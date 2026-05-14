#!/usr/bin/env python3
"""把 batch 3 的 34 条 BD tip（宗教 27 + 外交 7）加到 data.js。"""
import re

TIPS = {
    # 宗教 / 神性
    'prayerPool': '喂，水！记住我的愿啊！',
    'holyForge': '锤落火星，变出狐狸形状。',
    'holyKiln': '火舌卷走了影子。',
    'edictHall': '它俯身，接令如接雨。',
    'tribunalHall': '审镜子！镜子不说话。',
    'holyIronVault': '锁了一百年，铁还是新的。',
    'oilPress': '油出来了！它差点给油跪下。',
    'cathedral': '嗡——山谷抖了三下。',
    'hymnHall': '唱完了。梁上还在嗡。它有点小得意。',
    'pilgrimage': '它眼神亮着，带回一路陌生的鸟。',
    'relicShrine': '它想打喷嚏。憋住了。它真伟大。',
    'crusadeCamp': '每只靴里藏颗糖。',
    'scriptureSpire': '顺着读是经，倒着读是命。',
    'atonementPool': '把昨天扔进水里。咕咚。轻松了！',
    'holyAltar': '那我自己烧会儿。',
    'mysteryHall': '想偷听秘密，先学会闭嘴。',
    'sacredGrove': '树洞里摸到纸条，写着去年今日。',
    'apotheosisPool': '俯身。水面伸出一排钥匙。',
    'forbiddenLib': '这书不能看！……它看了。',
    'divinityForge': '器物睁开狐狸的眼睛。',
    'prophecyHall': '预言在梁上发芽。',
    'etherealGate': '它穿过门，影子留在了那边。',
    'secretCellar': '翻到底层。摸到寂静。',
    'ambrosiaSpring': '再举杯。',
    'apotheosisAltar': '上去的是它。下来的……也说自己是它。',
    'pureMindHall': '摘掉一片心事。咦，我来干嘛？',
    'forbiddenSpire': '登顶，然后遗忘来路。',
    # 外交
    'embassy': '使馆门口，两国狐狸互嗅气息。',
    'receptionHall': '门常开着，茶常温着。',
    'courierPost': '狐狸学会了鸟叫来报时。',
    'charterHall': '它盖了个章。歪了。它假装那是风格。',
    'exoticVault': '架上的东西一半叫不出名字。',
    'guestQuarter': '没客人。它还是烧了水。万一呢？',
    'alliancePlatform': '击掌。',
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
