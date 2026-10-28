#!/bin/sh
cd "$(dirname "$0")"
{ cat src/head.html; echo '<script>'; echo '(() => {'; cat src/tasks.js src/fun.js src/fun2.js src/fun3.js src/career.js src/progress.js src/clients.js src/senior.js src/engine.js src/exec.js src/audio.js src/play.js src/events.js src/minigames.js src/chat.js src/calc.js src/computer.js src/views.js; echo '})();'; echo '</script>'; } > index.html
{ printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n'; cat index.html; printf '\n</body>\n</html>\n'; } > corner-office.html
node -e "const s=require('fs').readFileSync('index.html','utf8'); const js=s.slice(s.indexOf('<script>')+8, s.lastIndexOf('</script>')); try{ new Function(js); console.log('syntax ok', js.length);}catch(e){console.log('SYNTAX',e.message)}"

cp corner-office.html site-index.html
