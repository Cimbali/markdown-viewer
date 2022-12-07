function parseURI(){
	let p = new URLSearchParams(window.location.search);
	let m = new Map(p);
	let a = document.createElement("A");
	a.href = m.get("file");
	a.href = a.href.slice(a.protocol.length)
	console.log(a);
	
	return {"file": a};
}

var params = parseURI();

fetch(params["file"]).then(r => r.text()).then(source => {
	embeddingModes.get("iframe")(params["file"].href, source, renderedDOM => {document.body.appendChild(renderedDOM);});
});
