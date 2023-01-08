'use strict';

/* exported yamltitle */
function yamltitle(text) {
	// Try (best-effort) to extract the value of a top-level “title” key
	const titleLine = text.split('\n').find(line => line.startsWith('title:'))
	if (!titleLine) {
		return null;
	}
	const title = titleLine.slice(6).trim();
	if (!title || title === '|') {
		// We need a string, so don’t support array, object, or multi-line titles
		return null;
	}

	// Handle string quoting for prettyness
	const char0 = title.charAt(0);
	if (char0 !== title.charAt(title.length - 1)) {
		return title;
	} else if (char0 === "'") {
		return title.slice(1, title.length - 1).replaceAll("''", "'");
	} else if (char0 === '"') {
		return title.slice(1, title.length - 1).replaceAll('\\n', "\n").replaceAll(
			/\\(?<escaped>.)/gu, (match, escaped) => escaped
		);
	} else {
		return title;
	}
}

/* exported frontmatter */
function frontmatter(callback = null) {
	const separator = '---', len = separator.length;
	return function block(state, startLine, endLine, silent) {
		if (startLine !== 0) {
			return false;
		}

		const { src, bMarks, eMarks, sCount } = state;

		if (src.slice(bMarks[startLine], eMarks[startLine]) !== separator) {
			return false;
		}

		let line = startLine;
		while (++line < endLine) {
			if (eMarks[line] - bMarks[line] !== len || sCount[line] !== 0) {
				continue;
			}
			if (src.slice(bMarks[line], eMarks[line]) === separator) {
				break;
			}
		}

		if (line === endLine) {
			return false;
		}
		if (silent) {
			return true;
		}

		const { parentType, lineMax } = state;
		// transform current token into container
		state.parentType = 'container';
		state.lineMax = line;

		// insert front-matter token
		const token  = state.push('front_matter', null, 0);
		token.hidden = true;
		token.markup = separator;
		token.block  = true;
		token.map    = [ startLine, line + 1 ];
		token.meta   = src.slice(state.bMarks[startLine + 1], state.eMarks[line - 1]);

		state.parentType = parentType;
		state.lineMax = lineMax;
		state.line = line + 1;

		if (callback) {
			callback(token.meta);
		}

		return true;
	}
}
