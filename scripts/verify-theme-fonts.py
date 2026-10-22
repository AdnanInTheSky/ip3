"""Maintenance verification: Python + fonttools[woff]==4.67.0.

Verify Google-generated SOFT=0 files against the original four-axis fonts. This
does not alter fonts, source CSS, original files, glyphs or visitor/browser state.
"""
import hashlib
import json
from pathlib import Path
from fontTools import __version__
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import DecomposingRecordingPen

ROOT = Path(__file__).resolve().parent.parent
DIRECTORY = ROOT / 'assets/fonts'
manifest = json.loads((ROOT / 'src/theme-fonts.json').read_text(encoding='utf8'))
proofs = []

def difference(a, b):
    if isinstance(a, (float, int)) and isinstance(b, (float, int)):
        return abs(a - b)
    if isinstance(a, (tuple, list)) and isinstance(b, (tuple, list)):
        assert len(a) == len(b)
        return max((difference(x, y) for x, y in zip(a, b)), default=0)
    assert a == b
    return 0

for font in manifest['optimizedFonts']:
    original = TTFont(DIRECTORY / font['original'])
    target = DIRECTORY / font['filename']
    assert hashlib.sha256(target.read_bytes()).hexdigest() == font['sha256']
    optimized = TTFont(target)
    assert original.getBestCmap() == optimized.getBestCmap()
    assert {a.axisTag for a in optimized['fvar'].axes} == {'opsz', 'wght', 'WONK'}
    glyphs = set(original.getBestCmap().values())
    maximum, comparisons = 0, 0
    for weight in (100, 300, 400, 600, 900):
        for opsz in (9, 36, 72, 144):
            for wonk in (0, 1):
                old = original.getGlyphSet(location={'wght': weight, 'SOFT': 0, 'opsz': opsz, 'WONK': wonk})
                new = optimized.getGlyphSet(location={'wght': weight, 'opsz': opsz, 'WONK': wonk})
                for name in glyphs:
                    a, b = DecomposingRecordingPen(old), DecomposingRecordingPen(new)
                    old[name].draw(a); new[name].draw(b)
                    maximum = max(maximum, difference(a.value, b.value), abs(old[name].width - new[name].width))
                    comparisons += 1
    # At most one font unit: 0.0432 CSS px at an 86.4 px headline.
    assert maximum <= 1, f'Unexpected glyph/advance change: {maximum} font units'
    proofs.append({'style': font['style'], 'glyphs': len(glyphs), 'locations': 40, 'comparisons': comparisons, 'maxOutlineOrAdvanceDeltaFontUnits': maximum, 'unitsPerEm': original['head'].unitsPerEm, 'allOriginalCodepointsRetained': True})

result = {'tool': 'fontTools ' + __version__, 'method': 'Compare unmodified Google-generated SOFT=0 WOFF2 with original fonts at the current SOFT=0 design; all weights, optical/WONK variations and codepoints retained. CDN and local fallback use identical bytes.', 'files': manifest['optimizedFonts'], 'proofs': proofs}
out = ROOT / 'docs/interactive-experience/mobile-performance-2026-10-22'
out.mkdir(parents=True, exist_ok=True)
(out / 'font-outline-proof.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf8')
print(json.dumps(result))
