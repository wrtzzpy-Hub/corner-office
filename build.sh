#!/bin/sh
# Rebuilds index.html from the files in src/.
cd "$(dirname "$0")"
{ printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n'
  cat src/head.html; echo '<script>'; echo '(() => {'
  cat src/tasks.js src/fun.js src/career.js src/engine.js src/audio.js src/play.js src/calc.js src/views.js
  echo '})();'; echo '</script>'; printf '\n</body>\n</html>\n'; } > index.html
