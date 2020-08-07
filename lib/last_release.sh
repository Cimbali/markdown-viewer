#!/bin/sh

git fetch
last_tag=`git describe origin/master --tags --abbrev=0`

echo Updating to $last_tag
git checkout $last_tag
