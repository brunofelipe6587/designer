# Wraps a creative's script (src/<name>.js) into a page <name>.html: canvas + fonts + common.js.
# Usage: python3 mk.py e1 [W H]
import sys
n = sys.argv[1]; w, h = (sys.argv[2], sys.argv[3]) if len(sys.argv) > 3 else (('1080', '1920') if n.startswith('v') else ('1080', '1350'))
body = open(f'src/{n}.js').read()
import os
pre = f'<script src="src/{n}_vo.js"></script>\n' if os.path.exists(f'src/{n}_vo.js') else ''
open(f'{n}.html', 'w').write(f'''<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<title>Black Sand Walk {n}</title>
<link href="../fonts/fonts.css" rel="stylesheet">
<style>html, body {{ margin: 0; background: #000; }} canvas {{ display: block; }}</style>
</head>
<body>
<canvas id="c" width="{w}" height="{h}"></canvas>
<script src="common.js"></script>
{pre}<script>
W = {w}; H = {h}; ctx = document.getElementById('c').getContext('2d');
{body}
</script>
</body>
</html>
''')
