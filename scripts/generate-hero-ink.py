"""Generate local SVG lettering from the bundled OFL-licensed Caveat font."""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

root = Path(__file__).resolve().parents[1]
font = TTFont(root / "node_modules/@fontsource/caveat/files/caveat-latin-500-normal.woff")
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
scale = 40 / font["head"].unitsPerEm
x = 0
paths = []
sentence = "Always working on our rover..."
for char in sentence:
    name = cmap[ord(char)]
    pen = SVGPathPen(glyphs)
    glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, 38)))
    if char != " ":
        paths.append(pen.getCommands())
    x += font["hmtx"][name][0] * scale
(root / "src/data/hero-ink.json").write_text(
    json.dumps({"text": sentence, "width": round(x + 4, 2), "height": 55, "paths": paths}, separators=(",", ":")) + "\n",
    encoding="utf-8",
)
print(f"Generated {len(paths)} handwritten glyphs")
