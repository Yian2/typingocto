#!/bin/sh
# Build the site, commit everything and publish typingocto/ to GitHub Pages (gh-pages branch).
set -e
cd "$(dirname "$0")/.."
node tools/build.js
git add -A
git commit -q -m "${1:-Update site}" || true
git push -q origin main
git push -q -f origin "$(git subtree split --prefix typingocto main):refs/heads/gh-pages"
echo "Published to https://typingocto.com"
