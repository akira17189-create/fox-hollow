#!/usr/bin/env python3
"""把 batch 4 的 12 条 SD 灵术 tip 加到 data.js。"""
import re

TIPS = {
    'resonWave': '嗡——整片谷地唱起来了',
    'shapeFox': '皮毛下藏着谁的爪子？',
    'calmFlow': '烦。烦。烦。……哦，不烦了。',
    'sageUtter': '嗯？忽然懂了。',
    'spiritWeave': '影子，替我干活。',
    'voidWalk': '一步迈出去，十里路没了。',
    'starSenseSpell': '星星是碎糖，往下掉！',
    'primordialDriveSpell': '屋脊全在冒火光！',
    'mirrorViewSpell': '水面另一头，有谁在偷看。',
    'voidReadSpell': '翻！书页自己动了。',
    'silenceMeditation': '呼吸与石同步。',
    'pactPrayerSpell': '五位灵契，今天拜哪个呢？',
}

text = open('js/data.js', encoding='utf-8').read()

def insert_tip(text, eid, tip):
    m = re.search(r'^  ' + re.escape(eid) + r':\s*\{', text, re.MULTILINE)
    if not m:
        return text, False
    open_brace = m.end() - 1
    depth = 1
    i = open_brace + 1
    while i < len(text) and depth > 0:
        if text[i] == '{': depth += 1
        elif text[i] == '}': depth -= 1
        i += 1
    close_brace = i - 1
    body = text[open_brace+1:close_brace]
    if re.search(r'(?:^|[\s,])tip\s*:\s*[\[\'"]', body):
        return text, False
    body_stripped = body.rstrip()
    needs_comma = bool(body_stripped) and not body_stripped.endswith(',')
    insertion = (',' if needs_comma else '') + " tip: ['" + tip + "']"
    new_text = text[:close_brace] + insertion + text[close_brace:]
    return new_text, True

applied = 0
skipped = 0
for eid, tip in TIPS.items():
    text, ok = insert_tip(text, eid, tip)
    if ok:
        applied += 1
    else:
        print(f'[skip] {eid} (找不到 或 已有 tip)')
        skipped += 1

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(text)

print(f'[done] 应用 {applied}，跳过 {skipped}')
