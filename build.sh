#!/usr/bin/env bash
# Joins src/ into single-file builds. No dependencies beyond bash (node optional, for a syntax check).
#   index.html         full standalone page: open it in any browser or host it on GitHub Pages
#   dist/artifact.html same game without the <html>/<head> wrapper, for publishing as a Claude artifact
set -euo pipefail
cd "$(dirname "$0")"
if command -v node >/dev/null; then cat src/js/*.js > /tmp/_vigil_check.js && node --check /tmp/_vigil_check.js; fi
mkdir -p dist
{ cat src/shell.html; echo '<script>'; cat src/js/*.js; echo '</script>'; } > dist/artifact.html
{ echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>';
  cat dist/artifact.html; echo '</body></html>'; } > index.html
echo "Built index.html and dist/artifact.html ($(wc -c < index.html) bytes)"
