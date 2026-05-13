/**
 * data.js - 狐狸谷物语 游戏数据定义
 * 所有资源、建筑、职业、研究、工坊的静态配置
 */

// ===== 季节 =====
const SN = ['早春', '盛夏', '金秋', '寒冬'];
const SM = [1.5, 1.0, 1.2, 0.25]; // 各季节野莓产量倍率

// ===== 时间常量 =====
const TPD = 10;   // ticks per day
const DPS = 100;  // days per season
const TMS = 200;  // tick interval (ms)

// ===== 采集按钮短句 =====
const GATHER_TIP = {
  berry: ['低头、叼起、嚼两下——采集的三重奏。'],
  wood:  ['树倒下去之后就改了称呼——这一刻起，它叫机会。'],
  stone: ['大地的零钱，低头就能捡到。'],
};

// ===== 资源定义 =====
const RD = {
  berry:   { n: '野莓', c: '基础', mx: 5000, tip: ['它长得像能吃，吃起来也像能吃，这很好。', '阳光、雨水与时间，在枝头凝结成微小的甜。'] },
  wood:    { n: '圆木', c: '基础', mx: 200, tip: ['它站着的时候叫风景，躺下来的时候叫材料。', '它梦见自己曾是一棵树。'] },
  stone:   { n: '碎石', c: '基础', mx: 200, tip: ['从绊脚石到基石，只差一个好主意。', '石头记得冰川的事，但你不记得。'] },

  leather: { n: '兽皮', c: '加工', mx: 50, tip: ['原主人不需要了，正好我们需要。'] },
  plank:   { n: '木板', c: '加工', mx: 100, lock: 1, tip: ['一根圆木想变体面，先得挨几锯。'] },
  brick:   { n: '砖块', c: '加工', mx: 100, lock: 1, tip: ['泥土进了火，出来就硬气了。'] },
  iron:    { n: '矿铁', c: '加工', mx: 0, lock: 1, tip: ['石头里藏着的秘密，只有高温能撬开。'] },

  // ===== 工业分支 A阶段：煤钢时代 =====
  coal:     { n: '煤', c: '加工', mx: 0, lock: 1 },
  steel:    { n: '钢', c: '加工', mx: 0, lock: 1 },
  plate:    { n: '钢板', c: '加工', mx: 100, lock: 1 },
  concrete: { n: '混凝', c: '加工', mx: 100, lock: 1 },
  gear:     { n: '齿轮', c: '加工', mx: 50, lock: 1 },

  // ===== 工业分支 B阶段：油火时代 =====
  oil:      { n: '火油', c: '加工', mx: 0, lock: 1, tip: ['黑色的血从地底涌上来，烫手，但好用。', '闻着危险，烧着更危险，不用最危险。'] },
  barrel:   { n: '油桶', c: '加工', mx: 50, lock: 1, tip: ['把火油的家搬大一圈——桶匠的全部哲学。'] },

  // ===== 工业分支 C阶段：精金时代 =====
  titan:     { n: '寒钛', c: '加工', mx: 0, lock: 1 },
  alloy:     { n: '合金', c: '加工', mx: 0, lock: 1 },
  outline:   { n: '纲要', c: '知识', mx: 25, lock: 1 },
  titanPart: { n: '钛构件', c: '加工', mx: 25, lock: 1 },
  pillar:    { n: '混凝柱', c: '加工', mx: 25, lock: 1 },
  starchart: { n: '星图', c: '知识', mx: 0, lock: 1 },

  // ===== 工业分支 D阶段：辉能时代（v0.20 §八 5.1a） =====
  uranium:     { n: '辉石', c: '加工', mx: 0, lock: 1, unlockBy: { u: 'fission' }, unlockMx: 30, tip: ['一块温热的、会自己唱歌的金属，凑得太近耳朵会嗡。'] },
  thorium:     { n: '重晶', c: '加工', mx: 30, lock: 1, tip: ['辉石冷却后留下的硬骨头——更稳，但也更沉默。'] },
  mirrorAlloy: { n: '镜合金', c: '加工', mx: 15, lock: 1, tip: ['表面映出的那张脸，是站在你身后还没到的那个你。'] },
  codex:       { n: '密典', c: '知识', mx: 10, lock: 1, tip: ['纲要写到一万次，就开始自己往里面填字了。'] },

  scroll:  { n: '卷轴', c: '知识', mx: 0, lock: 1, tip: ['把想法钉在皮子上，它就不会跑了。', '把会随风飘走的话，关进树皮的牢笼里。'] },
  lore:    { n: '学识', c: '知识', mx: 0, lock: 1, tip: ['你知道的东西正在慢慢超过你忘记的——暂时。', '对着天空发呆，直到看出点名堂。'] },
  draft:   { n: '蓝本', c: '知识', mx: 25, lock: 1, tip: ['把脑子里的机器画在纸上，它就离真实近了一步。', '线条是想象力的骨架，尺寸是野心的边界。'] },
  coin:    { n: '铜钱', c: '贸易', mx: 0, lock: 1, tip: ['信任的最小单位，圆的，方便滚来滚去。', '大家一致同意，跳过以物易物，直接怀疑这枚金属。'] },
  charm:   { n: '符咒', c: '研究', mx: 0, lock: 1, tip: ['灵狐在月光下留下的笔迹，读不懂，但管用。', '先祖留了一张纸条，但字迹不太好认。'] },
  remnant: { n: '遗光', c: '研究', mx: 0, lock: 1, tip: ['一小撮不急着散场的余晖，蹲在角落里等待。', '暖的，但不烫爪子。凑近了能听见很轻很轻的呼吸声。', '老狐狸说这是时间的尾巴尖——叫它光，叫得不够准。'] },

  spice:   { n: '香草', c: '贸易', mx: 0, lock: 1, tip: ['一小撮就能让一顿饭从"算了"变成"值了"。'] },
  silk:    { n: '丝帛', c: '贸易', mx: 0, lock: 1, tip: ['比皮毛轻，比树皮软，比任何东西都难弄到手。'] },
  ancCoin: { n: '古币', c: '贸易', mx: 0, lock: 1, tip: ['它见过一座城的最后一夜。'] },

  // v0.14 文化中间品（占位名）
  dye:  { n: '彩络', c: '加工', mx: 0, lock: 1, unlockBy: { u: 'engraving' }, tip: ['颜色是偷来的，花还不知道。'] },
  wine: { n: '醴浆', c: '加工', mx: 0, lock: 1, unlockBy: { u: 'calendar' }, tip: ['时间对野莓做的事，说出来不太体面。'] },
  ink:  { n: '墨锭', c: '加工', mx: 0, lock: 1, unlockBy: { u: 'engraving' }, tip: ['除了黑什么都不会。'] },

  // v0.16 政体资源

  // ===== 灵修分支 A阶段：初感 =====
  spirit:    { n: '灵能', c: '研究', mx: 0, lock: 1, tip: ['第一次碰到灵流的狐狸说，像被风舔了一下。', '它既不是光也不是热，但捧在爪心会微微发麻。'] },
  fateSilk:  { n: '命丝', c: '研究', mx: 0, lock: 1, tip: ['一根线连着你和你还没遇见的事。', '扯不断、烧不掉、丢了还会自己爬回来。'] },
  bead:      { n: '念珠', c: '研究', mx: 50, lock: 1, tip: ['每颗珠子里关着一个安静的念头。', '拨一颗响一声，拨到头又从第一颗开始。'] },
  spiritInk: { n: '灵墨', c: '研究', mx: 100, lock: 1, tip: ['用它写的字会在月光下发亮，但白天看不见。'] },
  sigil:     { n: '符纹', c: '研究', mx: 100, lock: 1, tip: ['画在石头上的符号，笔划比文字早，含义比语言深。'] },

  // ===== 灵修分支 B阶段：共鸣 =====
  resonance: { n: '共振子', c: '研究', mx: 0, lock: 1, tip: ['两颗灵珠靠近时会嗡嗡响——那是彼此在打招呼。'] },
  elixir:    { n: '灵液', c: '研究', mx: 25, lock: 1, tip: ['喝一口不会怎样，但灵流的上限会悄悄宽一圈。'] },
  spectrum:  { n: '谱石', c: '研究', mx: 25, lock: 1, tip: ['把共振子和念珠压在一起，就能看见里面藏着的颜色。'] },
  insight:   { n: '悟片', c: '研究', mx: 25, lock: 1, tip: ['薄薄一片，但里面写满了还没想到的事。'] },

  // ===== 灵修分支 C阶段：化形 =====
  crystalSilk: { n: '晶丝', c: '加工', mx: 0, lock: 1 },
  radiance:    { n: '辉芒', c: '加工', mx: 0, lock: 1 },
  spiritCore:  { n: '灵核', c: '加工', mx: 0, lock: 1 },
  formSoul:    { n: '形魄', c: '加工', mx: 25, lock: 1 },
  spiritChart: { n: '灵图', c: '知识', mx: 0, lock: 1 },

  // ===== 灵修分支 D阶段：深寂（v0.20 §八 5.2a） =====
  primordial:    { n: '元念',  c: '加工', mx: 0,  lock: 1, unlockBy: { u: 'primordialism' }, unlockMx: 30, tip: ['想着想着，连想本身也消失了——只剩想之前的那个东西。'] },
  silenceStone:  { n: '寂石',  c: '加工', mx: 20, lock: 1, tip: ['敲不响也磨不开。把它放在耳边，听见的是没有声音的声音。'] },
  mirrorSpirit:  { n: '镜灵',  c: '加工', mx: 5,  lock: 1, tip: ['朝它哈一口气，看见的是自己十年后的样子。'] },
  voidCodex:     { n: '幽典',  c: '知识', mx: 5,  lock: 1, tip: ['翻第一页是空的。翻第二页还是空的。但翻完合上，已经记住了所有事。'] },

  // ===== 神启副线 A阶段：初悟 =====
  piety:   { n: '虔诚', c: '研究', mx: 0, lock: 1 },
  holyOil: { n: '圣油', c: '研究', mx: 25, lock: 1 },
  // ===== 神启副线 B-教团 =====
  holyFlame: { n: '圣火', c: '加工', mx: 0, lock: 1 },
  holyIron:  { n: '圣铁', c: '加工', mx: 0, lock: 1 },
  // ===== 神启副线 C-教团（v0.20 §八 5.3a） =====
  hymn:           { n: '颂咏',  c: '研究', mx: 0,  lock: 1, unlockBy: { u: 'hymnArt' }, unlockMx: 30, tip: ['唱到第三遍的时候，你会发现合唱里多了一个不像狐狸的声音。'] },
  holyRelic:      { n: '圣骸',  c: '加工', mx: 10, lock: 1, tip: ['它什么时候来到山谷的，没人记得；要把它送走，每只狐狸都说不行。'] },
  holyScripture:  { n: '圣典',  c: '知识', mx: 5,  lock: 1, tip: ['翻一页轻一两，翻到最后整本飘起来——读得到的人最先笑。'] },
  // ===== 神启副线 C-秘仪（v0.20 §八 5.3d） =====
  divineInk:        { n: '神墨',   c: '研究', mx: 0,  lock: 1, tip: ['像墨，但比墨重得多——是把神看你的眼神，凝成一滴。'] },
  apotheosisStone:  { n: '化神石', c: '加工', mx: 8,  lock: 1, tip: ['捏在掌心，听到自己变成另一只狐狸的声音。'] },
  forbiddenCodex:   { n: '禁典',   c: '知识', mx: 5,  lock: 1, tip: ['封面贴着三道封条。读到第二章的狐狸，回来时只记得自己叫什么。'] },
  // ===== 神启副线 B-秘仪 =====
  ambrosia: { n: '神露', c: '研究', mx: 15, lock: 1 },
  gnosis:   { n: '秘知', c: '研究', mx: 0, lock: 1 },
  // ===== 通达副线 Phase A：初交 =====
  renown:     { n: '声誉', c: '外交', mx: 0, lock: 1 },
  credential: { n: '信物', c: '外交', mx: 25, lock: 1 },
  // ===== 通达副线 Phase B：结邦 =====
  charter: { n: '邦书', c: '外交', mx: 0, lock: 1 },
  exotic:  { n: '异珍', c: '外交', mx: 15, lock: 1 },
};

// ===== v0.15.1 猎手林间采风日志 =====
const HUNTER_SPICE_LOGS = [
  '猎手在溪谷背阴处发现了一丛野香草，小心翼翼地连根拔起。',
  '追猎物的路上踩到了什么，低头一看是长满了的香草苗。',
  '一只猎手说山坡上有股味道不对劲——是好的那种不对劲。',
];

// ===== v0.15.1 商贩路边生意日志 =====
const MERCHANT_SPICE_LOGS = [
  '一个路过的旅狐用一小包香草抵了欠款，商贩欣然收下。',
  '集市角落换到了一撮来路不明的香草——闻着是正宗的。',
  '商贩说今天做了笔好买卖，顺手掏出一包带味儿的东西。',
];

const MERCHANT_SPICE_FAIL_LOGS = [
  '路过的旅狐看了看商贩手里的物件，摇头走了。',
  '本来要换香草的旅客临时改了主意。',
];

// ===== 遗光发现日志 =====
const REMNANT_LOGS = [
  '溪水里有什么东西闪了一下，捞起来的时候，它已经不亮了。',
  '一只狐狸低头捡到一粒光，攥在爪子里，温温的。',
  '风停的时候，草丛里多了一点不该在那里的亮。',
  '泥土下面翻出一颗半透明的小石子，里面好像封着一缕旧日的光线。',
  '树根缝里卡着什么，拔出来一看，掌心多了一点微弱的暖意。',
  '雨后的石板路上，有一小块地方迟迟不干，走近了才发现那里搁着一粒几乎看不见的光。',
  '刨野莓的时候指尖碰到了什么凉凉的，拿起来才发觉——是亮的。',
  '有只狐狸说它在打盹时看见了一粒光掉进草丛，醒来去找，居然真的找到了。',
];

// ===== 污染系统 =====
// 建筑效果字段约定：
//   pollutionP = 该建筑每座每tick增加的污染（正值=排污，负值=治理；×0.5 = /s 显示值）
//   pollThresh = 该建筑每座对污染惩罚阈值的右移点数（烟囱机制，不减少实际污染）
const POLLUTION_TIERS = [
  { min: 0, n: '清净', hapM: 0, berryM: 0, maxFox: 0, caravanM: 0, loreM: 0 },
  { min: 31, n: '轻度', hapM: -0.10, berryM: -0.15, maxFox: 0, caravanM: 0, loreM: 0 },
  { min: 61, n: '中度', hapM: -0.25, berryM: -0.30, maxFox: -2, caravanM: 0, loreM: 0 },
  { min: 101, n: '严重', hapM: -0.40, berryM: -0.50, maxFox: -5, caravanM: -0.20, loreM: 0 },
  { min: 151, n: '灾难', hapM: -0.60, berryM: -0.70, maxFox: -8, caravanM: -0.20, loreM: -0.30 },
];

const GREY_FOG_EVENTS = [
  { t: '灰雾弥漫，一只狐狸染上了雾毒，虚弱地离开了村落。', e: 'sickFox', w: 3 },
  { t: '灰雾侵蚀了建筑根基，有一座建筑暂时无法运作。', e: 'disableBld', w: 2 },
  { t: '灰雾涌入仓库，吞噬了一些储备物资。', e: 'loseRes', w: 3 },
];

// ===== 躁念系统（灵修失衡，类比工业污染） =====
// 建筑效果字段约定：
//   unrestP = 该建筑每座每tick增加的躁念（正值=产躁，负值=净化；×0.5 = /s 显示值）
//   unrestThresh = 该建筑每座对躁念惩罚阈值的右移点数（静室机制，不减少实际躁念）
const UNREST_TIERS = [
  { min: 0,   n: '平静', hapM: 0,     charmM: 0,     maxFox: 0,  spellM: 0,     loreM: 0 },
  { min: 31,  n: '微躁', hapM: -0.10, charmM: -0.15, maxFox: 0,  spellM: 0,     loreM: 0 },
  { min: 61,  n: '不安', hapM: -0.25, charmM: -0.30, maxFox: -2, spellM: 0,     loreM: 0 },
  { min: 101, n: '狂躁', hapM: -0.40, charmM: -0.50, maxFox: -5, spellM: -0.20, loreM: 0 },
  { min: 151, n: '心魔', hapM: -0.60, charmM: -0.70, maxFox: -8, spellM: -0.30, loreM: -0.30 },
];

const INNER_DEMON_EVENTS = [
  { t: '一只狐狸目光涣散地走进了迷雾，再也没有回来。', e: 'lostFox', w: 3 },
  { t: '灵术阵法失控，短路的灵力震碎了符文。', e: 'spellCooldown', w: 2 },
  { t: '灵脉剧烈震荡，灵力输出骤降。', e: 'leylineDisrupt', w: 2 },
  { t: '躁念在村落中回荡，不安的情绪感染了每一只狐狸。', e: 'unrestEcho', w: 2 },
  { t: '命丝在躁念侵蚀下断裂，储备的丝线化为飞灰。', e: 'loseFateSilk', w: 1 },
];

// ===== 建筑定义 =====
// 能量系统字段约定：
//   energyP = 该建筑每座产出的能量单位（正值）
//   energyC = 该建筑每座消耗的能量单位（正值）
// 净能量 < 0 时，所有带 energyC 的建筑正向资源产出按 prod/cons 比衰减。
// 灵脉系统字段约定：
//   leylineP = 该建筑每座产出的灵脉单位（正值）
//   leylineC = 该建筑每座消耗的灵脉单位（正值）
// 净灵脉 < 0 时，所有带 leylineC 的建筑正向资源产出按 prod/cons 比衰减。
const BD = {
  berryPatch: {
    n: '莓果园', t: 'b', d: '每座持续产出野莓。',
    p: [{ r: 'berry', b: 8, k: 1.12 }],
    e: { berryP: .3 },
    tip: ['把野的变成家的，把弯腰的变成等着的。']
  },
  berryGrove: {
    n: '野莓林', t: 'b', d: '丛林化的莓果园，与树林共生，产出大幅提升。',
    p: [{ r: 'plank', b: 30, k: 1.13 }, { r: 'brick', b: 15, k: 1.13 }, { r: 'wood', b: 80, k: 1.13 }],
    e: { berryP: 1.5, berryMx: 500 },
    uq: { u: { calendar: 1 }, b: { berryPatch: 5 } },
    tip: ['一片懂事的林子，自己生莓子，也自己看着蜂。']
  },
  berryValley: {
    n: '野莓谷', t: 'b', d: '把整道山谷开成莓园——只有几座，但能撑起后期口粮。',
    p: [{ r: 'plank', b: 80, k: 1.15 }, { r: 'brick', b: 40, k: 1.15 }, { r: 'ancCoin', b: 3, k: 1.15 }],
    e: { berryP: 4.0, berryMx: 2000 },
    uq: { u: { branchLore: 1 }, b: { berryGrove: 8, storyTree: 2 }, custom: 5 },
    tip: ['整片山的甜度都被收编了。']
  },
  hutch: {
    n: '狐狸窝', t: 'b', d: '容纳更多狐狸定居。',
    p: [{ r: 'berry', b: 70, k: 1.12 }, { r: 'wood', b: 4, k: 1.12 }],
    e: { maxFox: 2 },
    tip: ['从今天起，风找不到你了。', '一个用来盛放疲惫和呼噜的碗。']
  },
  lumberYard: {
    n: '伐木场', t: 'b', d: '提高圆木产出效率。',
    p: [{ r: 'berry', b: 60, k: 1.12 }, { r: 'wood', b: 8, k: 1.12 }],
    e: { woodP: .12 },
    uq: { b: { berryPatch: 1 } },
    tip: ['跟整座山林谈判，一次只带走一棵。']
  },
  quarry: {
    n: '采石坑', t: 'b', d: '提高碎石产出效率。',
    p: [{ r: 'berry', b: 80, k: 1.12 }, { r: 'stone', b: 10, k: 1.12 }],
    e: { stoneP: .08 },
    uq: { b: { berryPatch: 1 } },
    tip: ['往下挖，挖到大地开始心疼的地方。']
  },


  tannery: {
    n: '鞣革坊', t: 'b', d: '加工兽皮材料。',
    p: [{ r: 'wood', b: 20, k: 1.12 }, { r: 'berry', b: 120, k: 1.12 }],
    e: { leatherP: .015 },
    uq: { b: { lumberYard: 1 } },
    ur: ['leather'],
    tip: ['把软的变硬，把会烂的变成不会烂的。']
  },
  warehouse: {
    n: '储藏窖', t: 'b', d: '增加资源储存上限。',
    p: [{ r: 'wood', b: 18, k: 1.12 }, { r: 'stone', b: 8, k: 1.12 }],
    e: { berryMx: 750, woodMx: 100, stoneMx: 75 },
    uq: { b: { quarry: 1 } },
    tip: ['富足的第一个形状，是堆起来的。']
  },
  library: {
    n: '藏书阁', t: 'b', d: '积累学识、研读古籍。学识储备越深，商队带来的图纸越易被认出。',
    p: [{ r: 'wood', b: 30, k: 1.12 }, { r: 'stone', b: 15, k: 1.12 }],
    e: { loreMx: 50, scrollMx: 25, loreP: .03, blueprintProb: .02 },
    uq: { b: { warehouse: 1 } },
    ur: ['lore', 'scroll'],
    tip: ['狐狸坐下来发呆的地方，但发的是高级的呆。']
  },
  smithy: {
    n: '锻造炉', t: 'b', d: '冶炼矿石打造铁器。',
    p: [{ r: 'wood', b: 40, k: 1.12 }, { r: 'stone', b: 25, k: 1.12 }],
    e: { ironMx: 50, ironP: .008 },
    uq: { b: { library: 1 } },
    ur: ['iron'],
    tip: ['石头进去，铁出来。中间发生的事叫冶金。']
  },
  market: {
    n: '集市摊', t: 'b', d: '交换物资赚取铜钱。',
    p: [{ r: 'wood', b: 50, k: 1.12 }, { r: 'stone', b: 20, k: 1.12 }, { r: 'leather', b: 5, k: 1.12 }],
    e: { coinMx: 50, coinP: .008 },
    uq: { b: { tannery: 1 } },
    ur: ['coin'],
    tip: ['你多的正好是我缺的——交易的全部哲学。']
  },
  shrine: {
    n: '灵狐祠', t: 'b', d: '积蓄符咒之力——灵性建筑链的入口。',
    p: [{ r: 'stone', b: 40, k: 1.12 }, { r: 'iron', b: 3, k: 1.12 }, { r: 'lore', b: 15, k: 1.12 }],
    e: { charmMx: 25, charmP: .012, hapB: .05 },
    uq: { b: { library: 1, smithy: 1 } },
    ur: ['charm'],
    tip: ['月亮最圆的晚上，石像的影子会动。']
  },
  moonwell: {
    n: '月光井', t: 'b', d: '汲取月华之力，增益万物产出。',
    p: [{ r: 'stone', b: 50, k: 1.12 }, { r: 'charm', b: 6, k: 1.12 }],
    e: { allM: .03 },
    uq: { b: { shrine: 1 } },
    tip: ['把月亮舀起来，一瓢一瓢的，很轻。']
  },
  plankHouse: {
    n: '板屋', t: 'b', d: '宽敞的高级住所，容纳更多狐狸。',
    p: [{ r: 'plank', b: 5, k: 1.12 }, { r: 'brick', b: 3, k: 1.12 }, { r: 'berry', b: 200, k: 1.12 }],
    e: { maxFox: 3 },
    uq: { u: { carpentry: 1, masonry: 1 } },
    tip: ['屋檐低一寸，梦就深一寸。','三只狐狸挤在一起，比壁炉还暖。']
  },
  vault: {
    n: '石窖', t: 'b', d: '用铁与砖砌成的深层储藏室。',
    p: [{ r: 'plank', b: 3, k: 1.12 }, { r: 'brick', b: 5, k: 1.12 }, { r: 'iron', b: 3, k: 1.12 }],
    e: { berryMx: 1500, woodMx: 200, stoneMx: 150, leatherMx: 30, ironMx: 30, loreMx: 30, scrollMx: 15, coinMx: 30, charmMx: 15, plankMx: 50, brickMx: 50 },
    uq: { u: { ironWorking: 1 } },
    tip: ['存东西是一种对明天的想象。','凉凉的，暗暗的，什么都不会坏。']
  },
  tradePost: {
    n: '商驿', t: 'b', d: '远方的商队开始在此歇脚——空闲时也搜罗些香草丝帛。',
    p: [{ r: 'coin', b: 15, k: 1.12 }, { r: 'brick', b: 4, k: 1.12 }, { r: 'leather', b: 3, k: 1.12 }],
    e: { allM: .02, coinMx: 30, spiceP: .003, silkP: .002, spiceMx: 10, silkMx: 8 },
    uq: { b: { market: 2 } },
    tip: ['驼铃一响，所有狐狸的耳朵都竖起来了。','路过的狐狸把包裹往地上一摊，就算开张了。']
  },
  trailroad: {
    n: '驿道', t: 'b', d: '通向山外的道路，每座增加一支远行并行队伍。',
    p: [{ r: 'plank', b: 3, k: 1.12 }, { r: 'brick', b: 5, k: 1.12 }, { r: 'stone', b: 30, k: 1.12 }],
    e: { spiceMx: 5, silkMx: 3, ancCoinMx: 3 },
    uq: { u: { beyondValley: 1 } },
    ur: ['spice', 'silk', 'ancCoin'],
    tip: ['路走到这里还没断，是一爪一爪踩出来的。']
  },
  watchtower: {
    n: '瞭望塔', t: 'b', d: '远眺山外，缩短远行路程，需持续消耗符咒维持。',
    p: [{ r: 'brick', b: 8, k: 1.12 }, { r: 'iron', b: 5, k: 1.12 }, { r: 'wood', b: 20, k: 1.12 }],
    e: { charmP: -.01 },
    uq: { b: { trailroad: 1 } },
    tip: ['站得高，为的是看得比明天更远一点。']
  },

  // ===== v0.14 文化建筑（占位名） =====
  storyTree: {
    n: '树荫堂', t: 'b', d: '老树下围聚听故事的地方，村庄记忆的载体。',
    p: [{ r: 'wood', b: 50, k: 1.12 }, { r: 'stone', b: 30, k: 1.12 }, { r: 'ancCoin', b: 5, k: 1.12 }],
    e: { hapB: .02, scrollP: .005, scrollMx: 20, dyeMx: 5 },
    uq: { b: { shrine: 2 }, u: { folkLore: 1 } },
    tip: ['树是一把撑开的耳朵。']
  },
  moonStage: {
    n: '月歌台', t: 'b', d: '月夜歌咏的高台，灵狐传说在此流传。',
    p: [{ r: 'plank', b: 20, k: 1.12 }, { r: 'brick', b: 10, k: 1.12 }, { r: 'wood', b: 30, k: 1.12 }],
    e: { charmP: .003, wineMx: 5 },
    uq: { b: { storyTree: 1 }, u: { calendar: 1 } },
    tip: ['今夜的歌属于月亮。']
  },
  memorial: {
    n: '刻名碑', t: 'b', d: '刻满前狐名字的纪念碑，山谷立起的习俗越多越生光；同时镌刻新事，每座产出少量卷轴。',
    p: [{ r: 'stone', b: 50, k: 1.12 }, { r: 'iron', b: 5, k: 1.12 }],
    e: { customAllM: .002, scrollP: .04, inkMx: 3 },
    uq: { b: { storyTree: 1 }, u: { engraving: 1 } },
    tip: ['名字刻进去，就和山一样长寿了。']
  },
  artistry: {
    n: '艺工坊', t: 'b', d: '染织、酿酒、制墨的手工作坊。',
    p: [{ r: 'plank', b: 8, k: 1.12 }, { r: 'brick', b: 5, k: 1.12 }, { r: 'wood', b: 25, k: 1.12 }],
    e: { craftCultureMul: .05 },
    uq: { b: { moonStage: 1 }, u: { artistryLore: 1 } },
    tip: ['慢工出细活，慢到快要忘了出什么活。']
  },
  assembly: {
    n: '共聚堂', t: 'b', d: '议事、节庆、聚会的大堂。热闹的村庄更易吸引商队来访。',
    p: [{ r: 'plank', b: 12, k: 1.12 }, { r: 'brick', b: 8, k: 1.12 }, { r: 'wood', b: 40, k: 1.12 }],
    e: { hapB: .03, caravanProb: .02 },
    uq: { b: { moonStage: 1 }, u: { customsDeep: 1 } },
    tip: ['一只狐狸清嗓子，所有耳朵同时转向。']
  },
  ancestor: {
    n: '祖龛', t: 'b', d: '专司祭祖的小祠堂。',
    p: [{ r: 'stone', b: 30, k: 1.12 }, { r: 'iron', b: 3, k: 1.12 }, { r: 'charm', b: 8, k: 1.12 }],
    e: { charmP: .016 },
    uq: { b: { shrine: 3 }, u: { ancestry: 1 } },
    tip: ['供果被看不见的牙齿细细地啃着。']
  },

  // ===== v0.16 政体建筑 =====
  councilHall: {
    n: '议事堂', t: 'b', d: '谷中议事之所，每座提供学识加成。',
    p: [{ r: 'plank', b: 15, k: 1.12 }, { r: 'brick', b: 10, k: 1.12 }, { r: 'wood', b: 50, k: 1.12 }, { r: 'coin', b: 20, k: 1.12 }],
    e: { loreM: .05 },
    uq: { u: { councilLore: 1 } },
    tip: ['七嘴八舌的地方，意外地能解决问题。']
  },
  polityHall: {
    n: '治风堂', t: 'b', d: '治风的权力中心，强化当前治风正面效果。',
    p: [{ r: 'plank', b: 25, k: 1.12 }, { r: 'brick', b: 20, k: 1.12 }, { r: 'iron', b: 10, k: 1.12 }, { r: 'coin', b: 30, k: 1.12 }],
    e: { polityBonus: .05 },
    uq: { polity: true },
    tip: ['权力本身没有形状，直到你给它盖了间屋子。']
  },

  // ===== 工业分支 A阶段：煤钢时代（5 个建筑） =====
  mine: {
    n: '矿坑', t: 'b', d: '深入岩层开采煤矿，持续产出煤并增加煤储量。', br: 'I',
    p: [{ r: 'plank', b: 10, k: 1.12 }, { r: 'brick', b: 8, k: 1.12 }, { r: 'iron', b: 5, k: 1.12 }],
    e: { coalP: .04, coalMx: 50, pollutionP: .01 },
    uq: { u: { deepMining: 1 } },
  },
  blastFurnace: {
    n: '高炉', t: 'b', d: '高温将铁与煤熔合为钢；炼钢配方自此可制，炉匠这门职业也可授业。', br: 'I',
    p: [{ r: 'brick', b: 15, k: 1.12 }, { r: 'iron', b: 10, k: 1.12 }, { r: 'coal', b: 20, k: 1.12 }],
    e: { steelP: .01, steelMx: 30, pollutionP: .02 },
    uq: { b: { mine: 2 }, u: { steelWork: 1 } },
  },
  chimney: {
    n: '烟囱', t: 'b', d: '高耸的排烟通道——不减少污染，但把惩罚门槛往后推。', br: 'I',
    p: [{ r: 'brick', b: 20, k: 1.12 }, { r: 'steel', b: 5, k: 1.12 }],
    e: { pollThresh: 50 },
    uq: { b: { blastFurnace: 1 } },
  },
  purifier: {
    n: '净化池', t: 'b', d: '用水与沉淀的力量缓缓消解工业污渍。', br: 'I',
    p: [{ r: 'brick', b: 25, k: 1.12 }, { r: 'iron', b: 15, k: 1.12 }, { r: 'wood', b: 40, k: 1.12 }],
    e: { pollutionP: -.04 },
    uq: { u: { pollControl: 1 } },
  },
  steelVault: {
    n: '钢仓', t: 'b', d: '堆放煤与钢等重型工业原料的露天场地。', br: 'I', phase: 3,
    p: [{ r: 'steel', b: 10, k: 1.12 }, { r: 'brick', b: 15, k: 1.12 }],
    e: { steelMx: 50, coalMx: 80 },
    uq: { b: { blastFurnace: 1 } },
  },

  // ===== 工业分支 B阶段：油火时代（7 个建筑） =====
  oilWell: {
    n: '油井', t: 'b', d: '深入岩层汲取黑色液体——火油的唯一稳定来源。', br: 'I',
    p: [{ r: 'steel', b: 5, k: 1.12 }, { r: 'gear', b: 5, k: 1.12 }, { r: 'brick', b: 10, k: 1.12 }],
    e: { oilP: .02, oilMx: 25, pollutionP: .016 },
    uq: { u: { oilExtract: 1 } },
  },
  oilTank: {
    n: '油缸', t: 'b', d: '密封的铁皮容器，让火油不再到处乱跑。', br: 'I',
    p: [{ r: 'steel', b: 5, k: 1.12 }, { r: 'brick', b: 5, k: 1.12 }],
    e: { oilMx: 30, coalMx: 30 },
    uq: { b: { oilWell: 1 } },
  },
  steamEngine: {
    n: '蒸汽机房', t: 'b', d: '铁壳里的水被煤火烧沸，蒸汽推动活塞日夜不休。', br: 'I',
    p: [{ r: 'steel', b: 8, k: 1.12 }, { r: 'gear', b: 5, k: 1.12 }, { r: 'brick', b: 8, k: 1.12 }],
    e: { energyP: 1, pollutionP: .02 },
    uq: { u: { steamPower: 1 } },
  },
  combustEngine: {
    n: '内燃机', t: 'b', d: '火油在气缸里爆燃——比蒸汽更暴烈，也更有力。', br: 'I', phase: 4,
    p: [{ r: 'steel', b: 15, k: 1.12 }, { r: 'gear', b: 10, k: 1.12 }, { r: 'oil', b: 10, k: 1.12 }],
    e: { energyP: 3, oilP: -.04, pollutionP: .03 },
    uq: { u: { combustion: 1 } },
  },
  factory: {
    n: '工厂', t: 'b', d: '标准化流程让每一道配方都更高效——但噪音和黑烟也随之而来。', br: 'I', phase: 4,
    p: [{ r: 'steel', b: 20, k: 1.12 }, { r: 'gear', b: 15, k: 1.12 }, { r: 'draft', b: 1, k: 1.12 }],
    e: { craftAllM: .05, energyC: 2, pollutionP: .04 },
    uq: { u: { assemblyLine: 1 } },
  },
  railroad: {
    n: '铁路', t: 'b', d: '钢轨铺平了远方——商队更快到达，远行更快归来。', br: 'I', phase: 4,
    p: [{ r: 'steel', b: 15, k: 1.12 }, { r: 'gear', b: 8, k: 1.12 }, { r: 'concrete', b: 5, k: 1.12 }],
    e: { caravanM: .08, expTimeM: .8, pollutionP: .01 },
    uq: { u: { roadwork: 1 } },
  },
  windTower: {
    n: '风力塔', t: 'b', d: '高塔上的叶片日夜旋转，既净化空气，也收集一点微弱的风能。', br: 'I',
    p: [{ r: 'steel', b: 10, k: 1.12 }, { r: 'brick', b: 12, k: 1.12 }, { r: 'iron', b: 5, k: 1.12 }],
    e: { pollutionP: -.06, energyP: .5 },
    uq: { u: { cleanWind: 1 } },
  },

  // ===== 工业分支 C阶段：精金时代（5 个建筑） =====
  calcFurnace: {
    n: '煅烧炉', t: 'b', d: '高温窑炉从矿石与火油中析出寒钛——代价是浓烟与石头。', br: 'I',
    p: [{ r: 'steel', b: 25, k: 1.12 }, { r: 'concrete', b: 10, k: 1.12 }, { r: 'draft', b: 3, k: 1.12 }],
    e: { titanP: .003, ironP: .05, stoneP: -.1, oilP: -.01, energyC: 1, pollutionP: .02 },
    uq: { u: { calcination: 1 } },
  },
  refinery: {
    n: '精炼厂', t: 'b', d: '将粗钛与钢熔融精炼——合金锻造效率的基石。', br: 'I',
    p: [{ r: 'titan', b: 10, k: 1.12 }, { r: 'steel', b: 30, k: 1.12 }, { r: 'draft', b: 5, k: 1.12 }],
    e: { _refineryEff: .10, energyC: 2, pollutionP: .015 },
    uq: { u: { refining: 1 } },
  },
  observatory: {
    n: '望远台', t: 'b', d: '山巅的透镜对准夜空——每座望远台将星辰的位置记入星图。', br: 'I',
    p: [{ r: 'titan', b: 5, k: 1.12 }, { r: 'steel', b: 15, k: 1.12 }, { r: 'scroll', b: 20, k: 1.12 }],
    e: { starchartP: .005, starchartMx: 25 },
    uq: { u: { stargazing: 1 } },
  },
  cleanForest: {
    n: '净林', t: 'b', d: '种下经过筛选的树苗，让森林替你吸走浓烟。', br: 'I',
    p: [{ r: 'titan', b: 5, k: 1.12 }, { r: 'alloy', b: 3, k: 1.12 }, { r: 'draft', b: 2, k: 1.12 }],
    e: { pollutionP: -.05 },
    uq: { u: { refining: 1 }, b: { refinery: 1 } },
  },
  titanVault: {
    n: '钛库', t: 'b', d: '寒钛需要特殊存储——普通仓库装不住这种脾气古怪的金属。', br: 'I',
    p: [{ r: 'titan', b: 15, k: 1.12 }, { r: 'pillar', b: 3, k: 1.12 }],
    e: { titanMx: 40, alloyMx: 20 },
    uq: { b: { calcFurnace: 1 } },
  },

  // ===== 工业分支 D阶段：辉能时代（v0.20 §八 5.1） =====
  accelerator: {
    n: '加速器', t: 'b', d: '把寒钛塞进环形管道里来回甩——辉石就是它甩晕了之后吐出来的金属。', br: 'I', phase: 4,
    p: [{ r: 'titan', b: 50, k: 1.22 }, { r: 'alloy', b: 15, k: 1.22 }, { r: 'draft', b: 10, k: 1.22 }],
    e: { uraniumP: .003, titanP: -.015, energyC: 5, pollutionP: .03 },
    uq: { u: { fission: 1 } },
  },
  furnace: {
    n: '熔炉', t: 'b', d: '辉石在炉膛里慢慢释放——比蒸汽更烫，比火油更稳，连影子都被它点亮。', br: 'I', phase: 4,
    p: [{ r: 'titan', b: 30, k: 1.22 }, { r: 'alloy', b: 10, k: 1.22 }, { r: 'uranium', b: 5, k: 1.22 }],
    e: { energyP: 5, uraniumP: -.001, allM: .05, pollutionP: .025 },
    uq: { u: { radiantPower: 1 } },
  },
  radianceBox: {
    n: '辉匣', t: 'b', d: '装辉石的匣子——盖子合上之后，里面的光仍在自己转动。', br: 'I', phase: 4,
    p: [{ r: 'alloy', b: 10, k: 1.18 }, { r: 'uranium', b: 5, k: 1.18 }],
    e: { uraniumMx: 30, thoriumMx: 10 },
    uq: { b: { accelerator: 1 } },
  },

  // ===== 灵修分支 A阶段：初感（4 个建筑） =====
  // 造价/效果以 branch-mystic.md 第六节表为准
  spiritWell: {
    n: '灵泉', t: 'b', d: '地底灵脉渗出地表，汇成一泓微光的泉——持续涌出灵能，但扰动安宁。', br: 'M',
    p: [{ r: 'charm', b: 50, k: 1.12 }, { r: 'stone', b: 30, k: 1.12 }, { r: 'wood', b: 80, k: 1.12 }],
    e: { spiritP: .02, spiritMx: 50, unrestP: .01 },
    uq: { u: { spiritSense: 1 } },
    tip: ['泉水不说话，但它会发光——这就够了。']
  },
  spiritTower: {
    n: '灵塔', t: 'b', d: '高塔内壁刻满符纹，能留住灵能与命丝，不让它们散回风里。', br: 'M',
    p: [{ r: 'plank', b: 25, k: 1.12 }, { r: 'brick', b: 15, k: 1.12 }, { r: 'charm', b: 40, k: 1.12 }],
    e: { spiritMx: 50, fateSilkMx: 30 },
    uq: { b: { spiritWell: 2 }, u: { leylineLore: 1 } },
    tip: ['塔尖的光到了夜里会变蓝，有时候是紫的——看心情。']
  },
  quietRoom: {
    n: '静室', t: 'b', d: '用沉默对抗躁动——每座静室将躁念惩罚的起点推远一些。', br: 'M',
    p: [{ r: 'plank', b: 20, k: 1.12 }, { r: 'leather', b: 15, k: 1.12 }, { r: 'charm', b: 30, k: 1.12 }],
    e: { unrestThresh: 50 },
    uq: { u: { pureMind: 1 } },
    tip: ['门关上之后，安静本身就开始工作了。']
  },
  leyArray: {
    n: '聚灵阵', t: 'b', d: '石阵共振灵脉深处的节律，为灵修建筑提供持续的灵脉供给。', br: 'M',
    p: [{ r: 'sigil', b: 3, k: 1.15 }, { r: 'stone', b: 50, k: 1.15 }, { r: 'bead', b: 5, k: 1.15 }],
    e: { leylineP: 1, unrestP: .005 },
    uq: { u: { leylineLore: 1 }, b: { spiritWell: 1 } },
    tip: ['阵中石头排成的图案，和天上某组星星一模一样——这不是巧合。']
  },
  // ===== 灵修分支 B阶段建筑 =====
  resonTower: {
    n: '共振塔', t: 'b', d: '捕捉灵脉深处的共振——产出共振子，但持续消耗灵能。', br: 'M',
    p: [{ r: 'sigil', b: 5, k: 1.15 }, { r: 'bead', b: 10, k: 1.15 }, { r: 'fateSilk', b: 8, k: 1.15 }],
    e: { resonanceP: .015, resonanceMx: 25, spiritP: -.02, leylineP: 3, unrestP: .02 },
    uq: { u: { resonArt: 1 } },
  },
  elixirBrewery: {
    n: '灵酿坊', t: 'b', d: '灵修配方的效率源泉——每座提升灵修配方产出。', br: 'M',
    p: [{ r: 'plank', b: 30, k: 1.12 }, { r: 'bead', b: 15, k: 1.12 }, { r: 'spiritInk', b: 5, k: 1.12 }],
    e: { craftSpiritM: .05, unrestP: .01 },
    uq: { u: { elixirBrew: 1 } },
  },
  shapeHall: {
    n: '化形殿', t: 'b', d: '灵流在此凝聚为形体——化形之道由此开启，深耗灵脉。', br: 'M',
    p: [{ r: 'fateSilk', b: 15, k: 1.15 }, { r: 'sigil', b: 8, k: 1.15 }, { r: 'spectrum', b: 3, k: 1.15 }],
    e: { leylineC: 2, unrestP: .03 },
    uq: { u: { shapeBasic: 1 } },
  },
  oracleHall: {
    n: '通灵阁', t: 'b', d: '在沉静中聆听灵脉的低语——持续产出悟片。', br: 'M',
    p: [{ r: 'plank', b: 40, k: 1.12 }, { r: 'scroll', b: 20, k: 1.12 }, { r: 'fateSilk', b: 10, k: 1.12 }],
    e: { insightP: .005, insightMx: 15, unrestP: .015 },
    uq: { u: { oracleArt: 1 } },
  },
  calmGrove: {
    n: '净念林', t: 'b', d: '古树与灵泉共鸣——消解躁念，回归安宁。', br: 'M',
    p: [{ r: 'wood', b: 100, k: 1.12 }, { r: 'spiritInk', b: 8, k: 1.12 }, { r: 'sigil', b: 3, k: 1.12 }],
    e: { unrestP: -.04 },
    uq: { u: { calmMind: 1 } },
  },

  // ===== 灵修分支 C阶段建筑（5 个） =====
  crystalCave: {
    n: '结晶窟', t: 'b', d: '命丝与灵能在窟中凝结——晶丝的诞生需要黑暗和耐心。', br: 'M', phase: 4,
    p: [{ r: 'fateSilk', b: 20, k: 1.15 }, { r: 'spectrum', b: 5, k: 1.15 }, { r: 'bead', b: 20, k: 1.15 }],
    e: { crystalSilkP: .008, fateSilkP: -.01, spiritP: -.02, leylineC: 1, unrestP: .025 },
    uq: { u: { crystalize: 1 } },
  },
  radianceDais: {
    n: '辉映台', t: 'b', d: '晶丝在台上折射——辉芒是光线走了弯路后留下的东西。', br: 'M', phase: 4,
    p: [{ r: 'crystalSilk', b: 5, k: 1.15 }, { r: 'spectrum', b: 8, k: 1.15 }, { r: 'sigil', b: 10, k: 1.15 }],
    e: { radianceP: .003, leylineC: 2, unrestP: .03 },
    uq: { u: { radiant: 1 } },
  },
  coreForge: {
    n: '灵核炉', t: 'b', d: '晶丝和共振子在炉中翻搅——灵核就是灵力的心脏。', br: 'M', phase: 4,
    p: [{ r: 'crystalSilk', b: 8, k: 1.18 }, { r: 'resonance', b: 15, k: 1.18 }, { r: 'spiritCore', b: 2, k: 1.18 }],
    e: { spiritCoreP: .002, crystalSilkP: -.005, resonanceP: -.01, unrestP: .02 },
    uq: { u: { coreCraft: 1 } },
  },
  radiantGrove: {
    n: '净辉林', t: 'b', d: '辉芒浸润了每一棵树——连风也变得安静了。', br: 'M', phase: 4,
    p: [{ r: 'crystalSilk', b: 3, k: 1.15 }, { r: 'elixir', b: 2, k: 1.15 }, { r: 'spectrum', b: 5, k: 1.15 }],
    e: { unrestP: -.08 },
    uq: { u: { pureRadiance: 1 } },
  },
  chartHall: {
    n: '灵图阁', t: 'b', d: '灵图是灵脉的地图——画得越多，看得越远。', br: 'M', phase: 4,
    p: [{ r: 'insight', b: 5, k: 1.12 }, { r: 'spiritInk', b: 10, k: 1.12 }, { r: 'scroll', b: 30, k: 1.12 }],
    e: { spiritChartP: .001, unrestP: .01 },
    uq: { u: { chartDraw: 1 } },
  },

  // ===== 灵修分支 D阶段：深寂（v0.20 §八 5.2a-b） =====
  primordialPool: {
    n: '元念池', t: 'b', d: '把晶丝沉到水底——水也学会了想事情，慢慢地，它的想法凝出元念。', br: 'M', phase: 4,
    p: [{ r: 'crystalSilk', b: 15, k: 1.18 }, { r: 'spiritCore', b: 5, k: 1.18 }, { r: 'spectrum', b: 10, k: 1.18 }],
    e: { primordialP: .001, crystalSilkP: -.003, leylineC: 5, unrestP: .05 },
    uq: { u: { primordialism: 1 } },
  },
  silenceCave: {
    n: '寂石窟', t: 'b', d: '从洞里取出来的石头不会响，把它放回洞里，连风也安静下来。', br: 'M', phase: 4,
    p: [{ r: 'primordial', b: 10, k: 1.20 }, { r: 'spiritCore', b: 8, k: 1.20 }, { r: 'formSoul', b: 3, k: 1.20 }],
    e: { silenceStoneP: .0005, leylineP: 5, unrestP: .04, allM: .05 },
    uq: { u: { silenceCryst: 1 } },
  },
  spiritVault: {
    n: '灵匣', t: 'b', d: '装灵性物的匣子——盖上之后，里面的东西仍在自己浮动。', br: 'M', phase: 4,
    p: [{ r: 'crystalSilk', b: 10, k: 1.15 }, { r: 'silenceStone', b: 2, k: 1.15 }, { r: 'insight', b: 8, k: 1.15 }],
    e: { primordialMx: 30, silenceStoneMx: 20 },
    uq: { b: { primordialPool: 1 } },
  },

  // ===== 神启副线 A阶段：初悟 =====
  divineAltar: {
    n: '祭坛', d: '供奉先灵，积蓄虔诚。',
    p: [{ r: 'charm', b: 25, k: 1.12 }, { r: 'stone', b: 40, k: 1.12 }, { r: 'scroll', b: 8, k: 1.12 }],
    e: { pietyP: .02, pietyMx: 30 },
    uq: { u: { ritualBasic: 1 } }, sb: 'D', t: 'f',
  },
  scriptureHall: {
    n: '经阁', d: '收藏圣典，扩展虔诚容量。',
    p: [{ r: 'plank', b: 20, k: 1.12 }, { r: 'scroll', b: 15, k: 1.12 }, { r: 'charm', b: 15, k: 1.12 }],
    e: { pietyMx: 50, loreP: .01 },
    uq: { u: { scriptureLore: 1 } }, sb: 'D', t: 'f',
  },
  prayerPool: {
    n: '祈愿池', d: '安宁之水，福泽山谷。',
    p: [{ r: 'stone', b: 50, k: 1.15 }, { r: 'charm', b: 20, k: 1.15 }, { r: 'piety', b: 10, k: 1.15 }],
    e: { pietyP: .015, pietyMx: 20, _hapFlat: .02 },
    uq: { u: { graceLore: 1 } }, sb: 'D', t: 'f',
  },

  // ===== 神启副线 B-教团（工业+神启） =====
  holyForge: {
    n: '圣工坊', d: '钢铁供奉于炉，虔诚回报于心。',
    p: [{ r: 'steel', b: 30, k: 1.15 }, { r: 'charm', b: 40, k: 1.15 }, { r: 'holyOil', b: 3, k: 1.15 }],
    e: { pietyP: .03, steelP: -.5 },
    uq: { u: { holyFlameLore: 1 } }, sb: 'D', br: 'I', t: 'f',
  },
  holyKiln: {
    n: '圣火窑', d: '砖窑里烧着的看着是柴，里头其实是信仰在续着火。',
    p: [{ r: 'brick', b: 40, k: 1.12 }, { r: 'charm', b: 30, k: 1.12 }, { r: 'holyOil', b: 2, k: 1.12 }],
    e: { holyFlameP: .01, holyFlameMx: 25 },
    uq: { u: { holyFlameLore: 1 } }, sb: 'D', br: 'I', t: 'f',
  },
  edictHall: {
    n: '教令堂', d: '教令从此处颁布——每多一堂，可多一令。',
    p: [{ r: 'holyFlame', b: 8, k: 1.18 }, { r: 'scroll', b: 30, k: 1.18 }, { r: 'piety', b: 50, k: 1.18 }],
    e: { _edictSlot: 1, _edictDur: 1 },
    uq: { u: { edictLore: 1 } }, sb: 'D', br: 'I', t: 'f',
  },
  tribunalHall: {
    n: '审判庭', d: '审判不是惩罚——是净化。',
    p: [{ r: 'holyFlame', b: 12, k: 1.20 }, { r: 'brick', b: 60, k: 1.20 }, { r: 'piety', b: 80, k: 1.20 }],
    e: { pollutionM: -.05, pietyP: .01, _hapFlat: .01 },
    uq: { u: { judgmentLore: 1 } }, sb: 'D', br: 'I', t: 'f',
  },
  holyIronVault: {
    n: '圣铁库', d: '圣铁不朽，信仰亦然。',
    p: [{ r: 'holyIron', b: 5, k: 1.12 }, { r: 'brick', b: 40, k: 1.12 }, { r: 'steel', b: 15, k: 1.12 }],
    e: { holyIronMx: 30, holyFlameMx: 15 },
    uq: { u: { churchArchLore: 1 } }, sb: 'D', br: 'I', t: 'f',
  },
  oilPress: {
    n: '圣油坊', d: '多一分圣油，多一分恩典。',
    p: [{ r: 'plank', b: 30, k: 1.12 }, { r: 'charm', b: 20, k: 1.12 }, { r: 'piety', b: 20, k: 1.12 }],
    e: { _oilCraftBonus: .05 },
    uq: { u: { holyWorkLore: 1 } }, sb: 'D', br: 'I', t: 'f',
  },

  // ===== 神启副线 C-教团（工业+神启）（v0.20 §八 5.3a, 8 个建筑） =====
  cathedral: {
    n: '大教堂', d: '一座建筑能让山谷的影子都拉长——它就是这样的存在。',
    p: [{ r: 'hymn', b: 8, k: 1.25 }, { r: 'holyFlame', b: 15, k: 1.25 }, { r: 'piety', b: 200, k: 1.25 }, { r: 'concrete', b: 30, k: 1.25 }],
    e: { allM: .05, pietyP: .05, _hapFlat: .03 },
    uq: { u: { hymnArt: 1 } }, sb: 'D', br: 'I', t: 'f', phase: 4,
  },
  hymnHall: {
    n: '颂咏堂', d: '颂歌一遍遍唱起来——唱到第十遍时，连墙都开始嗡嗡共鸣。',
    p: [{ r: 'holyFlame', b: 8, k: 1.18 }, { r: 'scroll', b: 25, k: 1.18 }, { r: 'piety', b: 60, k: 1.18 }],
    e: { hymnP: .005, hymnMx: 20 },
    uq: { u: { hymnArt: 1 } }, sb: 'D', br: 'I', t: 'f', phase: 4,
  },
  pilgrimage: {
    n: '朝圣道', d: '一条铺到山外的路——走在上面的狐狸，回来时眼神都亮一些。',
    p: [{ r: 'concrete', b: 50, k: 1.20 }, { r: 'piety', b: 80, k: 1.20 }, { r: 'holyOil', b: 5, k: 1.20 }],
    e: { _hapFlat: .02, _caravanBonusFlat: .05 },
    uq: { u: { templeStudy: 1 } }, sb: 'D', br: 'I', t: 'f', phase: 4,
  },
  relicShrine: {
    n: '圣骸堂', d: '保存圣骸的地方——它本身不会动，但靠近的狐狸都会下意识踮起脚走路。',
    p: [{ r: 'holyRelic', b: 2, k: 1.18 }, { r: 'brick', b: 80, k: 1.18 }, { r: 'piety', b: 100, k: 1.18 }],
    e: { holyRelicMx: 20, pietyP: .02 },
    uq: { u: { relicLore: 1 } }, sb: 'D', br: 'I', t: 'f', phase: 4,
  },
  crusadeCamp: {
    n: '圣战营', d: '不是练兵——是练心。出营的狐狸知道自己回不回得来。',
    p: [{ r: 'holyIron', b: 10, k: 1.22 }, { r: 'holyFlame', b: 20, k: 1.22 }, { r: 'piety', b: 150, k: 1.22 }],
    e: { _expRewardBonus: .15, _edictDurBonus: 1 },
    uq: { u: { crusadeLore: 1 } }, sb: 'D', br: 'I', t: 'f', phase: 4,
  },
  scriptureSpire: {
    n: '圣典塔', d: '塔身刻满字，从下往上读是教义，从上往下读是预言。',
    p: [{ r: 'holyScripture', b: 3, k: 1.20 }, { r: 'concrete', b: 40, k: 1.20 }, { r: 'scroll', b: 80, k: 1.20 }],
    e: { holyScriptureMx: 10, _researchDiscount: .05, loreM: .15 },
    uq: { u: { scriptureCompile: 1 } }, sb: 'D', br: 'I', t: 'f', phase: 4,
  },
  atonementPool: {
    n: '净罪池', d: '把不安的念头沉进水里——浮起来的就不再是念头。',
    p: [{ r: 'holyOil', b: 8, k: 1.18 }, { r: 'concrete', b: 30, k: 1.18 }, { r: 'piety', b: 80, k: 1.18 }],
    e: { pollutionM: -.10, _hapFlat: .02 },
    uq: { u: { templeStudy: 1 } }, sb: 'D', br: 'I', t: 'f', phase: 4,
  },
  holyAltar: {
    n: '圣火祭坛', d: '圣火不灭——只要还有狐狸记得，火就不熄。',
    p: [{ r: 'holyFlame', b: 30, k: 1.22 }, { r: 'holyIron', b: 8, k: 1.22 }, { r: 'piety', b: 120, k: 1.22 }],
    e: { holyFlameP: .03, holyFlameMx: 30 },
    uq: { u: { crusadeLore: 1 } }, sb: 'D', br: 'I', t: 'f', phase: 4,
  },

  // ===== 神启副线 B-秘仪（灵修+神启） =====
  mysteryHall: {
    n: '秘仪殿', d: '秘知不在书中——在殿中独坐之人的沉默里。',
    p: [{ r: 'charm', b: 40, k: 1.15 }, { r: 'holyOil', b: 3, k: 1.15 }, { r: 'scroll', b: 20, k: 1.15 }],
    e: { gnosisP: .005, gnosisMx: 40 },
    uq: { u: { mysteryInit: 1 } }, sb: 'D', br: 'M', t: 'f',
  },
  sacredGrove: {
    n: '圣林', d: '树根间渗出的不是水——是被遗忘的祈祷。',
    p: [{ r: 'plank', b: 30, k: 1.12 }, { r: 'charm', b: 25, k: 1.12 }, { r: 'piety', b: 30, k: 1.12 }],
    e: { ambrosiaP: .008, pietyP: .01 },
    uq: { u: { groveLore: 1 } }, sb: 'D', br: 'M', t: 'f',
  },
  apotheosisPool: {
    n: '化神池', d: '每一池水，都是一扇门的钥匙。',
    p: [{ r: 'ambrosia', b: 10, k: 1.25 }, { r: 'gnosis', b: 15, k: 1.25 }, { r: 'charm', b: 50, k: 1.25 }],
    e: { gnosisMx: 20 },
    uq: { u: { apotheosisLore: 1 } }, sb: 'D', br: 'M', t: 'f',
  },
  forbiddenLib: {
    n: '禁典阁', d: '有些书不该被读——但你已经翻开了。',
    p: [{ r: 'ambrosia', b: 8, k: 1.18 }, { r: 'scroll', b: 30, k: 1.18 }, { r: 'gnosis', b: 10, k: 1.18 }],
    e: { gnosisMx: 80, loreP: .015 },
    uq: { u: { forbiddenLore: 1 } }, sb: 'D', br: 'M', t: 'f',
  },

  // ===== 神启副线 C-秘仪（灵修+神启）（v0.20 §八 5.3d, 8 个建筑） =====
  divinityForge: {
    n: '化神工坊', d: '一把锤子落下去——出来的器物里，藏着某只狐狸更深的形状。',
    p: [{ r: 'gnosis', b: 12, k: 1.20 }, { r: 'ambrosia', b: 5, k: 1.20 }, { r: 'crystalSilk', b: 10, k: 1.20 }],
    e: { divineInkP: .003, divineInkMx: 20, unrestP: .03 },
    uq: { u: { divineInkArt: 1 } }, sb: 'D', br: 'M', t: 'f', phase: 4,
  },
  prophecyHall: {
    n: '预言殿', d: '殿里没椅子——预言一来，听的都站直了。',
    p: [{ r: 'gnosis', b: 15, k: 1.20 }, { r: 'fateSilk', b: 10, k: 1.20 }, { r: 'concrete', b: 25, k: 1.20 }],
    e: { gnosisP: .03, _expRewardBonus: .10 },
    uq: { u: { prophecyArt: 1 } }, sb: 'D', br: 'M', t: 'f', phase: 4,
  },
  etherealGate: {
    n: '灵界通道', d: '门后没有路。但从门后回来的狐狸，眼神变了。',
    p: [{ r: 'apotheosisStone', b: 2, k: 1.22 }, { r: 'gnosis', b: 20, k: 1.22 }, { r: 'spirit', b: 100, k: 1.22 }],
    e: { apotheosisStoneP: .001, leylineC: 2, unrestP: .04 },
    uq: { u: { etherealLore: 1 } }, sb: 'D', br: 'M', t: 'f', phase: 4,
  },
  secretCellar: {
    n: '秘知窖', d: '地窖里堆着的不是粮食——是别处没人记得的事。',
    p: [{ r: 'gnosis', b: 15, k: 1.15 }, { r: 'stone', b: 100, k: 1.15 }, { r: 'scroll', b: 40, k: 1.15 }],
    e: { gnosisMx: 60, loreP: .02 },
    uq: { u: { etherealLore: 1 } }, sb: 'D', br: 'M', t: 'f', phase: 4,
  },
  ambrosiaSpring: {
    n: '神露泉', d: '泉水尝过一次，就再也不知道渴是什么。',
    p: [{ r: 'gnosis', b: 10, k: 1.18 }, { r: 'spirit', b: 50, k: 1.18 }, { r: 'stone', b: 80, k: 1.18 }],
    e: { ambrosiaP: .02, ambrosiaMx: 25 },
    uq: { u: { divineInkArt: 1 } }, sb: 'D', br: 'M', t: 'f', phase: 4,
  },
  apotheosisAltar: {
    n: '化神祭坛', d: '上去的狐狸不一定下来，下来的不一定是同一只。',
    p: [{ r: 'apotheosisStone', b: 3, k: 1.25 }, { r: 'gnosis', b: 30, k: 1.25 }, { r: 'ambrosia', b: 15, k: 1.25 }],
    e: { gnosisP: .04, _hapFlat: .02 },
    uq: { u: { apotheosisRite: 1 } }, sb: 'D', br: 'M', t: 'f', phase: 4,
  },
  pureMindHall: {
    n: '净念殿', d: '把心里多出来的那一片摘掉——剩下的，是真正能装东西的地方。',
    p: [{ r: 'gnosis', b: 10, k: 1.18 }, { r: 'ambrosia', b: 8, k: 1.18 }, { r: 'spirit', b: 60, k: 1.18 }],
    e: { unrestP: -.08, _hapFlat: .01 },
    uq: { u: { pureMindLore: 1 } }, sb: 'D', br: 'M', t: 'f', phase: 4,
  },
  forbiddenSpire: {
    n: '禁典塔', d: '塔顶常年雾——爬上去过的狐狸不愿再说自己看见过什么。',
    p: [{ r: 'forbiddenCodex', b: 2, k: 1.22 }, { r: 'gnosis', b: 25, k: 1.22 }, { r: 'concrete', b: 30, k: 1.22 }],
    e: { forbiddenCodexMx: 10, _researchDiscount: .05, loreM: .15 },
    uq: { u: { forbiddenCompile: 1 } }, sb: 'D', br: 'M', t: 'f', phase: 4,
  },

  // ===== 通达副线 Phase A：初交（3 个建筑） =====
  embassy: {
    n: '使馆', d: '正式邦交之始。声誉持续积累，来客信任渐增。', t: 'w',
    p: [{ r: 'charm', b: 20, k: 1.12 }, { r: 'plank', b: 35, k: 1.12 }, { r: 'scroll', b: 6, k: 1.12 }],
    e: { renownP: .02, renownMx: 30 },
    uq: { u: { envoyBasic: 1 } }, sb: 'T',
  },
  receptionHall: {
    n: '迎宾堂', d: '以礼相待，广纳远客。', t: 'w',
    p: [{ r: 'plank', b: 25, k: 1.12 }, { r: 'scroll', b: 12, k: 1.12 }, { r: 'charm', b: 12, k: 1.12 }],
    e: { renownMx: 50, hapB: .015 },
    uq: { u: { credentialLore: 1 } }, sb: 'T',
  },
  courierPost: {
    n: '信驿', d: '信使往来不绝，信物积少成多。', t: 'w',
    p: [{ r: 'stone', b: 45, k: 1.15 }, { r: 'scroll', b: 10, k: 1.15 }, { r: 'charm', b: 15, k: 1.15 }],
    e: { credentialP: .005, renownP: .01 },
    uq: { u: { credentialLore: 1 } }, sb: 'T',
  },

  // ===== 通达副线 Phase B：结邦（4 个建筑） =====
  charterHall: {
    n: '邦交堂', d: '正式的外交文书从这里签发。', t: 'w',
    p: [{ r: 'charm', b: 35, k: 1.15 }, { r: 'credential', b: 3, k: 1.15 }, { r: 'scroll', b: 18, k: 1.15 }],
    e: { charterP: .005, charterMx: 30 },
    uq: { u: { allianceInit: 1 } }, sb: 'T',
  },
  exoticVault: {
    n: '异珍阁', d: '存放来自远方的稀奇物件。', t: 'w',
    p: [{ r: 'plank', b: 30, k: 1.12 }, { r: 'credential', b: 4, k: 1.12 }, { r: 'ancCoin', b: 8, k: 1.12 }],
    e: { exoticMx: 20 },
    uq: { u: { exoticLore: 1 } }, sb: 'T',
  },
  guestQuarter: {
    n: '远客居', d: '远方来客需要一个能安心喝茶的地方。', t: 'w',
    p: [{ r: 'plank', b: 25, k: 1.12 }, { r: 'brick', b: 15, k: 1.12 }, { r: 'charm', b: 10, k: 1.12 }],
    e: { renownP: .015, hapB: .01 },
    uq: { u: { guestLore: 1 } }, sb: 'T',
  },
  alliancePlatform: {
    n: '会盟台', d: '盟约在此缔结——每多一台，可深化一族。', t: 'w',
    p: [{ r: 'credential', b: 8, k: 1.22 }, { r: 'charter', b: 12, k: 1.22 }, { r: 'charm', b: 40, k: 1.22 }],
    e: {},
    uq: { u: { allianceLore: 1 } }, sb: 'T',
  },
};
const JD = {
  gatherer:   { n: '采集者', d: '采集野莓',   desc: '野莓 +0.5/s；授业可提升野莓产出', e: { berryP: 1 },     on: 1, tip: ['走走走，去看看山谷今天给我们留了什么。'] },
  woodcutter: { n: '伐木工', d: '砍伐圆木',   desc: '圆木 +0.12/s；授业可提升圆木产出', e: { woodP: .24 },    uq: { b: { lumberYard: 1 } }, tip: ['听得懂树倒的方向，就不会被砸到。'] },
  miner:      { n: '矿工',   d: '开采碎石',   desc: '碎石 +0.08/s；授业可提升碎石产出', e: { stoneP: .16 },   uq: { b: { quarry: 1 } }, tip: ['挖石头的狐狸不抬头看天，天塌了有石头顶着。'] },

  hunter:     { n: '猎手',   d: '捕猎兽皮',   desc: '兽皮 +0.015/s；香草入账后副产 +0.0025/s；授业可提升兽皮产出', e: { leatherP: .03, spiceP: .005 }, uq: { b: { tannery: 1 } }, tip: ['天没亮就进林子，轻着脚走，竖着耳朵听。'] },
  scholar:    { n: '学者',   d: '积累学识',   desc: '学识 +0.04/s、卷轴 +0.0025/s、符咒 +0.001/s；授业可提升学识产出', e: { loreP: .08, scrollP: .005, charmP: .002 },    uq: { b: { library: 1 } }, tip: ['用爪子翻书不太方便，但慢有慢的好处——每一页都记得牢。', '尾巴尖蘸了墨，写出来的字比手写的还好看。'] },
  smith:      { n: '铁匠',   d: '锻造铁器',   desc: '矿铁 +0.01/s；授业可提升矿铁产出', e: { ironP: .02 },    uq: { b: { smithy: 1 } }, tip: ['锤子落下去是蛮力，提起来才是手艺。'] },
  merchant:   { n: '商贩',   d: '赚取铜钱',   desc: '铜钱 +0.01/s；授业可提升铜钱产出', e: { coinP: .02 },    uq: { b: { market: 1 } }, tip: ['三寸不烂之舌，换来三尺不烂之布。', '把东边的故事卖给西边，赚一点路费。'] },
  scout:      { n: '斥候',   d: '远行探路',   desc: '出征远行队伍来源；授业可提升远行奖励', e: {}, uq: { b: { trailroad: 1 } }, tip: ['比风先到，比影子更轻，回来的时候揣着一兜子情报。'] },

  // ===== 工业分支 A阶段职业 =====
  deepMiner:  { n: '深层矿工', d: '开采深层煤矿', e: { coalP: .06 }, br: 'I', uq: { b: { mine: 1 } }, tip: ['地底越深越暗，但煤越来越亮。', '矿道里的风有自己的脾气，学会听它说话，就不会迷路。'] },
  smelter:    { n: '炉匠',   d: '自动炼钢',   desc: '每60tick自动消耗铁×5+煤×8炼出钢×1；授业可提升炼钢频率', e: {}, br: 'I', uq: { b: { blastFurnace: 1 } }, tip: ['火候看脸色，锤声听手感。', '铁和煤在炉子里吵了一架，出来的时候变成了钢。'] },

  // ===== 工业分支 B阶段职业 =====
  driller:    { n: '钻井工', d: '深采火油',   e: { oilP: .03 }, br: 'I', uq: { u: { oilGas: 1 }, b: { oilWell: 3 } }, tip: ['地底的黑水比地上的井水难伺候多了——它会喷、会烫、会着火。', '钻头转了一圈又一圈，黑金终于愿意上来见人。'] },
  machinist:  { n: '机师',   d: '维护能量设施', desc: '每人使所有能量产出建筑效率+15%（加法叠加）；授业可进一步提升', e: {}, br: 'I', uq: { u: { steamPower: 1 }, b: { steamEngine: 2 } }, tip: ['齿轮和活塞是我的语言，蒸汽是我的标点。', '听声音就知道哪颗螺丝松了——这种本事是被烫出来的。'] },
  engineer:   { n: '工程师', d: '设计与优化',  desc: '每人使所有配方产出+3%（加法叠入）；被动产出蓝本 +0.001/s', e: { draftP: .002 }, br: 'I', uq: { u: { assemblyLine: 1 }, b: { factory: 2 } }, tip: ['图纸上的线条看着简单，背后是三十次失败。', '让机器替狐狸干活——这才是真正的偷懒艺术。'] },

  // ===== 工业分支 C阶段职业 =====
  refiner:    { n: '精炼师', d: '精炼寒钛', desc: '全局被动：寒钛产出+0.002/s（需至少2座煅烧炉存在）', e: { titanP: .004 }, br: 'I', uq: { b: { calcFurnace: 2 } } },

  // ===== 工业分支 D阶段职业（v0.20 §八 5.1d） =====
  radianceExpert: { n: '辉能士', d: '辉石增产 + 熔炉效率', desc: '辉石产出+0.005/s（需至少1座熔炉存在）', e: { uraniumP: .005 }, br: 'I', phase: 4, uq: { b: { furnace: 1 } } },

  // ===== 灵修分支 A阶段职业 =====
  spiritSenser: { n: '感应者', d: '引导灵流', e: { spiritP: .02 }, br: 'M', uq: { b: { spiritWell: 1 } }, tip: ['闭着眼比睁着眼看得清——至少灵流是这样的。', '它们说灵流有方向，但每只狐狸感应到的方向都不一样。'] },
  silkWeaver:      { n: '织丝人', d: '织命丝',   desc: '命丝产出 +0.0075/s（需灵塔×2）', e: { fateSilkP: .015 }, br: 'M', uq: { b: { spiritTower: 2 } }, tip: ['命丝是哄出来的——纺机做不到这件事，你得让灵能相信自己想变成线。', '织到一半断了也别慌，命丝自己会找到另一头。'] },
  // ===== 灵修分支 B阶段职业 =====
  resonancer:      { n: '共鸣师', d: '感应共振',  e: { resonanceP: .01 }, br: 'M', uq: { b: { resonTower: 2 } }, tip: ['两颗灵珠靠近时会嗡嗡响——共鸣师的耳朵比灵珠还灵。'] },
  sageOracle:      { n: '悟者',   d: '凝聚悟片',  e: { insightP: .008 }, br: 'M', uq: { b: { oracleHall: 2 } }, tip: ['想到一个字之前，它先想到了你。'] },
  elixirBrewer:    { n: '酿灵师', d: '酿灵液',   desc: '每60tick自动消耗灵能×15+野莓×50酿出灵液×1；授业可提升酿灵频率', e: {}, br: 'M', uq: { b: { elixirBrewery: 3 } }, tip: ['灵液是等出来的——锅煮不出来；火候这个词，其实是耐心的别名。'] },

  // ===== 灵修分支 C阶段职业 =====
  shapeMaster:     { n: '化形师', d: '化形守护', desc: '全局被动：灵图产出+10%，灵术冷却-5%', e: {}, br: 'M', uq: { b: { shapeHall: 2 } } },

  // ===== 灵修分支 D阶段职业（v0.20 §八 5.2d） =====
  silenceAdept:    { n: '深寂士', d: '元念专精', desc: '元念产出+0.002/s（需至少1座寂石窟存在）', e: { primordialP: .004 }, br: 'M', phase: 4, uq: { b: { silenceCave: 1 } } },
  pactChanneler:   { n: '契灵使', d: '灵契沟通', desc: '当前活跃灵契产出+5%/人，灵契祭坛效果+3%/人', e: {}, br: 'M', phase: 4, uq: { u: { spiritPactLore: 1 } } },

  // ===== 神启副线 A阶段 =====
  priest: { n: '祭司', e: { pietyP: .04 }, uq: { b: { scriptureHall: 1 } }, sb: 'D' },

  // ===== 神启副线 B-教团 =====
  fanatic:   { n: '狂信者', d: '狂热信徒', desc: '虔诚+0.03/s，每多1名狂信者所有狂信者产出+5%', e: { pietyP: .03 }, uq: { b: { edictHall: 1 } }, sb: 'D', br: 'I' },
  holySmith: { n: '圣工匠', d: '锻造圣铁', desc: '圣铁+0.02/s（需圣工坊）', e: { holyIronP: .02 }, uq: { u: { holyIronLore: 1 }, b: { holyForge: 2 } }, sb: 'D', br: 'I' },

  // ===== 神启副线 C-教团（v0.20 §八 5.3b） =====
  cantor:   { n: '颂咏师', d: '颂咏产出', desc: '颂咏+0.005/s（需颂咏堂×1）', e: { hymnP: .005 }, uq: { b: { hymnHall: 1 } }, sb: 'D', br: 'I', phase: 4 },
  crusader: { n: '十字军', d: '远行+虔诚双产', desc: '虔诚+0.02/s（需圣战营×1）；远行加成留 5.3c 升级实装', e: { pietyP: .02 }, uq: { b: { crusadeCamp: 1 } }, sb: 'D', br: 'I', phase: 4 },

  // ===== 神启副线 B-秘仪 =====
  mysticAdept: { n: '秘仪师', d: '研习秘知', desc: '秘知+0.02/s（仅在秘仪殿工作时生效）；效率递减', e: { gnosisP: .02 }, uq: { b: { mysteryHall: 1 } }, sb: 'D', br: 'M' },

  // ===== 通达副线 Phase A =====
  envoy: { n: '使者', d: '招待远客', desc: '声望+0.04/s（需迎宾堂）', e: { renownP: .04 }, uq: { b: { receptionHall: 1 } }, sb: 'T' },
  // ===== 通达副线 Phase B =====
  diplomat: { n: '邦交官', d: '签发邦书', desc: '邦书+0.015/s（需邦交堂）', e: { charterP: .015 }, uq: { b: { charterHall: 1 } }, sb: 'T' },
};

// ===== 研究定义 =====
const UD = {
  stoneTools: {
    n: '石制工具', d: '提高采集与伐木效率。',
    p: [{ r: 'lore', a: 8 }, { r: 'stone', a: 15 }],
    e: { berryM: .5, woodM: .3 },
    uq: { b: { library: 1 } },
    tip: ['手里捏着一块石头，脑子里开始制造杠杆。']
  },


  carpentry: {
    n: '木工技艺', d: '学会木板加工。',
    p: [{ r: 'lore', a: 20 }, { r: 'wood', a: 30 }],
    e: { plankU: 1, woodM: .3 },
    uq: { b: { library: 1, lumberYard: 1 } },
    tip: ['当狐狸学会量尺寸，木头就紧张了。', '木头终于学会了配合你的想象力。']
  },
  masonry: {
    n: '石砌术', d: '学会砖块加工。',
    p: [{ r: 'lore', a: 25 }, { r: 'stone', a: 35 }],
    e: { brickU: 1, stoneM: .3 },
    uq: { b: { library: 1, quarry: 1 } },
    tip: ['不是所有石头都愿意叠在一起，得看缘分和灰浆。', '教一群碎石表演叠罗汉，并要求它们坚持一百年。']
  },
  forestLore: {
    n: '林间密语', d: '（被动）大幅提升伐木效率。',
    p: [{ r: 'lore', a: 35 }, { r: 'wood', a: 20 }],
    e: { woodM: .5 },
    uq: { u: { stoneTools: 1 } },
    tip: ['老树根底下压着的，是只有狐狸听得懂的话。']
  },
  ironWorking: {
    n: '铁器冶炼', d: '提高矿铁产出。',
    p: [{ r: 'lore', a: 40 }, { r: 'iron', a: 5 }],
    e: { ironM: .5 },
    uq: { b: { smithy: 1 } },
    tip: ['火候差一分，铁就只是块有脾气的石头。']
  },
  foxFolklore: {
    n: '狐灵传说', d: '提升符咒之力与满意度。',
    p: [{ r: 'lore', a: 50 }, { r: 'charm', a: 3 }],
    e: { charmM: .5, hapB: .1 },
    uq: { b: { shrine: 1 } },
    tip: ['先祖说的话，一半在风里，一半在梦里。']
  },
  spiritShelter: {
    n: '灵狐庇护', d: '（被动）减轻寒冬对野莓产量的影响。',
    p: [{ r: 'lore', a: 45 }, { r: 'charm', a: 8 }, { r: 'scroll', a: 3 }],
    e: { winterBuff: 1 },
    uq: { u: { foxFolklore: 1 } },
    tip: ['爪子搭在你肩上，暖烘烘的，但别回头。']
  },
  ancestorEye: {
    n: '先祖之眼', d: '（被动）减少狐狸的野莓消耗。',
    p: [{ r: 'lore', a: 35 }, { r: 'charm', a: 5 }, { r: 'scroll', a: 2 }],
    e: { foxEat: 1 },
    uq: { u: { foxFolklore: 1 } },
    tip: ['窝顶上蹲着先祖，碗里不敢剩东西。']
  },
  craftMastery: {
    n: '工法精要', d: '工坊配方可自行制作。',
    p: [{ r: 'lore', a: 30 }, { r: 'plank', a: 3 }, { r: 'brick', a: 2 }],
    e: { autoCraft: 1 },
    uq: { u: { carpentry: 1, masonry: 1 } },
    tip: ['让手艺自己记住该怎么动，狐狸就可以去发呆了。', '重复一千遍的事情，第一千零一遍开始就不需要人了。']
  },
  beyondValley: {
    n: '山外见闻', d: '山外的去处与驿道由此可达。',
    p: [{ r: 'lore', a: 30 }, { r: 'coin', a: 10 }, { r: 'scroll', a: 2 }],
    e: { beyondTab: 1 },
    uq: { b: { market: 1, library: 1 } },
    tip: ['出了山谷才发现，世界比尾巴还长。']
  },
  longJourney: {
    n: '远途跋涉', d: '（被动）远行奖励 +50%。',
    p: [{ r: 'lore', a: 45 }, { r: 'silk', a: 1 }, { r: 'ancCoin', a: 1 }],
    e: { expReward: .5 },
    uq: { b: { trailroad: 2 }, exp: { oldRuin: 1 } },
    tip: ['走远路的第一课，是学会不回头。']
  },

  // ===== v0.14 文化研究（占位名） =====
  folkLore: {
    n: '树下初闻', d: '树荫堂可建起，彩络工艺通晓，三个入门习俗成形。',
    p: [{ r: 'lore', a: 80 }],
    e: { hapB: .03 },
    uq: { b: { shrine: 1 } },
    tip: ['有只幼狐的后爪，不自觉地抠进了土里。']
  },
  calendar: {
    n: '月令新酿', d: '月歌台可建起，醴浆入账，两种新习俗成形。',
    p: [{ r: 'lore', a: 100 }, { r: 'scroll', a: 5 }],
    e: { hapB: .02, berryM: .05 },
    uq: { u: { folkLore: 1 }, b: { storyTree: 1 } },
    tip: ['等月亮，等果熟，等酒醒。', '把太阳的刻度，酿成狐狸喉间的灼热。']
  },
  engraving: {
    n: '岁时有常', d: '刻名碑可建起，墨锭入账，四种新习俗成形。',
    p: [{ r: 'lore', a: 120 }, { r: 'scroll', a: 10 }],
    e: { loreM: .1 },
    uq: { u: { folkLore: 1 }, b: { storyTree: 1 } },
    tip: ['大火流兮草虫鸣，繁霜降兮草木零。']
  },
  artistryLore: {
    n: '百艺通觉', d: '艺工坊可建起；彩络/醴浆/墨锭总产 +20%。',
    p: [{ r: 'lore', a: 150 }, { r: 'dye', a: 5 }],
    e: {},
    uq: { u: { engraving: 1 } },
    tip: ['手上活太多，终于串味了。']
  },
  customsDeep: {
    n: '俗成共庆', d: '建起共聚堂——让山谷更会聚在一起。',
    p: [{ r: 'lore', a: 200 }],
    e: { hapB: .05 },
    uq: { u: { engraving: 1 }, custom: 5 },
    tip: ['快乐太重了，得全村一起，才抛得起来。']
  },
  ancestry: {
    n: '连枝溯本', d: '祖龛可建起，祖荫祭这门习俗也立起来。',
    p: [{ r: 'lore', a: 130 }, { r: 'ink', a: 3 }],
    e: { charmM: .1 },
    uq: { u: { calendar: 1 }, b: { shrine: 3 } },
    tip: ['发现自己是无数个"过去"终于长出的"现在"。']
  },
  // ===== v0.16 政体研究 =====
  councilLore: {
    n: '共谷议事', d: '议事堂建起，典制下「治理」一脉由此开启。',
    p: [{ r: 'lore', a: 300 }, { r: 'scroll', a: 20 }],
    e: {},
    uq: { u: { engraving: 1 }, custom: 5 },
    tip: ['坐下来说的第一句话，往往是"你先说"。']
  },
  polityLore: {
    n: '法度通论', d: '治风堂可建起，山谷可在大势之间择道。',
    p: [{ r: 'lore', a: 400 }, { r: 'scroll', a: 40 }],
    e: {},
    uq: { u: { councilLore: 1 }, b: { councilHall: 2 } },
    tip: ['规矩是大家同意走的那条路，没人把它当笼子。']
  },
  policyLore: {
    n: '集议传统', d: '山谷的政事可分域而议。',
    p: [{ r: 'lore', a: 350 }, { r: 'coin', a: 50 }, { r: 'scroll', a: 30 }],
    e: {},
    uq: { u: { polityLore: 1 }, polity: true },
    tip: ['众狐议事，各有各的尾巴翘法。']
  },
  branchLore: {
    n: '择路而治', d: '造物（工业）与灵术（灵修），道路在此分叉，只能择其一深耕。',
    p: [{ r: 'lore', a: 400 }, { r: 'scroll', a: 40 }],
    e: {},
    uq: { u: { polityLore: 1, policyLore: 1 }, polity: true, b: { councilHall: 3 }, custom: 7 },
    tip: ['两条路都在脚下——选定后再无回头。']
  },

  // ===== 工业分支 A阶段：煤钢时代（6 个研究） =====
  deepMining: {
    n: '黑脉勘采', d: '向更深的岩层掘进，发现黑色的可燃矿脉。', br: 'I',
    p: [{ r: 'lore', a: 500 }, { r: 'scroll', a: 30 }, { r: 'iron', a: 10 }],
    e: { coalU: 1 },
    uq: { b: { smithy: 2 } },
  },
  steelWork: {
    n: '铁煤冶炼', d: '以煤熔铁，锻出远比矿铁坚硬的合金。', br: 'I',
    p: [{ r: 'lore', a: 600 }, { r: 'scroll', a: 40 }, { r: 'coal', a: 30 }],
    e: { steelU: 1 },
    uq: { u: { deepMining: 1 }, b: { mine: 2 } },
  },
  fineCraft: {
    n: '齿合精工', d: '精密咬合的齿轮，是一切机械的起点。', br: 'I',
    p: [{ r: 'lore', a: 500 }, { r: 'steel', a: 5 }],
    e: { gearU: 1 },
    uq: { u: { steelWork: 1 }, b: { blastFurnace: 1 } },
  },
  forging: {
    n: '轧板工艺', d: '将钢锤薄，得到可用于建造的钢板。', br: 'I', phase: 3,
    p: [{ r: 'lore', a: 450 }, { r: 'steel', a: 8 }],
    e: { plateU: 1 },
    uq: { u: { steelWork: 1 }, b: { blastFurnace: 1 } },
  },
  concreteTech: {
    n: '凝石配方', d: '石与煤在高温下融合，冷却后坚如磐石。', br: 'I', phase: 3,
    p: [{ r: 'lore', a: 400 }, { r: 'coal', a: 20 }, { r: 'brick', a: 30 }],
    e: { concreteU: 1 },
    uq: { u: { steelWork: 1 }, b: { blastFurnace: 1 } },
  },
  pollControl: {
    n: '清浊工事', d: '工业的代价需要偿还——净化池由此可建起，慢慢消解谷里的浊气。', br: 'I',
    p: [{ r: 'lore', a: 400 }, { r: 'scroll', a: 20 }],
    e: {},
    uq: { u: { deepMining: 1 } },
  },

  // ===== 工业分支 B阶段：油火时代（10 个研究） =====
  oilExtract: {
    n: '汲液工法', d: '地底深处有一种黑色的液体，比水稠，比火急。', br: 'I', phase: 3,
    p: [{ r: 'lore', a: 950 }, { r: 'scroll', a: 70 }, { r: 'steel', a: 15 }],
    e: { oilU: 1 },
    uq: { u: { fineCraft: 1 }, b: { blastFurnace: 3 } },
  },
  oilStorage: {
    n: '油储学', d: '火油易燃、易挥、易怒——学会驯服它的第一步是给它找个好容器。', br: 'I', phase: 3,
    p: [{ r: 'lore', a: 680 }, { r: 'plate', a: 10 }],
    e: { barrelU: 1 },
    uq: { u: { oilExtract: 1 } },
  },
  steamPower: {
    n: '蒸汽原理', d: '水被火逼急了会跑，跑得够快就能推动齿轮。', br: 'I', phase: 3,
    p: [{ r: 'lore', a: 1100 }, { r: 'scroll', a: 80 }, { r: 'steel', a: 20 }, { r: 'oil', a: 12 }],
    e: {},
    uq: { u: { oilExtract: 1 } },
  },
  combustion: {
    n: '内燃机理', d: '不再烧水推轮子——直接让火油在铁肚子里炸开。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1200 }, { r: 'steel', a: 25 }, { r: 'oil', a: 20 }],
    e: {},
    uq: { u: { steamPower: 1 } },
  },
  blueprintLore: {
    n: '蓝本学', d: '从"想到哪做到哪"到"画好了再动手"——工程的起点。', br: 'I',
    p: [{ r: 'lore', a: 950 }, { r: 'scroll', a: 50 }, { r: 'gear', a: 5 }],
    e: { draftU: 1 },
    uq: { u: { combustion: 1 } },
  },
  assemblyLine: {
    n: '流水线', d: '每只狐狸只做一道工序，合起来比谁都快。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1400 }, { r: 'steel', a: 35 }, { r: 'gear', a: 25 }, { r: 'draft', a: 3 }],
    e: {},
    uq: { u: { blueprintLore: 1, combustion: 1 }, b: { steamEngine: 4 } },
  },
  transmission: {
    n: '传动学', d: '齿轮咬着齿轮，力量从一端传到看不见的另一端。', br: 'I',
    p: [{ r: 'lore', a: 850 }, { r: 'gear', a: 18 }],
    e: {},
    uq: { u: { fineCraft: 1 }, b: { steamEngine: 3 } },
  },
  roadwork: {
    n: '通途', d: '铁轨比泥路快，比驿道稳——商队的脚步从此有了节拍。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 950 }, { r: 'steel', a: 25 }, { r: 'concrete', a: 12 }, { r: 'coin', a: 80 }],
    e: {},
    uq: { u: { transmission: 1 } },
  },
  cleanWind: {
    n: '清风', d: '让风做清洁工——风力塔由此可建起，既净污气，又收一点微弱的风能。', br: 'I',
    p: [{ r: 'lore', a: 700 }, { r: 'scroll', a: 45 }, { r: 'steel', a: 10 }],
    e: {},
    uq: { u: { pollControl: 1 }, b: { purifier: 3 } },
  },
  oilGas: {
    n: '油气学', d: '深井里冒出的不只有油，还有看不见的气——学会收集它。', br: 'I',
    p: [{ r: 'lore', a: 850 }, { r: 'oil', a: 22 }, { r: 'draft', a: 2 }],
    e: {},
    uq: { u: { oilExtract: 1 }, b: { oilWell: 4 } },
  },

  // ===== 工业分支 C阶段：精金时代（12 个研究） =====
  calcination: {
    n: '煅烧', d: '高温下矿石会释放出一种比铁更倔的金属——寒钛。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1200 }, { r: 'steel', a: 25 }, { r: 'oil', a: 15 }, { r: 'draft', a: 3 }],
    e: { titanU: 1 },
    uq: { u: { assemblyLine: 1 }, b: { factory: 2 } },
  },
  stargazing: {
    n: '观星', d: '抬头看天的狐狸不一定在发呆——有些在画星图。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 800 }, { r: 'titan', a: 5 }, { r: 'scroll', a: 30 }],
    e: { starchartU: 1 },
    uq: { u: { calcination: 1 } },
  },
  refining: {
    n: '精炼', d: '寒钛加上钢，在高温中融为一体——合金比两者都强。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1400 }, { r: 'titan', a: 15 }, { r: 'draft', a: 5 }],
    e: { alloyU: 1 },
    uq: { u: { calcination: 1 }, b: { calcFurnace: 2 } },
  },
  precFab: {
    n: '精构', d: '用合金铸出精密构件——每一颗螺栓都有它该在的位置。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1000 }, { r: 'titan', a: 10 }, { r: 'alloy', a: 3 }],
    e: { titanPartU: 1 },
    uq: { u: { refining: 1 } },
  },
  heavyBuild: {
    n: '重筑', d: '混凝不够用了——加上寒钛，柱子就能撑住更高的屋顶。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 900 }, { r: 'concrete', a: 10 }, { r: 'titan', a: 5 }],
    e: { pillarU: 1 },
    uq: { u: { concreteTech: 1, refining: 1 } },
  },
  systematics: {
    n: '系统论', d: '把零碎的蓝本编成纲要——从此设计不再是拍脑袋。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1100 }, { r: 'draft', a: 5 }, { r: 'scroll', a: 50 }],
    e: { outlineU: 1 },
    uq: { u: { assemblyLine: 1 }, b: { factory: 3 } },
  },
  rotaryKiln: {
    n: '回转', d: '窑炉转起来了——连续进料，不再等一炉烧完才开下一炉。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1300 }, { r: 'titan', a: 20 }, { r: 'oil', a: 20 }],
    e: {},
    uq: { u: { calcination: 1 }, b: { calcFurnace: 3 } },
  },
  fluidMech: {
    n: '流体力学', d: '液体在管道里不只是流——它有速度、有压力、有脾气。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1200 }, { r: 'titan', a: 15 }, { r: 'oil', a: 25 }],
    e: {},
    uq: { u: { rotaryKiln: 1 } },
  },
  alloyScience: {
    n: '合金学', d: '不同的金属混在一起，脾气比单独时都大——学会安抚它们。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1100 }, { r: 'alloy', a: 5 }, { r: 'titan', a: 10 }],
    e: {},
    uq: { u: { refining: 1 }, b: { refinery: 2 } },
  },
  modularEng: {
    n: '模块工程', d: '把大机器拆成小模块——坏了换一块，不用推倒重来。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1300 }, { r: 'alloy', a: 8 }, { r: 'draft', a: 8 }],
    e: {},
    uq: { u: { assemblyLine: 1, precFab: 1 } },
  },
  automation: {
    n: '自动化', d: '机器自己转，狐狸只管看——这才是工业的终极理想。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1400 }, { r: 'alloy', a: 10 }, { r: 'titanPart', a: 5 }, { r: 'draft', a: 10 }],
    e: {},
    uq: { u: { modularEng: 1 }, b: { factory: 3 } },
  },
  telescopeAdv: {
    n: '望远精修', d: '磨镜片是一门需要耐心的手艺——比磨脾气还难。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 900 }, { r: 'titan', a: 8 }, { r: 'alloy', a: 3 }],
    e: {},
    uq: { u: { stargazing: 1 }, b: { observatory: 3 } },
  },

  // ===== 工业分支 D阶段：辉能时代研究链（5.1c, 13 项） =====
  fission: {
    n: '裂变', d: '把寒钛压进合金笼里——它会慢慢碎成会发光的灰。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1800 }, { r: 'titan', a: 50 }, { r: 'alloy', a: 10 }, { r: 'draft', a: 10 }],
    e: { uraniumU: 1 },
    uq: { u: { refining: 1 }, b: { refinery: 2 } },
  },
  radiantPower: {
    n: '辉能', d: '辉石不只是会发光——把光收起来，能煮饭，也能熔金。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 2000 }, { r: 'uranium', a: 10 }, { r: 'alloy', a: 15 }],
    e: {},
    uq: { u: { fission: 1 }, b: { accelerator: 1 } },
  },
  particle: {
    n: '粒子学', d: '辉光是无数颗的合声，看清每一颗，才能让它们听话。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1600 }, { r: 'uranium', a: 15 }, { r: 'alloy', a: 8 }],
    e: {},
    uq: { u: { fission: 1 } },
  },
  shielding: {
    n: '屏蔽术', d: '辉石的脾气不能放任——一层混凝、一层钛、再一层混凝，它就老实了。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1500 }, { r: 'uranium', a: 20 }, { r: 'pillar', a: 5 }],
    e: {},
    uq: { u: { radiantPower: 1 } },
  },
  proliferation: {
    n: '增殖论', d: '一颗辉石点燃，能引出第二颗——只要环境对。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1700 }, { r: 'uranium', a: 30 }, { r: 'draft', a: 10 }],
    e: {},
    uq: { u: { radiantPower: 1 }, b: { furnace: 2 } },
  },
  thoriumConv: {
    n: '重晶转化', d: '把辉石的余烬再熔一次——会得到更稳、更密的东西。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1500 }, { r: 'uranium', a: 30 }],
    e: { thoriumU: 1 },
    uq: { u: { radiantPower: 1 } },
  },
  superCond: {
    n: '超导', d: '冷到一定程度，电就不再损耗——辉能从此走得更远。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1800 }, { r: 'alloy', a: 15 }, { r: 'uranium', a: 10 }],
    e: {},
    uq: { u: { particle: 1 } },
  },
  mirrorForge: {
    n: '镜锻', d: '合金磨成镜，照得见辉光的形状——也能把它折回去。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1600 }, { r: 'alloy', a: 10 }, { r: 'uranium', a: 8 }],
    e: { mirrorAlloyU: 1 },
    uq: { u: { refining: 1, radiantPower: 1 } },
  },
  voidPrinciple: {
    n: '幽理', d: '把所有图纸压成一本书——书里没字，但翻一页就懂一件事。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 2000 }, { r: 'outline', a: 5 }, { r: 'uranium', a: 15 }],
    e: { codexU: 1 },
    uq: { u: { systematics: 1, radiantPower: 1 } },
  },
  radiation: {
    n: '辐射学', d: '辉光会渗——隔着墙、隔着皮毛。学会防它，先学会看见它。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1500 }, { r: 'uranium', a: 20 }, { r: 'alloy', a: 10 }],
    e: {},
    uq: { u: { radiantPower: 1 } },
  },
  autoMech: {
    n: '机关自驱', d: '机器自己上料、自己出货——狐狸只管在远处看着。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 2200 }, { r: 'alloy', a: 15 }, { r: 'uranium', a: 20 }, { r: 'draft', a: 15 }],
    e: {},
    uq: { u: { automation: 1, radiantPower: 1 } },
  },
  powerNet: {
    n: '能网', d: '把每座熔炉串起来——一处过载，全网分担。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 1900 }, { r: 'uranium', a: 15 }, { r: 'alloy', a: 12 }, { r: 'pillar', a: 5 }],
    e: {},
    uq: { u: { superCond: 1 }, b: { furnace: 2 } },
  },
  deepRadiance: {
    n: '深层辉脉', d: '辉石在更深的岩层里成片地长——把矿井挖到那里，省一半料。', br: 'I', phase: 4,
    p: [{ r: 'lore', a: 2100 }, { r: 'uranium', a: 25 }, { r: 'thorium', a: 8 }],
    e: {},
    uq: { u: { proliferation: 1 }, b: { accelerator: 2 } },
  },

  // ===== 灵修分支 A阶段：初感（6 个研究） =====
  spiritSense: {
    n: '感应术', d: '闭上眼，用爪尖去触碰看不见的东西——第一缕灵流。', br: 'M',
    p: [{ r: 'lore', a: 200 }, { r: 'charm', a: 30 }],
    e: { spiritU: 1 },
    uq: { b: { shrine: 2 } },
    tip: ['闭上眼之后反而看见了更多——这不科学，但管用。']
  },
  leylineLore: {
    n: '灵脉学', d: '地底有一张看不见的网，灵流沿着它奔涌——学会追踪灵脉的走向。', br: 'M',
    p: [{ r: 'lore', a: 250 }, { r: 'charm', a: 40 }, { r: 'spirit', a: 10 }],
    e: { fateSilkU: 1 },
    uq: { u: { spiritSense: 1 }, b: { spiritWell: 2 } },
    tip: ['脚下的路不止一条，有些只有蹲下来才看得见。']
  },
  silkWeave: {
    n: '丝织', d: '命丝可以纺成墨——能写下灵脉记忆的墨。', br: 'M',
    p: [{ r: 'lore', a: 300 }, { r: 'spirit', a: 20 }],
    e: {},
    uq: { u: { leylineLore: 1 } },
    tip: ['织出的第一滴墨会自己爬上纸——这很正常，不用怕。']
  },
  inscription: {
    n: '铭刻', d: '将灵脉的纹路刻进石头——石头会记住。', br: 'M',
    p: [{ r: 'lore', a: 500 }, { r: 'spirit', a: 8 }, { r: 'fateSilk', a: 3 }],
    e: { spiritInkU: 1, sigilU: 1 },
    uq: { u: { leylineLore: 1 } },
    tip: ['命丝织入石刻，符纹才能活——石头说它从来都记得，只是没人问过它。']
  },
  pureMind: {
    n: '净心', d: '灵修之路的代价——学会平息内心的躁念。', br: 'M',
    p: [{ r: 'lore', a: 280 }, { r: 'charm', a: 50 }],
    e: {},
    uq: { u: { leylineLore: 1 } },
    tip: ['安静是一门手艺，需要比喧嚣更大的力气。']
  },
  beadCraft: {
    n: '念珠功', d: '把灵能凝成珠子，一颗装一个念头——刚好够用。', br: 'M',
    p: [{ r: 'lore', a: 250 }, { r: 'spirit', a: 15 }],
    e: { beadU: 1 },
    uq: { u: { leylineLore: 1 } },
    tip: ['拨到第七颗的时候，第一颗开始回忆。']
  },
  // ===== 灵修分支 B阶段研究 =====
  resonArt: {
    n: '共鸣术', d: '让灵脉的节律与自身共振——共振子诞生的起点。', br: 'M', phase: 3,
    p: [{ r: 'lore', a: 400 }, { r: 'spirit', a: 50 }, { r: 'fateSilk', a: 10 }],
    e: { resonanceU: 1 },
    uq: { u: { silkWeave: 1 }, b: { spiritTower: 2 } },
  },
  specAnalysis: {
    n: '谱析', d: '将共振子的振动分解为可见的谱——谱石诞生。', br: 'M', phase: 3,
    p: [{ r: 'lore', a: 450 }, { r: 'resonance', a: 5 }, { r: 'fateSilk', a: 15 }],
    e: { spectrumU: 1 },
    uq: { u: { resonArt: 1 } },
  },
  elixirBrew: {
    n: '灵酿', d: '灵能与野莓在沉默中融合——第一滴灵液诞生。', br: 'M', phase: 3,
    p: [{ r: 'lore', a: 400 }, { r: 'spirit', a: 40 }, { r: 'fateSilk', a: 8 }],
    e: { elixirU: 1 },
    uq: { u: { resonArt: 1 } },
  },
  shapeBasic: {
    n: '化形基础', d: '灵流不只是力量，也是形状——学会用灵流塑形。', br: 'M', phase: 3,
    p: [{ r: 'lore', a: 500 }, { r: 'resonance', a: 10 }, { r: 'spectrum', a: 3 }],
    e: {},
    uq: { u: { elixirBrew: 1 }, b: { elixirBrewery: 2 } },
  },
  sageWay: {
    n: '悟道法', d: '在安静中听到灵脉说话——那是悟道的第一步。', br: 'M', phase: 3,
    p: [{ r: 'lore', a: 450 }, { r: 'scroll', a: 30 }, { r: 'spirit', a: 60 }],
    e: { insightU: 1 },
    uq: { u: { resonArt: 1 }, b: { resonTower: 2 } },
  },
  oracleArt: {
    n: '通灵术', d: '悟片是灵脉留下的碎语——学会收集与解读。', br: 'M', phase: 3,
    p: [{ r: 'lore', a: 500 }, { r: 'insight', a: 5 }, { r: 'fateSilk', a: 20 }],
    e: {},
    uq: { u: { sageWay: 1 } },
  },
  calmMind: {
    n: '净念', d: '躁念不是敌人——它只是灵流太急时溢出的声音。', br: 'M', phase: 3,
    p: [{ r: 'lore', a: 350 }, { r: 'charm', a: 60 }, { r: 'spirit', a: 30 }],
    e: {},
    uq: { u: { pureMind: 1 }, b: { quietRoom: 2 } },
  },
  leyExpand: {
    n: '脉扩', d: '灵脉不是固定的管道——它可以被拓宽。', br: 'M', phase: 3,
    p: [{ r: 'lore', a: 500 }, { r: 'resonance', a: 8 }, { r: 'sigil', a: 10 }],
    e: {},
    uq: { u: { resonArt: 1 }, b: { resonTower: 3 } },
  },

  // ===== 灵修分支 C阶段研究（12 个） =====
  crystalize: {
    n: '结晶术', d: '命丝在黑暗中会自己长出形状——前提是你别去碰它。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 600 }, { r: 'fateSilk', a: 30 }, { r: 'resonance', a: 15 }],
    e: { crystalSilkU: 1 },
    uq: { u: { oracleArt: 1 }, b: { resonTower: 3 } },
  },
  radiant: {
    n: '辉映', d: '光穿过晶丝后就不再是光了——它变成了辉芒。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 650 }, { r: 'crystalSilk', a: 5 }, { r: 'spectrum', a: 8 }],
    e: { radianceU: 1 },
    uq: { u: { crystalize: 1 } },
  },
  coreCraft: {
    n: '灵核锻造', d: '灵核不是从地里挖的——它是晶丝和共振子在炉中认了亲。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 700 }, { r: 'crystalSilk', a: 8 }, { r: 'resonance', a: 20 }],
    e: { spiritCoreU: 1 },
    uq: { u: { crystalize: 1 }, b: { crystalCave: 2 } },
  },
  formStudy: {
    n: '形魄学', d: '万物都有形，但不是所有形都有魄——区别在于有没有灵核。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 750 }, { r: 'spiritCore', a: 5 }, { r: 'crystalSilk', a: 10 }],
    e: { formSoulU: 1 },
    uq: { u: { coreCraft: 1 } },
  },
  chartDraw: {
    n: '灵图编', d: '灵脉的走向不是猜出来的——是一笔一笔画出来的。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 600 }, { r: 'insight', a: 10 }, { r: 'spiritInk', a: 15 }],
    e: { spiritChartU: 1 },
    uq: { u: { sageWay: 1 }, b: { oracleHall: 2 } },
  },
  spiritGrid: {
    n: '念阵', d: '把灵核排成阵——它们就会自己干活了。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 800 }, { r: 'spiritCore', a: 8 }, { r: 'spectrum', a: 12 }],
    e: {},
    uq: { u: { chartDraw: 1, coreCraft: 1 } },
  },
  deepReson: {
    n: '深共鸣', d: '共振不只是物理——深处的那一波，连灵魂都会跟着抖。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 700 }, { r: 'resonance', a: 25 }, { r: 'crystalSilk', a: 5 }],
    e: {},
    uq: { u: { resonArt: 1 }, b: { resonTower: 3 } },
  },
  cosmicSpec: {
    n: '万物谱', d: '谱石记录的不是颜色——是万物共振的频率。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 900 }, { r: 'spectrum', a: 15 }, { r: 'insight', a: 12 }],
    e: {},
    uq: { u: { deepReson: 1, radiant: 1 } },
  },
  pureRadiance: {
    n: '净辉', d: '辉芒浸透了林子——连躁念都不好意思留下来了。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 550 }, { r: 'crystalSilk', a: 3 }, { r: 'elixir', a: 2 }],
    e: {},
    uq: { b: { shapeHall: 2 } },
  },
  coreFusion: {
    n: '灵核融合', d: '五颗灵核靠在一起——就会变成一颗更大的。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 850 }, { r: 'spiritCore', a: 5 }, { r: 'radiance', a: 8 }],
    e: {},
    uq: { u: { coreCraft: 1 } },
  },
  radiantVision: {
    n: '辉视', d: '看远不靠眼睛——靠辉芒在脑袋里画的那张图。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 700 }, { r: 'radiance', a: 5 }, { r: 'insight', a: 8 }],
    e: {},
    uq: { u: { radiant: 1 }, b: { oracleHall: 3 } },
  },
  starSense: {
    n: '星感', d: '灵图画到够多的时候——你会开始听见星星在说话。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 750 }, { r: 'formSoul', a: 3 }, { r: 'spiritChart', a: 30 }],
    e: {},
    uq: { u: { chartDraw: 1 }, b: { chartHall: 3 } },
  },

  // ===== 灵修分支 D阶段：深寂研究链（v0.20 §八 5.2c, 18 项） =====
  primordialism: {
    n: '元念术', d: '把心里那个最初的念头剥出来——它薄得像光，但能压住一座山。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 1000 }, { r: 'crystalSilk', a: 20 }, { r: 'spiritCore', a: 10 }],
    e: { primordialU: 1 },
    uq: { u: { coreFusion: 1 }, b: { crystalCave: 3 } },
  },
  silenceCryst: {
    n: '寂石凝', d: '把元念压紧、再压紧——压到它自己也安静下来，就成了石头。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 1100 }, { r: 'primordial', a: 8 }, { r: 'radiance', a: 10 }],
    e: { silenceStoneU: 1 },
    uq: { u: { primordialism: 1 }, b: { radianceDais: 2 } },
  },
  mirrorArt: {
    n: '镜术', d: '寂石磨成镜——照不出脸，但照得出心里漏掉的字。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 1200 }, { r: 'silenceStone', a: 3 }, { r: 'spiritCore', a: 12 }],
    e: { mirrorSpiritU: 1 },
    uq: { u: { silenceCryst: 1 } },
  },
  hyperSense: {
    n: '超感', d: '镜灵在身边时，感官会突破皮毛——能听见百米外的鼾声。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 1300 }, { r: 'mirrorSpirit', a: 2 }, { r: 'insight', a: 15 }],
    e: {},
    uq: { u: { mirrorArt: 1 } },
  },
  spiritWeb: {
    n: '灵网', d: '把每一根灵脉串起来，串成一只很大的耳朵。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 1500 }, { r: 'spiritCore', a: 15 }, { r: 'primordial', a: 12 }],
    e: {},
    uq: { u: { hyperSense: 1 }, b: { coreForge: 2 } },
  },
  voidLore: {
    n: '幽理', d: '看不见的那一面也有规则——只是规则从不出声。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 1400 }, { r: 'primordial', a: 10 }, { r: 'spectrum', a: 20 }],
    e: {},
    uq: { u: { primordialism: 1, cosmicSpec: 1 } },
  },
  primordialDrive: {
    n: '元驱', d: '元念可以推着东西走——前提是没有狐狸眨眼。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 1600 }, { r: 'spiritCore', a: 18 }, { r: 'primordial', a: 15 }],
    e: {},
    uq: { u: { coreFusion: 1, primordialism: 1 } },
  },
  silenceResonance: {
    n: '寂弦感应', d: '寂石之间会响——但只有寂石听得见。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 1800 }, { r: 'silenceStone', a: 10 }, { r: 'crystalSilk', a: 30 }],
    e: {},
    uq: { u: { silenceCryst: 1 } },
  },
  deepLeyline: {
    n: '深层灵脉', d: '灵脉之下还有灵脉——更深的那条不流，但通往任何地方。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 2000 }, { r: 'silenceStone', a: 15 }, { r: 'primordial', a: 20 }],
    e: {},
    uq: { u: { silenceResonance: 1 } },
  },
  mirrorForging: {
    n: '镜锻', d: '把灵核倒进镜里——出来的东西能在两边同时存在。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 1500 }, { r: 'spiritCore', a: 12 }, { r: 'primordial', a: 10 }],
    e: {},
    uq: { u: { coreFusion: 1, primordialism: 1 } },
  },
  voidCodexLore: {
    n: '幽典编', d: '把所有幽理写下来——空白处的字最重。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 1800 }, { r: 'insight', a: 20 }, { r: 'primordial', a: 15 }],
    e: { voidCodexU: 1 },
    uq: { u: { cosmicSpec: 1, primordialism: 1 } },
  },
  spiritDrive: {
    n: '灵驱', d: '念阵转起来——不需要燃料，只需要一只狐狸坐着想事情。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 2000 }, { r: 'spiritCore', a: 20 }, { r: 'silenceStone', a: 8 }],
    e: {},
    uq: { u: { spiritGrid: 1, primordialism: 1 } },
  },
  silenceField: {
    n: '寂界术', d: '推开一扇看不见的门——门后没有时间。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 2200 }, { r: 'silenceStone', a: 15 }, { r: 'mirrorSpirit', a: 5 }],
    e: {},
    uq: { u: { silenceResonance: 1, mirrorForging: 1 } },
  },
  spiritPactLore: {
    n: '灵契学', d: '跟看不见的东西签字——签完了，它就一直在你身后。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 2000 }, { r: 'spiritCore', a: 18 }, { r: 'primordial', a: 15 }, { r: 'voidCodex', a: 3 }],
    e: {},
    uq: { u: { spiritWeb: 1, voidCodexLore: 1 } },
  },
  silentPurity: {
    n: '净寂', d: '灵液里加一颗元念——能让一整片林子忘记躁动。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 1600 }, { r: 'primordial', a: 12 }, { r: 'elixir', a: 8 }],
    e: {},
    uq: { u: { voidLore: 1, pureRadiance: 1 } },
  },
  primordialForging: {
    n: '元念锻冶', d: '把元念塞进炉子——出来的不再是念，是会发烫的真。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 1800 }, { r: 'primordial', a: 18 }, { r: 'spiritCore', a: 15 }, { r: 'silenceStone', a: 8 }],
    e: {},
    uq: { u: { primordialDrive: 1 }, b: { primordialPool: 3 } },
  },
  mirrorSpiritFocus: {
    n: '镜灵聚焦', d: '一面镜灵不够——三面对着一处，照出的不再是当下。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 2000 }, { r: 'mirrorSpirit', a: 5 }, { r: 'silenceStone', a: 12 }, { r: 'radiance', a: 10 }],
    e: {},
    uq: { u: { mirrorForging: 1, hyperSense: 1 } },
  },
  voidCodexCompile: {
    n: '幽典纂', d: '一本幽典写到第二本——记忆开始向外渗。', br: 'M', phase: 4,
    p: [{ r: 'lore', a: 2200 }, { r: 'voidCodex', a: 5 }, { r: 'insight', a: 25 }, { r: 'primordial', a: 20 }],
    e: {},
    uq: { u: { voidCodexLore: 1, spiritWeb: 1 } },
  },

  // ===== 神启副线 A阶段：初悟 =====
  divineLore: {
    n: '神启之学', d: '开启神恩之道；虔诚自此入账，宗教自此而立。',
    p: [{ r: 'lore', a: 400 }, { r: 'scroll', a: 25 }, { r: 'charm', a: 30 }, { r: 'remnant', a: 5 }],
    e: { subBranch: 'D', pietyU: 1 },
    uq: { u: { branchLore: 1 }, polity: true, b: { shrine: 3 } },
  },
  ritualBasic: {
    n: '祭祀礼法', d: '制定祭仪规范，祭坛可建起。',
    p: [{ r: 'lore', a: 300 }, { r: 'charm', a: 35 }],
    e: {},
    uq: { u: { divineLore: 1 } }, sb: 'D',
  },
  scriptureLore: {
    n: '经典研习', d: '研读古卷圣典；经阁可建起，祭司这门职业也出现。',
    p: [{ r: 'lore', a: 400 }, { r: 'scroll', a: 20 }, { r: 'piety', a: 15 }],
    e: {},
    uq: { u: { ritualBasic: 1 }, b: { divineAltar: 2 } }, sb: 'D',
  },
  graceLore: {
    n: '恩典感召', d: '感悟神恩之力——神恩由此而立，祈愿池可建起，圣油入账。',
    p: [{ r: 'lore', a: 500 }, { r: 'scroll', a: 30 }, { r: 'piety', a: 30 }],
    e: { holyOilU: 1 },
    uq: { u: { scriptureLore: 1 }, b: { divineAltar: 3 } }, sb: 'D',
  },

  // ===== 神启副线 B-教团（工业+神启） =====
  holyFlameLore: {
    n: '圣火术', d: '从烈炉中提炼信仰——圣火不灭。',
    p: [{ r: 'lore', a: 500 }, { r: 'piety', a: 50 }, { r: 'holyOil', a: 5 }],
    e: { holyFlameU: 1 },
    uq: { u: { graceLore: 1 }, mainLine: 'industry' }, sb: 'D', br: 'I',
  },
  edictLore: {
    n: '教令学', d: '教令——从此你的话就是律法。',
    p: [{ r: 'lore', a: 600 }, { r: 'holyFlame', a: 5 }, { r: 'piety', a: 80 }],
    e: { edictU: 1 },
    uq: { u: { holyFlameLore: 1 }, b: { holyKiln: 2 } }, sb: 'D', br: 'I',
  },
  holyWorkLore: {
    n: '圣工论', d: '劳动即祈祷——工具是最好的圣物。',
    p: [{ r: 'lore', a: 600 }, { r: 'holyFlame', a: 8 }, { r: 'piety', a: 60 }],
    e: {},
    uq: { u: { holyFlameLore: 1 }, b: { holyForge: 2 } }, sb: 'D', br: 'I',
  },
  judgmentLore: {
    n: '审判论', d: '正义需要仪式——审判庭不判罪，判污。',
    p: [{ r: 'lore', a: 700 }, { r: 'holyFlame', a: 10 }, { r: 'piety', a: 120 }],
    e: {},
    uq: { u: { edictLore: 1 }, b: { edictHall: 2 } }, sb: 'D', br: 'I',
  },
  holyIronLore: {
    n: '圣铁锻造', d: '钢经圣火洗礼后，便不再是凡铁。',
    p: [{ r: 'lore', a: 650 }, { r: 'holyFlame', a: 8 }, { r: 'steel', a: 30 }],
    e: { holyIronU: 1 },
    uq: { u: { holyFlameLore: 1 }, b: { blastFurnace: 3 } }, sb: 'D', br: 'I',
  },
  churchArchLore: {
    n: '教会建筑学', d: '为神建造的东西，不能用凡间的图纸。',
    p: [{ r: 'lore', a: 700 }, { r: 'holyIron', a: 5 }, { r: 'holyOil', a: 8 }],
    e: {},
    uq: { u: { holyIronLore: 1, judgmentLore: 1 } }, sb: 'D', br: 'I',
  },

  // ===== 神启副线 C-教团：圣堂与圣战（v0.20 §八 5.3b, 12 项） =====
  hymnArt: {
    n: '颂咏术', d: '把祷词谱成调——唱出来的字比写下来的更难磨灭。',
    p: [{ r: 'lore', a: 900 }, { r: 'piety', a: 150 }, { r: 'holyOil', a: 8 }],
    e: { hymnU: 1 },
    uq: { u: { churchArchLore: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  templeStudy: {
    n: '圣堂学', d: '一座大教堂的图纸——几代狐狸用诵经声念出来的。',
    p: [{ r: 'lore', a: 1000 }, { r: 'hymn', a: 5 }, { r: 'concrete', a: 10 }],
    e: {},
    uq: { u: { hymnArt: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  pilgrimageLore: {
    n: '朝圣论', d: '一条路走的次数够多，路本身就成了圣物。',
    p: [{ r: 'lore', a: 1100 }, { r: 'hymn', a: 8 }, { r: 'holyOil', a: 10 }],
    e: {},
    uq: { u: { templeStudy: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  crusadeLore: {
    n: '圣战论', d: '不是为夺取——是为夺还。词序不同，结局不同。',
    p: [{ r: 'lore', a: 1200 }, { r: 'piety', a: 200 }, { r: 'holyIron', a: 8 }],
    e: {},
    uq: { u: { pilgrimageLore: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  relicLore: {
    n: '圣骸学', d: '研究遗留下来的东西——它们记得的比活着的狐狸更多。',
    p: [{ r: 'lore', a: 1100 }, { r: 'hymn', a: 5 }, { r: 'piety', a: 180 }],
    e: { holyRelicU: 1 },
    uq: { u: { hymnArt: 1 }, b: { tribunalHall: 3 } }, sb: 'D', br: 'I', phase: 4,
  },
  relicTreatise: {
    n: '遗物论', d: '每一块圣骸背后都有一个名字——这门学问就是记住那些名字。',
    p: [{ r: 'lore', a: 1300 }, { r: 'holyRelic', a: 2 }, { r: 'scroll', a: 30 }],
    e: {},
    uq: { u: { relicLore: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  scriptureCompile: {
    n: '圣典编纂', d: '把零散的训诫装订成册——书脊裂开的那一刻，新的教义诞生了。',
    p: [{ r: 'lore', a: 1400 }, { r: 'hymn', a: 8 }, { r: 'scroll', a: 50 }],
    e: { holyScriptureU: 1 },
    uq: { u: { hymnArt: 1 }, b: { scriptureHall: 5 } }, sb: 'D', br: 'I', phase: 4,
  },
  doctrineSystem: {
    n: '教义系统化', d: '所有的"应该"被排进表格——一行行读下去，连呼吸都有节奏。',
    p: [{ r: 'lore', a: 1500 }, { r: 'holyScripture', a: 2 }, { r: 'piety', a: 200 }],
    e: {},
    uq: { u: { scriptureCompile: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  grandEdictLore: {
    n: '大教令论', d: '一道教令能让一整季的农事改道——研究的就是这个力量从哪来。',
    p: [{ r: 'lore', a: 1700 }, { r: 'holyScripture', a: 3 }, { r: 'holyFlame', a: 20 }],
    e: {},
    uq: { u: { doctrineSystem: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  crusadePrep: {
    n: '圣战备战', d: '战旗、口粮、誓词——三样齐备了，山谷也就齐备了。',
    p: [{ r: 'lore', a: 1500 }, { r: 'holyFlame', a: 30 }, { r: 'piety', a: 250 }],
    e: {},
    uq: { u: { crusadeLore: 1 }, b: { cathedral: 2 } }, sb: 'D', br: 'I', phase: 4,
  },
  expeditionTheology: {
    n: '远征神学', d: '走出山谷的祷告，跟在山谷里念的，不是一回事。',
    p: [{ r: 'lore', a: 1700 }, { r: 'piety', a: 300 }, { r: 'holyRelic', a: 1 }],
    e: {},
    uq: { u: { crusadePrep: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  holyLandReclaim: {
    n: '圣地夺还', d: '原来那里曾经是的——这是一句研究的开始，也是一切的尽头。',
    p: [{ r: 'lore', a: 2000 }, { r: 'holyRelic', a: 2 }, { r: 'holyScripture', a: 2 }, { r: 'piety', a: 400 }],
    e: {},
    uq: { u: { expeditionTheology: 1 } }, sb: 'D', br: 'I', phase: 4,
  },

  // ===== 神启副线 B-秘仪（灵修+神启） =====
  mysteryInit: {
    n: '秘仪入门', d: '有些仪式不在白天进行——有些知识不在书上。',
    p: [{ r: 'lore', a: 500 }, { r: 'piety', a: 50 }, { r: 'holyOil', a: 5 }],
    e: { ambrosiaU: 1, gnosisU: 1 },
    uq: { u: { graceLore: 1 }, mainLine: 'mystic' }, sb: 'D', br: 'M',
  },
  groveLore: {
    n: '圣林学', d: '树根比学者更懂得什么是神圣。',
    p: [{ r: 'lore', a: 600 }, { r: 'ambrosia', a: 3 }, { r: 'piety', a: 80 }],
    e: {},
    uq: { u: { mysteryInit: 1 }, b: { mysteryHall: 2 } }, sb: 'D', br: 'M',
  },
  apotheosisLore: {
    n: '化神论', d: '如果神曾是凡物——那凡物也可以变成神。',
    p: [{ r: 'lore', a: 700 }, { r: 'gnosis', a: 20 }, { r: 'ambrosia', a: 8 }],
    e: {},
    uq: { u: { groveLore: 1 }, b: { sacredGrove: 2 } }, sb: 'D', br: 'M',
  },
  forbiddenLore: {
    n: '禁典研读', d: '翻开禁典前请确认——你准备好忘记自己了吗。',
    p: [{ r: 'lore', a: 800 }, { r: 'gnosis', a: 50 }, { r: 'ambrosia', a: 15 }],
    e: {},
    uq: { u: { apotheosisLore: 1 }, b: { apotheosisPool: 2 } }, sb: 'D', br: 'M',
  },
  ascensionLore: {
    n: '飞升论', d: '最后一页是空白的——因为飞升者自己就是书。',
    p: [{ r: 'lore', a: 1000 }, { r: 'gnosis', a: 100 }, { r: 'ambrosia', a: 30 }],
    e: {},
    uq: { u: { forbiddenLore: 1 }, b: { apotheosisPool: 4 } }, sb: 'D', br: 'M',
  },

  // ===== 神启副线 C-秘仪研究（v0.20 §八 5.3e, 12 项） =====
  // Tier 1：六个建筑门控
  pureMindLore: {
    n: '净念论', d: '把心里多出来的那一片摘掉——剩下的，才装得下别的。',
    p: [{ r: 'lore', a: 1000 }, { r: 'ambrosia', a: 15 }, { r: 'scroll', a: 40 }],
    e: {},
    uq: { u: { mysteryInit: 1 }, b: { mysteryHall: 2 } }, sb: 'D', br: 'M', phase: 4,
  },
  divineInkArt: {
    n: '神墨术', d: '把神看你的眼神记下来，凝成一滴可以书写的东西。',
    p: [{ r: 'lore', a: 1100 }, { r: 'gnosis', a: 50 }, { r: 'ambrosia', a: 10 }],
    e: { divineInkU: 1 },
    uq: { u: { apotheosisLore: 1 }, b: { apotheosisPool: 2 } }, sb: 'D', br: 'M', phase: 4,
  },
  prophecyArt: {
    n: '预言术', d: '风穿过殿里的孔——孔的形状就是明日的形状。',
    p: [{ r: 'lore', a: 1100 }, { r: 'gnosis', a: 60 }, { r: 'scroll', a: 30 }],
    e: {},
    uq: { u: { apotheosisLore: 1 }, b: { mysteryHall: 3 } }, sb: 'D', br: 'M', phase: 4,
  },
  etherealLore: {
    n: '灵界论', d: '门后没有路，但从门后回来的爪子，沾着别处的灰。',
    p: [{ r: 'lore', a: 1200 }, { r: 'gnosis', a: 80 }, { r: 'ambrosia', a: 20 }],
    e: { apotheosisStoneU: 1 },
    uq: { u: { forbiddenLore: 1 }, b: { apotheosisPool: 3 } }, sb: 'D', br: 'M', phase: 4,
  },
  apotheosisRite: {
    n: '化神仪典', d: '上去的狐狸不一定下来；下来的不一定是同一只。仪式只是路。',
    p: [{ r: 'lore', a: 1300 }, { r: 'ambrosia', a: 30 }, { r: 'gnosis', a: 100 }],
    e: {},
    uq: { u: { ascensionLore: 1 } }, sb: 'D', br: 'M', phase: 4,
  },
  forbiddenCompile: {
    n: '禁典编纂', d: '把零散的禁忌装订成册——书脊裂开的那一刻，新的封条诞生了。',
    p: [{ r: 'lore', a: 1400 }, { r: 'gnosis', a: 150 }, { r: 'ambrosia', a: 25 }],
    e: { forbiddenCodexU: 1 },
    uq: { u: { ascensionLore: 1 }, b: { forbiddenLib: 2 } }, sb: 'D', br: 'M', phase: 4,
  },
  // Tier 2：被动加成 / 配方解锁
  divineInkRefining: {
    n: '神墨精炼', d: '同样一滴墨，研开之后的墨色比研开之前深得多。',
    p: [{ r: 'lore', a: 1200 }, { r: 'divineInk', a: 5 }, { r: 'gnosis', a: 80 }],
    e: { divineInkM: 0.5 },
    uq: { u: { divineInkArt: 1 }, b: { divinityForge: 2 } }, sb: 'D', br: 'M', phase: 4,
  },
  inkScripture: {
    n: '墨经', d: '神墨写下的字不褪——这门学问就是怎么让它们不褪。',
    p: [{ r: 'lore', a: 1100 }, { r: 'divineInk', a: 3 }, { r: 'scroll', a: 60 }],
    e: {},
    uq: { u: { divineInkArt: 1 } }, sb: 'D', br: 'M', phase: 4,
  },
  omenLore: {
    n: '卜兆论', d: '兆头本身没有意义；意义在看见兆头的那只眼睛里。',
    p: [{ r: 'lore', a: 1200 }, { r: 'gnosis', a: 80 }, { r: 'ambrosia', a: 20 }],
    e: { gnosisM: 0.2 },
    uq: { u: { prophecyArt: 1 }, b: { prophecyHall: 1 } }, sb: 'D', br: 'M', phase: 4,
  },
  futureSight: {
    n: '远见', d: '远处看得见的不是更多的事，是同一件事更早的样子。',
    p: [{ r: 'lore', a: 1300 }, { r: 'gnosis', a: 100 }, { r: 'ambrosia', a: 30 }],
    e: { loreM: 0.15 },
    uq: { u: { prophecyArt: 1 }, b: { prophecyHall: 2 } }, sb: 'D', br: 'M', phase: 4,
  },
  voidTouch: {
    n: '触虚', d: '把爪子伸进门缝里——回来的爪子会觉得自己缺了一块。',
    p: [{ r: 'lore', a: 1200 }, { r: 'apotheosisStone', a: 2 }, { r: 'gnosis', a: 80 }],
    e: {},
    uq: { u: { etherealLore: 1 }, b: { etherealGate: 1 } }, sb: 'D', br: 'M', phase: 4,
  },
  ascensionTransform: {
    n: '形魄羽化', d: '走到这一步的狐狸，再回头看自己原来的形状，已经认不全了。',
    p: [{ r: 'lore', a: 1400 }, { r: 'gnosis', a: 120 }, { r: 'ambrosia', a: 30 }],
    e: { ambrosiaM: 0.3 },
    uq: { u: { apotheosisRite: 1 }, b: { apotheosisAltar: 2 } }, sb: 'D', br: 'M', phase: 4,
  },

  // ===== 通达副线 Phase A：初交（3 项研究） =====
  envoyBasic: {
    n: '使节礼法', d: '远客来访不再只是做买卖，而是一门学问。使馆可建起，声誉自此入账。',
    p: [{ r: 'lore', a: 350 }, { r: 'ancCoin', a: 5 }],
    e: { renownU: 1 },
    uq: { u: { beyondValley: 1 }, b: { tradePost: 2 } }, sb: 'T',
  },
  credentialLore: {
    n: '信物制度', d: '持信为凭，远方始知你的名字。迎宾堂、信驿可建起，信物自此入账。',
    p: [{ r: 'lore', a: 450 }, { r: 'renown', a: 20 }, { r: 'ancCoin', a: 8 }],
    e: { credentialU: 1 },
    uq: { u: { envoyBasic: 1 }, b: { embassy: 2 } }, sb: 'T',
  },
  reputeLore: {
    n: '声望学', d: '声誉积厚之后，外交产出自然丰饶。声望由此而立，使者这门职业也出现。',
    p: [{ r: 'lore', a: 550 }, { r: 'renown', a: 50 }, { r: 'credential', a: 3 }],
    e: {},
    uq: { u: { credentialLore: 1 }, b: { embassy: 3 } }, sb: 'T',
  },

  // ===== 通达副线 Phase B：结邦（5 项研究） =====
  allianceInit: {
    n: '结邦之礼', d: '以信物为凭、声誉为基，正式与七族缔交。邦交由此而立，邦书入账，邦交堂可建起。',
    p: [{ r: 'lore', a: 500 }, { r: 'renown', a: 60 }, { r: 'credential', a: 5 }],
    e: { charterU: 1 },
    uq: { u: { reputeLore: 1 }, b: { embassy: 2 } }, sb: 'T',
  },
  exoticLore: {
    n: '异珍鉴赏', d: '辨别远方奇物，令异珍不再是堆角落的摆设。异珍入账，异珍阁可建起，远交礼包这门工艺也通晓。',
    p: [{ r: 'lore', a: 580 }, { r: 'credential', a: 5 }, { r: 'renown', a: 80 }],
    e: { exoticU: 1 },
    uq: { u: { allianceInit: 1 }, b: { charterHall: 2 } }, sb: 'T',
  },
  guestLore: {
    n: '远客之道', d: '远客留下，不只是过路——需要一个像样的住处。远客居可建起，邦交官这门职业也出现。',
    p: [{ r: 'lore', a: 650 }, { r: 'exotic', a: 3 }, { r: 'charter', a: 10 }],
    e: {},
    uq: { u: { exoticLore: 1 }, b: { exoticVault: 2 } }, sb: 'T',
  },
  allianceLore: {
    n: '会盟论', d: '从松散友邦到正式盟约，需要一座专门的台。会盟台可建起。',
    p: [{ r: 'lore', a: 750 }, { r: 'charter', a: 25 }, { r: 'exotic', a: 5 }],
    e: {},
    uq: { u: { guestLore: 1 }, b: { guestQuarter: 2 } }, sb: 'T',
  },
  deepAlliancePrelude: {
    n: '深盟序言', d: '盟约只是开始——序言写完，深盟的篇章才翻开，再深一层的来往由此可耕。',
    p: [{ r: 'lore', a: 900 }, { r: 'charter', a: 50 }, { r: 'exotic', a: 10 }],
    e: {},
    uq: { u: { allianceLore: 1 }, b: { alliancePlatform: 2 } }, sb: 'T',
  },
};

// ===== 工坊定义 =====
const CD = {
  plank: {
    n: '木板', d: '圆木 → 木板',
    inp: [{ r: 'wood', a: 30 }],
    out: [{ r: 'plank', a: 1 }],
    uq: { u: { carpentry: 1 } },
    tip: ['锯开一根圆木，就像翻开一本年轮写的日记。']
  },
  brick: {
    n: '砖块', d: '碎石 → 砖块',
    inp: [{ r: 'stone', a: 30 }],
    out: [{ r: 'brick', a: 1 }],
    uq: { u: { masonry: 1 } },
    tip: ['泥巴觉得自己这辈子就这样了，然后来了一把火。']
  },
  scroll: {
    n: '卷轴', d: '学识 → 卷轴',
    inp: [{ r: 'lore', a: 20 }],
    out: [{ r: 'scroll', a: 1 }],
    uq: { b: { library: 1 } },
    tip: ['脑子里的东西写下来，才算真的存在过。']
  },

  // ===== 工业分支 A阶段：煤钢配方 =====
  steel: {
    n: '钢', d: '矿铁+煤 → 钢', br: 'I',
    inp: [{ r: 'iron', a: 5 }, { r: 'coal', a: 8 }],
    out: [{ r: 'steel', a: 1 }],
    uq: { b: { blastFurnace: 1 } },
  },
  gear: {
    n: '齿轮', d: '钢+矿铁 → 齿轮', br: 'I',
    inp: [{ r: 'steel', a: 2 }, { r: 'iron', a: 3 }],
    out: [{ r: 'gear', a: 1 }],
    uq: { u: { fineCraft: 1 } },
    tip: ['一个齿咬住另一个齿，就像两只狐狸互相信任。']
  },
  plate: {
    n: '钢板', d: '钢+煤 → 钢板', br: 'I',
    inp: [{ r: 'steel', a: 3 }, { r: 'coal', a: 2 }],
    out: [{ r: 'plate', a: 2 }],
    uq: { u: { forging: 1 } },
    tip: ['把钢锤薄，听它叹气，就知道够不够格了。']
  },
  concrete: {
    n: '混凝', d: '砖块+煤 → 混凝', br: 'I',
    inp: [{ r: 'brick', a: 30 }, { r: 'coal', a: 5 }],
    out: [{ r: 'concrete', a: 1 }],
    uq: { u: { concreteTech: 1 } },
    tip: ['石与煤在高温下融合，冷却后坚如磐石。']
  },

  // ===== 工业分支 B阶段：油火配方 =====
  oil: {
    n: '火油', d: '煤+矿铁 → 火油', br: 'I',
    inp: [{ r: 'coal', a: 15 }, { r: 'iron', a: 3 }],
    out: [{ r: 'oil', a: 1 }],
    uq: { b: { oilWell: 1 } },
    tip: ['把煤烧到极致，黑色的血就从石头缝里渗出来了。']
  },
  barrel: {
    n: '油桶', d: '钢板+钢 → 油桶', br: 'I',
    inp: [{ r: 'plate', a: 2 }, { r: 'steel', a: 1 }],
    out: [{ r: 'barrel', a: 1 }],
    uq: { b: { oilTank: 1 } },
    tip: ['密封、坚固、不漏一滴——对容器的全部要求。']
  },
  draft: {
    n: '蓝本', d: '卷轴+学识 → 蓝本', br: 'I',
    inp: [{ r: 'scroll', a: 5 }, { r: 'lore', a: 100 }],
    out: [{ r: 'draft', a: 1 }],
    uq: { u: { blueprintLore: 1 } },
    tip: ['先在纸上犯错，总好过在铁上犯错。']
  },

  // ===== v0.14 文化工艺（占位名） =====
  dye: {
    n: '彩络', d: '丝帛+香草 → 彩络',
    inp: [{ r: 'silk', a: 1 }, { r: 'spice', a: 1 }],
    out: [{ r: 'dye', a: 1 }],
    uq: { u: { engraving: 1 } },
    tip: ['一锅热水，几朵花的葬礼，一匹布的新生。']
  },
  wine: {
    n: '醴浆', d: '野莓 → 醴浆',
    inp: [{ r: 'berry', a: 30 }],
    out: [{ r: 'wine', a: 1 }],
    uq: { u: { calendar: 1 } },
    tip: ['什么都不干，干等。最考验狐狸的一道工坊活。']
  },
  ink: {
    n: '墨锭', d: '兽皮+碎石 → 墨锭',
    inp: [{ r: 'leather', a: 3 }, { r: 'stone', a: 2 }],
    out: [{ r: 'ink', a: 1 }],
    uq: { u: { engraving: 1 }, b: { memorial: 1 } },
    tip: ['推一下，拉一下。再推一下，再拉一下。悟了没？没。']
  },

  // ===== 工业分支 C阶段：精金配方（4 个） =====
  forgeAlloy: {
    n: '合金', d: '寒钛+钢 → 合金',
    inp: [{ r: 'titan', a: 2 }, { r: 'steel', a: 5 }],
    out: [{ r: 'alloy', a: 1 }],
    uq: { b: { refinery: 1 } },
    br: 'I',
  },
  drawOutline: {
    n: '纲要', d: '蓝本+卷轴 → 纲要',
    inp: [{ r: 'draft', a: 3 }, { r: 'scroll', a: 10 }],
    out: [{ r: 'outline', a: 1 }],
    uq: { u: { systematics: 1 } },
    br: 'I',
  },
  castTitanPart: {
    n: '钛构件', d: '寒钛+合金 → 钛构件',
    inp: [{ r: 'titan', a: 5 }, { r: 'alloy', a: 1 }],
    out: [{ r: 'titanPart', a: 1 }],
    uq: { u: { precFab: 1 } },
    br: 'I',
  },
  pourPillar: {
    n: '混凝柱', d: '混凝+钢 → 混凝柱',
    inp: [{ r: 'concrete', a: 5 }, { r: 'steel', a: 3 }],
    out: [{ r: 'pillar', a: 1 }],
    uq: { u: { heavyBuild: 1 } },
    br: 'I',
  },

  // ===== 工业分支 D阶段：辉能配方（v0.20 §八 5.1d, 3 个） =====
  craftThorium: {
    n: '重晶', d: '辉石 → 重晶（高温浓缩）',
    inp: [{ r: 'uranium', a: 200 }],
    out: [{ r: 'thorium', a: 1 }],
    uq: { u: { thoriumConv: 1 } },
    br: 'I', phase: 4,
  },
  craftMirrorAlloy: {
    n: '镜合金', d: '寒钛+合金+辉石 → 镜合金',
    inp: [{ r: 'titan', a: 20 }, { r: 'alloy', a: 10 }, { r: 'uranium', a: 5 }],
    out: [{ r: 'mirrorAlloy', a: 1 }],
    uq: { u: { mirrorForge: 1 } },
    br: 'I', phase: 4,
  },
  craftCodex: {
    n: '密典', d: '纲要+辉石+学识 → 密典',
    inp: [{ r: 'outline', a: 5 }, { r: 'uranium', a: 15 }, { r: 'lore', a: 200 }],
    out: [{ r: 'codex', a: 1 }],
    uq: { u: { voidPrinciple: 1 } },
    br: 'I', phase: 4,
  },

  // ===== v0.15 丝帛供应链配方 =====
  weave: {
    n: '丝帛（纺）', d: '兽皮+圆木 → 丝帛',
    inp: [{ r: 'leather', a: 5 }, { r: 'wood', a: 5 }],
    out: [{ r: 'silk', a: 1 }],
    uq: { b: { artistry: 1 } },
    tip: ['不是正经蚕丝，但搓出来一样滑溜。']
  },
  spiceToSilk: {
    n: '丝帛（换）', d: '香草+铜钱 → 丝帛',
    inp: [{ r: 'spice', a: 3 }, { r: 'coin', a: 5 }],
    out: [{ r: 'silk', a: 1 }],
    uq: { b: { tradePost: 1 } },
    tip: ['三袋香草加五枚钱，过路的河獭掏出一匹丝，双方满意。']
  },

  // ===== 灵修分支 A阶段配方（4 个，编灵图留 C 阶段） =====
  fateSilk: {
    n: '命丝', d: '符咒+灵能 → 命丝',
    inp: [{ r: 'charm', a: 8 }, { r: 'spirit', a: 3 }],
    out: [{ r: 'fateSilk', a: 1 }],
    uq: { u: { silkWeave: 1 } },
    br: 'M',
    tip: ['命丝是哄出来的——纺机做不到这件事，你得让灵能相信自己想变成线。']
  },
  bead: {
    n: '念珠', d: '符咒+碎石 → 念珠',
    inp: [{ r: 'charm', a: 5 }, { r: 'stone', a: 20 }],
    out: [{ r: 'bead', a: 2 }],
    uq: { u: { beadCraft: 1 } },
    br: 'M',
    tip: ['每颗石子里都住着一个安静的念头，串起来就不会跑了。']
  },
  spiritInk: {
    n: '灵墨', d: '墨锭+符咒 → 灵墨',
    inp: [{ r: 'ink', a: 3 }, { r: 'charm', a: 4 }],
    out: [{ r: 'spiritInk', a: 1 }],
    uq: { u: { inscription: 1 } },
    br: 'M',
    tip: ['普通的墨加了符咒就会在月光下发亮——这是好事还是坏事另说。']
  },
  sigil: {
    n: '符纹', d: '灵墨+兽皮 → 符纹',
    inp: [{ r: 'spiritInk', a: 2 }, { r: 'leather', a: 5 }],
    out: [{ r: 'sigil', a: 1 }],
    uq: { u: { inscription: 1 } },
    br: 'M',
    tip: ['刻下的线条比文字早，意义比语言深。']
  },
  drawChartBasic: {
    n: '灵图（粗）', d: '灵墨+卷轴 → 灵图',
    inp: [{ r: 'spiritInk', a: 3 }, { r: 'scroll', a: 5 }],
    out: [{ r: 'spiritChart', a: 1 }],
    uq: { u: { chartDraw: 1 } },
    br: 'M',
  },
  // ===== 灵修分支 B阶段配方 =====
  resonance: {
    n: '共振子', d: '灵能+命丝 → 共振子',
    inp: [{ r: 'spirit', a: 10 }, { r: 'fateSilk', a: 3 }],
    out: [{ r: 'resonance', a: 1 }],
    uq: { u: { resonArt: 1 } },
    br: 'M',
  },
  elixir: {
    n: '灵液', d: '灵能+野莓 → 灵液',
    inp: [{ r: 'spirit', a: 15 }, { r: 'berry', a: 50 }],
    out: [{ r: 'elixir', a: 1 }],
    uq: { u: { elixirBrew: 1 } },
    br: 'M',
  },
  spectrum: {
    n: '谱石', d: '共振子+念珠 → 谱石',
    inp: [{ r: 'resonance', a: 3 }, { r: 'bead', a: 5 }],
    out: [{ r: 'spectrum', a: 1 }],
    uq: { u: { specAnalysis: 1 } },
    br: 'M',
  },
  insight: {
    n: '悟片', d: '卷轴+灵能 → 悟片',
    inp: [{ r: 'scroll', a: 8 }, { r: 'spirit', a: 12 }],
    out: [{ r: 'insight', a: 1 }],
    uq: { u: { sageWay: 1 } },
    br: 'M',
  },

  // ===== 灵修分支 C阶段配方（5 个） =====
  weaveCrystal: {
    n: '晶丝', d: '命丝+灵能 → 晶丝',
    inp: [{ r: 'fateSilk', a: 5 }, { r: 'spirit', a: 8 }],
    out: [{ r: 'crystalSilk', a: 1 }],
    uq: { u: { crystalize: 1 } },
    br: 'M',
  },
  forgeCore: {
    n: '灵核（造）', d: '晶丝+共振子 → 灵核',
    inp: [{ r: 'crystalSilk', a: 3 }, { r: 'resonance', a: 8 }],
    out: [{ r: 'spiritCore', a: 1 }],
    uq: { u: { coreCraft: 1 } },
    br: 'M',
  },
  drawChart: {
    n: '灵图（精）', d: '灵墨+悟片+辉芒 → 灵图',
    inp: [{ r: 'spiritInk', a: 5 }, { r: 'insight', a: 2 }, { r: 'radiance', a: 1 }],
    out: [{ r: 'spiritChart', a: 3 }],
    uq: { u: { starSense: 1 } },
    br: 'M',
  },
  shapeForm: {
    n: '形魄', d: '晶丝+灵核 → 形魄',
    inp: [{ r: 'crystalSilk', a: 5 }, { r: 'spiritCore', a: 2 }],
    out: [{ r: 'formSoul', a: 1 }],
    uq: { u: { formStudy: 1 } },
    br: 'M',
  },
  forgeMirror: {
    n: '灵核（精）', d: '灵核+辉芒 → 精炼灵核（高效灵核产出）',
    inp: [{ r: 'spiritCore', a: 2 }, { r: 'radiance', a: 3 }],
    out: [{ r: 'spiritCore', a: 2 }],
    uq: { u: { coreFusion: 1 } },
    br: 'M',
  },

  // ===== 灵修分支 D阶段配方（v0.20 §八 5.2d, 4 个 + 1 内置） =====
  // 注: "蒸元念" 为元念池建筑内置被动 (晶丝→元念)，不计入 CD 条目
  craftSilenceStone: {
    n: '寂石', d: '元念+晶丝 → 寂石',
    inp: [{ r: 'primordial', a: 5 }, { r: 'crystalSilk', a: 3 }],
    out: [{ r: 'silenceStone', a: 1 }],
    uq: { u: { silenceCryst: 1 } },
    br: 'M', phase: 4,
  },
  craftVoidCodex: {
    n: '幽典', d: '悟片+元念+镜灵 → 幽典',
    inp: [{ r: 'insight', a: 10 }, { r: 'primordial', a: 8 }, { r: 'mirrorSpirit', a: 1 }],
    out: [{ r: 'voidCodex', a: 1 }],
    uq: { u: { voidCodexLore: 1 } },
    br: 'M', phase: 4,
  },
  craftPrimordial: {
    n: '元念（锻）', d: '元念+灵核+寂石 → 元念（高效锻冶，净 -3 元念但产更纯）',
    inp: [{ r: 'primordial', a: 8 }, { r: 'spiritCore', a: 3 }, { r: 'silenceStone', a: 1 }],
    out: [{ r: 'primordial', a: 5 }],
    uq: { u: { primordialForging: 1 } },
    br: 'M', phase: 4,
  },
  refineSilenceStone: {
    n: '寂石（淬）', d: '寂石+镜灵+幽典 → 浓缩寂石+灵液',
    inp: [{ r: 'silenceStone', a: 3 }, { r: 'mirrorSpirit', a: 1 }, { r: 'voidCodex', a: 1 }],
    out: [{ r: 'silenceStone', a: 2 }, { r: 'elixir', a: 1 }],
    uq: { u: { spiritPactLore: 1 } },
    br: 'M', phase: 4,
  },

  // ===== 神启副线 A阶段 =====
  holyOilCraft: {
    n: '圣油', d: '以虔诚与野莓提炼圣油。',
    inp: [{ r: 'piety', a: 15 }, { r: 'berry', a: 50 }],
    out: [{ r: 'holyOil', a: 1 }],
    uq: { u: { graceLore: 1 } }, sb: 'D',
  },

  // ===== 神启副线 B-教团配方 =====
  holyFlameCraft: {
    n: '圣火', d: '煤+钢+虔诚 → 圣火',
    inp: [{ r: 'coal', a: 30 }, { r: 'steel', a: 5 }, { r: 'piety', a: 10 }],
    out: [{ r: 'holyFlame', a: 2 }],
    uq: { u: { holyFlameLore: 1 } }, sb: 'D', br: 'I',
  },
  holyIronCraft: {
    n: '圣铁', d: '圣火+钢 → 圣铁',
    inp: [{ r: 'holyFlame', a: 3 }, { r: 'steel', a: 8 }],
    out: [{ r: 'holyIron', a: 1 }],
    uq: { u: { holyIronLore: 1 } }, sb: 'D', br: 'I',
  },
  holyWater: {
    n: '圣水', d: '圣油+碎石 → 虔诚上限+15',
    inp: [{ r: 'holyOil', a: 2 }, { r: 'stone', a: 30 }],
    out: [{ r: '_pietyMxPerm', a: 15 }],
    uq: { u: { edictLore: 1 } }, sb: 'D', br: 'I',
    perm: true,
  },
  edictScroll: {
    n: '教令状', d: '圣火+卷轴 → 教令冷却-1季',
    inp: [{ r: 'holyFlame', a: 2 }, { r: 'scroll', a: 5 }],
    out: [{ r: '_edictCDReduce', a: 1 }],
    uq: { u: { edictLore: 1 } }, sb: 'D', br: 'I',
    perm: true,
  },
  holyGear: {
    n: '圣铁齿轮', d: '圣铁+齿轮 → 工业配方+3%（上限15%）',
    inp: [{ r: 'holyIron', a: 2 }, { r: 'gear', a: 3 }],
    out: [{ r: '_holyGearBonus', a: .03 }],
    uq: { u: { churchArchLore: 1 } }, sb: 'D', br: 'I',
    perm: true,
  },

  // ===== 神启副线 C-教团配方（v0.20 §八 5.3b, 5 个） =====
  craftHymn: {
    n: '颂咏', d: '圣油+卷轴 → 颂咏',
    inp: [{ r: 'holyOil', a: 3 }, { r: 'scroll', a: 5 }],
    out: [{ r: 'hymn', a: 1 }],
    uq: { u: { hymnArt: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  craftHolyRelic: {
    n: '圣骸', d: '颂咏+圣铁 → 圣骸',
    inp: [{ r: 'hymn', a: 5 }, { r: 'holyIron', a: 3 }],
    out: [{ r: 'holyRelic', a: 1 }],
    uq: { u: { relicLore: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  craftHolyScripture: {
    n: '圣典', d: '颂咏+卷轴+学识 → 圣典',
    inp: [{ r: 'hymn', a: 10 }, { r: 'scroll', a: 20 }, { r: 'lore', a: 300 }],
    out: [{ r: 'holyScripture', a: 1 }],
    uq: { u: { scriptureCompile: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  craftCrusadeRation: {
    n: '圣战军粮', d: '圣火+野莓 → 远行奖励永久+5%',
    inp: [{ r: 'holyFlame', a: 10 }, { r: 'berry', a: 200 }],
    out: [{ r: '_expRewardBonus', a: .05 }],
    uq: { u: { crusadePrep: 1 } }, sb: 'D', br: 'I', phase: 4,
    perm: true,
  },
  craftGraceWater: {
    n: '恩典之水', d: '圣骸+圣油 → 神恩上限永久+2%',
    inp: [{ r: 'holyRelic', a: 1 }, { r: 'holyOil', a: 3 }],
    out: [{ r: '_graceCapBonus', a: .02 }],
    uq: { u: { relicTreatise: 1 } }, sb: 'D', br: 'I', phase: 4,
    perm: true,
  },

  // ===== 神启副线 B-秘仪配方 =====
  ambrosiaDistill: {
    n: '神露', d: '虔诚+灵能 → 神露',
    inp: [{ r: 'piety', a: 20 }, { r: 'spirit', a: 15 }],
    out: [{ r: 'ambrosia', a: 1 }],
    uq: { u: { mysteryInit: 1 } }, sb: 'D', br: 'M',
  },
  gnosisFragment: {
    n: '秘知', d: '神露+卷轴 → 秘知',
    inp: [{ r: 'ambrosia', a: 3 }, { r: 'scroll', a: 15 }],
    out: [{ r: 'gnosis', a: 5 }],
    uq: { u: { groveLore: 1 } }, sb: 'D', br: 'M',
  },
  apotheosisElixir: {
    n: '化神药', d: '神露+秘知+虔诚 → 开门消耗-30%',
    inp: [{ r: 'ambrosia', a: 10 }, { r: 'gnosis', a: 20 }, { r: 'piety', a: 50 }],
    out: [{ r: '_gateDiscount', a: .30 }],
    uq: { u: { forbiddenLore: 1 } }, sb: 'D', br: 'M',
    perm: true,
  },

  // ===== 神启副线 C-秘仪配方（v0.20 §八 5.3e, 5 个） =====
  divineInkSeal: {
    n: '神墨凝魂', d: '秘知+卷轴 → 神墨',
    inp: [{ r: 'gnosis', a: 40 }, { r: 'scroll', a: 30 }],
    out: [{ r: 'divineInk', a: 1 }],
    uq: { u: { inkScripture: 1 } }, sb: 'D', br: 'M', phase: 4,
  },
  apotheosisStoneCraft: {
    n: '化神石锻', d: '秘知+神墨+晶丝 → 化神石',
    inp: [{ r: 'gnosis', a: 80 }, { r: 'divineInk', a: 3 }, { r: 'crystalSilk', a: 10 }],
    out: [{ r: 'apotheosisStone', a: 1 }],
    uq: { u: { voidTouch: 1 } }, sb: 'D', br: 'M', phase: 4,
  },
  forbiddenCodexBind: {
    n: '禁典装订', d: '秘知+神墨+卷轴 → 禁典',
    inp: [{ r: 'gnosis', a: 100 }, { r: 'divineInk', a: 5 }, { r: 'scroll', a: 50 }],
    out: [{ r: 'forbiddenCodex', a: 1 }],
    uq: { u: { forbiddenCompile: 1 } }, sb: 'D', br: 'M', phase: 4,
  },
  gnosisAmplify: {
    n: '秘知凝聚', d: '神露+神墨 → 秘知（高产）',
    inp: [{ r: 'ambrosia', a: 8 }, { r: 'divineInk', a: 2 }],
    out: [{ r: 'gnosis', a: 20 }],
    uq: { u: { apotheosisRite: 1 } }, sb: 'D', br: 'M', phase: 4,
  },
  apotheosisDoor: {
    n: '化神之门', d: '化神石+禁典+神露+秘知 → 下次开门秘知消耗 -50%',
    inp: [{ r: 'apotheosisStone', a: 3 }, { r: 'forbiddenCodex', a: 1 }, { r: 'ambrosia', a: 40 }, { r: 'gnosis', a: 120 }],
    out: [{ r: '_gateDiscount', a: 0.50 }],
    uq: { u: { ascensionTransform: 1 } }, sb: 'D', br: 'M', phase: 4,
    perm: true,
  },

  // ===== 通达副线 Phase A =====
  makeCredential: {
    n: '信物（铸）', d: '以声誉与卷轴制成正式信物。',
    inp: [{ r: 'renown', a: 15 }, { r: 'scroll', a: 30 }],
    out: [{ r: 'credential', a: 1 }],
    uq: { u: { credentialLore: 1 } }, sb: 'T',
  },

  // ===== 通达副线 Phase B：结邦（3 个配方） =====
  makeCharter: {
    n: '邦书', d: '以信物与卷轴制成正式邦书。',
    inp: [{ r: 'credential', a: 3 }, { r: 'scroll', a: 20 }],
    out: [{ r: 'charter', a: 1 }],
    uq: { u: { allianceInit: 1 } }, sb: 'T',
  },
  makeExotic: {
    n: '异珍', d: '以信物与基础物资包装成远方认可的礼品。',
    inp: [{ r: 'credential', a: 2 }, { r: 'berry', a: 100 }, { r: 'plank', a: 5 }, { r: 'brick', a: 3 }],
    out: [{ r: 'exotic', a: 1 }],
    uq: { u: { exoticLore: 1 } }, sb: 'T',
  },
  charterToCredential: {
    n: '信物（换）', d: '以邦书与声誉换取更多信物。',
    inp: [{ r: 'charter', a: 5 }, { r: 'renown', a: 30 }],
    out: [{ r: 'credential', a: 3 }],
    uq: { u: { allianceLore: 1 } }, sb: 'T',
  },
};

// ===== 进阶升级定义 =====
// 效果类型：
//   *M (如 coalM) = 全局资源产出乘数（加法叠入 calcR 的 m[]，与研究同机制）
//   craftM: { recipeId: { outMul: 0.25 } } = 配方产出乘数 +25%
//   craftM: { recipeId: { inpM: { resId: -0.2 } } } = 配方某原料消耗 -20%
//   bldM: { bldId: { prodM: 0.4 } } = 该建筑所有 *P 产出 +40%
//   bldM: { bldId: { extraP: { resId: 0.01 } } } = 该建筑每座额外产出（P 值）
//   bldM: { bldId: { pollM: -0.25 } } = 该建筑污染 -25%
const UPGD = {
  // ===== A阶段：工具类 #1-5 =====
  ironPickaxe: {
    n: '铁质矿镐', d: '煤产出+30%', br: 'I',
    p: [{ r: 'iron', a: 15 }, { r: 'coal', a: 10 }],
    e: { coalM: 0.3 },
    uq: { u: { deepMining: 1 } },
  },
  steelTools: {
    n: '钢制工具', d: '木/石产出+40%', br: 'I',
    p: [{ r: 'steel', a: 10 }],
    e: { woodM: 0.4, stoneM: 0.4 },
    uq: { u: { steelWork: 1 } },
  },
  steelSaw: {
    n: '钢制锯刃', d: '木板配方产出+25%', br: 'I',
    p: [{ r: 'steel', a: 8 }, { r: 'iron', a: 5 }],
    e: { craftM: { plank: { outMul: 0.25 } } },
    uq: { u: { steelWork: 1 } },
  },
  steelChisel: {
    n: '钢制凿头', d: '砖块配方产出+25%', br: 'I',
    p: [{ r: 'steel', a: 8 }, { r: 'brick', a: 20 }],
    e: { craftM: { brick: { outMul: 0.25 } } },
    uq: { u: { steelWork: 1 } },
  },
  mineSupport: {
    n: '矿道支撑', d: '矿坑产出+40%', br: 'I',
    p: [{ r: 'plank', a: 20 }, { r: 'iron', a: 10 }],
    e: { bldM: { mine: { prodM: 0.4 } } },
    uq: { u: { deepMining: 1 } },
  },
  // ===== A阶段：产出倍率类 #6-10 =====
  bellows: {
    n: '鼓风皮囊', d: '炼钢效率+25%', br: 'I',
    p: [{ r: 'leather', a: 10 }, { r: 'iron', a: 5 }],
    e: { craftM: { steel: { outMul: 0.25 } } },
    uq: { u: { steelWork: 1 } },
  },
  doubleFurnace: {
    n: '双层高炉', d: '高炉污染-25%', br: 'I',
    p: [{ r: 'brick', a: 30 }, { r: 'steel', a: 8 }],
    e: { bldM: { blastFurnace: { pollM: -0.25 } } },
    uq: { u: { steelWork: 1 } },
  },
  oreScreen: {
    n: '碎矿筛选', d: '矿坑额外产铁+0.005/s', br: 'I',
    p: [{ r: 'steel', a: 5 }, { r: 'gear', a: 3 }],
    e: { bldM: { mine: { extraP: { iron: 0.01 } } } },
    uq: { u: { fineCraft: 1 } },
  },
  cokedCoal: {
    n: '焦煤提纯', d: '炼钢配方煤耗-20%', br: 'I',
    p: [{ r: 'coal', a: 40 }, { r: 'iron', a: 8 }],
    e: { craftM: { steel: { inpM: { coal: -0.2 } } } },
    uq: { u: { steelWork: 1 } },
  },
  ironForge: {
    n: '锻铁强化', d: '铁产出+35%', br: 'I',
    p: [{ r: 'steel', a: 12 }, { r: 'iron', a: 20 }],
    e: { ironM: 0.35 },
    uq: { u: { steelWork: 1 } },
  },
  // ===== A阶段：存储类 #11-14 =====
  steelRack: {
    n: '钢制储架', d: '煤/钢上限+50%', br: 'I',
    p: [{ r: 'steel', a: 15 }, { r: 'plank', a: 10 }],
    e: { mxM: { coal: 0.5, steel: 0.5 } },
    uq: { u: { steelWork: 1 } },
  },
  steelGranary: {
    n: '钢制粮仓', d: '野莓上限+40%', br: 'I',
    p: [{ r: 'steel', a: 10 }, { r: 'plank', a: 15 }],
    e: { mxM: { berry: 0.4 } },
    uq: { u: { steelWork: 1 } },
  },
  steelBookshelf: {
    n: '钢制书架', d: '卷轴/学识上限+30%', br: 'I',
    p: [{ r: 'steel', a: 8 }, { r: 'scroll', a: 10 }],
    e: { mxM: { scroll: 0.3, lore: 0.3 } },
    uq: { u: { steelWork: 1 } },
  },
  reinforcedVault: {
    n: '加固储窖', d: '储藏窖存储效果+30%', br: 'I',
    p: [{ r: 'steel', a: 12 }, { r: 'brick', a: 20 }],
    e: { bldMxM: { warehouse: 0.3 } },
    uq: { u: { steelWork: 1 } },
  },
  // ===== A阶段：消耗减免类 #15-16 =====
  coalBriq: {
    n: '煤粉压块', d: '高炉煤耗-20%（炼钢配方）', br: 'I',
    p: [{ r: 'coal', a: 30 }, { r: 'iron', a: 5 }],
    e: { craftM: { steel: { inpM: { coal: -0.2 } } } },
    uq: { u: { steelWork: 1 } },
  },
  insulatedWall: {
    n: '隔热炉壁', d: '高炉煤耗-15%（炼钢配方）', br: 'I',
    p: [{ r: 'brick', a: 25 }, { r: 'coal', a: 15 }],
    e: { craftM: { steel: { inpM: { coal: -0.15 } } } },
    uq: { u: { steelWork: 1 } },
  },
  // ===== A阶段：跨系统类 #17-20 =====
  steelBow: {
    n: '钢制猎弓', d: '猎手产出+40%', br: 'I',
    p: [{ r: 'steel', a: 6 }, { r: 'leather', a: 5 }],
    e: { jobM: { hunter: 0.4 } },
    uq: { u: { steelWork: 1 } },
  },
  steelScales: {
    n: '钢制商秤', d: '商贩产出+30%', br: 'I',
    p: [{ r: 'steel', a: 5 }, { r: 'coin', a: 20 }],
    e: { jobM: { merchant: 0.3 } },
    uq: { u: { steelWork: 1 } },
  },
  mineTownPlan: {
    n: '矿镇规划', d: '矿坑/高炉建造费-10%', br: 'I',
    p: [{ r: 'steel', a: 10 }, { r: 'concrete', a: 5 }],
    e: { bldCostM: { mine: -0.1, blastFurnace: -0.1 } },
    uq: { u: { concreteTech: 1 } },
  },
  coalLamp: {
    n: '煤灯照明', d: '学者产出+20%', br: 'I',
    p: [{ r: 'coal', a: 20 }, { r: 'iron', a: 5 }],
    e: { jobM: { scholar: 0.2 } },
    uq: { u: { deepMining: 1 } },
  },

  // ===== 工业分支 B阶段升级（Phase 3 批次，10 个） =====
  // #21 深井钻头：油井产出 +50%
  deepWellDrill: {
    n: '深井钻头', d: '油井产出+50%', br: 'I',
    p: [{ r: 'steel', a: 15 }, { r: 'gear', a: 5 }],
    e: { bldM: { oilWell: { prodM: 0.5 } } },
    uq: { u: { oilExtract: 1 } },
  },
  // #22 精密齿轮：齿轮配方产出 ×2（即 +100%）
  precGear: {
    n: '精密齿轮', d: '齿轮配方产出×2', br: 'I',
    p: [{ r: 'steel', a: 12 }, { r: 'gear', a: 3 }, { r: 'draft', a: 1 }],
    e: { craftM: { gear: { outMul: 1.0 } } },
    uq: { u: { steamPower: 1 } },
  },
  // #23 蒸汽锻锤：炼钢/铸齿轮/压钢板配方产出 +30%
  steamHammer: {
    n: '蒸汽锻锤', d: '金属配方产出+30%', br: 'I',
    p: [{ r: 'gear', a: 8 }, { r: 'steel', a: 10 }],
    e: { craftM: { steel: { outMul: 0.3 }, gear: { outMul: 0.3 }, plate: { outMul: 0.3 } } },
    uq: { u: { steamPower: 1 } },
  },
  // #24 蒸汽伐木机：伐木场产出 +60%
  steamSawmill: {
    n: '蒸汽伐木机', d: '伐木场产出+60%', br: 'I',
    p: [{ r: 'gear', a: 10 }, { r: 'steel', a: 8 }, { r: 'plank', a: 15 }],
    e: { bldM: { lumberYard: { prodM: 0.6 } } },
    uq: { u: { steamPower: 1 } },
  },
  // #25 蒸汽采石机：采石坑产出 +60%
  steamQuarry: {
    n: '蒸汽采石机', d: '采石坑产出+60%', br: 'I',
    p: [{ r: 'gear', a: 10 }, { r: 'steel', a: 8 }, { r: 'brick', a: 10 }],
    e: { bldM: { quarry: { prodM: 0.6 } } },
    uq: { u: { steamPower: 1 } },
  },
  // #26 增压汽缸：蒸汽机房能量 +50%（特殊效果，calcEnergy 读取 _energyBoost）
  boostCylinder: {
    n: '增压汽缸', d: '蒸汽机房能量+50%', br: 'I',
    p: [{ r: 'gear', a: 10 }, { r: 'steel', a: 12 }],
    e: { _energyBoost: { steamEngine: 0.5 } },
    uq: { u: { steamPower: 1 }, b: { steamEngine: 2 } },
  },
  // #33 密封油管：火油上限 +40%
  sealPipe: {
    n: '密封油管', d: '火油上限+40%', br: 'I',
    p: [{ r: 'plate', a: 10 }, { r: 'oil', a: 5 }],
    e: { mxM: { oil: 0.4 } },
    uq: { u: { oilStorage: 1 } },
  },
  // #34 大型油缸：油缸存储效果 +50%
  largeTank: {
    n: '大型油缸', d: '油缸存储+50%', br: 'I',
    p: [{ r: 'plate', a: 15 }, { r: 'concrete', a: 8 }],
    e: { bldMxM: { oilTank: 0.5 } },
    uq: { u: { oilStorage: 1 }, b: { oilTank: 2 } },
  },
  // #35 齿轮箱：齿轮上限 +60%
  gearBox: {
    n: '齿轮箱', d: '齿轮上限+60%', br: 'I',
    p: [{ r: 'steel', a: 10 }, { r: 'plate', a: 5 }],
    e: { mxM: { gear: 0.6 } },
    uq: { u: { fineCraft: 1 } },
  },
  // #39 蒸汽回收：蒸汽机房污染 -30%
  steamRecovery: {
    n: '蒸汽回收', d: '蒸汽机房污染-30%', br: 'I',
    p: [{ r: 'gear', a: 12 }, { r: 'plate', a: 5 }],
    e: { bldM: { steamEngine: { pollM: -0.3 } } },
    uq: { u: { steamPower: 1 }, b: { steamEngine: 2 } },
  },
  // ===== 工业分支 B阶段升级（Phase 3 批次二，18 个） =====
  // #27 连杆传动：工厂配方加成 +3%（factory phase 4，提前定义）
  linkRod: {
    n: '连杆传动', d: '工厂配方加成+3%', br: 'I',
    p: [{ r: 'gear', a: 20 }, { r: 'steel', a: 10 }],
    e: { _factoryCraftBonus: 0.03 },
    uq: { u: { assemblyLine: 1 } },
  },
  // #28 自动给料：炉匠炼钢速率 +50%
  autoFeed: {
    n: '自动给料', d: '炉匠炼钢速率+50%', br: 'I',
    p: [{ r: 'gear', a: 8 }, { r: 'draft', a: 2 }],
    e: { _smelterRate: 0.5 },
    uq: { u: { steamPower: 1 }, b: { blastFurnace: 3 } },
  },
  // #29 油气回收：煅烧炉火油消耗 -25%（phase C 建筑，提前定义）
  oilRecovery: {
    n: '油气回收', d: '煅烧炉火油消耗-25%', br: 'I',
    p: [{ r: 'plate', a: 5 }, { r: 'oil', a: 15 }],
    e: { _bldConsReduce: { calciner: { oil: -0.25 } } },
    uq: { u: { oilGas: 1 } },
  },
  // #30 铁路提速：铁路商队到达率 +5%（phase 4 建筑，提前定义）
  railSpeed: {
    n: '铁路提速', d: '铁路商队加成+5%', br: 'I',
    p: [{ r: 'steel', a: 20 }, { r: 'gear', a: 10 }],
    e: { _railTradeBonus: 0.05 },
    uq: { u: { roadwork: 1 } },
  },
  // #31 双缸内燃：内燃机能量 +1（3→4）
  dualCylinder: {
    n: '双缸内燃', d: '内燃机能量+1', br: 'I',
    p: [{ r: 'gear', a: 15 }, { r: 'oil', a: 8 }, { r: 'draft', a: 1 }],
    e: { _energyBoost: { combustEngine: 0.333 } },
    uq: { u: { combustion: 1 }, b: { combustEngine: 2 } },
  },
  // #32 预热回路：蒸汽机房能量 +0.2/座（与增压汽缸叠加，1.5→1.7）
  preheatCircuit: {
    n: '预热回路', d: '蒸汽机房能量+0.2/座', br: 'I',
    p: [{ r: 'plate', a: 8 }, { r: 'oil', a: 10 }],
    e: { _energyBoost: { steamEngine: 0.2 } },
    uq: { u: { steamPower: 1 }, b: { steamEngine: 3 } },
  },
  // #36 蓝本柜：蓝本上限 +50%
  bpCabinet: {
    n: '蓝本柜', d: '蓝本上限+50%', br: 'I',
    p: [{ r: 'steel', a: 8 }, { r: 'scroll', a: 10 }],
    e: { mxM: { draft: 0.5 } },
    uq: { u: { blueprintLore: 1 } },
  },
  // #37 钢梁仓库：所有基础资源上限 +15%
  steelBeam: {
    n: '钢梁仓库', d: '基础资源上限+15%', br: 'I',
    p: [{ r: 'steel', a: 20 }, { r: 'concrete', a: 10 }],
    e: { mxM: { berry: 0.15, wood: 0.15, stone: 0.15, iron: 0.15, coal: 0.15 } },
    uq: { u: { steamPower: 1 } },
  },
  // #38 内燃优化：内燃机火油消耗 -30%（phase 4 建筑，提前定义）
  combOpt: {
    n: '内燃优化', d: '内燃机火油消耗-30%', br: 'I',
    p: [{ r: 'gear', a: 15 }, { r: 'oil', a: 10 }],
    e: { _bldConsReduce: { combustEngine: { oil: -0.3 } } },
    uq: { u: { combustion: 1 }, b: { combustEngine: 2 } },
  },
  // #40 废热利用：工厂能耗 -0.5（2→1.5，phase 4 建筑，提前定义）
  wasteHeat: {
    n: '废热利用', d: '工厂能耗-0.5', br: 'I',
    p: [{ r: 'plate', a: 8 }, { r: 'gear', a: 10 }],
    e: { _energyCostReduce: { factory: 0.5 } },
    uq: { u: { assemblyLine: 1 }, b: { factory: 2 } },
  },
  // #41 传送带：配方自动制作间隔 -20%（50tick→40tick）
  conveyor: {
    n: '传送带', d: '自动制作速率+25%', br: 'I',
    p: [{ r: 'gear', a: 20 }, { r: 'steel', a: 15 }, { r: 'draft', a: 2 }],
    e: { _autoCraftSpeed: 0.25 },
    uq: { u: { steamPower: 1 }, b: { steamEngine: 3 } },
  },
  // #42 自动锻压：钢板配方可自动制作
  autoForge: {
    n: '自动锻压', d: '钢板可自行制作', br: 'I',
    p: [{ r: 'gear', a: 15 }, { r: 'plate', a: 8 }, { r: 'draft', a: 1 }],
    e: { _autoCraftEnable: 'plate' },
    uq: { u: { steamPower: 1 } },
  },
  // #43 自动混凝：混凝配方可自动制作
  autoConcrete: {
    n: '自动混凝', d: '混凝可自行制作', br: 'I',
    p: [{ r: 'gear', a: 12 }, { r: 'concrete', a: 5 }, { r: 'draft', a: 1 }],
    e: { _autoCraftEnable: 'concrete' },
    uq: { u: { concreteTech: 1 } },
  },
  // #44 复式记账：铜钱产出 +30%
  doubleBook: {
    n: '复式记账', d: '铜钱产出+30%', br: 'I',
    p: [{ r: 'scroll', a: 20 }, { r: 'coin', a: 50 }],
    e: { coinM: 0.3 },
    uq: { u: { steamPower: 1 } },
  },
  // #45 蒸汽印刷：卷轴配方产出 ×2
  steamPrint: {
    n: '蒸汽印刷', d: '卷轴配方产出×2', br: 'I',
    p: [{ r: 'gear', a: 10 }, { r: 'scroll', a: 15 }, { r: 'draft', a: 1 }],
    e: { craftM: { scroll: { outMul: 1.0 } } },
    uq: { u: { steamPower: 1 } },
  },
  // #46 机械织布：丝帛配方产出 +50%
  mechWeave: {
    n: '机械织布', d: '纺丝帛/换丝帛 配方产出 +50%。', br: 'I',
    p: [{ r: 'gear', a: 12 }, { r: 'plate', a: 5 }, { r: 'silk', a: 3 }],
    e: { craftM: { weave: { outMul: 0.5 }, spiceToSilk: { outMul: 0.5 } } },
    uq: { u: { steamPower: 1 } },
  },
  // #47 燃油灯塔：远行奖励 +15%
  oilLighthouse: {
    n: '燃油灯塔', d: '远行奖励+15%', br: 'I',
    p: [{ r: 'oil', a: 10 }, { r: 'steel', a: 8 }],
    e: { _expRewardBonus: 0.15 },
    uq: { u: { oilExtract: 1 } },
  },
  // #48 工业城镇：狐狸上限 +3
  indTown: {
    n: '工业城镇', d: '狐狸上限+3', br: 'I',
    p: [{ r: 'steel', a: 25 }, { r: 'concrete', a: 15 }, { r: 'gear', a: 10 }],
    e: { _maxFoxFlat: 3 },
    uq: { u: { steamPower: 1 }, b: { steamEngine: 3 } },
  },

  // ===== 工业分支 C阶段升级 #49-78（30 个） =====
  // 工具类 #49-53
  titanTools: {
    n: '钛制工具', d: '所有基础产出+30%', br: 'I',
    p: [{ r: 'titan', a: 20 }, { r: 'alloy', a: 3 }],
    e: { berryM: 0.3, woodM: 0.3, stoneM: 0.3, ironM: 0.3 },
    uq: { u: { calcination: 1 } },
  },
  titanPickaxe: {
    n: '钛制矿镐', d: '煤产出+60%', br: 'I',
    p: [{ r: 'titan', a: 15 }, { r: 'alloy', a: 2 }],
    e: { coalM: 0.6 },
    uq: { u: { calcination: 1 } },
  },
  titanHammer: {
    n: '钛制锻锤', d: '所有金属配方产出+40%', br: 'I',
    p: [{ r: 'titan', a: 12 }, { r: 'alloy', a: 2 }],
    e: { craftM: { steel: { outMul: 0.4 }, gear: { outMul: 0.4 }, plate: { outMul: 0.4 } } },
    uq: { u: { refining: 1 } },
  },
  titanDrill: {
    n: '钛制钻头', d: '油井产出+40%', br: 'I',
    p: [{ r: 'titan', a: 15 }, { r: 'alloy', a: 3 }],
    e: { bldM: { oilWell: { prodM: 0.4 } } },
    uq: { u: { calcination: 1 } },
  },
  titanBow: {
    n: '钛制猎弓', d: '猎手产出+50%', br: 'I',
    p: [{ r: 'titan', a: 8 }, { r: 'alloy', a: 1 }],
    e: { jobM: { hunter: 0.5 } },
    uq: { u: { calcination: 1 } },
  },
  // 产出倍率类 #54-61
  oxidation: {
    n: '氧化反应', d: '寒钛产出+200%', br: 'I',
    p: [{ r: 'titan', a: 10 }, { r: 'oil', a: 20 }],
    e: { titanM: 2.0 },
    uq: { u: { calcination: 1 }, b: { calcFurnace: 2 } },
  },
  rotaryKilnUpg: {
    n: '回转窑炉', d: '寒钛产出+150%', br: 'I',
    p: [{ r: 'titan', a: 15 }, { r: 'oil', a: 20 }, { r: 'draft', a: 3 }],
    e: { titanM: 1.5 },
    uq: { u: { rotaryKiln: 1 } },
  },
  fluidCrack: {
    n: '流体裂化', d: '寒钛产出+200%', br: 'I',
    p: [{ r: 'titan', a: 20 }, { r: 'oil', a: 30 }, { r: 'draft', a: 5 }],
    e: { titanM: 2.0 },
    uq: { u: { fluidMech: 1 } },
  },
  alloyQuench: {
    n: '合金淬火', d: '合金配方产出x2', br: 'I',
    p: [{ r: 'titan', a: 25 }, { r: 'oil', a: 15 }],
    e: { craftM: { forgeAlloy: { outMul: 1.0 } } },
    uq: { u: { alloyScience: 1 } },
  },
  precTelescope: {
    n: '精密望远镜', d: '星图产出+80%', br: 'I',
    p: [{ r: 'titan', a: 10 }, { r: 'alloy', a: 3 }, { r: 'scroll', a: 30 }],
    e: { starchartM: 0.8 },
    uq: { u: { telescopeAdv: 1 } },
  },
  refineReflow: {
    n: '精炼回流', d: '精炼厂效率+40%', br: 'I',
    p: [{ r: 'alloy', a: 8 }, { r: 'oil', a: 20 }],
    e: { bldM: { refinery: { prodM: 0.4 } } },
    uq: { u: { refining: 1 }, b: { refinery: 2 } },
  },
  highTempCalc: {
    n: '高温煅烧', d: '煅烧炉铁副产+100%', br: 'I',
    p: [{ r: 'titan', a: 18 }, { r: 'oil', a: 25 }, { r: 'draft', a: 4 }],
    e: { bldM: { calcFurnace: { extraP: { ironP: .05 } } } },
    uq: { u: { calcination: 1 }, b: { calcFurnace: 3 } },
  },
  alloyGear: {
    n: '合金齿轮', d: '蒸汽机/内燃机/工厂效率+15%', br: 'I',
    p: [{ r: 'alloy', a: 5 }, { r: 'titan', a: 10 }],
    e: { bldM: { steamEngine: { prodM: 0.15 }, combustEngine: { prodM: 0.15 }, factory: { prodM: 0.15 } } },
    uq: { u: { refining: 1 } },
  },
  // 存储类 #62-65
  titanTank: {
    n: '钛制储罐', d: '所有资源上限+20%', br: 'I',
    p: [{ r: 'titan', a: 30 }, { r: 'pillar', a: 3 }],
    e: { _allMxPct: 0.2 },
    uq: { u: { heavyBuild: 1 } },
  },
  alloyVault: {
    n: '合金保险库', d: '贸易资源上限+80%', br: 'I',
    p: [{ r: 'alloy', a: 8 }, { r: 'pillar', a: 3 }],
    e: { mxM: { spice: 0.8, silk: 0.8, ancCoin: 0.8 } },
    uq: { u: { refining: 1 } },
  },
  outlineArchive: {
    n: '纲要存档室', d: '纲要/蓝本上限+60%', br: 'I',
    p: [{ r: 'pillar', a: 2 }, { r: 'draft', a: 5 }],
    e: { mxM: { outline: 0.6, draft: 0.6 } },
    uq: { u: { systematics: 1 } },
  },
  titanAlloyStore: {
    n: '钛合金仓', d: '钛库存储效果+50%', br: 'I',
    p: [{ r: 'titan', a: 25 }, { r: 'alloy', a: 5 }, { r: 'pillar', a: 3 }],
    e: { bldMxM: { titanVault: 0.5 } },
    uq: { b: { titanVault: 2 } },
  },
  // 消耗减免类 #66-69
  modularFactory: {
    n: '模块化工厂', d: '工厂能耗-1', br: 'I',
    p: [{ r: 'alloy', a: 5 }, { r: 'draft', a: 5 }, { r: 'pillar', a: 3 }],
    e: { bldM: { factory: { energySave: 1 } } },
    uq: { u: { modularEng: 1 } },
  },
  calcOptimize: {
    n: '煅烧优化', d: '煅烧炉石消耗-30%', br: 'I',
    p: [{ r: 'titan', a: 12 }, { r: 'oil', a: 20 }, { r: 'draft', a: 3 }],
    e: { bldM: { calcFurnace: { consM: { stoneP: -0.3 } } } },
    uq: { u: { calcination: 1 }, b: { calcFurnace: 2 } },
  },
  outlineIndex: {
    n: '纲要索引', d: '研究费用-15%', br: 'I',
    p: [{ r: 'outline', a: 5 }, { r: 'scroll', a: 50 }],
    e: { _researchCostM: -0.15 },
    uq: { u: { systematics: 1 } },
  },
  concreteBase: {
    n: '混凝地基', d: '建筑造价-10%', br: 'I',
    p: [{ r: 'pillar', a: 5 }, { r: 'alloy', a: 3 }],
    e: { _bldCostM: -0.10 },
    uq: { u: { heavyBuild: 1 } },
  },
  // 自动化类 #70-74
  autoLine: {
    n: '自动化流水线', d: '工程师配方加成+5%', br: 'I',
    p: [{ r: 'alloy', a: 10 }, { r: 'titanPart', a: 5 }, { r: 'draft', a: 8 }],
    e: { _engCraftBonus: 0.05 },
    uq: { u: { automation: 1 } },
  },
  autoAlloy: {
    n: '自动合金锻', d: '合金配方可自动制作', br: 'I',
    p: [{ r: 'alloy', a: 5 }, { r: 'titan', a: 8 }, { r: 'draft', a: 3 }],
    e: { _autoCraft: 'forgeAlloy' },
    uq: { u: { refining: 1 } },
  },
  autoTitanPart: {
    n: '自动钛构铸', d: '钛构件配方可自动制作', br: 'I',
    p: [{ r: 'titanPart', a: 3 }, { r: 'titan', a: 10 }, { r: 'draft', a: 5 }],
    e: { _autoCraft: 'castTitanPart' },
    uq: { u: { precFab: 1 } },
  },
  refineAutoCtrl: {
    n: '精炼自控', d: '精炼师产出+30%', br: 'I',
    p: [{ r: 'alloy', a: 8 }, { r: 'titanPart', a: 5 }, { r: 'outline', a: 2 }],
    e: { jobM: { refiner: 0.3 } },
    uq: { u: { automation: 1 }, b: { refinery: 2 } },
  },
  autoTrack: {
    n: '望远自动追踪', d: '望远台产出+40%', br: 'I',
    p: [{ r: 'titan', a: 12 }, { r: 'alloy', a: 5 }, { r: 'draft', a: 3 }],
    e: { bldM: { observatory: { prodM: 0.4 } } },
    uq: { u: { stargazing: 1 }, b: { observatory: 2 } },
  },
  // 跨系统类 #75-78
  titanScale: {
    n: '钛制商秤', d: '商贩产出+50%', br: 'I',
    p: [{ r: 'titan', a: 5 }, { r: 'coin', a: 80 }],
    e: { jobM: { merchant: 0.5 } },
    uq: { u: { calcination: 1 } },
  },
  alloyCoinMold: {
    n: '合金铸币模', d: '铜钱产出+40%', br: 'I',
    p: [{ r: 'alloy', a: 3 }, { r: 'coin', a: 100 }],
    e: { coinM: 0.4 },
    uq: { u: { refining: 1 } },
  },
  titanScholarCap: {
    n: '钛制学士冠', d: '学者产出+40%，学识上限+30%', br: 'I',
    p: [{ r: 'titan', a: 8 }, { r: 'outline', a: 3 }],
    e: { jobM: { scholar: 0.4 }, mxM: { lore: 0.3 } },
    uq: { u: { systematics: 1 } },
  },
  alloyRailway: {
    n: '合金铁路', d: '铁路商队加成再+8%，远行时间再x0.85', br: 'I',
    p: [{ r: 'alloy', a: 10 }, { r: 'titan', a: 15 }],
    e: { _caravanBonusFlat: 0.08, _expTimeM: 0.85 },
    uq: { u: { refining: 1 }, b: { railroad: 1 } },
  },

  // ===== 工业分支 D阶段升级 #79-106（v0.20 §八 5.1e, 28 个） =====
  // 工具类 #79-81
  uraniumTools: {
    n: '辉石工具', d: '所有基础产出+25%（与钛制工具叠加）', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 10 }, { r: 'alloy', a: 5 }],
    e: { berryM: 0.25, woodM: 0.25, stoneM: 0.25, ironM: 0.25 },
    uq: { u: { fission: 1 } },
  },
  uraniumPickaxe: {
    n: '辉石矿镐', d: '煤产出+50%（叠加铁/钛矿镐）', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 8 }, { r: 'alloy', a: 3 }],
    e: { coalM: 0.5 },
    uq: { u: { fission: 1 } },
  },
  uraniumDrill: {
    n: '辉石钻头', d: '油井产出+40%（叠加钛钻头）', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 8 }, { r: 'alloy', a: 3 }],
    e: { bldM: { oilWell: { prodM: 0.4 } } },
    uq: { u: { fission: 1 } },
  },
  // 产出倍率类 #82-90
  particleFocus: {
    n: '粒子聚焦', d: '加速器产出+60%', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 15 }, { r: 'alloy', a: 10 }],
    e: { bldM: { accelerator: { prodM: 0.6 } } },
    uq: { u: { particle: 1 } },
  },
  proliferReact: {
    n: '增殖反应', d: '熔炉能量产出+50%', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 30 }, { r: 'draft', a: 10 }],
    e: { _energyBoost: { furnace: 0.5 } },
    uq: { u: { proliferation: 1 } },
  },
  mirrorPolish: {
    n: '镜面精磨', d: '镜合金配方产出×2', br: 'I', phase: 4,
    p: [{ r: 'mirrorAlloy', a: 5 }, { r: 'titan', a: 20 }],
    e: { craftM: { craftMirrorAlloy: { outMul: 1.0 } } },
    uq: { u: { mirrorForge: 1 } },
  },
  thoriumStable: {
    n: '钍稳定器', d: '熔炉产出加成+60%（含全产出加成）', br: 'I', phase: 4,
    p: [{ r: 'thorium', a: 10 }, { r: 'alloy', a: 15 }],
    e: { bldM: { furnace: { prodM: 0.6 } } },
    uq: { u: { thoriumConv: 1 } },
  },
  uraniumCatalyst: {
    n: '辉石催化', d: '炼钢配方产出×3（钢瓶颈终极解）', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 20 }, { r: 'titan', a: 15 }],
    e: { craftM: { steel: { outMul: 2.0 } } },
    uq: { u: { radiantPower: 1 } },
  },
  thoriumReson: {
    n: '重晶共鸣', d: '加速器/熔炉/辉匣产出+15%', br: 'I', phase: 4,
    p: [{ r: 'thorium', a: 8 }, { r: 'uranium', a: 30 }],
    e: { bldM: { accelerator: { prodM: 0.15 }, furnace: { prodM: 0.15 }, radianceBox: { prodM: 0.15 } } },
    uq: { u: { thoriumConv: 1 } },
  },
  deepCalc: {
    n: '深层煅烧', d: '煅烧炉产出+100%', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 15 }, { r: 'titan', a: 30 }, { r: 'oil', a: 40 }],
    e: { bldM: { calcFurnace: { prodM: 1.0 } } },
    uq: { u: { radiantPower: 1 } },
  },
  fastFission: {
    n: '加速裂解', d: '加速器产出+40%（与粒子聚焦叠加）', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 25 }, { r: 'alloy', a: 12 }],
    e: { bldM: { accelerator: { prodM: 0.4 } } },
    uq: { u: { particle: 1 } },
  },
  codexInsight: {
    n: '密典洞见', d: '所有研究费用-10%', br: 'I', phase: 4,
    p: [{ r: 'codex', a: 5 }, { r: 'lore', a: 1500 }],
    e: { _researchCostM: -0.10 },
    uq: { u: { voidPrinciple: 1 } },
  },
  // 存储类 #91-93
  uraniumVault: {
    n: '辉石保险库', d: '辉石/重晶上限+60%', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 15 }, { r: 'pillar', a: 5 }],
    e: { mxM: { uranium: 0.6, thorium: 0.6 } },
    uq: { u: { fission: 1 } },
  },
  mirrorVessel: {
    n: '镜合金容器', d: '镜合金/密典上限+50%', br: 'I', phase: 4,
    p: [{ r: 'mirrorAlloy', a: 5 }, { r: 'alloy', a: 10 }],
    e: { mxM: { mirrorAlloy: 0.5, codex: 0.5 } },
    uq: { u: { mirrorForge: 1 } },
  },
  radianceCompress: {
    n: '辉能压缩仓', d: '煤/钢/火油/寒钛上限+30%', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 20 }, { r: 'alloy', a: 15 }, { r: 'pillar', a: 8 }],
    e: { mxM: { coal: 0.3, steel: 0.3, oil: 0.3, titan: 0.3 } },
    uq: { u: { radiantPower: 1 } },
  },
  // 消耗减免类 #94-99
  shieldedReact: {
    n: '屏蔽反应室', d: '熔炉辉石消耗-30%', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 20 }, { r: 'pillar', a: 5 }],
    e: { bldM: { furnace: { extraP: { uranium: 0.0003 } } } },
    uq: { u: { shielding: 1 } },
  },
  superCoil: {
    n: '超导线圈', d: '加速器能耗-2（5→3）', br: 'I', phase: 4,
    p: [{ r: 'alloy', a: 15 }, { r: 'uranium', a: 10 }],
    e: { _energyCostReduce: { accelerator: 2 } },
    uq: { u: { superCond: 1 } },
  },
  thoriumDense: {
    n: '重晶浓缩', d: '重晶转化原料-25%（200→150）', br: 'I', phase: 4,
    p: [{ r: 'thorium', a: 5 }, { r: 'uranium', a: 50 }],
    e: { craftM: { craftThorium: { inpM: { uranium: -0.25 } } } },
    uq: { u: { thoriumConv: 1 } },
  },
  radProtect: {
    n: '辐射防护', d: '加速器/熔炉污染-30%', br: 'I', phase: 4,
    p: [{ r: 'alloy', a: 20 }, { r: 'pillar', a: 8 }],
    e: { bldM: { accelerator: { pollM: -0.3 }, furnace: { pollM: -0.3 } } },
    uq: { u: { radiation: 1 } },
  },
  energyReservoir: {
    n: '辉能蓄池', d: '能量不足时衰减速率-50%', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 25 }, { r: 'mirrorAlloy', a: 3 }],
    e: { _energyShortageReduce: 0.5 },
    uq: { u: { proliferation: 1 } },
  },
  codexAnnotate: {
    n: '密典注解', d: '研究费用-15%（与密典洞见叠加）', br: 'I', phase: 4,
    p: [{ r: 'codex', a: 3 }, { r: 'lore', a: 1000 }],
    e: { _researchCostM: -0.15 },
    uq: { u: { voidPrinciple: 1 } },
  },
  // 自动化类 #100-103
  radianceAutoForge: {
    n: '辉能自动锻', d: '自动制作速率+30%', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 10 }, { r: 'alloy', a: 8 }, { r: 'draft', a: 8 }],
    e: { _autoCraftSpeed: 0.3 },
    uq: { u: { autoMech: 1 } },
  },
  autoThorium: {
    n: '自动重晶转', d: '重晶配方可自动制作', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 15 }, { r: 'titanPart', a: 8 }, { r: 'outline', a: 3 }],
    e: { _autoCraftEnable: 'craftThorium' },
    uq: { u: { thoriumConv: 1 } },
  },
  autoMirror: {
    n: '自动镜锻', d: '镜合金配方可自动制作', br: 'I', phase: 4,
    p: [{ r: 'mirrorAlloy', a: 3 }, { r: 'alloy', a: 10 }, { r: 'draft', a: 5 }],
    e: { _autoCraftEnable: 'craftMirrorAlloy' },
    uq: { u: { mirrorForge: 1 } },
  },
  smartScheduler: {
    n: '智能调度', d: '所有职业产出+20%', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 20 }, { r: 'outline', a: 5 }, { r: 'alloy', a: 12 }],
    e: { _jobAllM: 0.2 },
    uq: { u: { autoMech: 1 } },
  },
  // 跨系统类 #104-106
  radianceBeacon: {
    n: '辉能灯塔', d: '远行奖励+25%，远行时间-20%', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 8 }, { r: 'pillar', a: 5 }],
    e: { _expRewardBonus: 0.25, _expTimeM: 0.8 },
    uq: { u: { radiantPower: 1 } },
  },
  uraniumCoinage: {
    n: '辉石铸币', d: '铜钱产出+50%，商队到达率+5%', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 5 }, { r: 'coin', a: 200 }],
    e: { coinM: 0.5, _caravanFreq: 0.05 },
    uq: { u: { radiantPower: 1 } },
  },
  radianceHeat: {
    n: '辉能供暖', d: '冬季野莓惩罚-50%', br: 'I', phase: 4,
    p: [{ r: 'uranium', a: 12 }, { r: 'pillar', a: 3 }],
    e: { _winterPenaltyReduce: 0.5 },
    uq: { u: { radiantPower: 1 } },
  },

  // ===== 灵修分支 A阶段升级 #1-20 =====
  // #1 灵泉精修：灵泉产出 +50%
  wellRefine: {
    n: '灵泉精修', d: '灵泉产出+50%', br: 'M',
    p: [{ r: 'spirit', a: 30 }, { r: 'charm', a: 20 }],
    e: { bldM: { spiritWell: { prodM: 0.5 } } },
    uq: { b: { spiritWell: 2 } },
    tip: ['疏通泉眼只需要一根手指和三分耐心。']
  },
  // #2 念珠磨光：念珠配方产出 +1（基础2→3，即+50%）
  beadPolish: {
    n: '念珠磨光', d: '念珠配方产出+1', br: 'M',
    p: [{ r: 'bead', a: 10 }, { r: 'spirit', a: 20 }],
    e: { craftM: { bead: { outMul: 0.5 } } },
    uq: { u: { beadCraft: 1 } },
    tip: ['磨过的珠子不光滑，是温润——握在爪心像捏着一颗小太阳。']
  },
  // #3 墨液浓缩：灵墨配方消耗 -20%
  inkConcentrate: {
    n: '墨液浓缩', d: '灵墨配方消耗-20%', br: 'M',
    p: [{ r: 'spiritInk', a: 5 }, { r: 'charm', a: 30 }],
    e: { craftM: { spiritInk: { inpM: { ink: -0.2, charm: -0.2 } } } },
    uq: { u: { inscription: 1 } },
    tip: ['少放材料多搅三圈——秘诀就这么简单。']
  },
  // #4 符刻深纹：符纹配方产出 +1（基础1→2，即+100%）
  sigilDeep: {
    n: '符刻深纹', d: '符纹配方产出+1', br: 'M',
    p: [{ r: 'sigil', a: 5 }, { r: 'spiritInk', a: 8 }],
    e: { craftM: { sigil: { outMul: 1.0 } } },
    uq: { u: { inscription: 1 } },
    tip: ['第一刀定形，第二刀入魂——刻深了，石头自己会记住。']
  },
  // #5 感应凝聚：感应者产出 +30%
  channelFocus: {
    n: '感应凝聚', d: '感应者产出+30%', br: 'M',
    p: [{ r: 'spirit', a: 40 }, { r: 'fateSilk', a: 5 }],
    e: { jobM: { spiritSenser: 0.3 } },
    uq: { u: { silkWeave: 1 } },
    tip: ['闭眼之前深呼吸，灵流就知道该往哪走了。']
  },
  // #6 灵泉涌流：灵泉产出 +30%（与#1加法叠加）
  wellSurge: {
    n: '灵泉涌流', d: '灵泉产出+30%', br: 'M',
    p: [{ r: 'spirit', a: 60 }, { r: 'bead', a: 15 }],
    e: { bldM: { spiritWell: { prodM: 0.3 } } },
    uq: { b: { spiritWell: 3 } },
    tip: ['泉眼越挖越深，光也越来越亮——挡都挡不住。']
  },
  // #7 丝韧化：命丝配方产出 +1（基础1→2，即+100%）
  silkToughen: {
    n: '丝韧化', d: '命丝配方产出+1', br: 'M',
    p: [{ r: 'fateSilk', a: 15 }, { r: 'spirit', a: 50 }],
    e: { craftM: { fateSilk: { outMul: 1.0 } } },
    uq: { u: { silkWeave: 1 } },
    tip: ['拉到断之前松手——命丝就学会了韧性。']
  },
  // #8 脉稳：聚灵阵灵脉 +0.5/座（特殊效果，引擎 calcLeyline 读取）
  leyStable: {
    n: '脉稳', d: '聚灵阵灵脉+0.5/座', br: 'M',
    p: [{ r: 'sigil', a: 8 }, { r: 'bead', a: 20 }],
    e: { _leyBonus: { leyArray: 0.5 } },
    uq: { u: { leylineLore: 1 } },
    tip: ['石头排对了位置，地底的嗡嗡声就变成了稳定的节拍。']
  },
  // #9 灵塔扩容：灵塔存储效果 +50%
  towerExpand: {
    n: '灵塔扩容', d: '灵塔存储+50%', br: 'M',
    p: [{ r: 'fateSilk', a: 10 }, { r: 'plank', a: 30 }],
    e: { bldMxM: { spiritTower: 0.5 } },
    uq: { b: { spiritTower: 3 } },
    tip: ['往上加了两层——灵能说住得挺宽敞的。']
  },
  // #10 静室深修：静室阈值 50→80（特殊效果，引擎 effectiveUnrest 读取）
  quietDeep: {
    n: '静室深修', d: '静室阈值右移 50→80', br: 'M',
    p: [{ r: 'charm', a: 50 }, { r: 'spirit', a: 30 }],
    e: { _quietBonus: 30 },
    uq: { b: { quietRoom: 2 } },
    tip: ['把门再关紧一点，安静就再深一层。']
  },
  // #11 灵墨存瓶：灵墨上限 +50（基础100，+50%）
  inkBottle: {
    n: '灵墨存瓶', d: '灵墨上限+50', br: 'M',
    p: [{ r: 'spiritInk', a: 8 }, { r: 'charm', a: 40 }],
    e: { mxM: { spiritInk: 0.5 } },
    uq: { u: { inscription: 1 } },
    tip: ['用符文封口的瓶子，墨水放一百年都不会干。']
  },
  // #12 符纹匣：符纹上限 +30（基础100，+30%）
  sigilCase: {
    n: '符纹匣', d: '符纹上限+30', br: 'M',
    p: [{ r: 'sigil', a: 5 }, { r: 'plank', a: 20 }],
    e: { mxM: { sigil: 0.3 } },
    uq: { u: { inscription: 1 } },
    tip: ['木匣子里衬了一层兽皮——符纹怕磕。']
  },
  // #13 念珠串架：念珠上限 +50（基础50，+100%）
  beadRack: {
    n: '念珠串架', d: '念珠上限+50', br: 'M',
    p: [{ r: 'bead', a: 15 }, { r: 'wood', a: 50 }],
    e: { mxM: { bead: 1.0 } },
    uq: { u: { beadCraft: 1 } },
    tip: ['架子上挂满了串珠，风一吹叮叮当当——像风铃。']
  },
  // #14 灵泉引流：灵泉躁念 -50%（特殊效果，引擎 calcUnrest 读取）
  wellCalm: {
    n: '灵泉引流', d: '灵泉躁念-50%', br: 'M',
    p: [{ r: 'spirit', a: 50 }, { r: 'charm', a: 30 }],
    e: { _unrestReduce: { spiritWell: -0.5 } },
    uq: { u: { pureMind: 1 } },
    tip: ['把泉水引到静室旁边，躁动就被安静吸走了一半。']
  },
  // #15 感应远距：感应者产出受满意度额外×1.2（特殊效果，引擎 calcR 读取）
  channelFar: {
    n: '感应远距', d: '感应者产出×满意度×1.2', br: 'M',
    p: [{ r: 'spirit', a: 60 }, { r: 'fateSilk', a: 8 }],
    e: { _happyJobBonus: { spiritSenser: 0.2 } },
    uq: { u: { silkWeave: 1 }, b: { spiritWell: 3 } },
    tip: ['距离不是障碍——闭上眼，灵流自己会过来。']
  },
  // #16 聚灵阵联：每3座聚灵阵额外灵脉+1（特殊效果，引擎 calcLeyline 读取）
  leyLink: {
    n: '聚灵阵联', d: '每3座聚灵阵额外灵脉+1', br: 'M',
    p: [{ r: 'sigil', a: 10 }, { r: 'bead', a: 25 }],
    e: { _leySetBonus: { leyArray: { per: 3, bonus: 1 } } },
    uq: { b: { leyArray: 3 } },
    tip: ['三座阵连成一条线，地底的灵脉就开始共振了。']
  },
  // #17 灵猎：猎手产出 +30%（跨系统）
  spiritHunt: {
    n: '灵猎', d: '猎手产出+30%', br: 'M',
    p: [{ r: 'spirit', a: 40 }, { r: 'leather', a: 20 }],
    e: { jobM: { hunter: 0.3 } },
    uq: { u: { spiritSense: 1 } },
    tip: ['用灵觉追踪猎物——它还没跑，你就知道它要往哪跑。']
  },
  // #18 灵笔：学者产出 +25%（跨系统）
  spiritPen: {
    n: '灵笔', d: '学者产出+25%', br: 'M',
    p: [{ r: 'spiritInk', a: 5 }, { r: 'scroll', a: 15 }],
    e: { jobM: { scholar: 0.25 } },
    uq: { u: { inscription: 1 } },
    tip: ['灵墨写的字会自己发光，省了蜡烛钱。']
  },
  // #19 灵商：商贩产出 +20%（跨系统）
  spiritTrade: {
    n: '灵商', d: '商贩产出+20%', br: 'M',
    p: [{ r: 'spirit', a: 50 }, { r: 'coin', a: 30 }],
    e: { jobM: { merchant: 0.2 } },
    uq: { u: { leylineLore: 1 } },
    tip: ['用灵觉看穿对方底价——这不算作弊，算天赋。']
  },
  // #20 念珠护：远行奖励 +10%（特殊效果，engine-systems resolveExpedition 读取）
  beadGuard: {
    n: '念珠护', d: '远行奖励+10%', br: 'M',
    p: [{ r: 'bead', a: 20 }, { r: 'sigil', a: 5 }],
    e: { _expRewardBonus: 0.1 },
    uq: { u: { beadCraft: 1 } },
    tip: ['出门前拨一遍念珠，回来的时候总会多带点东西。']
  },
  // ===== 灵修分支 B阶段升级 #21-48 =====
  // #21 共振塔调谐：共振塔产出 +40%
  resonTune: {
    n: '共振塔调谐', d: '共振塔产出+40%', br: 'M',
    p: [{ r: 'resonance', a: 10 }, { r: 'fateSilk', a: 15 }],
    e: { bldM: { resonTower: { prodM: 0.4 } } },
    uq: { b: { resonTower: 2 } },
  },
  // #22 灵液精酿：灵液上限扩展效果 10→15
  elixirRefine: {
    n: '灵液精酿', d: '灵液上限扩展效果+50%（10→15）', br: 'M',
    p: [{ r: 'elixir', a: 3 }, { r: 'spirit', a: 80 }],
    e: { _elixirBonus: 5 },
    uq: { u: { elixirBrew: 1 } },
  },
  // #23 谱石切面：谱石配方产出 +1
  specFacet: {
    n: '谱石切面', d: '谱石配方产出+1', br: 'M',
    p: [{ r: 'spectrum', a: 5 }, { r: 'resonance', a: 8 }],
    e: { craftM: { spectrum: { outFlat: 1 } } },
    uq: { u: { specAnalysis: 1 } },
  },
  // #24 通灵阁专注：通灵阁悟片产出 +50%
  oracleFocus: {
    n: '通灵阁专注', d: '通灵阁悟片产出+50%', br: 'M',
    p: [{ r: 'insight', a: 8 }, { r: 'fateSilk', a: 20 }],
    e: { bldM: { oracleHall: { prodM: 0.5 } } },
    uq: { u: { oracleArt: 1 } },
  },
  // #25 酿灵师心法：酿灵师效率 +30%
  brewerMastery: {
    n: '酿灵师心法', d: '酿灵师效率+30%', br: 'M',
    p: [{ r: 'elixir', a: 2 }, { r: 'resonance', a: 12 }],
    e: { jobM: { elixirBrewer: 0.3 } },
    uq: { b: { elixirBrewery: 3 } },
  },
  // #26 共振波增幅：共振波灵术效果 50%→65%
  waveAmplify: {
    n: '共振波增幅', d: '共振波效果50%→65%', br: 'M',
    p: [{ r: 'resonance', a: 15 }, { r: 'spectrum', a: 5 }],
    e: { _spellBoost: { resonWave: 0.15 } },
    uq: { u: { resonArt: 1 }, b: { resonTower: 3 } },
  },
  // #27 化形延时：化形·灵狐持续时间 +1季
  shapeExtend: {
    n: '化形延时', d: '化形·灵狐持续+1季', br: 'M',
    p: [{ r: 'elixir', a: 3 }, { r: 'resonance', a: 20 }],
    e: { _shapeExtend: 1 },
    uq: { u: { shapeBasic: 1 } },
  },
  // #28 悟语深解：悟语效果 40%→55%
  sageDeep: {
    n: '悟语深解', d: '悟语效果40%→55%', br: 'M',
    p: [{ r: 'insight', a: 10 }, { r: 'spectrum', a: 8 }],
    e: { _spellBoost: { sageUtter: 0.15 } },
    uq: { u: { sageWay: 1 } },
  },
  // #29 灵酿坊扩容：灵酿坊配方加成 5%→8%
  breweryExpand: {
    n: '灵酿坊扩容', d: '灵酿坊配方加成5%→8%', br: 'M',
    p: [{ r: 'fateSilk', a: 25 }, { r: 'spectrum', a: 5 }],
    e: { _breweryBoost: 0.03 },
    uq: { b: { elixirBrewery: 2 } },
  },
  // #30 共鸣师聆听：共鸣师额外产出灵能 0.005/s
  resonListen: {
    n: '共鸣师聆听', d: '共鸣师额外产出灵能+0.005/s', br: 'M',
    p: [{ r: 'resonance', a: 12 }, { r: 'spirit', a: 100 }],
    e: { _resonancerSpiritP: 0.01 },
    uq: { b: { resonTower: 2 }, j: { resonancer: 3 } },
  },
  // #31 净念林深根：净念林躁念消除 +50%（-0.04→-0.06）
  groveDeepRoot: {
    n: '净念林深根', d: '净念林躁念消除+50%', br: 'M',
    p: [{ r: 'elixir', a: 2 }, { r: 'fateSilk', a: 20 }],
    e: { _unrestReduce: { calmGrove: -0.5 } },
    uq: { u: { calmMind: 1 } },
  },
  // #32 悟者远思：悟者产出 +40%
  sageDistant: {
    n: '悟者远思', d: '悟者产出+40%', br: 'M',
    p: [{ r: 'insight', a: 12 }, { r: 'fateSilk', a: 25 }],
    e: { jobM: { sageOracle: 0.4 } },
    uq: { u: { oracleArt: 1 } },
  },
  // #33 共振子池：共振子上限 +100
  resonPool: {
    n: '共振子池', d: '共振子上限+100', br: 'M',
    p: [{ r: 'resonance', a: 20 }, { r: 'sigil', a: 10 }],
    e: { _flatMx: { resonance: 100 } },
    uq: { u: { resonArt: 1 } },
  },
  // #34 灵液窖：灵液上限 +30
  elixirVault: {
    n: '灵液窖', d: '灵液上限+30', br: 'M',
    p: [{ r: 'elixir', a: 5 }, { r: 'fateSilk', a: 15 }],
    e: { _flatMx: { elixir: 30 } },
    uq: { u: { elixirBrew: 1 } },
  },
  // #35 谱石匣：谱石上限 +50
  specBox: {
    n: '谱石匣', d: '谱石上限+50', br: 'M',
    p: [{ r: 'spectrum', a: 8 }, { r: 'bead', a: 20 }],
    e: { _flatMx: { spectrum: 50 } },
    uq: { u: { specAnalysis: 1 } },
  },
  // #36 悟片册：悟片上限 +40
  insightManual: {
    n: '悟片册', d: '悟片上限+40', br: 'M',
    p: [{ r: 'insight', a: 10 }, { r: 'scroll', a: 25 }],
    e: { _flatMx: { insight: 40 } },
    uq: { u: { sageWay: 1 } },
  },
  // #37 灵脉扩流：聚灵阵灵脉 +1/座（1→2）
  leyExpFlow: {
    n: '灵脉扩流', d: '聚灵阵灵脉+1/座', br: 'M',
    p: [{ r: 'resonance', a: 15 }, { r: 'sigil', a: 12 }],
    e: { _leyBonus: { leyArray: 1 } },
    uq: { u: { leyExpand: 1 } },
  },
  // #38 共振塔减耗：共振塔灵能消耗 -30%
  resonEfficiency: {
    n: '共振塔减耗', d: '共振塔灵能消耗-30%', br: 'M',
    p: [{ r: 'resonance', a: 12 }, { r: 'spectrum', a: 5 }],
    e: { _spiritConsReduce: { resonTower: 0.3 } },
    uq: { u: { leyExpand: 1 } },
  },
  // #39 化形殿减负：化形殿灵脉消耗 -1（2→1）
  shapeBurden: {
    n: '化形殿减负', d: '化形殿灵脉消耗-1', br: 'M',
    p: [{ r: 'elixir', a: 3 }, { r: 'resonance', a: 15 }],
    e: { _leyCostReduce: { shapeHall: 1 } },
    uq: { u: { shapeBasic: 1 } },
  },
  // #40 通灵阁宁：通灵阁躁念 -50%
  oracleCalm: {
    n: '通灵阁宁', d: '通灵阁躁念-50%', br: 'M',
    p: [{ r: 'insight', a: 8 }, { r: 'elixir', a: 2 }],
    e: { _unrestReduce: { oracleHall: -0.5 } },
    uq: { u: { calmMind: 1 } },
  },
  // #41 灵织延续：灵织灵术持续 +1季（预支C阶段）
  spiritWeaveExt: {
    n: '灵织延续', d: '灵织灵术持续+1季', br: 'M',
    p: [{ r: 'resonance', a: 20 }],
    e: { _spellDuration: { spiritWeave: 1 } },
    uq: { u: { leyExpand: 1 } },
  },
  // #42 自酿循环：灵液配方受灵酿坊加成 ×2
  selfBrew: {
    n: '自酿循环', d: '灵液配方受灵酿坊加成×2', br: 'M',
    p: [{ r: 'elixir', a: 5 }, { r: 'spectrum', a: 8 }],
    e: { _selfBrewMul: 2 },
    uq: { b: { elixirBrewery: 3 } },
  },
  // #43 灵能集中：灵能建筑产出在灵脉充足时额外 +10%
  spiritConcentrate: {
    n: '灵能集中', d: '灵脉充足时灵能建筑+10%', br: 'M',
    p: [{ r: 'resonance', a: 15 }, { r: 'spirit', a: 120 }],
    e: { _leyFullBonus: 0.1 },
    uq: { u: { leyExpand: 1 } },
  },
  // #44 织丝远行：织丝人产出影响远行奖励 +15%（跨系统）
  silkAdventure: {
    n: '织丝远行', d: '远行奖励+15%', br: 'M',
    p: [{ r: 'fateSilk', a: 20 }, { r: 'insight', a: 5 }],
    e: { _expRewardBonus: 0.15 },
    uq: { u: { oracleArt: 1 } },
  },
  // #45 共鸣造物：共振子存量每50个，全配方+1%（跨系统）
  resonCreation: {
    n: '共鸣造物', d: '共振子每50个全配方+1%', br: 'M',
    p: [{ r: 'resonance', a: 25 }, { r: 'spectrum', a: 8 }],
    e: { _resonCraftBonus: 0.01 },
    uq: { u: { resonArt: 1 } },
  },
  // #46 灵液润笔：学者/抄写员产出 +35%（跨系统）
  elixirInk: {
    n: '灵液润笔', d: '学者产出+35%', br: 'M',
    p: [{ r: 'elixir', a: 3 }, { r: 'scroll', a: 20 }],
    e: { jobM: { scholar: 0.35 } },
    uq: { u: { elixirBrew: 1 } },
  },
  // #47 谱石占卜：灵术冷却时间 -15%（全局）
  specDivine: {
    n: '谱石占卜', d: '灵术冷却-15%', br: 'M',
    p: [{ r: 'spectrum', a: 10 }, { r: 'resonance', a: 15 }],
    e: { _spellCoolReduce: 0.15 },
    uq: { u: { specAnalysis: 1 } },
  },
  // #48 化形路途：化形·灵狐形态期间远行时间 -30%（跨系统）
  shapeJourney: {
    n: '化形路途', d: '化形期间远行时间-30%', br: 'M',
    p: [{ r: 'elixir', a: 4 }, { r: 'fateSilk', a: 30 }],
    e: { _shapeExpTime: -0.3 },
    uq: { u: { shapeBasic: 1 } },
  },

  // ===== 灵修分支 C阶段升级 #49-78 =====
  caveRefine: {
    n: '结晶窟精修', d: '结晶窟晶丝产出+50%', br: 'M',
    p: [{ r: 'crystalSilk', a: 10 }, { r: 'spiritCore', a: 3 }],
    e: { bldM: { crystalCave: { prodM: 0.5 } } },
    uq: { b: { crystalCave: 2 } },
  },
  daisFocus: {
    n: '辉映台聚焦', d: '辉映台辉芒产出+40%', br: 'M',
    p: [{ r: 'radiance', a: 5 }, { r: 'crystalSilk', a: 8 }],
    e: { bldM: { radianceDais: { prodM: 0.4 } } },
    uq: { u: { radiant: 1 } },
  },
  coreStable: {
    n: '灵核炉稳火', d: '灵核炉产出+30%，躁念-20%', br: 'M',
    p: [{ r: 'spiritCore', a: 5 }, { r: 'spectrum', a: 10 }],
    e: { bldM: { coreForge: { prodM: 0.3, unrestM: -0.2 } } },
    uq: { u: { coreCraft: 1 } },
  },
  formSolid: {
    n: '形魄凝实', d: '形魄配方产出+1', br: 'M',
    p: [{ r: 'formSoul', a: 3 }, { r: 'spiritCore', a: 5 }],
    e: { _craftBonus: { shapeForm: 1 } },
    uq: { u: { formStudy: 1 } },
  },
  chartExpert: {
    n: '灵图阁专精', d: '灵图阁产出+60%', br: 'M',
    p: [{ r: 'spiritChart', a: 20 }, { r: 'insight', a: 10 }],
    e: { bldM: { chartHall: { prodM: 0.6 } } },
    uq: { u: { chartDraw: 1 } },
  },
  silkToughenC: {
    n: '晶丝韧化', d: '晶丝配方消耗-20%', br: 'M',
    p: [{ r: 'crystalSilk', a: 8 }, { r: 'resonance', a: 20 }],
    e: { _craftReduce: { weaveCrystal: 0.2 } },
    uq: { u: { deepReson: 1 } },
  },
  coreDouble: {
    n: '灵核双产', d: '灵核配方有20%概率双产', br: 'M',
    p: [{ r: 'spiritCore', a: 8 }, { r: 'radiance', a: 5 }],
    e: { _craftDouble: { forgeCore: 0.2 } },
    uq: { u: { deepReson: 1 } },
  },
  cosmicProd: {
    n: '万物谱感', d: '所有灵修建筑产出+8%', br: 'M',
    p: [{ r: 'spectrum', a: 15 }, { r: 'insight', a: 12 }],
    e: { _mysticBldAll: 0.08 },
    uq: { u: { cosmicSpec: 1 } },
  },
  radiantFar: {
    n: '辉映远照', d: '辉映台效果影响范围扩大', br: 'M',
    p: [{ r: 'radiance', a: 8 }, { r: 'crystalSilk', a: 12 }],
    e: { _radiantExpand: 1 },
    uq: { u: { deepReson: 1 } },
  },
  deepResonWave: {
    n: '深共鸣波', d: '共振波灵术效果65%→80%', br: 'M',
    p: [{ r: 'resonance', a: 30 }, { r: 'spiritCore', a: 5 }],
    e: { _spellBoost: { resonWave: 0.15 } },
    uq: { u: { deepReson: 1 } },
  },
  cosmicRead: {
    n: '万物谱读', d: '研究花费-10%（全局永久）', br: 'M',
    p: [{ r: 'spectrum', a: 20 }, { r: 'insight', a: 15 }],
    e: { _researchDiscount: 0.10 },
    uq: { u: { cosmicSpec: 1 } },
  },
  formPower: {
    n: '形魄强化', d: '形魄用于任务时效果+30%', br: 'M',
    p: [{ r: 'formSoul', a: 5 }, { r: 'spiritCore', a: 8 }],
    e: { _formBonus: 0.3 },
    uq: { u: { formStudy: 1 } },
  },
  chartMass: {
    n: '灵图量产', d: '灵图阁每座额外灵图+0.0005/s', br: 'M',
    p: [{ r: 'spiritChart', a: 30 }, { r: 'insight', a: 15 }],
    e: { _chartExtra: 0.0005 },
    uq: { u: { cosmicSpec: 1 } },
  },
  crystalStore: {
    n: '晶丝仓', d: '晶丝上限+100', br: 'M',
    p: [{ r: 'crystalSilk', a: 15 }, { r: 'spectrum', a: 10 }],
    e: { _flatMx: { crystalSilk: 100 } },
    uq: { u: { starSense: 1 } },
  },
  radianceBottle: {
    n: '辉芒瓶', d: '辉芒上限+50', br: 'M',
    p: [{ r: 'radiance', a: 8 }, { r: 'crystalSilk', a: 10 }],
    e: { _flatMx: { radiance: 50 } },
    uq: { u: { starSense: 1 } },
  },
  coreBox: {
    n: '灵核匣', d: '灵核上限+30', br: 'M',
    p: [{ r: 'spiritCore', a: 8 }, { r: 'formSoul', a: 3 }],
    e: { _flatMx: { spiritCore: 30 } },
    uq: { u: { starSense: 1 } },
  },
  chartBook: {
    n: '灵图册', d: '灵图上限+200', br: 'M',
    p: [{ r: 'spiritChart', a: 40 }, { r: 'insight', a: 10 }],
    e: { _flatMx: { spiritChart: 200 } },
    uq: { u: { starSense: 1 } },
  },
  caveSave: {
    n: '结晶窟减耗', d: '结晶窟命丝消耗-25%', br: 'M',
    p: [{ r: 'crystalSilk', a: 10 }, { r: 'resonance', a: 25 }],
    e: { bldM: { crystalCave: { costM: -0.25 } } },
    uq: { u: { crystalize: 1 }, b: { crystalCave: 3 } },
  },
  daisEco: {
    n: '辉映台节能', d: '辉映台灵脉消耗-1（2→1）', br: 'M',
    p: [{ r: 'radiance', a: 5 }, { r: 'spiritCore', a: 3 }],
    e: { _leyCostReduce: { radianceDais: 1 } },
    uq: { u: { radiant: 1 } },
  },
  coreCycle: {
    n: '灵核炉循环', d: '灵核炉共振子消耗-20%', br: 'M',
    p: [{ r: 'spiritCore', a: 6 }, { r: 'crystalSilk', a: 12 }],
    e: { bldM: { coreForge: { costM: -0.2 } } },
    uq: { u: { coreCraft: 1 } },
  },
  groveDeep: {
    n: '净辉林深根', d: '净辉林躁念消除+50%', br: 'M',
    p: [{ r: 'crystalSilk', a: 5 }, { r: 'elixir', a: 3 }],
    e: { _unrestReduce: { radiantGrove: -0.5 } },
    uq: { u: { pureRadiance: 1 } },
  },
  weaveExpert: {
    n: '灵织精通', d: '灵织灵术期间配方产出+30%', br: 'M',
    p: [{ r: 'spiritCore', a: 5 }, { r: 'crystalSilk', a: 10 }],
    e: { _spellBoost: { spiritWeave: 0.3 } },
    uq: { u: { spiritGrid: 1 } },
  },
  weaveSeason: {
    n: '灵织双季', d: '灵织灵术持续+1季', br: 'M',
    p: [{ r: 'spiritCore', a: 8 }, { r: 'insight', a: 15 }],
    e: { _spellDuration: { spiritWeave: 1 } },
    uq: { u: { spiritGrid: 1 } },
  },
  voidWalkSave: {
    n: '虚行免耗', d: '虚行灵术辉芒消耗-1（3→2）', br: 'M',
    p: [{ r: 'radiance', a: 10 }, { r: 'spiritChart', a: 20 }],
    e: { _spellCostReduce: { voidWalk: { radiance: 1 } } },
    uq: { u: { radiantVision: 1 } },
  },
  starSenseAmp: {
    n: '星感增幅', d: '星感灵术效果×3→×5', br: 'M',
    p: [{ r: 'formSoul', a: 3 }, { r: 'spiritChart', a: 30 }],
    e: { _spellBoost: { starSenseSpell: 0.67 } },
    uq: { u: { starSense: 1 } },
  },
  autoChart: {
    n: '自动灵图', d: '灵图阁每季初自动施放一次基础编灵图', br: 'M',
    p: [{ r: 'spiritChart', a: 50 }, { r: 'spiritCore', a: 5 }],
    e: { _autoChart: 1 },
    uq: { u: { chartDraw: 1, spiritGrid: 1 } },
  },
  shapeMasterView: {
    n: '化形师远望', d: '化形师被动：灵图产出+20%', br: 'M',
    p: [{ r: 'formSoul', a: 5 }, { r: 'spiritChart', a: 30 }],
    e: { _shapeMasterChart: 0.2 },
    uq: { b: { shapeHall: 2 } },
  },
  crystalTrade: {
    n: '晶丝商路', d: '商贩产出+15%，商队带回晶丝碎片', br: 'M',
    p: [{ r: 'crystalSilk', a: 8 }, { r: 'coin', a: 50 }],
    e: { jobM: { merchant: 0.15 }, _caravanCrystal: 1 },
    uq: { u: { crystalize: 1 } },
  },
  coreTeach: {
    n: '灵核授业', d: '所有职业授业效果+1级', br: 'M',
    p: [{ r: 'spiritCore', a: 10 }, { r: 'insight', a: 12 }],
    e: { _trainBonus: 1 },
    uq: { u: { coreCraft: 1 } },
  },
  radianceLamp: {
    n: '辉芒灯', d: '所有建筑躁念-10%（全局）', br: 'M',
    p: [{ r: 'radiance', a: 10 }, { r: 'spiritCore', a: 5 }],
    e: { _globalUnrestReduce: 0.10 },
    uq: { u: { radiant: 1, pureRadiance: 1 } },
  },

  // ===== 灵修分支 D阶段升级 #79-120（v0.20 §八 5.2e, 42 个） =====
  poolDeepStore: {
    n: '元念池深蓄', d: '元念池产出+40%', br: 'M', phase: 4,
    p: [{ r: 'primordial', a: 8 }, { r: 'spiritCore', a: 10 }],
    e: { bldM: { primordialPool: { prodM: 0.4 } } },
    uq: { u: { primordialism: 1 }, b: { primordialPool: 2 } },
  },
  caveBoost: {
    n: '寂石窟增效', d: '寂石窟产出+60%（含全产出加成 5%→8%）', br: 'M', phase: 4,
    p: [{ r: 'silenceStone', a: 5 }, { r: 'primordial', a: 12 }],
    e: { bldM: { silenceCave: { prodM: 0.6 } } },
    uq: { u: { silenceCryst: 1 } },
  },
  vaultExpand: {
    n: '灵匣扩展', d: '灵匣存储贡献+75%', br: 'M', phase: 4,
    p: [{ r: 'silenceStone', a: 3 }, { r: 'crystalSilk', a: 20 }],
    e: { bldMxM: { spiritVault: 0.75 } },
    uq: { u: { deepLeyline: 1 } },
  },
  mirrorSharpen: {
    n: '镜灵锐化', d: '镜观灵术消耗灵图-30%', br: 'M', phase: 4,
    p: [{ r: 'mirrorSpirit', a: 3 }, { r: 'primordial', a: 10 }],
    e: {},
    uq: { u: { hyperSense: 1 } },
  },
  hyperFar: {
    n: '超感远知', d: '灵修任务发现距离+1', br: 'M', phase: 4,
    p: [{ r: 'mirrorSpirit', a: 5 }, { r: 'insight', a: 20 }],
    e: {},
    uq: { u: { hyperSense: 1 } },
  },
  webNode: {
    n: '灵网节点', d: '寂石窟每座额外灵脉+1', br: 'M', phase: 4,
    p: [{ r: 'spiritCore', a: 12 }, { r: 'primordial', a: 15 }],
    e: {},
    uq: { u: { spiritWeb: 1 } },
  },
  primordialFlow: {
    n: '元念涌', d: '元念池灵脉消耗-2', br: 'M', phase: 4,
    p: [{ r: 'primordial', a: 15 }, { r: 'silenceStone', a: 5 }],
    e: {},
    uq: { u: { spiritWeb: 1 } },
  },
  mirrorDouble: {
    n: '镜灵倍映', d: '镜灵配方有 25% 概率双产', br: 'M', phase: 4,
    p: [{ r: 'mirrorSpirit', a: 5 }, { r: 'spiritCore', a: 15 }],
    e: {},
    uq: { u: { hyperSense: 1 } },
  },
  webResonance: {
    n: '灵网共振', d: '所有灵修 D 建筑产出+12%', br: 'M', phase: 4,
    p: [{ r: 'spiritCore', a: 20 }, { r: 'silenceStone', a: 8 }],
    e: { bldM: { primordialPool: { prodM: 0.12 }, silenceCave: { prodM: 0.12 }, spiritVault: { prodM: 0.12 } } },
    uq: { u: { spiritWeb: 1 } },
  },
  deepLeyRes: {
    n: '深层灵脉共鸣', d: '共振塔灵脉产出+2', br: 'M', phase: 4,
    p: [{ r: 'primordial', a: 12 }, { r: 'resonance', a: 40 }],
    e: {},
    uq: { u: { spiritWeb: 1 } },
  },
  coreOverload: {
    n: '灵核炉超载', d: '灵核炉产出×2', br: 'M', phase: 4,
    p: [{ r: 'spiritCore', a: 15 }, { r: 'primordial', a: 10 }],
    e: { bldM: { coreForge: { prodM: 1.0 } } },
    uq: { u: { spiritWeb: 1 } },
  },
  primordialAuto: {
    n: '元念自酿', d: '元念池每秒额外产出+0.0003（无需晶丝）', br: 'M', phase: 4,
    p: [{ r: 'primordial', a: 20 }, { r: 'silenceStone', a: 10 }],
    e: { bldM: { primordialPool: { extraP: { primordial: 0.0006 } } } },
    uq: { u: { spiritWeb: 1 } },
  },
  primordialBin: {
    n: '元念仓', d: '元念上限+50', br: 'M', phase: 4,
    p: [{ r: 'primordial', a: 10 }, { r: 'crystalSilk', a: 25 }],
    e: { _flatMx: { primordial: 50 } },
    uq: { u: { voidLore: 1 } },
  },
  silenceShelf: {
    n: '寂石柜', d: '寂石上限+30', br: 'M', phase: 4,
    p: [{ r: 'silenceStone', a: 8 }, { r: 'primordial', a: 15 }],
    e: { _flatMx: { silenceStone: 30 } },
    uq: { u: { voidLore: 1 } },
  },
  codexShelf: {
    n: '幽典架', d: '幽典上限+10', br: 'M', phase: 4,
    p: [{ r: 'voidCodex', a: 3 }, { r: 'insight', a: 20 }],
    e: { _flatMx: { voidCodex: 10 } },
    uq: { u: { voidLore: 1 } },
  },
  silenceCondense: {
    n: '寂石凝缩', d: '寂石配方原料-20%', br: 'M', phase: 4,
    p: [{ r: 'silenceStone', a: 5 }, { r: 'primordial', a: 12 }],
    e: { craftM: { craftSilenceStone: { inpM: { primordial: -0.2, crystalSilk: -0.2 } } } },
    uq: { u: { silenceResonance: 1 } },
  },
  primordialPurify: {
    n: '元念净化', d: '元念池躁念-30%', br: 'M', phase: 4,
    p: [{ r: 'primordial', a: 10 }, { r: 'elixir', a: 5 }],
    e: {},
    uq: { u: { silenceResonance: 1 } },
  },
  caveSilence: {
    n: '寂石窟宁静', d: '寂石窟躁念-25%', br: 'M', phase: 4,
    p: [{ r: 'silenceStone', a: 8 }, { r: 'primordial', a: 10 }],
    e: {},
    uq: { u: { silenceResonance: 1 } },
  },
  codexDeep: {
    n: '幽典精读', d: '幽读灵术效果加强。', br: 'M', phase: 4,
    p: [{ r: 'voidCodex', a: 3 }, { r: 'mirrorSpirit', a: 3 }],
    e: {},
    uq: { u: { silenceResonance: 1 } },
  },
  primordialAmp: {
    n: '元驱增幅', d: '元驱灵术效果加强（5.2f）', br: 'M', phase: 4,
    p: [{ r: 'primordial', a: 15 }, { r: 'silenceStone', a: 8 }],
    e: {},
    uq: { u: { silenceResonance: 1 } },
  },
  deepFlow: {
    n: '深层灵脉涌', d: '全灵脉产出+20%', br: 'M', phase: 4,
    p: [{ r: 'silenceStone', a: 10 }, { r: 'spiritCore', a: 20 }],
    e: {},
    uq: { u: { silenceResonance: 1 } },
  },
  vaultDouble: {
    n: '灵匣双层', d: '灵匣存储贡献+100%（与扩展叠加）', br: 'M', phase: 4,
    p: [{ r: 'silenceStone', a: 12 }, { r: 'primordial', a: 20 }],
    e: { bldMxM: { spiritVault: 1.0 } },
    uq: { u: { deepLeyline: 1 }, ud: { vaultExpand: 1 } },
  },
  hologramChart: {
    n: '全息灵图', d: '灵图阁产出+100%', br: 'M', phase: 4,
    p: [{ r: 'spiritChart', a: 100 }, { r: 'mirrorSpirit', a: 5 }],
    e: { bldM: { chartHall: { prodM: 1.0 } } },
    uq: { u: { deepLeyline: 1 } },
  },
  mirrorView: {
    n: '镜灵远望', d: '镜观灵术冷却-50%（5.2f）', br: 'M', phase: 4,
    p: [{ r: 'mirrorSpirit', a: 8 }, { r: 'voidCodex', a: 3 }],
    e: {},
    uq: { u: { deepLeyline: 1 } },
  },
  caveNetwork: {
    n: '寂石窟联网', d: '寂石窟全产出加成多座叠加（5.2f 数值精调）', br: 'M', phase: 4,
    p: [{ r: 'silenceStone', a: 15 }, { r: 'primordial', a: 25 }],
    e: {},
    uq: { u: { deepLeyline: 1 } },
  },
  spiritDriveExp: {
    n: '灵驱远行', d: '远行时间×0.75（永久）。', br: 'M', phase: 4,
    p: [{ r: 'spiritCore', a: 25 }, { r: 'silenceStone', a: 10 }],
    e: { _expTimeM: 0.75 },
    uq: { u: { spiritDrive: 1 } },
  },
  primordialTrain: {
    n: '元念授业', d: '所有职业授业再+1级（与工业 #77 叠加）', br: 'M', phase: 4,
    p: [{ r: 'primordial', a: 15 }, { r: 'insight', a: 20 }],
    e: { _trainBonus: 1 },
    uq: { u: { spiritDrive: 1 } },
  },
  codexLore: {
    n: '幽典藏识', d: '学识产出+50%，学识上限+30%', br: 'M', phase: 4,
    p: [{ r: 'voidCodex', a: 5 }, { r: 'primordial', a: 20 }],
    e: { loreM: 0.5, mxM: { lore: 0.3 } },
    uq: { u: { spiritDrive: 1 } },
  },
  mirrorDaisFocus: {
    n: '镜灵台聚光', d: '镜灵台产出+50%。', br: 'M', phase: 4,
    p: [{ r: 'mirrorSpirit', a: 5 }, { r: 'primordial', a: 15 }],
    e: {},
    uq: { u: { mirrorSpiritFocus: 1 } },
  },
  mirrorDaisCalm: {
    n: '镜灵台宁静', d: '镜灵台灵脉消耗-1（5.2f）', br: 'M', phase: 4,
    p: [{ r: 'mirrorSpirit', a: 3 }, { r: 'silenceStone', a: 8 }],
    e: {},
    uq: { u: { mirrorSpiritFocus: 1 } },
  },
  mirrorDaisCool: {
    n: '镜灵台冷却', d: '镜灵台灵术冷却加成升至 5%/座（5.2f）', br: 'M', phase: 4,
    p: [{ r: 'mirrorSpirit', a: 8 }, { r: 'voidCodex', a: 2 }],
    e: {},
    uq: { u: { mirrorSpiritFocus: 1 } },
  },
  codexHallStudy: {
    n: '幽典阁专修', d: '幽典阁产出+60%，升级折扣升至 3.5%/座（5.2f）', br: 'M', phase: 4,
    p: [{ r: 'voidCodex', a: 5 }, { r: 'insight', a: 25 }],
    e: {},
    uq: { u: { voidCodexCompile: 1 } },
  },
  codexHallSilence: {
    n: '幽典阁藏', d: '幽典阁躁念-30%（5.2f）', br: 'M', phase: 4,
    p: [{ r: 'voidCodex', a: 3 }, { r: 'primordial', a: 12 }],
    e: {},
    uq: { u: { voidCodexCompile: 1 } },
  },
  primordialForgeBoost: {
    n: '元念炉增效', d: '元念炉乘法加成 ×1.5→×2。', br: 'M', phase: 4,
    p: [{ r: 'primordial', a: 20 }, { r: 'spiritCore', a: 15 }],
    e: {},
    uq: { u: { primordialForging: 1 } },
  },
  primordialForgeReduce: {
    n: '元念炉减负', d: '元念炉灵脉消耗-1（5.2f）', br: 'M', phase: 4,
    p: [{ r: 'primordial', a: 12 }, { r: 'silenceStone', a: 8 }],
    e: {},
    uq: { u: { primordialForging: 1 } },
  },
  pactAltarReson: {
    n: '灵契祭坛共鸣', d: '灵契祭坛产出加成升至 25%/座。', br: 'M', phase: 4,
    p: [{ r: 'spiritCore', a: 20 }, { r: 'voidCodex', a: 3 }],
    e: {},
    uq: { u: { spiritPactLore: 1 } },
  },
  deepMeditation: {
    n: '深寂冥想', d: '寂石冥想跳跃天数+50%（5.2f 寂石冥想）', br: 'M', phase: 4,
    p: [{ r: 'silenceStone', a: 12 }, { r: 'primordial', a: 15 }, { r: 'mirrorSpirit', a: 3 }],
    e: {},
    uq: { u: { silenceField: 1 } },
  },
  meditationFinesse: {
    n: '寂石冥想精修', d: '寂石冥想消耗-30%（5.2f）', br: 'M', phase: 4,
    p: [{ r: 'silenceStone', a: 10 }, { r: 'primordial', a: 12 }],
    e: {},
    uq: { u: { silenceResonance: 1 } },
  },
  primordialMeditation: {
    n: '元念冥想', d: '冥想期间元念产出额外×2（5.2f）', br: 'M', phase: 4,
    p: [{ r: 'primordial', a: 20 }, { r: 'silenceStone', a: 10 }, { r: 'spiritCore', a: 15 }],
    e: {},
    uq: { u: { primordialForging: 1 } },
  },
  longSilence: {
    n: '长寂入定', d: '冥想冷却-40%（5.2f）', br: 'M', phase: 4,
    p: [{ r: 'silenceStone', a: 15 }, { r: 'mirrorSpirit', a: 5 }, { r: 'voidCodex', a: 3 }],
    e: {},
    uq: { u: { deepLeyline: 1 } },
  },
  pureSilenceDeep: {
    n: '净寂殿深静', d: '净寂殿躁念消除+50%。', br: 'M', phase: 4,
    p: [{ r: 'silenceStone', a: 10 }, { r: 'primordial', a: 15 }, { r: 'elixir', a: 8 }],
    e: {},
    uq: { u: { silentPurity: 1 } },
  },
  pactChannelerArt: {
    n: '契灵使心法', d: '契灵使产出+40%。', br: 'M', phase: 4,
    p: [{ r: 'spiritCore', a: 15 }, { r: 'voidCodex', a: 3 }, { r: 'silenceStone', a: 10 }],
    e: { jobM: { pactChanneler: 0.4 } },
    uq: { u: { spiritPactLore: 1 } },
  },

  // ===== 神启副线 A阶段：升级 #1-10 =====
  altarRefine: {
    n: '祭坛精修', d: '祭坛虔诚产出 +50%。',
    p: [{ r: 'piety', a: 30 }, { r: 'charm', a: 20 }],
    e: { bldM: { divineAltar: { prodM: 0.5 } } },
    uq: { b: { divineAltar: 3 } }, sb: 'D',
  },
  scriptureExpand: {
    n: '经阁扩典', d: '经阁虔诚上限 +50%。',
    p: [{ r: 'piety', a: 40 }, { r: 'scroll', a: 25 }],
    e: { bldMxM: { scriptureHall: 0.5 } },
    uq: { b: { scriptureHall: 2 } }, sb: 'D',
  },
  priestDevotion: {
    n: '祭司虔心', d: '祭司虔诚产出 +30%。',
    p: [{ r: 'piety', a: 50 }, { r: 'lore', a: 200 }],
    e: { jobM: { priest: 0.3 } },
    uq: { b: { scriptureHall: 2 } }, sb: 'D',
  },
  poolCalm: {
    n: '祈愿安宁', d: '祈愿池满意度加成翻倍。',
    p: [{ r: 'piety', a: 35 }, { r: 'stone', a: 50 }],
    e: { _poolHapBonus: 0.02 },
    uq: { b: { prayerPool: 2 } }, sb: 'D',
  },
  pietyVessel: {
    n: '虔诚之瓮', d: '虔诚上限 +30%。',
    p: [{ r: 'piety', a: 60 }, { r: 'charm', a: 25 }],
    e: { mxM: { piety: 0.3 } },
    uq: { b: { divineAltar: 4 } }, sb: 'D',
  },
  graceDeepen: {
    n: '恩典深悟', d: '神恩上限 +5%（50%→55%）。',
    p: [{ r: 'piety', a: 100 }, { r: 'scroll', a: 30 }],
    e: { _graceCapBonus: 0.05 },
    uq: { u: { graceLore: 1 } }, sb: 'D',
  },
  holyScript: {
    n: '圣典抄录', d: '经阁学识产出 +50%。',
    p: [{ r: 'piety', a: 40 }, { r: 'scroll', a: 20 }],
    e: { bldM: { scriptureHall: { prodM: 0.5 } } },
    uq: { b: { scriptureHall: 3 } }, sb: 'D',
  },
  crossFaith: {
    n: '信仰共鸣', d: '每座所择方向的建筑，额外提供虔诚产出 +1%。',
    p: [{ r: 'piety', a: 80 }, { r: 'charm', a: 30 }, { r: 'remnant', a: 5 }],
    e: { _crossFaith: 0.01 },
    uq: { b: { divineAltar: 5 } }, sb: 'D',
  },
  oilRefine: {
    n: '圣油精炼', d: '炼圣油配方产出 +50%。',
    p: [{ r: 'holyOil', a: 5 }, { r: 'piety', a: 60 }],
    e: { craftM: { holyOilCraft: { outMul: 0.5 } } },
    uq: { b: { oilPress: 2 } }, sb: 'D',
  },
  graceAscend: {
    n: '恩典升华', d: '神恩上限 +5%（55%→60%）。',
    p: [{ r: 'piety', a: 200 }, { r: 'holyOil', a: 8 }],
    e: { _graceCapBonus: 0.05 },
    uq: { ud: { graceDeepen: 1 } }, sb: 'D',
  },

  // ===== 神启副线 B-教团：升级 #11-30 =====
  forgeEfficiency: {
    n: '圣工精进', d: '圣工坊产出 +50%。',
    p: [{ r: 'holyFlame', a: 5 }, { r: 'piety', a: 60 }],
    e: { bldM: { holyForge: { prodM: 0.5 } } },
    uq: { b: { holyForge: 3 } }, sb: 'D', br: 'I',
  },
  kilnExpand: {
    n: '窑炉扩建', d: '圣火窑产出 +50%。',
    p: [{ r: 'holyFlame', a: 8 }, { r: 'brick', a: 50 }],
    e: { bldM: { holyKiln: { prodM: 0.5 } } },
    uq: { b: { holyKiln: 3 } }, sb: 'D', br: 'I',
  },
  edictDuration: {
    n: '教令延续', d: '所有教令持续 +1 季。',
    p: [{ r: 'piety', a: 100 }, { r: 'holyFlame', a: 10 }],
    e: { _edictDurBonus: 1 },
    uq: { b: { edictHall: 2 } }, sb: 'D', br: 'I',
  },
  edictDiscount: {
    n: '教令节俭', d: '教令虔诚消耗 -20%。',
    p: [{ r: 'piety', a: 80 }, { r: 'holyOil', a: 5 }],
    e: { _edictCostReduce: 0.2 },
    uq: { u: { edictLore: 1 } }, sb: 'D', br: 'I',
  },
  fanaticZeal: {
    n: '狂信热忱', d: '狂信者集体加成 5%→8%。',
    p: [{ r: 'piety', a: 100 }, { r: 'holyFlame', a: 8 }],
    e: { _fanaticBonusRate: 0.03 },
    uq: { job: { fanatic: 5 } }, sb: 'D', br: 'I',
  },
  tribunalPurge: {
    n: '审判净化', d: '审判庭污染削减翻倍。',
    p: [{ r: 'holyFlame', a: 15 }, { r: 'piety', a: 120 }],
    e: { bldM: { tribunalHall: { pollM: 2 } } },
    uq: { b: { tribunalHall: 2 } }, sb: 'D', br: 'I',
  },
  forgeTithe: {
    n: '圣工什一', d: '圣工坊钢消耗 -30%。',
    p: [{ r: 'holyFlame', a: 10 }, { r: 'steel', a: 20 }],
    e: { _forgeSteelReduce: 0.3 },
    uq: { b: { holyForge: 4 } }, sb: 'D', br: 'I',
  },
  holyBlueprint: {
    n: '圣典蓝图', d: '工业建筑造价 -8%。',
    p: [{ r: 'piety', a: 150 }, { r: 'holyFlame', a: 12 }],
    e: { _holyBldDiscount: 0.08 },
    uq: { u: { churchArchLore: 1 } }, sb: 'D', br: 'I',
  },
  flameBless: {
    n: '圣火祝圣', d: '圣火产出 +30%（全源）。',
    p: [{ r: 'holyFlame', a: 20 }, { r: 'piety', a: 100 }],
    e: { _holyFlameAllM: 0.3 },
    uq: { b: { holyKiln: 4 } }, sb: 'D', br: 'I',
  },
  holyIronForge: {
    n: '圣铁强化', d: '圣铁铸配方产出 +50%。',
    p: [{ r: 'holyIron', a: 8 }, { r: 'holyFlame', a: 10 }],
    e: { craftM: { holyIronCraft: { outMul: 0.5 } } },
    uq: { u: { holyIronLore: 1 } }, sb: 'D', br: 'I',
  },
  massConversion: {
    n: '大规模皈依', d: '狂信者产出 +20%。',
    p: [{ r: 'piety', a: 120 }, { r: 'holyFlame', a: 10 }],
    e: { jobM: { fanatic: 0.20 } },
    uq: { job: { fanatic: 6 } }, sb: 'D', br: 'I',
  },
  industrialFaith: {
    n: '工业信条', d: '每座工业建筑额外 +0.5% 全局产出。',
    p: [{ r: 'piety', a: 200 }, { r: 'holyFlame', a: 15 }, { r: 'holyOil', a: 8 }],
    e: { _industryFaith: 0.005 },
    uq: { u: { churchArchLore: 1 } }, sb: 'D', br: 'I',
  },
  edictSlot: {
    n: '教令增席', d: '教令同时在朝上限 +1。',
    p: [{ r: 'holyFlame', a: 20 }, { r: 'piety', a: 250 }],
    e: { _edictSlotBonus: 1 },
    uq: { b: { edictHall: 3 } }, sb: 'D', br: 'I',
  },
  pressEfficiency: {
    n: '圣油坊精进', d: '圣油坊加成翻倍（5%→10%/座）。',
    p: [{ r: 'holyOil', a: 10 }, { r: 'piety', a: 80 }],
    e: { _oilCraftBonusUp: 0.05 },
    uq: { b: { oilPress: 3 } }, sb: 'D', br: 'I',
  },
  ironSmithFocus: {
    n: '圣工匠专注', d: '圣工匠 jobM +40%。',
    p: [{ r: 'holyIron', a: 5 }, { r: 'piety', a: 100 }],
    e: { jobM: { holySmith: 0.4 } },
    uq: { job: { holySmith: 3 } }, sb: 'D', br: 'I',
  },
  faithSteel: {
    n: '信钢', d: '钢产出 +15%（全局）。',
    p: [{ r: 'holyIron', a: 8 }, { r: 'holyFlame', a: 12 }],
    e: { craftM: { steel: { outMul: 0.15 } } },
    uq: { u: { holyIronLore: 1 }, b: { blastFurnace: 4 } }, sb: 'D', br: 'I',
  },
  kilnSurge: {
    n: '窑炉增产', d: '圣火窑 prodM +30%。',
    p: [{ r: 'holyFlame', a: 15 }, { r: 'piety', a: 80 }],
    e: { bldM: { holyKiln: { prodM: 0.3 } } },
    uq: { ud: { kilnExpand: 1 } }, sb: 'D', br: 'I',
  },
  altarSurge: {
    n: '祭坛增产', d: '祭坛 prodM +30%（与 #1 加法叠加共 +80%）。',
    p: [{ r: 'piety', a: 100 }, { r: 'holyOil', a: 6 }],
    e: { bldM: { divineAltar: { prodM: 0.3 } } },
    uq: { ud: { altarRefine: 1 } }, sb: 'D', br: 'I',
  },
  priestSchool: {
    n: '神学院', d: '祭司 jobM +20%（与 #3 叠加）。',
    p: [{ r: 'piety', a: 120 }, { r: 'lore', a: 300 }],
    e: { jobM: { priest: 0.2 } },
    uq: { ud: { priestDevotion: 1 } }, sb: 'D', br: 'I',
  },
  holyGraceB: {
    n: '恩典通达', d: '神恩上限 +5%（60%→65%）。',
    p: [{ r: 'piety', a: 250 }, { r: 'holyFlame', a: 20 }, { r: 'holyIron', a: 5 }],
    e: { _graceCapBonus: 0.05 },
    uq: { u: { churchArchLore: 1 } }, sb: 'D', br: 'I',
  },

  // ===== 神启副线 C-教团：升级 #31-65（v0.20 §八 5.3c, 35 个） =====
  // 产出倍率 #31-38
  hymnSurge: {
    n: '颂咏增产', d: '颂咏堂产出 +50%。',
    p: [{ r: 'hymn', a: 5 }, { r: 'holyFlame', a: 10 }],
    e: { bldM: { hymnHall: { prodM: 0.5 } } },
    uq: { b: { hymnHall: 3 } }, sb: 'D', br: 'I', phase: 4,
  },
  cathedralGrace: {
    n: '大教堂恩典', d: '神恩上限 +3%/座大教堂（5.5 整体验收时实装具体公式）。',
    p: [{ r: 'hymn', a: 8 }, { r: 'holyIron', a: 10 }],
    e: {},
    uq: { b: { cathedral: 2 } }, sb: 'D', br: 'I', phase: 4,
  },
  relicPower: {
    n: '圣骸力量', d: '圣骸堂产出翻倍。',
    p: [{ r: 'holyRelic', a: 3 }, { r: 'piety', a: 150 }],
    e: { bldM: { relicShrine: { prodM: 1.0 } } },
    uq: { b: { relicShrine: 3 } }, sb: 'D', br: 'I', phase: 4,
  },
  scripturePower: {
    n: '圣典之力', d: '圣典塔学识加成翻倍。',
    p: [{ r: 'holyScripture', a: 3 }, { r: 'piety', a: 150 }],
    e: { bldM: { scriptureSpire: { prodM: 1.0 } } },
    uq: { b: { scriptureSpire: 3 } }, sb: 'D', br: 'I', phase: 4,
  },
  flameAltarSurge: {
    n: '圣火祭坛增产', d: '圣火祭坛产出 +50%。',
    p: [{ r: 'holyFlame', a: 25 }, { r: 'holyIron', a: 10 }],
    e: { bldM: { holyAltar: { prodM: 0.5 } } },
    uq: { b: { holyAltar: 2 } }, sb: 'D', br: 'I', phase: 4,
  },
  pilgrimBlessing: {
    n: '朝圣祝福', d: '朝圣道幸福加成翻倍（5.5 实装）。',
    p: [{ r: 'hymn', a: 3 }, { r: 'piety', a: 100 }],
    e: {},
    uq: { b: { pilgrimage: 3 } }, sb: 'D', br: 'I', phase: 4,
  },
  hymnistDevotion: {
    n: '颂咏师精进', d: '颂咏师产出 +40%。',
    p: [{ r: 'hymn', a: 5 }, { r: 'holyScripture', a: 2 }],
    e: { jobM: { cantor: 0.4 } },
    uq: { job: { cantor: 3 } }, sb: 'D', br: 'I', phase: 4,
  },
  crusaderZeal: {
    n: '十字军热忱', d: '十字军远行奖励加成（5.5 实装）。',
    p: [{ r: 'holyFlame', a: 20 }, { r: 'holyIron', a: 8 }],
    e: {},
    uq: { job: { crusader: 3 } }, sb: 'D', br: 'I', phase: 4,
  },
  // 存储 #39-43
  hymnVault: {
    n: '颂咏库', d: '颂咏上限 +30。',
    p: [{ r: 'hymn', a: 5 }, { r: 'holyIron', a: 5 }],
    e: { _flatMx: { hymn: 30 } },
    uq: { b: { hymnHall: 3 } }, sb: 'D', br: 'I', phase: 4,
  },
  relicVault: {
    n: '圣骸库', d: '圣骸上限 +50%。',
    p: [{ r: 'holyRelic', a: 3 }, { r: 'holyIron', a: 8 }],
    e: { mxM: { holyRelic: 0.5 } },
    uq: { b: { relicShrine: 2 } }, sb: 'D', br: 'I', phase: 4,
  },
  scriptureVault: {
    n: '圣典库', d: '圣典上限 +50%。',
    p: [{ r: 'holyScripture', a: 3 }, { r: 'scroll', a: 30 }],
    e: { mxM: { holyScripture: 0.5 } },
    uq: { b: { scriptureSpire: 2 } }, sb: 'D', br: 'I', phase: 4,
  },
  holyIronVaultUp: {
    n: '圣铁库扩建', d: '圣铁库存储贡献 +50%。',
    p: [{ r: 'holyIron', a: 10 }, { r: 'brick', a: 50 }],
    e: { bldMxM: { holyIronVault: 0.5 } },
    uq: { b: { holyIronVault: 3 } }, sb: 'D', br: 'I', phase: 4,
  },
  flameMxUp: {
    n: '圣火仓扩', d: '圣火上限 +30%。',
    p: [{ r: 'holyFlame', a: 15 }, { r: 'brick', a: 40 }],
    e: { mxM: { holyFlame: 0.3 } },
    uq: { b: { holyKiln: 5 } }, sb: 'D', br: 'I', phase: 4,
  },
  // 教令强化 #44-48
  edictMastery: {
    n: '教令宗师', d: '教令冷却 -1 季。',
    p: [{ r: 'hymn', a: 5 }, { r: 'holyFlame', a: 15 }],
    e: {},
    uq: { u: { grandEdictLore: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  edictPower: {
    n: '教令强化', d: '基础教令效果 +10%。',
    p: [{ r: 'holyScripture', a: 3 }, { r: 'piety', a: 200 }],
    e: {},
    uq: { u: { grandEdictLore: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  crusadeEdictUp: {
    n: '圣战令强化', d: '圣战令效果 +15%。',
    p: [{ r: 'holyFlame', a: 25 }, { r: 'holyIron', a: 12 }],
    e: {},
    uq: { u: { crusadeLore: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  edictSlotC: {
    n: '教令增席·高', d: '教令同时在朝上限 +1。',
    p: [{ r: 'hymn', a: 8 }, { r: 'holyScripture', a: 2 }],
    e: {},
    uq: { u: { grandEdictLore: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  pilgrimEdictUp: {
    n: '朝圣令强化', d: '朝圣令效果 +15%。',
    p: [{ r: 'hymn', a: 5 }, { r: 'piety', a: 150 }],
    e: {},
    uq: { u: { pilgrimageLore: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  // 圣战与远征 #49-53
  crusadeCampUp: {
    n: '圣战营强化', d: '圣战营教令持续效果翻倍（5.5 实装）。',
    p: [{ r: 'holyFlame', a: 20 }, { r: 'holyIron', a: 10 }],
    e: {},
    uq: { b: { crusadeCamp: 3 } }, sb: 'D', br: 'I', phase: 4,
  },
  holyExpBonus: {
    n: '神圣远征', d: '远行奖励 +10%（永久，与研究叠加）。',
    p: [{ r: 'holyRelic', a: 3 }, { r: 'holyFlame', a: 15 }],
    e: { _expRewardBonus: 0.10 },
    uq: { u: { expeditionTheology: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  crusadeLogistics: {
    n: '圣战后勤', d: '圣战军粮效果加成（5.5 实装）。',
    p: [{ r: 'holyIron', a: 8 }, { r: 'piety', a: 150 }],
    e: {},
    uq: { u: { crusadePrep: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  faithCaravan: {
    n: '信仰商队', d: '商队到达率 +10%。',
    p: [{ r: 'hymn', a: 3 }, { r: 'piety', a: 120 }],
    e: { _caravanFreq: 0.10 },
    uq: { b: { pilgrimage: 4 } }, sb: 'D', br: 'I', phase: 4,
  },
  holyLandBonus: {
    n: '圣地回报', d: '圣地夺还后远行额外圣骸概率 +5%（5.5 实装）。',
    p: [{ r: 'holyRelic', a: 5 }, { r: 'holyScripture', a: 3 }],
    e: {},
    uq: { u: { holyLandReclaim: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  // 跨系统 #54-58
  sacredIndustry: {
    n: '神圣工业', d: '工业配方产出 +10%（全局）。',
    p: [{ r: 'holyScripture', a: 5 }, { r: 'holyFlame', a: 20 }, { r: 'piety', a: 250 }],
    e: {},
    uq: { u: { holyLandReclaim: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  faithMine: {
    n: '信仰矿脉', d: '煤/铁产出 +15%。',
    p: [{ r: 'holyIron', a: 10 }, { r: 'piety', a: 200 }],
    e: { coalM: 0.15, ironM: 0.15 },
    uq: { u: { templeStudy: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  holyEnergy: {
    n: '圣能', d: '能量产出 +10%（全源；5.5 实装）。',
    p: [{ r: 'holyFlame', a: 25 }, { r: 'holyIron', a: 12 }],
    e: {},
    uq: { b: { holyAltar: 2 } }, sb: 'D', br: 'I', phase: 4,
  },
  faithResearch: {
    n: '信仰学问', d: '学识产出 +10%。',
    p: [{ r: 'holyScripture', a: 3 }, { r: 'piety', a: 180 }],
    e: { loreM: 0.10 },
    uq: { u: { scriptureCompile: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  purifyDeep: {
    n: '深层净罪', d: '净罪池治污翻倍（5.5 实装）。',
    p: [{ r: 'holyOil', a: 10 }, { r: 'piety', a: 200 }],
    e: {},
    uq: { b: { atonementPool: 3 } }, sb: 'D', br: 'I', phase: 4,
  },
  // 神恩推进 #59-65
  graceCapC1: {
    n: '恩典深化·壹', d: '神恩上限 +3%。',
    p: [{ r: 'hymn', a: 8 }, { r: 'piety', a: 300 }],
    e: { _graceCapBonus: 0.03 },
    uq: { b: { cathedral: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  graceCapC2: {
    n: '恩典深化·贰', d: '神恩上限 +3%。',
    p: [{ r: 'holyRelic', a: 3 }, { r: 'piety', a: 400 }],
    e: { _graceCapBonus: 0.03 },
    uq: { ud: { graceCapC1: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  graceCapC3: {
    n: '恩典深化·叁', d: '神恩上限 +4%。',
    p: [{ r: 'holyScripture', a: 5 }, { r: 'piety', a: 500 }],
    e: { _graceCapBonus: 0.04 },
    uq: { ud: { graceCapC2: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  pietyMxC: {
    n: '虔诚大瓮', d: '虔诚上限 +50%。',
    p: [{ r: 'hymn', a: 5 }, { r: 'holyIron', a: 8 }],
    e: { mxM: { piety: 0.5 } },
    uq: { b: { cathedral: 2 } }, sb: 'D', br: 'I', phase: 4,
  },
  relicGrace: {
    n: '圣骸恩典', d: '每个圣骸库存 +0.5% 虔诚产出（5.5 实装）。',
    p: [{ r: 'holyRelic', a: 5 }, { r: 'piety', a: 250 }],
    e: {},
    uq: { u: { relicTreatise: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  scriptureGrace: {
    n: '圣典恩典', d: '每个圣典库存 +1% 学识产出（5.5 实装）。',
    p: [{ r: 'holyScripture', a: 5 }, { r: 'piety', a: 250 }],
    e: {},
    uq: { u: { doctrineSystem: 1 } }, sb: 'D', br: 'I', phase: 4,
  },
  hymnOfLabor: {
    n: '劳作颂歌', d: '基础资源产出 +8%（永久）。',
    p: [{ r: 'hymn', a: 10 }, { r: 'piety', a: 300 }],
    e: { berryM: 0.08, woodM: 0.08, stoneM: 0.08 },
    uq: { u: { hymnArt: 1 }, b: { cathedral: 2 } }, sb: 'D', br: 'I', phase: 4,
  },

  // ===== 神启副线 B-秘仪：升级 #11-30 =====
  mysteryDeepen: {
    n: '秘仪深化', d: '秘仪殿秘知上限 +50%。',
    p: [{ r: 'gnosis', a: 20 }, { r: 'ambrosia', a: 5 }],
    e: { bldMxM: { mysteryHall: 0.5 } },
    uq: { b: { mysteryHall: 3 } }, sb: 'D', br: 'M',
  },
  groveExpand: {
    n: '圣林扩张', d: '圣林神露产出 +50%。',
    p: [{ r: 'ambrosia', a: 8 }, { r: 'piety', a: 60 }],
    e: { bldM: { sacredGrove: { prodM: 0.5 } } },
    uq: { b: { sacredGrove: 3 } }, sb: 'D', br: 'M',
  },
  mysticFocus: {
    n: '秘仪师专注', d: '秘仪师效率递减缓和（0.85→0.90）。',
    p: [{ r: 'gnosis', a: 30 }, { r: 'ambrosia', a: 10 }],
    e: { _mysticDecayRate: 0.05 },
    uq: { job: { mysticAdept: 2 } }, sb: 'D', br: 'M',
  },
  ambrosiaVessel: {
    n: '神露之瓮', d: '神露上限 +50%。',
    p: [{ r: 'ambrosia', a: 10 }, { r: 'charm', a: 30 }],
    e: { mxM: { ambrosia: 0.5 } },
    uq: { b: { sacredGrove: 2 } }, sb: 'D', br: 'M',
  },
  gnosisRetain: {
    n: '秘知留存', d: '秘知上限 +30%。',
    p: [{ r: 'gnosis', a: 40 }, { r: 'scroll', a: 20 }],
    e: { mxM: { gnosis: 0.3 } },
    uq: { b: { forbiddenLib: 2 } }, sb: 'D', br: 'M',
  },
  gatePrepI: {
    n: '门前冥想·初', d: '第一门秘知消耗 -20%。',
    p: [{ r: 'piety', a: 80 }, { r: 'ambrosia', a: 5 }],
    e: { _gateDiscount1: 0.2 },
    uq: { u: { apotheosisLore: 1 } }, sb: 'D', br: 'M',
  },
  gatePrepII: {
    n: '门前冥想·深', d: '第二门秘知消耗 -20%。',
    p: [{ r: 'gnosis', a: 50 }, { r: 'ambrosia', a: 12 }],
    e: { _gateDiscount2: 0.2 },
    uq: { _gates: 1 }, sb: 'D', br: 'M',
  },
  forbiddenInsight: {
    n: '禁典领悟', d: '禁典阁学识产出 +100%。',
    p: [{ r: 'gnosis', a: 60 }, { r: 'ambrosia', a: 15 }],
    e: { bldM: { forbiddenLib: { prodM: 1.0 } } },
    uq: { b: { forbiddenLib: 3 } }, sb: 'D', br: 'M',
  },
  mysteryEcstasy: {
    n: '秘仪迷醉', d: '开门后获得3季全局产出 +15%。',
    p: [{ r: 'gnosis', a: 40 }, { r: 'ambrosia', a: 10 }],
    e: { _gateEcstasy: 0.15 },
    uq: { b: { apotheosisPool: 2 } }, sb: 'D', br: 'M',
  },
  spiritAmbrosia: {
    n: '灵能凝露', d: '凝露配方灵能消耗 -30%。',
    p: [{ r: 'ambrosia', a: 8 }, { r: 'piety', a: 100 }],
    e: { craftM: { ambrosiaDistill: { inReduce: 0.3 } } },
    uq: { u: { mysteryInit: 1 } }, sb: 'D', br: 'M',
  },
  gatePrepIII: {
    n: '门前冥想·玄', d: '第三门秘知消耗 -20%。',
    p: [{ r: 'gnosis', a: 100 }, { r: 'ambrosia', a: 25 }],
    e: { _gateDiscount3: 0.2 },
    uq: { _gates: 2 }, sb: 'D', br: 'M',
  },
  transformBody: {
    n: '蜕形术', d: '第四门人口代价 -2（-5→-3）。',
    p: [{ r: 'gnosis', a: 150 }, { r: 'ambrosia', a: 30 }],
    e: { _gate4PopReduce: 2 },
    uq: { _gates: 3 }, sb: 'D', br: 'M',
  },
  poolResonance: {
    n: '化神共鸣', d: '化神池每座额外秘知产出 +0.003。',
    p: [{ r: 'gnosis', a: 80 }, { r: 'ambrosia', a: 20 }],
    e: { _poolGnosisP: 0.003 },
    uq: { b: { apotheosisPool: 3 } }, sb: 'D', br: 'M',
  },
  deepMystery: {
    n: '深层秘仪', d: '秘仪师效率递减进一步缓和。',
    p: [{ r: 'gnosis', a: 120 }, { r: 'ambrosia', a: 25 }],
    e: { _mysticDecayRate2: 0.05 },
    uq: { u: { forbiddenLore: 1 } }, sb: 'D', br: 'M',
  },
  ambrosiaFlow: {
    n: '神露涌流', d: '神露产出 +30%（全源）。',
    p: [{ r: 'gnosis', a: 100 }, { r: 'ambrosia', a: 30 }, { r: 'piety', a: 200 }],
    e: { _ambrosiaAllM: 0.3 },
    uq: { u: { ascensionLore: 1 } }, sb: 'D', br: 'M',
  },
  graceCapB: {
    n: '恩典通神', d: '神恩上限 +5%（→65%）。',
    p: [{ r: 'gnosis', a: 80 }, { r: 'ambrosia', a: 20 }],
    e: { _graceCapBonus: 0.05 },
    uq: { u: { ascensionLore: 1 } }, sb: 'D', br: 'M',
  },
  gatePrepIV: {
    n: '门前冥想·幽', d: '第四门秘知消耗 -20%。',
    p: [{ r: 'gnosis', a: 200 }, { r: 'ambrosia', a: 50 }],
    e: { _gateDiscount4: 0.2 },
    uq: { _gates: 3 }, sb: 'D', br: 'M',
  },
  ascensionPrep: {
    n: '飞升准备', d: '第五门所有消耗 -15%。',
    p: [{ r: 'gnosis', a: 250 }, { r: 'ambrosia', a: 60 }, { r: 'piety', a: 300 }],
    e: { _gate5AllReduce: 0.15 },
    uq: { _gates: 4 }, sb: 'D', br: 'M',
  },
  transcendForm: {
    n: '超脱凡形', d: '第五门人口代价 -5（-10→-5）。',
    p: [{ r: 'gnosis', a: 300 }, { r: 'ambrosia', a: 80 }],
    e: { _gate5PopReduce: 5 },
    uq: { _gates: 4 }, sb: 'D', br: 'M',
  },
  gnosisRefine: {
    n: '秘知精粹', d: '秘知残篇配方产出 +50%。',
    p: [{ r: 'gnosis', a: 50 }, { r: 'ambrosia', a: 15 }],
    e: { craftM: { gnosisFragment: { outMul: 0.5 } } },
    uq: { b: { forbiddenLib: 2 } }, sb: 'D', br: 'M',
  },

  // ===== 通达副线 Phase A：升级 #1-10 =====
  embassyRefine: {
    n: '使馆精修', d: '使馆产出 +50%。',
    p: [{ r: 'renown', a: 25 }, { r: 'charm', a: 18 }],
    e: { bldM: { embassy: { prodM: 0.5 } } },
    uq: { b: { embassy: 3 } }, sb: 'T',
  },
  hallExpand: {
    n: '迎宾堂扩建', d: '迎宾堂上限贡献 +50%。',
    p: [{ r: 'renown', a: 35 }, { r: 'scroll', a: 20 }],
    e: { bldMxM: { receptionHall: 0.5 } },
    uq: { b: { receptionHall: 2 } }, sb: 'T',
  },
  envoyDedication: {
    n: '使者虔诚', d: '使者产出 +30%。',
    p: [{ r: 'renown', a: 45 }, { r: 'lore', a: 180 }],
    e: { jobM: { envoy: 0.3 } },
    uq: { b: { receptionHall: 2 } }, sb: 'T',
  },
  hallHospitality: {
    n: '迎宾款待', d: '迎宾堂幸福加成翻倍（.015→.030）。',
    p: [{ r: 'renown', a: 30 }, { r: 'plank', a: 40 }],
    e: { _hallHapBonus: .015 },
    uq: { b: { receptionHall: 2 } }, sb: 'T',
  },
  renownVessel: {
    n: '声誉之库', d: '声誉上限 +30%。',
    p: [{ r: 'renown', a: 55 }, { r: 'charm', a: 20 }],
    e: { mxM: { renown: 0.3 } },
    uq: { b: { embassy: 4 } }, sb: 'T',
  },
  reputeDeepen: {
    n: '声望深悟', d: '声望上限 +5%（40%→45%）。',
    p: [{ r: 'renown', a: 90 }, { r: 'scroll', a: 25 }],
    e: { _reputeCapBonus: 0.05 },
    uq: { u: { reputeLore: 1 } }, sb: 'T',
  },
  courierSpeed: {
    n: '信驿快递', d: '信驿信物产出 +100%。',
    p: [{ r: 'renown', a: 35 }, { r: 'scroll', a: 15 }],
    e: { bldM: { courierPost: { prodM: 1.0 } } },
    uq: { b: { courierPost: 3 } }, sb: 'T',
  },
  crossCulture: {
    n: '文化共鸣', d: '每座所择方向的建筑，声誉产出 +1%（加法叠入）。',
    p: [{ r: 'renown', a: 70 }, { r: 'charm', a: 25 }, { r: 'remnant', a: 3 }],
    e: { _crossCulture: 1 },
    uq: { b: { embassy: 5 } }, sb: 'T',
  },
  credentialRefine: {
    n: '信物精制', d: '制信物配方产出 +50%。',
    p: [{ r: 'credential', a: 4 }, { r: 'renown', a: 55 }],
    e: { craftM: { makeCredential: { outMul: 0.5 } } },
    uq: { b: { embassy: 5 } }, sb: 'T',
  },
  reputeAscend: {
    n: '声望升华', d: '声望上限 +5%（45%→50%）。',
    p: [{ r: 'renown', a: 180 }, { r: 'credential', a: 6 }],
    e: { _reputeCapBonus: 0.05 },
    uq: { ud: { reputeDeepen: 1 } }, sb: 'T',
  },

  // ===== 通达副线 Phase B：结邦升级（#11-30） =====
  charterHallDeepen: {
    n: '邦交堂深化', d: '邦交堂邦书上限 +50%。',
    p: [{ r: 'charter', a: 15 }, { r: 'exotic', a: 3 }],
    e: { bldMxM: { charterHall: 0.5 } },
    uq: { b: { charterHall: 3 } }, sb: 'T',
  },
  exoticVaultExpand: {
    n: '异珍阁扩建', d: '异珍阁异珍上限 +50%。',
    p: [{ r: 'exotic', a: 5 }, { r: 'credential', a: 8 }],
    e: { bldMxM: { exoticVault: 0.5 } },
    uq: { b: { exoticVault: 3 } }, sb: 'T',
  },
  diplomatFocus: {
    n: '邦交官专注', d: '邦交官产出 +30%。',
    p: [{ r: 'charter', a: 20 }, { r: 'exotic', a: 5 }],
    e: { jobM: { diplomat: 0.3 } },
    uq: { b: { charterHall: 2 } }, sb: 'T',
  },
  charterVessel: {
    n: '邦书之库', d: '邦书上限 +30%（全局）。',
    p: [{ r: 'charter', a: 25 }, { r: 'scroll', a: 18 }],
    e: { _charterMxM: 0.3 },
    uq: { b: { charterHall: 2 } }, sb: 'T',
  },
  exoticVessel: {
    n: '异珍之瓮', d: '异珍上限 +50%（全局）。',
    p: [{ r: 'exotic', a: 8 }, { r: 'charm', a: 20 }],
    e: { _exoticMxM: 0.5 },
    uq: { b: { exoticVault: 2 } }, sb: 'T',
  },
  depthPrepI: {
    n: '邦交冥思·初', d: '深度 1 信物消耗 -20%。',
    p: [{ r: 'renown', a: 70 }, { r: 'credential', a: 5 }],
    e: { _depthCostReduce1: 0.2 },
    uq: { u: { allianceLore: 1 } }, sb: 'T',
  },
  depthPrepII: {
    n: '邦交冥思·深', d: '深度 2 邦书消耗 -20%。',
    p: [{ r: 'charter', a: 30 }, { r: 'exotic', a: 8 }],
    e: { _depthCostReduce2: 0.2 },
    uq: { u: { allianceLore: 1 }, allianceDepth: 1 }, sb: 'T',
  },
  platformInsight: {
    n: '会盟台领悟', d: '会盟台每座额外邦书产出 +0.003/s。',
    p: [{ r: 'charter', a: 40 }, { r: 'exotic', a: 10 }],
    e: { _platformCharterP: 0.003 },
    uq: { b: { alliancePlatform: 3 } }, sb: 'T',
  },
  allianceJoy: {
    n: '结邦喜悦', d: '深化邦交后获得 3 季全局产出 +10% 增益。',
    p: [{ r: 'charter', a: 25 }, { r: 'exotic', a: 8 }],
    e: { _allianceJoy: 1 },
    uq: { b: { alliancePlatform: 2 } }, sb: 'T',
  },
  giftRitual: {
    n: '远交礼法', d: '远交礼包配方基础资源消耗 -30%。',
    p: [{ r: 'exotic', a: 6 }, { r: 'renown', a: 90 }],
    e: { craftM: { makeExotic: { inpM: { berry: -0.3, plank: -0.3, brick: -0.3 } } } },
    uq: { u: { exoticLore: 1 } }, sb: 'T',
  },
  depthPrepIII: {
    n: '邦交冥思·玄', d: '深度 3 邦书消耗 -20%。',
    p: [{ r: 'charter', a: 60 }, { r: 'exotic', a: 15 }],
    e: { _depthCostReduce3: 0.2 },
    uq: { u: { allianceLore: 1 }, allianceDepth: 2 }, sb: 'T',
  },
  maintenanceEase: {
    n: '维护减担', d: '深度 3 维护成本 -20%。',
    p: [{ r: 'charter', a: 80 }, { r: 'exotic', a: 18 }],
    e: { _maintenanceReduce: 0.2 },
    uq: { u: { allianceLore: 1 }, allianceDepth: 3 }, sb: 'T',
  },
  guestComfort: {
    n: '远客居安', d: '远客居满意度加成翻倍（.01→.02）。',
    p: [{ r: 'charter', a: 35 }, { r: 'renown', a: 120 }],
    e: { bldM: { guestQuarter: { hapM: 1.0 } } },
    uq: { b: { guestQuarter: 3 } }, sb: 'T',
  },
  diplomatDeepen: {
    n: '邦交官进阶', d: '邦交官产出 +30%。',
    p: [{ r: 'charter', a: 50 }, { r: 'exotic', a: 12 }],
    e: { jobM: { diplomat: 0.30 } },
    uq: { u: { guestLore: 1 } }, sb: 'T',
  },
  exoticFlow: {
    n: '异珍涌流', d: '异珍产出 +30%（全源）。',
    p: [{ r: 'charter', a: 55 }, { r: 'exotic', a: 18 }, { r: 'renown', a: 150 }],
    e: { _exoticAllM: 0.3 },
    uq: { u: { deepAlliancePrelude: 1 } }, sb: 'T',
  },
  reputeCapB: {
    n: '声望通达', d: '声望上限 +5%（→55%）。',
    p: [{ r: 'charter', a: 45 }, { r: 'exotic', a: 12 }],
    e: { _reputeCapBonus: 0.05 },
    uq: { u: { deepAlliancePrelude: 1 } }, sb: 'T',
  },
  favorBoost: {
    n: '好感倍增', d: '商队交互好感获取 ×1.5。',
    p: [{ r: 'charter', a: 30 }, { r: 'renown', a: 100 }],
    e: { _favorBoost: 0.5 },
    uq: { b: { exoticVault: 2 } }, sb: 'T',
  },
  caravanFrequency: {
    n: '商队频至', d: '全局商队来访率 +15%。',
    p: [{ r: 'charter', a: 40 }, { r: 'exotic', a: 10 }],
    e: { _caravanFreq: 0.15 },
    uq: { b: { guestQuarter: 2 } }, sb: 'T',
  },
  charterSurge: {
    n: '邦书涌现', d: '制邦书配方产出 ×2。',
    p: [{ r: 'charter', a: 30 }, { r: 'credential', a: 10 }],
    e: { craftM: { makeCharter: { outMul: 1.0 } } },
    uq: { b: { charterHall: 2 } }, sb: 'T',
  },
  wideAlliance: {
    n: '广结善缘', d: '同时持有 4 族浅盟时，声誉产出 +5%。',
    p: [{ r: 'charter', a: 40 }, { r: 'renown', a: 100 }],
    e: { _wideAlliance: 1 },
    uq: { b: { alliancePlatform: 3 } }, sb: 'T',
  },
};

// ===== 神启副线 A阶段：仪式 =====
const RITUALS = {
  bless: {
    n: '祈福', d: '本季全职业产出 +20%。',
    cost: [{ r: 'piety', a: 15 }],
    uq: { u: { graceLore: 1 } }, sb: 'D',
  },
  purify: {
    n: '净化', d: '污染/内乱 -15。',
    cost: [{ r: 'holyOil', a: 3 }],
    uq: { u: { graceLore: 1 } }, sb: 'D',
  },
};

// ===== v0.19 §七 4.5 六神系统（branch-divine.md §十三） =====
const DEITY_DATA = {
  mountainGod: {
    n: '山神', theme: '大地/建筑',
    passive: { _bldCostM: -0.08, _stoneM: 0.10, _brickM: 0.10 },
    sects: ['rockSect', 'soilSect'],
    rituals: ['earthPulse', 'petrifyShield'],
  },
  moonFox: {
    n: '月狐', theme: '灵性/符咒',
    passive: { _charmM: 0.12 },
    passiveByLine: { M: { _spellBoost: 0.08 }, I: { _hapFlat: 0.03 } },
    sects: ['crescentSect', 'fullMoonSect', 'eclipseSect'],
    rituals: ['moonBath', 'lunarWeave'],
  },
  bonfireGod: {
    n: '篝火神', theme: '温暖/幸福',
    passive: { _hapFlat: 0.08, _gatherM: 0.10 },
    sects: ['flameSect', 'warmSect'],
    rituals: ['bonfireFeast', 'warmthSpread'],
  },
  namelessFog: {
    n: '雾中无名', theme: '神秘/学识',
    passive: { _loreM: 0.15, _scrollCraftM: 0.10 },
    sects: ['peekSect', 'voidSect'],
    rituals: ['fogReveal', 'knowledgeSteal'],
  },
  ancestorSpirit: {
    n: '祖灵集合', theme: '传承/人口',
    passive: { _maxFoxFlat: 5, _jobEffM: 0.08 },
    sects: ['watchSect', 'teachSect'],
    rituals: ['ancestorShield', 'bloodLegacy'],
  },
  goldTailMerchant: {
    n: '金尾商君', theme: '商贸/外交',
    passive: { _caravanProb: 0.12, _coinM: 0.15 },
    sects: ['purseSect', 'importSect', 'pawnSect'],
    rituals: ['fortuneBless', 'tradeBlessing'],
  },
};

const DEITY_RITUAL_DATA = {
  // 小仪式（虔诚消耗，本季即时效果）
  earthPulse:     { n: '地脉强化', d: '本季建筑造价额外 -15%。', deity: 'mountainGod', cost: [{ r: 'piety', a: 25 }], dur: 0, e: { _bldCostM: -0.15 }, cd: 2 },
  moonBath:       { n: '月光沐浴', d: '本季符咒产出 +25%。',     deity: 'moonFox',     cost: [{ r: 'piety', a: 20 }], dur: 0, e: { _charmM: 0.25 },    cd: 2 },
  bonfireFeast:   { n: '篝火盛宴', d: '本季幸福 +0.15。',        deity: 'bonfireGod',  cost: [{ r: 'piety', a: 20 }], dur: 0, e: { _hapFlat: 0.15 },   cd: 2 },
  fogReveal:      { n: '迷雾启示', d: '本季学识 +25%，下研究费用 -10%。', deity: 'namelessFog',  cost: [{ r: 'piety', a: 30 }], dur: 0, e: { _loreM: 0.25, _researchDiscount: 0.10 }, cd: 3 },
  ancestorShield: { n: '祖灵庇佑', d: '本季不安 -20，污染 -10。', deity: 'ancestorSpirit', cost: [{ r: 'piety', a: 25 }], dur: 0, e: { _unrestReduce: 20, _pollReduce: 10 }, cd: 2 },
  fortuneBless:   { n: '财神祝福', d: '本季铜钱产出 +30%。',      deity: 'goldTailMerchant', cost: [{ r: 'piety', a: 20 }], dur: 0, e: { _coinM: 0.30 }, cd: 2 },
  // 大仪式（圣油+资源消耗，持续多季）
  petrifyShield:  { n: '石化护盾', d: '3 季内污染产出 -50%。',    deity: 'mountainGod', cost: [{ r: 'holyOil', a: 5 }, { r: 'stone', a: 200 }], dur: 3, e: { _pollProdM: -0.50 }, cd: 5 },
  lunarWeave:     { n: '命丝编织', d: '下次占卜可从 4 签中选。',   deity: 'moonFox',     cost: [{ r: 'holyOil', a: 4 }, { r: 'charm', a: 30 }],  dur: -1, e: { _divDrawCount: 4 }, cd: 5 },
  warmthSpread:   { n: '暖意传递', d: '3 季内全资源产出 +8%。',    deity: 'bonfireGod',  cost: [{ r: 'holyOil', a: 4 }, { r: 'berry', a: 300 }], dur: 3, e: { _allProdM: 0.08 }, cd: 5 },
  knowledgeSteal: { n: '知识窃取', d: '立即获得最贵未完成研究 15% 进度。', deity: 'namelessFog', cost: [{ r: 'holyOil', a: 6 }, { r: 'scroll', a: 15 }], dur: 0, e: { _researchProgress: 0.15 }, cd: 6 },
  bloodLegacy:    { n: '血脉传承', d: '3 季内职业效率 +20%。',     deity: 'ancestorSpirit', cost: [{ r: 'holyOil', a: 5 }, { r: 'ancCoin', a: 20 }], dur: 3, e: { _jobEffM: 0.20 }, cd: 5 },
  tradeBlessing:  { n: '通商护佑', d: '3 季内商队概率 +25%，远行奖励 +15%。', deity: 'goldTailMerchant', cost: [{ r: 'holyOil', a: 4 }, { r: 'coin', a: 100 }], dur: 3, e: { _caravanProb: 0.25, _expRewardM: 0.15 }, cd: 5 },
};

const SECT_DATA = {
  rockSect:      { n: '磐石派', deity: 'mountainGod', passive: { _bldHpM: 0.10 } },
  soilSect:      { n: '沃土派', deity: 'mountainGod', passive: { _baseProdM: 0.05 } },
  crescentSect:  { n: '弦月派', deity: 'moonFox',     passive: { _charmM: 0.05 } },
  fullMoonSect:  { n: '满月派', deity: 'moonFox',     passive: { _spellBoost: 0.05 } },
  eclipseSect:   { n: '蚀月派', deity: 'moonFox',     passive: { _pietyM: 0.08 } },
  flameSect:     { n: '焰心派', deity: 'bonfireGod',  passive: { _hapDecayReduce: 0.15 } },
  warmSect:      { n: '暖风派', deity: 'bonfireGod',  passive: { _foodM: 0.08 } },
  peekSect:      { n: '窥秘派', deity: 'namelessFog',  passive: { _researchDiscount: 0.05 } },
  voidSect:      { n: '忘我派', deity: 'namelessFog',  passive: { _scrollM: 0.10 } },
  watchSect:     { n: '守望派', deity: 'ancestorSpirit', passive: { _maxFoxFlat: 2 } },
  teachSect:     { n: '师承派', deity: 'ancestorSpirit', passive: { _expGainM: 0.10 } },
  purseSect:     { n: '锦囊派', deity: 'goldTailMerchant', passive: { _coinM: 0.08 } },
  importSect:    { n: '舶来派', deity: 'goldTailMerchant', passive: { _caravanReward: 0.10 } },
  pawnSect:      { n: '质库派', deity: 'goldTailMerchant', passive: { _tradeDiscount: 0.08 } },
};

// ===== 占卜系统：年签（Phase 3, §六 3.4） =====
const DIVINATION_POOL = [
  {
    id: 'harvest', n: '丰年签',
    desc: '全年野莓产出 +15%，铜钱产出 -5%。',
    tip: '田间有穗，囊中无钱。',
    bonus: { berryM: 0.15 },
    penalty: { coinM: -0.05 },
  },
  {
    id: 'scholar', n: '学海签',
    desc: '全年学识产出 +20%，建筑造价 +8%。',
    tip: '知识的代价是行动的迟缓。',
    bonus: { loreM: 0.20 },
    penalty: { bldCostM: 0.08 },
  },
  {
    id: 'merchant', n: '商旅签',
    desc: '全年商队概率 +15%，铜钱 +10%，幸福 -3%。',
    tip: '忙碌的爪子没空微笑。',
    bonus: { caravanProb: 0.15, coinM: 0.10 },
    penalty: { hapB: -0.03 },
  },
  {
    id: 'hermit', n: '隐逸签',
    desc: '全年幸福 +8%，内乱/污染产出 -10%，远行奖励 -15%。',
    tip: '闭门修行，不问山外。',
    bonus: { hapB: 0.08, pollReduce: 0.10, unrestReduce: 0.10 },
    penalty: { expReward: -0.15 },
  },
  {
    id: 'forge', n: '锻造签',
    desc: '全年工艺产出 +12%，基础资源产出 -5%。',
    tip: '精工出细活，粗粮短半斤。',
    bonus: { craftM: 0.12 },
    penalty: { baseProdM: -0.05 },
  },
  {
    id: 'inspire', n: '灵感签',
    desc: '全年符咒产出 +15%，灵术效果 +8%，学识产出 -5%。',
    tip: '灵光一闪，笔下无墨。',
    bonus: { charmM: 0.15, spellBoost: 0.08 },
    penalty: { loreM: -0.05 },
  },
];

// ===== 灵术定义 =====
const SD = {
  rain: {
    n: '祈雨', d: '本季野莓产量 ×1.5',
    cost: [{ r: 'charm', a: 5 }],
    uq: { b: { shrine: 1 } },
    tip: ['对天空说了三遍"求你了"，第四遍的时候雷响了。']
  },
  summon: {
    n: '祖灵', d: '本季所有职业产出 +50%',
    cost: [{ r: 'charm', a: 8 }],
    uq: { b: { shrine: 1 } },
    tip: ['今天的活莫名其妙就干完了，大家面面相觑。']
  },
  harvest: {
    n: '丰收祭', d: '本季建筑造价 -30%，并触发一次山谷见闻',
    cost: [{ r: 'charm', a: 3 }],
    uq: { b: { shrine: 1 } },
    tip: ['最小的那只站在石墩上喊了声"开始！"，所有尾巴一起摇了起来。']
  },
  spiritPath: {
    n: '灵路', d: '一次远行剩余时间 -30%',
    cost: [{ r: 'charm', a: 6 }],
    uq: { b: { shrine: 1, trailroad: 1 } },
    tip: ['在地上画一道，就少走一整天。']
  },
  tradeWind: {
    n: '商风', d: '立即召来一支随机商队（停留1季）',
    cost: [{ r: 'charm', a: 10 }],
    uq: { b: { shrine: 1, trailroad: 1 } },
    tip: ['灵力化成风，风里裹着铜钱的响声。']
  },
  feast: {
    n: '山谷宴席', d: '满意度 +15%，持续本季',
    cost: [{ r: 'spice', a: 2 }, { r: 'berry', a: 100 }],
    uq: { b: { trailroad: 1 } },
    tip: ['香草往锅里一撒，连最不爱说话的狐狸都开了口。']
  },

  // ===== v0.15 文化灵术 =====
  overflow: {
    n: '盈库', d: '本季资源上限 +30%；满仓时溢出按 50% 效率继续累积',
    cost: [{ r: 'dye', a: 2 }],
    uq: { u: { artistryLore: 1 } },
    tip: ['本来放不下了——但换个方式叠，居然又挤进去了。']
  },
  doubleCraft: {
    n: '双工', d: '本季所有工坊制作产出 +50%',
    cost: [{ r: 'wine', a: 2 }],
    uq: { u: { artistryLore: 1 } },
    tip: ['一锤下去多崩出半个，狐狸自己都吓了一跳。']
  },
  inkPact: {
    n: '墨契', d: '下次研究花费 -40%；本季内未用则消失',
    cost: [{ r: 'ink', a: 2 }],
    uq: { u: { artistryLore: 1 } },
    tip: ['写一份契约跟学识讲价，居然成了。']
  },

  // ===== 灵修 A 阶段灵术 =====
  spiritSight: {
    n: '灵视', d: '一次远行剩余时间 -50%',
    cost: [{ r: 'spirit', a: 5 }],
    cooldown: 150, // 30s = 150 tick（5 tick/s）
    br: 'M',
    uq: { u: { spiritSense: 1 } },
    tip: ['闭上眼，路就在脚下画好了——只是睁眼后又找不到了。']
  },
  tidePull: {
    n: '引潮', d: '本季所有建筑被动产出 +30%',
    cost: [{ r: 'spirit', a: 8 }, { r: 'fateSilk', a: 1 }],
    cooldown: 300, // 60s = 300 tick
    br: 'M',
    uq: { u: { leylineLore: 1 } },
    tip: ['灵潮涌进来的时候，连储藏窖都多了一层底。']
  },
  fateWeave: {
    n: '织命', d: '本季所有配方产出 +80%',
    cost: [{ r: 'fateSilk', a: 2 }],
    cooldown: 300, // 60s = 300 tick
    br: 'M',
    uq: { u: { silkWeave: 1 } },
    tip: ['命丝搅进染缸里，出来的东西连配方都没见过。']
  },

  // ===== 灵修 B 阶段灵术 =====
  resonWave: {
    n: '共振波', d: '本季全产出 +50%（建筑+职业）',
    cost: [{ r: 'resonance', a: 3 }, { r: 'spirit', a: 10 }],
    cooldown: 450, // 90s = 450 tick
    br: 'M',
    uq: { u: { resonArt: 1 } },
  },
  shapeFox: {
    n: '化形·灵狐', d: '所有职业效率 ×1.5，持续本季',
    cost: [{ r: 'elixir', a: 1 }, { r: 'spirit', a: 15 }],
    cooldown: 600, // 120s = 600 tick
    br: 'M',
    uq: { u: { shapeBasic: 1 } },
  },
  sageUtter: {
    n: '悟语', d: '下一个研究花费 -40%',
    cost: [{ r: 'insight', a: 2 }],
    cooldown: 450, // 90s
    br: 'M',
    uq: { u: { sageWay: 1 } },
  },
  calmFlow: {
    n: '净流', d: '立即躁念 -30',
    cost: [{ r: 'elixir', a: 1 }, { r: 'charm', a: 5 }],
    cooldown: 225, // 45s
    br: 'M',
    uq: { u: { calmMind: 1 } },
  },

  // ===== 灵修 C 阶段灵术 =====
  spiritWeave: {
    n: '灵织', d: '启动自动制作（持续本季，无需工坊精通）',
    cost: [{ r: 'crystalSilk', a: 2 }, { r: 'spiritCore', a: 1 }],
    cooldown: 600, // 120s
    br: 'M',
    uq: { u: { spiritGrid: 1 } },
  },
  voidWalk: {
    n: '虚行', d: '立即完成当前一次远行',
    cost: [{ r: 'radiance', a: 3 }, { r: 'spiritChart', a: 5 }],
    cooldown: 900, // 180s
    br: 'M',
    uq: { u: { radiantVision: 1 } },
  },
  starSenseSpell: {
    n: '星感', d: '本季灵图产出×3',
    cost: [{ r: 'formSoul', a: 1 }, { r: 'spirit', a: 20 }],
    cooldown: 450, // 90s
    br: 'M',
    uq: { u: { starSense: 1 } },
  },

  // ===== 灵修 D 阶段灵术（v0.20 §八 5.2f, 5 个） =====
  primordialDriveSpell: {
    n: '元驱', d: '本季所有灵修建筑效果×2',
    cost: [{ r: 'primordial', a: 5 }, { r: 'silenceStone', a: 1 }],
    cooldown: 750, // 150s
    br: 'M', phase: 4,
    uq: { u: { primordialDrive: 1 } },
  },
  mirrorViewSpell: {
    n: '镜观', d: '在灵图水面上窥见远方未明之事——立即获得学识 +1000。',
    cost: [{ r: 'mirrorSpirit', a: 1 }, { r: 'spiritChart', a: 50 }],
    cooldown: 1500, // 300s
    br: 'M', phase: 4,
    uq: { u: { mirrorArt: 1 } },
  },
  voidReadSpell: {
    n: '幽读', d: '永久：下一个升级花费-30%',
    cost: [{ r: 'voidCodex', a: 1 }],
    cooldown: 3000, // 600s
    br: 'M', phase: 4,
    uq: { u: { voidCodexLore: 1 } },
  },
  silenceMeditation: {
    n: '寂石冥想', d: '在寂石旁静坐一季，本季山谷全产出 +40%。',
    cost: [{ r: 'silenceStone', a: 5 }, { r: 'primordial', a: 10 }],
    cooldown: 4500, // 900s
    br: 'M', phase: 4,
    uq: { u: { silenceField: 1 } },
  },
  pactPrayerSpell: {
    n: '灵契祈愿', d: '在五位灵契之间转换祈愿对象。',
    cost: [{ r: 'spiritCore', a: 5 }, { r: 'voidCodex', a: 1 }],
    cooldown: 1500, // 300s
    br: 'M', phase: 4,
    uq: { u: { spiritPactLore: 1 } },
  },
};

// ===== 灵契系统定义（灵修 D 独占，v0.20 §八 5.2f） =====
// 5 选 1，激活时通过 pactPrayerSpell 切换。每套灵契提供独占被动。
const PACT_DEF = {
  earthPact: { n: '大地契', d: '土性灵契：野莓/圆木/碎石产出 +20%。',       e: { _baseResM: 0.20 },                       br: 'M', uq: { u: { spiritPactLore: 1 } } },
  waterPact: { n: '流水契', d: '水性灵契：商队概率 +15%、远行奖励 +20%。', e: { _caravanProb: 0.15, _expRewardM: 0.20 }, br: 'M', uq: { u: { spiritPactLore: 1 } } },
  woodPact:  { n: '林木契', d: '木性灵契：建筑造价 -15%。',                 e: { buildCostM: -0.15 },                     br: 'M', uq: { u: { spiritPactLore: 1 } } },
  firePact:  { n: '烈焰契', d: '火性灵契：配方产出 +20%。',                 e: { _craftAllM: 0.20 },                      br: 'M', uq: { u: { spiritPactLore: 1 } } },
  metalPact: { n: '玄金契', d: '金性灵契：学识产出 +15%、研究花费 -10%。', e: { loreM: 0.15, _researchCostM: -0.10 },    br: 'M', uq: { u: { spiritPactLore: 1 } } },
};

// ===== 教令系统定义（教团独占） =====
const EDICT_DEF = {
  edictCraft:   { n: '圣工令',  cost: { piety: 50, holyFlame: 5 },  dur: 4, e: { _craftAllM: .25 },                         uq: { u: { edictLore: 1 } } },
  edictBuild:   { n: '征召令',  cost: { piety: 40, holyFlame: 3 },  dur: 3, e: { _buildSpeedM: .30 },                       uq: { u: { edictLore: 1 } } },
  edictTithe:   { n: '什一令',  cost: { piety: 30, holyFlame: 2 },  dur: 5, e: { _baseResM: .15 },                          uq: { u: { edictLore: 1 } } },
  edictJudge:   { n: '审判令',  cost: { piety: 60, holyFlame: 8 },  dur: 2, e: { _pollReduce: 20, _hapFlat: .10 },          uq: { u: { judgmentLore: 1 } } },
  edictCrusade: { n: '圣战令',  cost: { piety: 100, holyFlame: 15 }, dur: 3, e: { _allProdM: .20, _expRewardM: .30 },       uq: { u: { judgmentLore: 1 } } },
};

// ===== 飞升阶梯定义（秘仪独占） =====
const GATE_DEF = [
  { n: '初窥之门', cost: { gnosis: 30, ambrosia: 5 },                     e: { _spellM: .10 },                                      penalty: {},                              tip: '你第一次听见了门后的声音。' },
  { n: '离形之门', cost: { gnosis: 80, ambrosia: 15, piety: 100 },        e: { _allProdM: .08, _researchM: .15 },                    penalty: {},                              tip: '你的影子开始独立行动。' },
  { n: '饮露之门', cost: { gnosis: 150, ambrosia: 30 },                   e: { _graceCapBonus: .15 },                                penalty: { _hapCapM: -.05 },              tip: '你尝到了不属于凡间的味道。' },
  { n: '褪壳之门', cost: { gnosis: 300, ambrosia: 60, piety: 300 },       e: { _mysticResM: 0.5 },                                   penalty: { _maxPopReduce: 5 },            tip: '你正在丢弃一些不再需要的东西。' },
  { n: '飞升之门', cost: { gnosis: 500, ambrosia: 100, piety: 500 },      e: { _ascension: true },                                   penalty: { _maxPopReduce: 10, _baseResM: -.20 }, tip: '你不再是狐狸了。' },
];

// ===== v0.19 §七 4.4 邦交系统：七族定义 =====
const ALLIANCE_TRIBES = {
  otter:    { n: '河獭·哗啦', desc: '资源流通', shallow: '基础资源(木/皮)+4%/级', deep: '全局+2%/级' },
  crane:    { n: '白鹤·拂月', desc: '学识传递', shallow: '学识+5%/级, 符咒+3%/级', deep: '研究速度+4%/级' },
  ruinfolk: { n: '旧墟遗民', desc: '古技传承', shallow: '古币+8%/级, 远行奖励+3%/级', deep: '建筑造价-2%/级' },
  lynx:     { n: '山猫·阿斑', desc: '商贸竞争', shallow: '竞拍减免5%/级', deep: '全局+3%/级' },
  owl:      { n: '雪鸮·夜眼', desc: '暗夜秘知', shallow: '符咒+5%/级', deep: '稀有远行概率+5%/级' },
  ratter:   { n: '水鼠·囤囤', desc: '囤积仓储', shallow: '存储+3%/级', deep: '存储+5%/级' },
  koala:    { n: '考拉·小曼', desc: '安逸悠闲', shallow: '幸福+2%/级', deep: '幸福+3%/级' },
};
const ALLIANCE_DEPTH = [
  null, // depth 0 placeholder
  { n: '结识', cost: { credential: 5, renown: 30 }, favor: 5 },
  { n: '友邦', cost: { credential: 12, charter: 3, renown: 80 }, favor: 15 },
  { n: '盟邦', cost: { charter: 10, credential: 20, renown: 150 }, favor: 30, maint: 0.002 },
  { n: '至交', cost: { charter: 25, renown: 300 }, favor: 50, maint: 0.005 },
  { n: '永盟', cost: { charter: 40, renown: 600 }, favor: 80, maint: 0.010 },
];

// ===== v0.15 节令系统：消耗的文化资源 → 加成 =====
const SEASON_RITES = {
  dye:  { consume: 1, mul: { jobMul: .05 }, name: '彩络', desc: '穿新衣干活有精神' },
  wine: { consume: 1, mul: { berryMul: .08 }, name: '醴浆', desc: '微醺的狐狸摘得更多' },
  ink:  { consume: 1, mul: { loreMul: .10 }, name: '墨锭', desc: '研墨读书效率高' },
};
// 三全礼 = 三者全选生效 → 满意度 +5% + 全产出 +3%（allM 加法）

// ===== v0.16 政体定义 =====
const POLITY = {
  elder: {
    n: '老橡守', d: '长老治谷，稳扎稳打。学识与满意度优先，但对外封闭。',
    tier1: 'in',
    cost: [{ r: 'scroll', a: 80 }, { r: 'coin', a: 80 }, { r: 'ancCoin', a: 10 }],
    e: { hapM: .08, loreM: .25 },
    pen: { caravanProb: -.05, expRewardM: -.10, researchCostM: .05 },
  },
  hermit: {
    n: '雾隐修', d: '隐居修行，灵性充沛。符咒与学识双高，但经济封闭。',
    tier1: 'in',
    cost: [{ r: 'scroll', a: 80 }, { r: 'coin', a: 80 }, { r: 'ancCoin', a: 10 }],
    e: { charmM: .15, loreM: .10, spellEffM: .10 },
    pen: { coinM: -.10, caravanProb: -.05, diplomatResM: -.10 },
  },
  public: {
    n: '喧藤议', d: '公议治谷，均衡发展。政策调整成本低，但建设研究微涨。',
    tier1: 'in',
    cost: [{ r: 'scroll', a: 80 }, { r: 'coin', a: 80 }, { r: 'ancCoin', a: 10 }],
    e: { hapM: .12, allM: .02, policyCostM: -.30 },
    pen: { buildCostM: .08, researchCostM: .05 },
  },
  trade: {
    n: '衔铜道', d: '商道治谷，铜钱为先。贸易强力但居民不太开心。',
    tier1: 'out',
    cost: [{ r: 'scroll', a: 80 }, { r: 'coin', a: 80 }, { r: 'ancCoin', a: 10 }],
    e: { coinM: .20, caravanProb: .08, bpChance: .08 },
    pen: { hapM: -.08, baseProdM: -.03 },
  },
  martial: {
    n: '破霜行', d: '远行治谷，武力开拓。远征强力但经济与满意度承压。',
    tier1: 'out',
    cost: [{ r: 'scroll', a: 80 }, { r: 'coin', a: 80 }, { r: 'ancCoin', a: 10 }],
    e: { expRewardM: .15, baseProdM: .10, scoutM: .10 },
    pen: { hapM: -.08, coinM: -.05 },
  },
  anarchy: {
    n: '散藤活', d: '无人治谷，自由至上。手动采集爆发但建筑长期疲软。',
    tier1: 'out',
    cost: [{ r: 'scroll', a: 80 }, { r: 'coin', a: 80 }, { r: 'ancCoin', a: 10 }],
    e: { gatherM: .30, jobM: .08, hapCapM: .20 },
    pen: { bldProdM: -.15, researchSpeedM: -.05 },
  },
};

// ===== v0.16 Tier 1 路线（policyLore 完成后选；不可逆）=====
// 玩家先选 in/out 再从对应 3 个政体里挑 1。Tier 1 effect 统一在 calcR / bp / 远行奖励 / 商队概率 4 处应用。
const TIER = {
  in:  {
    n: '守谷志', d: '专注内政发展，基础产出与建筑优先。',
    cost: [{ r: 'scroll', a: 30 }, { r: 'coin', a: 30 }],
    e: { baseProdM: 0.04, buildCostM: -0.02 },
  },
  out: {
    n: '拓霜径', d: '专注对外扩张，远征与贸易优先。',
    cost: [{ r: 'scroll', a: 30 }, { r: 'coin', a: 30 }],
    e: { expRewardM: 0.12, caravanProb: 0.05 },
  },
};

// ===== v0.16 政策定义 =====
const POLICY = {
  branch: {
    n: '择路而治', permanent: true,
    cost: [],
    uq: { u: { branchLore: 1 } },
    opts: {
      I: { n: '造物之路', d: '开启煤矿、冶钢与能量管理，带来污染风险。选定后不可更改。', e: {} },
      M: { n: '灵修之路', d: '开启灵泉、灵脉与命丝编织，带来内乱风险。选定后不可更改。', e: {} },
    },
  },
  land: {
    n: '地利', permanent: true,
    cost: [{ r: 'scroll', a: 50 }, { r: 'coin', a: 40 }],
    uq: { u: { policyLore: 1 }, polity: true },
    opts: {
      public:  { n: '均丰田',   d: '产出普涨，满意度微降。',
                 e: { berryM: .08, woodM: .05, stoneM: .05 }, pen: { hapM: -.03 } },
      private: { n: '独垄丘',   d: '铜钱暴涨，建筑省钱，但采集下降。',
                 e: { coinM: .15, buildCostM: -.05 }, pen: { berryM: -.05 } },
      commune: { n: '共耕垄',   d: '采集最强，心情好，但铜钱萎缩。',
                 e: { berryM: .15, hapM: .05 }, pen: { coinM: -.05 } },
    },
  },
  edu: {
    n: '传习', permanent: true,
    cost: [{ r: 'scroll', a: 50 }, { r: 'coin', a: 40 }],
    uq: { u: { policyLore: 1 }, polity: true },
    opts: {
      mentor:  { n: '师徒授',   d: '授业便宜，但学识产出略低。',
                 e: { trainCostM: -.30 }, pen: { loreM: -.05 } },
      academy: { n: '竹简堂',   d: '学识与卷轴双高，但授业昂贵。',
                 e: { loreM: .15, scrollM: .10 }, pen: { trainCostM: .20 } },
      self:    { n: '野学记',   d: '学识/卷轴微涨，采集经验大涨。',
                 e: { loreM: .05, scrollM: .05, gatherExpM: .20 }, pen: {} },
    },
  },
  trade: {
    n: '外通', permanent: true,
    cost: [{ r: 'scroll', a: 50 }, { r: 'coin', a: 40 }],
    uq: { u: { policyLore: 1 }, polity: true },
    opts: {
      open:    { n: '四通货', d: '商队频繁，图纸概率高，但满意度微降。',
                 e: { caravanProb: .10, bpChance: .05, coinM: .05 }, pen: { hapM: -.03 } },
      control: { n: '税秤台',     d: '铜钱稳涨，交易划算，但商队减少。',
                 e: { coinM: .10, tradePriceM: -.10 }, pen: { caravanProb: -.05 } },
      closed:  { n: '封谷门',     d: '内政加成，但商队骤降、铜钱骤减。',
                 e: { hapM: .05, baseProdM: .05 }, pen: { caravanProb: -.15, coinM: -.10 } },
    },
  },
  class: {
    n: '序位', permanent: true,
    cost: [{ r: 'scroll', a: 50 }, { r: 'coin', a: 40 }],
    uq: { u: { policyLore: 1 }, polity: true },
    opts: {
      equal:   { n: '平齐席',     d: '心情好，但职业效率微降。',
                 e: { hapM: .08 }, pen: { jobM: -.03 } },
      seniority: { n: '按须座', d: '授业加成，但心情微降。',
                 e: { trainFlat: .5 }, pen: { hapM: -.03 } },
      merit:   { n: '拔尖桩', d: '职业效率与铜钱双涨，但心情差。',
                 e: { jobM: .05, coinM: .05 }, pen: { hapM: -.05 } },
    },
  },
  diplomacy: {
    n: '外交', permanent: true,
    cost: [{ r: 'scroll', a: 50 }, { r: 'coin', a: 40 }],
    uq: { u: { policyLore: 1 }, polity: true },
    opts: {
      open:   { n: '通邻径', d: '开启与邻邦的往来之道。', e: { diplomatResM: .10 }, pen: {},
                special: 'G.subBranches.T = true' },
      closed: { n: '闭谷栓', d: '不开外交，换取内政加成。', e: { baseProdM: .05, buildCostM: -.03 }, pen: {},
                special: 'G.subBranches.T = false' },
    },
  },
};

// ===== TAB定义 =====
const TABS = [
  { id: 'b', n: '营火' },
  { id: 'v', n: '村落' },
  { id: 'c', n: '工坊' },
  { id: 'r', n: '研究' },
  { id: 'w', n: '山外', uq: { u: { beyondValley: 1 } } },
  { id: 'k', n: '典制', uq: { u: { folkLore: 1 } } },
  { id: 'f', n: '宗教', uq: { u: { divineLore: 1 } } },
  { id: 'a', n: '成就' },
];

// ===== 山谷见闻事件 =====
const ED = [
  // 灵启（需灵狐祠）
  { t: '一只采集者在溪边愣住了，说自己想起了一条从没走过的路。', e: { charm: 2 }, uq: { b: { shrine: 1 } }, w: 1 },
  { t: '伐木工放下斧头，盯着年轮看了很久，说这棵树认识它的祖母。', e: { charm: 1 }, uq: { b: { shrine: 1 } }, w: 1 },
  { t: '学者翻到一页空白的卷轴，上面的字只在月光下才显形。', e: { scroll: 1 }, uq: { b: { library: 1 } }, w: 1 },
  { t: '一只小狐狸梦见了一座从未建过的桥，醒来后把它画了下来。', uq: { b: { shrine: 1 } }, w: 1 },


  // 天象（无前置或少量前置）
  { t: '天边挂了一圈淡金色的光环，年长的狐狸说这叫"祖眼"。', w: 2 },
  { t: '一颗星从北向南划过，尾巴拖得很长，像谁写了一笔。', w: 2 },
  { t: '今晚的月亮大得不像话，连影子都亮了起来。', w: 2 },
  { t: '天空泛起绿色的光幕，安静地抖动了一整夜。', w: 2 },
  { t: '云层裂开一道缝，阳光只照在灵狐祠上，持续了整整一刻钟。', e: { charm: 1 }, uq: { b: { shrine: 1 } }, w: 1 },
  { t: '雨后出现了两道彩虹，老狐狸说这是好兆头。', e: { berry: 5 }, s: [0, 1], w: 2 },

  // 山谷异象
  { t: '溪水今早是甜的，只有第一个喝到的狐狸知道。', w: 2 },
  { t: '老橡树的根部发出微弱的光，天亮就消失了。', w: 2 },
  { t: '石壁上多了一串爪印，比任何村民的都大。', uq: { b: { shrine: 1 } }, w: 2 },
  { t: '灵狐祠的石像今晚面朝了不同的方向。', uq: { b: { shrine: 1 } }, w: 2 },
  { t: '清点库存的狐狸数了三遍，每一遍都比上一遍多。', e: { berry: 10 }, uq: { b: { warehouse: 1 } }, w: 1 },
  { t: '采石坑深处传来低沉的回响，像是大地在叹气。', uq: { b: { quarry: 1 } }, w: 2 },
  { t: '月光井的水面映出一只狐狸的脸——月亮今晚没有出现。', uq: { b: { moonwell: 1 } }, w: 2 },
  { t: '林间飘来一股不属于这个季节的花香。', w: 2 },

  // 过客与声音
  { t: '远处传来几声陌生的歌，风一转就没了。', w: 3 },
  { t: '一只灰色的狐狸在村口站了一会儿，什么也没说就走了。', w: 3 },
  { t: '一只路过的旅狐留下了一小包东西，算是借路的谢礼。', e: { wood: 3, stone: 2 }, w: 2 },
  { t: '有人在集市边丢了一串铜钱，等了半天没人来认领。', e: { coin: 2 }, uq: { b: { market: 1 } }, w: 1 },
  { t: '风里夹着远方篝火的气味，但四周并没有别的村庄。', w: 3 },
  { t: '入夜后，山谷里传来一声悠长的嚎叫，不像狐狸。', s: [3], w: 2 },

  // 遗光相关
  { t: '老橡树今晚落了一片叶子，叶脉里裹着一粒淡淡的光。', e: { remnant: 1 }, w: 1 },
  { t: '月光井的水底有什么东西在发亮，捞上来只剩一颗温热的小石子。', e: { remnant: 1 }, uq: { b: { moonwell: 1 } }, w: 1 },

  // 治理初期争议（v0.16 §四 1.7）
  { t: '议事堂里吵了半天，最后大家发现分歧只是谁先说话的顺序。', uq: { b: { councilHall: 1 } }, w: 2 },
  { t: '两只狐狸为了粮仓分配的事拍了桌子，第三只趁机把剩下的莓果吃了。', uq: { b: { councilHall: 1 } }, e: { berry: -3 }, w: 2 },
  { t: '长老提议冬天多存粮，年轻的说不如多探路。谁也没说服谁，但都觉得说了比没说好。', uq: { b: { councilHall: 1 } }, w: 2 },
  { t: '有狐狸提出轮流守夜，立刻有三只说自己不适合夜里醒着。', uq: { u: { councilLore: 1 } }, w: 2 },
  { t: '治风堂门口多了一块石板，上面刻着歪歪扭扭的字："意见箱"。至今没狐狸用过。', uq: { b: { polityHall: 1 } }, w: 2 },
  { t: '一场关于要不要修新路的争论持续了三天，最后路还没修，但大家学会了举手表决。', uq: { b: { councilHall: 1 } }, e: { lore: 2 }, w: 1 },

  // §五 2.5 工业路见闻（br:'I'，选工业后才出现）
  { t: '矿坑深处传来金属碰金属的回声，但下面没有狐狸在挖。', br: 'I', uq: { b: { mine: 1 } }, w: 2 },
  { t: '高炉出钢的一瞬，火光把半个山谷映成橙色。几只幼狐以为天亮了，爬出窝来。', br: 'I', uq: { b: { blastFurnace: 1 } }, e: { steel: 1 }, w: 1 },
  { t: '烟囱冒出的黑烟在风里画了一笔，远看像一条不太健康的龙。', br: 'I', uq: { b: { chimney: 1 } }, w: 2 },
  { t: '净化池边长出了一丛不认识的草，叶片是灰绿色的。有狐狸说这是好事。', br: 'I', uq: { b: { purifier: 1 } }, e: { berry: 3 }, w: 1 },
  { t: '一只深层矿工说它在煤层里看到了贝壳的印痕。这座山以前是海。', br: 'I', uq: { b: { mine: 2 } }, e: { coal: 2 }, w: 1 },

  // §五 2.5 灵修路见闻（br:'M'，选灵修后才出现）
  { t: '灵泉今晨的水是淡紫色的，舀起来却透明。感知者说，那是灵脉换气的颜色。', br: 'M', uq: { b: { spiritWell: 1 } }, w: 2 },
  { t: '静室里传出极轻的嗡鸣声，不是谁在念诵——是墙壁本身在共振。', br: 'M', uq: { b: { quietRoom: 1 } }, w: 2 },
  { t: '织丝师说今天的命丝特别顺手，像是丝线自己知道该往哪里去。', br: 'M', uq: { b: { spiritTower: 1 } }, e: { fateSilk: 1 }, w: 1 },
  { t: '聚灵阵的石头半夜自己挪了位置。早上量过，误差不到一指宽，但方向更准了。', br: 'M', uq: { b: { leyArray: 1 } }, e: { spirit: 2 }, w: 1 },
  { t: '一只年幼的感知者闭眼坐了一下午，睁眼后说它听见了山谷底下有东西在流动，很慢，很亮。', br: 'M', uq: { b: { spiritWell: 2 } }, w: 2 },

  // §六 3.7 工业 B 见闻（5 条，br:'I'）
  { t: '油井冒出一股黑烟，钻井工们手忙脚乱堵了半天。事后发现只是地底气泡，但所有狐狸的毛都熏黑了。', br: 'I', uq: { b: { oilWell: 1 } }, e: { oil: -2 }, w: 2 },
  { t: '蒸汽机房的阀门松了，热气喷了满屋。机师淡定地拧紧螺丝，说这是机器在打喷嚏。', br: 'I', uq: { b: { steamEngine: 1 } }, w: 2 },
  { t: '钢板刚出炉时会唱歌，声音很短，像金属在叹一口气。一只学徒站在旁边听了一整天。', br: 'I', uq: { u: { forging: 1 } }, e: { plate: 1 }, w: 1 },
  { t: '有狐狸提议把油缸刷成红色以示危险。另一只说不如刷成绿色表示安全。最后谁也没刷。', br: 'I', uq: { b: { oilTank: 1 } }, w: 3 },
  { t: '一只钻井工在深层挖到了一块琥珀色的结晶，里面封着一片不认识的叶子。它把这块结晶放在窗台上，有时候会发光。', br: 'I', uq: { b: { oilWell: 3 } }, e: { remnant: 1 }, w: 1 },

  // §六 3.7 灵修 B 见闻（5 条，br:'M'）
  { t: '共振室发出一阵不和谐的嗡鸣，所有灵珠同时暗了一拍。感知者说这叫"灵脉打嗝"，算不上坏事。', br: 'M', uq: { b: { resonTower: 1 } }, w: 2 },
  { t: '灵墨瓶打翻了，墨迹在石板上自己画出了一个完整的符纹。织纹师盯着看了很久，说它从来没教过这个图案。', br: 'M', uq: { u: { inscription: 1 } }, e: { sigil: 1 }, w: 1 },
  { t: '静室的墙壁上长出了一层薄薄的霜花，但室内温度并不低。有狐狸用爪尖碰了一下，霜花化成了淡蓝色的水珠。', br: 'M', uq: { b: { quietRoom: 2 } }, w: 2 },
  { t: '聚灵阵今晚的光芒特别亮，照得周围的草地像铺了一层银粉。几只幼狐跑来打滚，说草是甜的。', br: 'M', uq: { b: { leyArray: 2 } }, e: { spirit: 3 }, w: 1 },
  { t: '一位年长的感知者说它做了一个梦，梦里灵脉是一棵树，根扎在山谷底部，枝叶伸向天空。醒来后它在地上画了一张图，谁也看不懂，但都觉得很重要。', br: 'M', uq: { b: { spiritWell: 3 } }, w: 2 },

  // §六 3.7 宗教见闻（5 条，sb:'D'）
  { t: '祭坛上的供品今早换了位置，但没有狐狸承认动过。祭司说这是神明在挑食。', sb: 'D', uq: { b: { divineAltar: 1 } }, w: 2 },
  { t: '经阁的卷轴在无人翻阅时自己翻了一页。那一页恰好写着"不要害怕"。', sb: 'D', uq: { b: { scriptureHall: 1 } }, e: { piety: 2 }, w: 1 },
  { t: '祈愿池的水面浮起一层淡金色的光膜，持续了整整一刻钟。祭司们跪下来了，幼狐们在旁边看得很开心。', sb: 'D', uq: { b: { prayerPool: 1 } }, e: { piety: 3 }, w: 1 },
  { t: '一位虔诚的祭司连续冥想三天三夜，出关后说它什么也没悟到，但心里很踏实。', sb: 'D', uq: { b: { scriptureHall: 1 } }, w: 2 },
  { t: '有狐狸在圣油坛旁闻到了不属于任何已知草药的香气。祭司说这叫"神息"，闻到的狐狸一整天都很安静。', sb: 'D', uq: { b: { divineAltar: 2 } }, e: { holyOil: 1 }, w: 1 },

  // §六 3.7 占卜见闻（3 条，sb:'D'，需 divineLore）
  { t: '年初抽到的签文应验了——丰年签说的"田间有穗"，今年野莓确实多了不少。有狐狸开始认真对待那些签了。', sb: 'D', uq: { u: { divineLore: 1 } }, e: { berry: 8 }, w: 1 },
  { t: '去年的签文完全没应验，但抽签的狐狸说这不怪签，怪天气。旁边的狐狸翻了个白眼。', sb: 'D', uq: { u: { divineLore: 1 } }, w: 3 },
  { t: '占卜台的竹签散落一地，风把它们吹成了一个奇怪的图案。祭司趴在地上研究了半天，说这是"天意乱码"。', sb: 'D', uq: { u: { divineLore: 1 } }, w: 2 },

  // §六 3.7 外交见闻（3 条，sb:'T'）
  { t: '一位外族使者来访，带了一篮子从未见过的水果作为见面礼。味道像是酸和甜吵了一架，谁也没赢。', sb: 'T', uq: { b: { embassy: 1 } }, e: { berry: 5 }, w: 2 },
  { t: '信驿收到一封远方来信，内容只有四个字："一切安好。"没有落款，没有回信地址。信使说这已经是第三封了。', sb: 'T', uq: { b: { courierPost: 1 } }, w: 2 },
  { t: '边境传来消息，两个巡逻队因为一棵长在分界线上的果树起了争执。最后协商的结果是：谁先到谁摘，但要给对方留一半。', sb: 'T', uq: { b: { embassy: 2 } }, e: { renown: 1 }, w: 1 },

  // §六 3.7 通用见闻（3 条，枯风口/远方）
  { t: '远行队从枯风口带回一块风蚀石，形状像一只蜷缩的狐狸。有狐狸说这是自然的巧合，有狐狸说这是远古的信号。', uq: { exp: { windRidge: 1 } }, w: 2 },
  { t: '枯风口的风今天格外安静。斥候说它在风停的缝隙里听到了远方的鼓声，节奏很慢，像心跳。', uq: { exp: { windRidge: 2 } }, w: 2 },
  { t: '一位远行归来的老狐狸说，枯风口尽头的沙地里埋着一座倒塌的石塔，石塔上刻着不认识的文字。它抄了几个字回来，学者们至今没有破译。', uq: { exp: { windRidge: 3 } }, e: { lore: 3 }, w: 1 },

  // ============================================================
  // §七 4.6 教团事件（5 题 × 3 文风 = 15 条；sb:'D' br:'I'）
  // ============================================================
  // A1. 教令颁布／执行
  { t: '一张新教令贴在教令堂的石壁上，浆糊还没干透，一只老斥候凑近读完后把自己那只跛脚抬起来看了又看——它不太确定这条关于"行走之罪"的条文是否在针对它，但它的脚掌显然早已知道答案。', sb: 'D', br: 'I', uq: { b: { edictHall: 1 } }, e: { piety: 1 }, w: 2 },
  { t: '教令堂的羊皮纸今夜发出干燥的脆响，没有风，没有爪印触碰，但墨迹仍在向羊皮的边缘延伸，像一条正在寻找终点的路径；某只圣工匠在锻炉前停下动作，它的铁锤悬在半空，仿佛听到了羊皮纸在另一个房间里低声诵读自己。', sb: 'D', br: 'I', uq: { b: { edictHall: 1 } }, e: { piety: 1 }, w: 2 },
  { t: '一只幼狐发现教令堂门廊两侧张贴的教令，左墙第三十七条与右墙第十二条在描述同一种行为——面朝圣火窑跪下——但前者的罚则是抄经，后者是禁食三日，它不明白这两条教令究竟哪一条更早存在，或者它们是否在互相注视中各自生长。', sb: 'D', br: 'I', uq: { b: { edictHall: 1 } }, e: { piety: 1 }, w: 2 },

  // A2. 圣火试炼／圣火窑异象
  { t: '圣火窑的火焰今晚偏左三度，一只狂信者跪在窑口前试图与它谈判——它说火啊你烧得不对，火焰没有回答，但那只狐狸的胡须尖端开始卷曲，它觉得这是一种有立场的沉默。', sb: 'D', br: 'I', uq: { b: { holyKiln: 1 } }, e: { holyFlame: 2 }, w: 1 },
  { t: '圣火窑的炉膛今夜没有熄灭，火焰在木炭已经燃尽很久之后仍以同一个角度向左偏斜，像在听某个尚未到达的声音；圣工匠没有添柴，它只是站在边上等，它的影子被火光拉得很长，影子尽头触及了圣铁库的门槛。', sb: 'D', br: 'I', uq: { b: { holyKiln: 1 } }, e: { holyFlame: 2 }, w: 1 },
  { t: '一只狂信者盯着圣火窑里的火焰看了整整一夜，黎明时它对另一只狐狸说火焰的每一次跳动都是同一个跳动的精确复现；另一只狐狸没有回答，因为它想起自己昨晚在审判庭的铜镜里，也曾见过一模一样的火焰在镜面深处以相反的方向燃烧。', sb: 'D', br: 'I', uq: { b: { holyKiln: 1 } }, e: { holyFlame: 2 }, w: 1 },

  // A3. 信仰审判／审判庭场面
  { t: '审判庭的铜锣响了，一只被控告的铁匠站在中央，它低头看着自己的爪心——爪心里有一小块铁渣，它不记得是哪次锻造嵌进去的，但它决定用这块铁渣作为自己的全部辩护，因为它相信铁比言语更诚实。', sb: 'D', br: 'I', uq: { b: { tribunalHall: 1 } }, e: { piety: 2 }, w: 1 },
  { t: '审判庭的铜镜前，一只老祭司将右前掌按在一卷被翻到第七十三遍的案卷上，掌下的墨迹正在缓慢地渗入它的掌纹，那些纹路在很久以前的某个下午就已经长成了与案卷文字完全吻合的形状。', sb: 'D', br: 'I', uq: { b: { tribunalHall: 1 } }, e: { piety: 2 }, w: 1 },
  { t: '被审判的异端在审判庭的铜镜里看到了另一个自己正在宣读判决词，而坐于高台的法官长着它自己的脸，它无法确认是在受审还是在定罪，抑或这场审判在很久以前已由被审判者自己完成。', sb: 'D', br: 'I', uq: { b: { tribunalHall: 1 } }, e: { piety: 2 }, w: 1 },

  // A4. 狂信者集会／集体仪式
  { t: '十三只狂信者在圣铁库前的空地上围成一圈，它们低头吟诵的声音让地面上的铁砂开始轻微跳动；一只路过的商贩停下来看了片刻，它低头发现自己布袋里的铁币也在以同样的频率震颤，它不知道该不该为此交税。', sb: 'D', br: 'I', uq: { b: { holyIronVault: 1 } }, e: { piety: 1 }, w: 2 },
  { t: '吟唱从圣铁库的穹顶垂落，一队狂信者围绕未经锻造的铁矿绕行九圈，它们的呼吸在铁的表面凝结成白霜，铁块在白霜下发出细微的震颤，像在回应一种更古老的召唤。', sb: 'D', br: 'I', uq: { b: { holyIronVault: 1 } }, e: { piety: 1 }, w: 2 },
  { t: '一只幼狐偷偷溜进狂信者集会的场地，它学着身边成年狐狸的样子垂下头颅，却发现自己垂头的角度与场地上某块旧石板上的爪印凹陷完全一致；很多年后它会想起这个瞬间，并意识到那个凹陷正是它自己多年前踮脚站立时无意间留下的。', sb: 'D', br: 'I', uq: { b: { holyIronVault: 1 } }, e: { piety: 1 }, w: 2 },

  // A5. 圣工匠锻造圣铁的瞬间
  { t: '圣工匠的铁锤停在半空，它盯着砧板上那块烧得发白的圣铁，认真考虑要不要锤下去——它知道这一锤会改变铁的内部结构，而铁的内部结构可能比它自己的灵魂更清楚接下来该走向何方。', sb: 'D', br: 'I', uq: { b: { holyForge: 1 } }, e: { holyIron: 2 }, w: 1 },
  { t: '圣工坊的铁砧今夜发出了一声不属于任何锤击的嗡鸣，砧板上的圣铁在冷却之前将自己最后一缕赤红折成了一个不该出现在三维空间里的角度；圣工匠的铁钳空握在爪中，它知道那个角度正是铁的内部正在朝它说话的姿势。', sb: 'D', br: 'I', uq: { b: { holyForge: 1 } }, e: { holyIron: 2 }, w: 1 },
  { t: '圣工匠敲击圣铁，火星在半空凝固成从未存在过的星座图，锤砧上的金属逐渐呈现出一把钥匙的形态，剑刃的轮廓被它自己悄悄抹去了——那把钥匙可以开启其自身内部的虚空结构，它在锻造中解构了自己。', sb: 'D', br: 'I', uq: { b: { holyForge: 1 } }, e: { holyIron: 2 }, w: 1 },

  // ============================================================
  // §七 4.6 秘仪事件（5 题 × 3 文风 = 15 条；sb:'D' br:'M'）
  // ============================================================
  // B1. 秘仪殿独修者出关
  { t: '秘仪殿的石门向内滑开，一只闭关七天的感知者走了出来，它眯着眼睛适应外面的光线，然后低头看了看自己的影子——影子边缘多了一圈微弱的毛边，它不确定那是辉光还是自己太久没晒太阳长出来的幻觉。', sb: 'D', br: 'M', uq: { b: { mysteryHall: 1 } }, e: { spirit: 2 }, w: 2 },
  { t: '秘仪殿的门扉在第七日的黄昏裂开一道缝，那只闭关的感知者没有从门里走出来，而是从门缝透出的光线中重新凝聚成形；守门的幼狐注意到石阶上它走时留下的爪印已经被新的青苔覆盖，但青苔长出的方向与它入关那日风的方向一致。', sb: 'D', br: 'M', uq: { b: { mysteryHall: 1 } }, e: { spirit: 2 }, w: 2 },
  { t: '感知者在秘仪殿暗室中经历了没有刻度的漫长时日，推门而出时它确信自己只是进去了半息，但石阶上的落灰厚度却与三个季节前它曾目睹的某场葬礼完全一致，门内门外的流逝互不相认。', sb: 'D', br: 'M', uq: { b: { mysteryHall: 1 } }, e: { spirit: 2 }, w: 2 },

  // B2. 神露异象／化神池微光
  { t: '采集者蹲在化神池边看着液面上漂浮的微光，认真考虑了一会要不要把这层发光的油状物刮下来当灯油卖，最后决定算了——它不确定喝下这东西会看见神明还是只会换来一整夜的腹泻。', sb: 'D', br: 'M', uq: { b: { apotheosisPool: 1 } }, e: { ambrosia: 2 }, w: 1 },
  { t: '化神池今夜升起一缕淡金色的雾气，雾气在池面上方三尺处停住，在那里缓慢地团成一个近乎球体的形状；一只老祭司将神露坛浸入池中时，坛颈内侧凝结的露珠排列成了它多年前在禁典阁随手翻到但至今未懂的那一页的页码。', sb: 'D', br: 'M', uq: { b: { apotheosisPool: 1 } }, e: { ambrosia: 2 }, w: 1 },
  { t: '化神池的微光照亮的是另一个倒悬池底的化神池，池壁并没有被照见；一只注视液面的采集者在倒影中看到了自己的背面，那背面的眼睛正望向它永远无法抵达的池水深处。', sb: 'D', br: 'M', uq: { b: { apotheosisPool: 1 } }, e: { ambrosia: 2 }, w: 1 },

  // B3. 秘知碎片浮现
  { t: '幼狐在禁典阁的地砖缝隙里抠出半张残页，它费劲地拼读出那个不属于狐狸语言的词，感到颅骨深处一阵发痒，像有什么东西正在里面找位置安家，它想也许是该去吃点草药驱驱虫了。', sb: 'D', br: 'M', uq: { b: { mysteryHall: 2 } }, e: { gnosis: 1 }, w: 1 },
  { t: '禁典阁的某卷轴在无人触碰的情况下从第七层书架滑落，展开在"遗忘"这个词的释义上；一只刚好经过的感知者低头看向那个词时，发现自己脑海中一段从未发生过的记忆正在被缓慢地擦除，而擦除之前它看见了那段记忆的最后一个画面——正是它此刻低头看向卷轴的动作。', sb: 'D', br: 'M', uq: { b: { mysteryHall: 2 } }, e: { gnosis: 1 }, w: 1 },
  { t: '幼狐读懂了残卷上那段本无语义的墨迹，它意识到这些符号原本就是纸张本身就有的孔洞，从未被任何笔写过；阅读不过是让光线穿过这些孔洞，在它视网膜上投下早于文字存在的倒影。', sb: 'D', br: 'M', uq: { b: { mysteryHall: 2 } }, e: { gnosis: 1 }, w: 1 },

  // B4. 圣林的某一棵树
  { t: '伐木工绕着圣林中央那棵长满眼睛的树走了一圈，用手里的斧柄敲了敲树干，听到里面传来类似空罐子的回响，它决定把这棵树标记为不可用，毕竟没有哪只狐狸想要一只能盯着自己干活的房梁。', sb: 'D', br: 'M', uq: { b: { sacredGrove: 1 } }, e: { resonance: 1 }, w: 2 },
  { t: '圣林深处的老树在今夜褪去了树皮，露出内部交错缠绕的筋络，那些筋络随月光收缩，将地下的某种分泌物泵向枝头，树冠上没有叶片，只有密密麻麻的孔洞在替它呼吸。', sb: 'D', br: 'M', uq: { b: { sacredGrove: 1 } }, e: { resonance: 1 }, w: 2 },
  { t: '一只织丝师在圣林捡到一片叶子，叶脉的走向精确地复现了山谷溪流的河道图，包括那条三年前改道后已经干涸的支流；它拿给河獭使节看，河獭指认说那条支流在它祖先的祖先把河流弯折成那个角度之前就那样流了。', sb: 'D', br: 'M', uq: { b: { sacredGrove: 1 } }, e: { resonance: 1 }, w: 2 },

  // B5. 飞升前夕的"门前"瞬间
  { t: '独修者站在飞升阶梯的第一道门前，它用爪子触碰了一下门表面的纹理——那些纹理看起来像是某种生物的血管凝固后留下的印记——它觉得门背后大概什么也没有，但正因为什么也没有，飞升才有意义，就像一只狐狸终其一生在收集一个空的概念。', sb: 'D', br: 'M', uq: { u: { ascensionLore: 1 } }, e: { formSoul: 2 }, w: 1 },
  { t: '飞升阶梯的第一道门在今天的月光下呈现出一种半透明的质地——像是用凝露砌成的——独修者站在门前没有推，它知道这道门只需要它认为自己能够穿过去就会自己融化，而它还没有完全相信这一点，所以门还在那里。', sb: 'D', br: 'M', uq: { u: { ascensionLore: 1 } }, e: { formSoul: 2 }, w: 1 },
  { t: '独修者站在飞升阶梯的第一道门前时想起了自己第一次学会走路的那一天——它跌倒了三次才站起来——而如今这道门的高度恰好等于它第一次跌倒时视线到达的位置，它明白飞升的本质不过是重新走回那个摔倒的瞬间，然后决定不再站起来。', sb: 'D', br: 'M', uq: { u: { ascensionLore: 1 } }, e: { formSoul: 2 }, w: 1 },

  // ============================================================
  // §七 4.6 邦交事件（3 题 × 3 文风 = 9 条；sb:'T'）
  // ============================================================
  // C1. 邦书签订／盟邦正式建立
  { t: '那只代表山猫族在邦书上按爪印的使者按完之后盯着自己的爪印看了很久——它觉得自己的爪印比旁边那只河獭使者的爪印大了半圈，而这半圈大概会在未来某个时间里被解读为某种隐晦的宣誓，但它现在什么也没有说，只是把爪子收回到了披风下面。', sb: 'T', uq: { b: { embassy: 1 } }, e: { charter: 1 }, w: 1 },
  { t: '邦书签订的当夜，教令堂的墨水瓶自行倾倒，墨汁在石台上流成一条细线，恰好连接了邦书上按有山谷方爪印和山猫爪印的两个位置；守夜的祭司没有擦拭，它知道盟约一旦用墨汁再次确认，就会在盟约双方各自的记忆里种植一棵彼此镜像的树。', sb: 'T', uq: { b: { embassy: 1, edictHall: 1 } }, e: { charter: 1 }, w: 1 },
  { t: '邦书原件一式两份，一份留在山谷，一份被河獭使节带回河滩；但山谷那一份上的爪印在第七天开始缓慢地增加了一个——多出的那个爪印属于一只从未参与过谈判的白鹤，而河獭使节送回的信函中附上的那份抄本上，早已印有同一只白鹤的同一道爪痕。', sb: 'T', uq: { b: { embassy: 1 } }, e: { charter: 1 }, w: 1 },

  // C2. 异珍献礼
  { t: '水鼠商队送来一只用旧墟残片打磨的扁圆盘，盘面上蚀刻的纹路在月光下会轻微移位；一只老斥候把盘子翻过来发现底面刻着一行小字，它不认得水鼠文，但它觉得那行字大概是"此面向下"——而它刚刚把盘面朝下放了整整三个晚上。', sb: 'T', uq: { b: { embassy: 1 } }, e: { exotic: 1 }, w: 2 },
  { t: '雪鸮使者衔来一块通体透明的晶石，晶石内部封着一片早已绝迹的蕨类叶片；晶石被放置在秘仪殿的窗台上，每逢月圆之夜那片蕨叶便会缓慢地旋转半圈，仿佛在某个遥远地层下仍然有它的根系在生长，而月亮正是那棵无形之树的花。', sb: 'T', uq: { b: { embassy: 1, mysteryHall: 1 } }, e: { exotic: 1 }, w: 2 },
  { t: '旧墟遗民送来一卷记载其先祖迁徙路径的树皮地图，地图上标注的终点恰好是山谷的圣林中心那棵老树所在的位置；但地图制作于七百年前，而圣林的那棵老树年轮只有四百圈——除非地图当年标注的就是一粒尚未落地的种子的位置，那粒种子在三百年之后才落进泥土，开始长成这棵老树。', sb: 'T', uq: { b: { embassy: 1, sacredGrove: 1 } }, e: { exotic: 1 }, w: 2 },

  // C3. 远客到访
  { t: '考拉使节在桉树杈上睡了整个下午，一只好奇的幼狐在树下仰头数它的呼吸次数，数到第四十七次时考拉使节睁开一只眼睛说：我梦见你们山谷的时间过得比外面慢，而且我正在你的梦里被一只幼狐数着呼吸——你是那只幼狐吗。', sb: 'T', uq: { b: { embassy: 2 } }, e: { coin: 1 }, w: 2 },
  { t: '白鹤使节在化神池边站了一整个黄昏，它细长的倒影在水面上被涟漪拉扯成一道道近乎文字的笔划；守池的老祭司没有打扰它，因为它认出那些笔划的起笔方式与禁典阁中一卷佚名经文的起笔惯例完全一致——而那卷经文据信是由某只早已飞升的白鹤先祖口述的。', sb: 'T', uq: { b: { embassy: 2, apotheosisPool: 1 } }, e: { coin: 1 }, w: 2 },
  { t: '山猫使节第一次进入净林时，它爪下的落叶发出了一种它在故乡从未听过的碎裂声；它回头对陪同的采集者说这声音很像它童年时在一条早已干涸的河床里踩碎薄冰的声响，而采集者告诉它净林的地面从未结过冰——除非净林的土壤记得的是另一片土地上的冬天。', sb: 'T', uq: { b: { embassy: 2, cleanForest: 1 } }, e: { coin: 1 }, w: 2 },

  // ============================================================
  // §七 4.6 工业 C 阶段事件（5 题 × 3 文风 = 15 条；br:'I' phase:4）
  // ============================================================
  // D1. 煅烧炉的高温／精炼师的瞬间
  { t: '煅烧炉前，精炼师的耐热面罩内侧蒙了一层薄霜——那是它自己的汗被高温蒸干后又被炉膛反射的冷光凝结而成的；它透过霜层看向炉心那块正在变形的寒钛锭，觉得那块金属比它自己更清楚"忍耐"这个词的笔画顺序。', br: 'I', uq: { b: { calcFurnace: 1 }, phase: 4 }, e: { titan: 1 }, w: 2 },
  { t: '煅烧炉的炉膛在午夜降温的时刻发出一声细长的低吟，精炼师没有回头，它知道那是寒钛在冷却过程中正在将自己的内部结构重排为一篇它永不会读到的论文；炉壁上的温度计水银柱停在了一个刻度上，那个刻度恰好是它师父的师父第一次开炉时炉温的一半。', br: 'I', uq: { b: { calcFurnace: 1 }, phase: 4 }, e: { titan: 1 }, w: 2 },
  { t: '精炼师在煅烧炉出渣口捡到一块炉渣，炉渣的多孔结构在放大镜下呈现出星图的精确比例——是望远台上周记录的那片天区，但旋转了一百八十度；它去望远台核实时发现那片天区在本周确实发生了同样的旋转，而炉渣冷却的时间比天象变化早了整整三天。', br: 'I', uq: { b: { calcFurnace: 1 }, phase: 4 }, e: { titan: 1 }, w: 2 },

  // D2. 寒钛与合金的诞生
  { t: '第一块合金锭被推出精炼厂时，负责质检的老斥候把耳朵贴上去听了很久——它说这块合金的内部有一种细密的撞击声，频率大约是每秒三十七次，听起来像是金属在给自己数心跳；旁边的精炼师说那是热胀冷缩的余韵，但老斥候觉得热胀冷缩不会数数。', br: 'I', uq: { b: { refinery: 1 }, phase: 4 }, e: { alloy: 1 }, w: 1 },
  { t: '精炼厂的冷却池里，寒钛锭入水时升起的蒸汽在水面上方三尺处停留了七秒，在那七秒里蒸汽形成了一个近乎完美的十二面体；在场的三只精炼师同时停下了爪中的记录笔，它们都曾在灵图阁的某卷残页上见过同样的十二面体——那是某个早已失传的合金配方的几何签名。', br: 'I', uq: { b: { refinery: 1 }, phase: 4 }, e: { alloy: 1 }, w: 1 },
  { t: '合金配方被记录在纲要的第一百四十页，但一只矿工在翻阅时发现那一页的纸张纹理与它三周前在旧墟遗民那里看到的一片碎布完全相同；它问遗民那片碎布从何而来，遗民回答说那是它祖辈从一座从未存在过的煅烧炉废墟里捡到的。', br: 'I', uq: { b: { refinery: 1 }, phase: 4 }, e: { alloy: 1 }, w: 1 },

  // D3. 望远台第一次看到的星象
  { t: '望远台调试完成的当晚，观察员把镜筒对准天顶那颗最亮的星，但它从目镜里看到的不止那颗星——那星旁边还有一串排成螺旋状的微弱光点，像是某只比它更早的观察员把一组小型卫星挂在那里晾晒，忘记收走了。', br: 'I', uq: { b: { observatory: 1 }, phase: 4 }, e: { starchart: 2 }, w: 1 },
  { t: '望远台的第一张星图在显影液里浮现时，绘图师发现星图的右下角有一组它从未在天区见过的星点，那组星点连起来恰好是煅烧炉的结构剖面图；它没有修改图纸，它知道有些星辰在很久以前就已经熄灭，但它们的光仍在跋涉，而在跋涉的途中光学会了模仿它所经过的一切。', br: 'I', uq: { b: { observatory: 1 }, phase: 4 }, e: { starchart: 2 }, w: 1 },
  { t: '一只幼狐偷偷爬上望远台，把眼睛贴在目镜上看到了它此生第一片星野，它觉得那些星点排列的方式很像山谷里所有狐狸爪印的总和投射到夜空上的地图；多年后当它成为灵图阁的抄写员时，它在某卷古星图上发现了一张标注为"幼狐所见第一眼星图"的图版，其上星点与它的记忆分毫不差——那张图版绘制于它出生前。', br: 'I', uq: { b: { observatory: 1 }, phase: 4 }, e: { starchart: 2 }, w: 1 },

  // D4. 净林反治污染的微小迹象
  { t: '净林边缘一棵半枯的冷杉根部抽了一枝新芽，一只负责巡视的采集者蹲下来用爪尖轻轻碰了碰芽尖，觉得它在推开自己爪尖的力度与一只健康的幼狐推开奶碗的力度完全一致——它决定把这条写进今天的巡视日志，然后划掉，然后重新写上，然后再次划掉。', br: 'I', uq: { b: { cleanForest: 1 }, phase: 4 }, e: { wood: 2 }, w: 2 },
  { t: '净林的土壤在今夜黎明前裂开一条窄缝，缝里渗出一层淡得几乎看不见的绿意，没有地下水的腥气；巡视的斥候没有惊动任何同伴，它只是在日志上画了一个圈，它知道有些治愈在发生之前就已经完成了，而裂缝不过是愈合留下的记忆。', br: 'I', uq: { b: { cleanForest: 1 }, phase: 4 }, e: { wood: 2 }, w: 2 },
  { t: '一只伐木工在净林深处发现一截被它一年前砍伐的树桩上冒出了新枝，它记得那截树桩的年轮数量，但新枝上第一片叶子的叶脉数恰好等于年轮数的一倍半；它查阅了净林档案里关于这棵树的所有记录，发现最后一次有狐狸给它浇水是二百年前，浇水的狐狸与它长得一模一样。', br: 'I', uq: { b: { cleanForest: 1 }, phase: 4 }, e: { wood: 2 }, w: 2 },

  // D5. 钛库／混凝柱建筑的物理感
  { t: '钛库的混凝柱在今夜浇铸时，一只负责振捣的老矿工把耳朵贴在模板外侧听了很久，它说柱子里面的混凝土正在流淌的过程中对自己即将凝固这件事产生了轻微的抵触情绪——它在发出一种像叹息又像哈欠的声响，区别在于叹息会停而哈欠会传染。', br: 'I', uq: { b: { titanVault: 1 }, phase: 4 }, e: { concrete: 1 }, w: 2 },
  { t: '钛库的新混凝柱在脱模时暴露出一段不该存在的纹理——那是一道蜿蜒盘旋的螺旋线，与模板接缝或钢筋走向都对不上，从柱基一直延伸到柱顶，仿佛混凝土在凝固之前曾有一个念头从底部升起并在到达顶端之前被永久地封存在柱身之内。', br: 'I', uq: { b: { titanVault: 1 }, phase: 4 }, e: { concrete: 1 }, w: 2 },
  { t: '一只钻井工在钛库混凝柱的基础坑里挖出一块碎陶片，陶片上的釉质纹路与精炼厂冷却池底部的裂纹走向完全一致；但精炼厂建于钛库之后，而陶片的烧制年代据旧墟遗民鉴定比山谷最早的建筑还要早——它意识到冷却池的裂纹是在复现一片更早的陶器上的图案，并非随机生出。', br: 'I', uq: { b: { titanVault: 1 }, phase: 4 }, e: { concrete: 1 }, w: 2 },

  // ============================================================
  // §七 4.6 灵修 C 阶段事件（5 题 × 3 文风 = 15 条；br:'M' phase:4）
  // ============================================================
  // E1. 化形师的形魄变化
  { t: '化形师站在辉映台中央，它的形魄从尾尖开始逐渐褪去毛发的质感，变成一种像玻璃又像雾的半透明状态；它低头端详自己正在消失的左前掌，觉得这只掌终于比自己更早地抵达了它一直想去却描述不出的那种形态——一种不渴望被命名的形态。', br: 'M', uq: { b: { radianceDais: 1 }, phase: 4 }, e: { formSoul: 2 }, w: 1 },
  { t: '辉映台上，一只化形师的形魄在满月下完成了第七次蜕变；它褪去的那层旧形没有消散，而是在空气中绕了三圈后沉入辉映台的石缝，石缝里立刻长出了一种从未见过的藤蔓；藤蔓的每一片叶子都是它从前某一世形魄的轮廓，按时间顺序从下往上排列，而最顶端那片尚未展开的新叶正在无声地描绘它自己。', br: 'M', uq: { b: { radianceDais: 1 }, phase: 4 }, e: { formSoul: 2 }, w: 1 },
  { t: '化形师在镜中看见自己的新形魄时，发现那形态与灵图阁墙上某幅壁画里的一位先祖完全一致；但壁画的年代标注是未来的某一年——它查阅了所有档案后确认，那幅壁画是在它完成蜕变的同一刻被一只从未离开过灵图阁的文职狐狸画上去的，而那只文职狐狸从未见过它。', br: 'M', uq: { b: { radianceDais: 1 }, phase: 4 }, e: { formSoul: 2 }, w: 1 },

  // E2. 灵核诞生的瞬间
  { t: '灵核炉出料口滚出一枚新生的灵核，灵核表面有一圈微弱的辉光在顺时针流转；值守的精炼师用镊子夹起来对着光看，它发现那圈辉光里裹着一粒极小的气泡，气泡里有一个微缩的倒影——倒影是它自己正在用镊子夹着灵核看的样子，它觉得这枚灵核在诞生后的第三秒就已经学会了复读。', br: 'M', uq: { b: { coreForge: 1 }, phase: 4 }, e: { spiritCore: 2 }, w: 1 },
  { t: '灵核炉在成核的瞬间，整个精炼厂的光线向内坍缩了一瞬——所有方向的光都朝炉心弯曲了同一个角度，看着像变暗其实只是改了走向；那一瞬之后，新诞生的灵核安静地躺在冷却盘上，它的辉光向内沉降，没有向外发散，像一个正在默诵自身内部所有谜底的哑谜。', br: 'M', uq: { b: { coreForge: 1 }, phase: 4 }, e: { spiritCore: 2 }, w: 1 },
  { t: '这枚灵核在检测仪上显示出的辉芒频谱，与灵图阁里一卷密封卷轴上记载的某枚古代灵核数据完全一致；但密封卷轴被打开时，上面墨迹尚未干透，而卷轴的羊皮经多名长者鉴定来自三百年前——它意识到这枚灵核此刻在做的事，更像按照早已写下的参数重新发生一遍。', br: 'M', uq: { b: { coreForge: 1 }, phase: 4 }, e: { spiritCore: 2 }, w: 1 },

  // E3. 辉芒映照下的山谷
  { t: '净辉林的树冠今夜被辉映台溢出的一层淡青色辉芒笼罩，一只路过的商贩停下来抬头看，它觉得这些光在树叶之间流淌的样子很像货币在流通——每一片叶子都在借光、发光、折射光给下一片叶子，而树根在黑暗里记账。', br: 'M', uq: { b: { radiantGrove: 1 }, phase: 4 }, e: { radiance: 1 }, w: 2 },
  { t: '辉映台今夜将辉芒投射到净辉林的每一片叶子上，叶子在吸收辉芒后纷纷翻转过来，露出叶背银白色的绒毛；从高处看，整片净辉林变成了一面巨大而柔软的镜子，镜面照出的是山谷地层深处结晶窟里那些正在缓慢生长的晶丝所弯成的方向，天空没有出现在镜面上。', br: 'M', uq: { b: { radiantGrove: 1 }, phase: 4 }, e: { radiance: 1 }, w: 2 },
  { t: '一只织丝师在辉芒笼罩山谷的夜里发现，它白天织好的一匹晶丝缎上的辉光纹路，与净辉林此刻树冠间光斑的位置完全对应；它去核实织机上的图案记录，发现那匹缎是在辉芒映照前织成的，而织造时它只是按照一匹从灵图阁借来的古缎样品在仿制。', br: 'M', uq: { b: { radiantGrove: 1 }, phase: 4 }, e: { radiance: 1 }, w: 2 },

  // E4. 灵图阁里浮现的图案
  { t: '灵图阁的显图池里浮起一层新的灵图，值守的感知者俯身看了一会，扭头对旁边的化形师说：这张图在画我们灵图阁的平面图，包括显图池所在的位置，以及此刻你站在池边看图的姿势——化形师低头看了一眼池面，发现自己的倒影确实被画进去了，画得很潦草，但神情抓得很准。', br: 'M', uq: { b: { chartHall: 1 }, phase: 4 }, e: { spiritChart: 2 }, w: 1 },
  { t: '灵图阁的显图池在无风的午夜自行泛起涟漪，涟漪止息后池面上浮现的是一段正在缓慢书写的文字，没有谁认得这种笔法；文字的笔画方式是结晶窟最深处的晶丝生长方式——每一笔都先在笔划的两端同时出现，然后向中间汇合，仿佛句子在被写下之前就已经知道了自己的终点。', br: 'M', uq: { b: { chartHall: 1 }, phase: 4 }, e: { spiritChart: 2 }, w: 1 },
  { t: '一只文职狐狸在整理灵图阁旧档时发现，十七年前某张被判定为"绘制错误"的灵图上有一处不起眼的笔误；它将那个笔误放大后发现，那笔误精确地描绘了今年今日显图池上浮现的最新图案的轮廓——而十七年前那只绘图员在画下这笔时，曾在日志中写道：我的笔滑了一下，画了个毫无意义的小圈。', br: 'M', uq: { b: { chartHall: 1 }, phase: 4 }, e: { spiritChart: 2 }, w: 1 },

  // E5. 结晶窟深处的晶丝活动
  { t: '结晶窟最深处的晶丝今夜又长了三寸，值守的织丝师量完后在日志上写"晶丝仍在生长，方向与昨日一致，速度与昨日一致，对世界的态度似乎也与昨日一致"——然后它把最后半句划掉了，它觉得给晶丝赋予态度是一种不专业，但划掉之后它又在旁边画了一个表示赞同的小勾。', br: 'M', uq: { b: { crystalCave: 1 }, phase: 4 }, e: { crystalSilk: 1 }, w: 2 },
  { t: '结晶窟深处，一簇晶丝在黑暗中发出微弱的鸣响，频率低于任何狐狸的听觉范围，但织丝师放在石壁上的爪掌能感受到石壁在以同样的频率轻颤；它没有点灯，它知道晶丝在无光的夜里会唱一首只有石头能听懂的歌，而歌词的内容是晶丝对自己未来的形态所作的一系列假设。', br: 'M', uq: { b: { crystalCave: 1 }, phase: 4 }, e: { crystalSilk: 1 }, w: 2 },
  { t: '织丝师发现结晶窟石壁上有一道晶丝生长的路径，它沿着路径往回追溯，发现晶丝的起点是一枚三百年前就已经停止活动的灵核残片；它查阅了灵图阁的档案，发现那枚残片在三百年间一直在以肉眼察觉不到的速度朝晶丝的方向缓慢移动——它在移动的终点处裂开，而裂开的角度恰好等于晶丝第一次弯曲的角度。', br: 'M', uq: { b: { crystalCave: 1 }, phase: 4 }, e: { crystalSilk: 1 }, w: 2 },
];

// ===== 世界的回响（极稀有叙事） =====
const WD = [
  // 早春
  { t: '黄昏的屋顶铺着一层茸茸的微光。风从西边山口进来，带着远山融雪的凉气，吹动了晾在枝头的空篮子。篮子的影子在墙上慢慢旋转，像一个迟缓的日晷。之后，一切静下来。', s: 0 },
  { t: '灵狐祠褪色的木檐下，积水映出移动的云。一块石板因为昨夜的雨，浮现出深色的爪痕，很淡。水痕在蒸发，而苔藓正沿着边缘缓慢生长，向阴影内部探进。', s: 0 },
  { t: '山坡背阴处的残雪终于化尽了，露出底下湿润的、深褐色的泥土。一只狐狸用鼻尖轻轻拱开松软的腐殖层，触到了一颗刚刚探头的蕨类嫩芽，那蜷缩的姿态像紧握的拳头，绒毛上还沾着细小的水滴。它停住了，就那样感受着鼻尖传来的、微弱的、生命的凉意，许久没有动。远处，融雪汇成的小溪唱着清亮的歌，而这里，只有嫩芽在寂静中缓慢舒展的声响，和狐狸平稳的呼吸交织在一起。', s: 0 },
  { t: '积雪化尽，一只狐崽在溪边叼出一片被水泡软的落叶。叶脉上留有两排细小的牙印，间距恰好是它换牙前的尺寸。它试着咬合上去，旧牙印严丝合缝。那一瞬，去年的春天从叶脉里涌出，流遍它的上颚。', s: 0 },

  // 盛夏
  { t: '在堆着旧陶罐的角落，苔藓爬上了罐口，里面蓄着昨夜的雨水。有细小的虫浮在水面，一动不动，翅膀是透明的。它停在那儿，直到罐沿的阴影缓缓盖过它，把水面染成深绿。', s: 1 },
  { t: '整个山谷在午后沉入一种透明的寂静。没有声响，只有光在移动，在屋顶、石阶、晾晒的莓果之间流淌。这寂静有重量，压弯了草茎，也拉长了影子的形状。然后，远处传来一声极轻的回响，像是山谷自己在呼吸。', s: 1 },
  { t: '正午，灵狐祠的石阶被晒得发烫。一只狐狸侧身卧在最高一级的阴影里，下巴搁在凉凉的石板上。它的眼睛半眯着，望着檐下晃动的光影，瞳孔里映出光斑。它的胡须偶尔轻颤一下，仿佛在应和某种听不见的节拍。远处溪流的声响、近处苍蝇的嗡鸣，都混合成一片白噪音。它就那样躺着，胸膛缓慢起伏，似乎与石阶、阴影、光影融为了一体，时间在它周围变得粘稠而透明。', s: 1 },
  { t: '午后闷热，连风都停滞了。一只狐狸将整个下颌轻轻贴在月光井冰凉的井沿上，眯起了眼。井水的凉意丝丝缕缕地渗上来，透过皮毛，镇住了夏日的浮躁。它并不为喝水，只是那样贴着，仿佛在聆听井深处那亘古的清凉。阳光在它火红的背脊上流淌，滚烫；而井沿的石头与它相贴的那一小块皮肤，却像浸在初春的溪水里。这冷与热，在它身上划出了一道寂静的分界线。', s: 1 },
  { t: '午后最热的时辰，一只狐狸蹲在莓果园的阴影里。一只蜻蜓飞来，把它的耳尖选为停机处。它一动不动，斜着眼看蜻蜓翅膀上淌下的光。蜻蜓飞走后，耳尖还残余一阵细碎的拍翅震感。它回头对伙伴说："南坡的刺莓熟了。"伙伴歪着头看它。', s: 1 },

  // 金秋
  { t: '储藏室的木架上，一只去年的空蜂巢，在某个午后开始渗出琥珀色的光。那光很粘稠，沿着木纹缓慢爬行，滴落在下层晒干的蘑菇上。蘑菇收缩了一下，散发出更浓郁的、尘土般的气味。', s: 2 },
  { t: '一只幼狐在莓果园的垄沟尽头坐下了。它没有看浆果，而是仰头盯着缠绕藤蔓的木架。一阵极细的风穿过，藤上的一片老叶颤动了几下，背面翻出了银白色。幼狐的耳朵转向那片叶子，鼻尖微湿，就这么一动不动，直到叶子重新静止，翻回深绿。它眨了眨眼，尾巴尖轻轻扫过泥土，然后起身，无声地走进了旁边更深的草丛。', s: 2 },
  { t: '月光井边，一只年长的狐狸静静地坐着。它没有低头看水，只是望着井口上方的夜空。一片云缓缓飘过，遮住了月亮，井台陷入更深的幽暗。就在云层最厚的时刻，井水深处似乎有微光一闪，很微弱，像遥远的回应。狐狸的耳朵不易察觉地动了一下，它没有去寻找光源，只是继续望着那片遮蔽月亮的云，喉咙里发出一声几乎听不见的、悠长的呼气。然后，它转过身，踏着来时的脚印，慢慢离开了。', s: 2 },
  { t: '风吹过打谷场，卷起金黄的草屑和尘埃。一只狐狸坐在一堆新收的草垛旁，专注地看着风中打旋的几颗带翼的种子。种子起起伏伏，被气流托着，越过篱笆，飞向远处那片未知的树林。狐狸的目光追随着它们，直到那些小白点消失在林地的边缘。它低头，用前爪拨弄了一下身边一颗未被风带走的种子，若有所思，然后小心地用鼻尖将其推入一道松软的土缝。', s: 2 },
  { t: '一只狐狸在满院落叶里翻身打滚。站起时头顶粘着一片最大的红叶，它昂首穿过庭院。踩到自己的尾巴，跌了一跤，红叶滑落，恰恰飘上供桌。它垂着耳朵想走，却看见红叶边缘无声燃起一圈冷蓝色的薄焰。火焰的高度，恰好够点亮它眼睛里的惊奇。', s: 2 },

  // 寒冬
  { t: '寅时与卯时之间，月光井底传出一记微震。水面从中心漾开一圈没有来源的涟漪，涟漪里翻出一枚松针，褐色的鳞片排列齐整，带着不属于这个季节的冷。松针沉底之前，整口井短暂地变成了一只灰色的眼睛。', s: 3 },
  { t: '冬日，一场小雪过后，所有声音都被吸收了。积雪压在屋顶的茅草上，屋檐下挂起细小的冰棱。偶尔，一片雪花从树枝上滑落，掉进松软的雪堆里，发出"噗"的一声轻响，随即又被无边的寂静吞没。雪地上，只有阳光留下的、淡蓝色的影子在缓慢移动。', s: 3 },
  { t: '第一场雪静静地落了一夜，清晨，世界一片松软的洁白。一只狐狸从温暖的洞穴中探出头，在雪地上印下一串清晰的爪印。它走到月光井边，井水没有结冰，幽深如墨，将飘落的雪花温柔地吞没。狐狸低头饮水，水面倒映出它口鼻处升腾的微弱白气，和它沉静的眼睛。饮罢，它抬头望向被雪洗净的湛蓝天空，许久，然后抖了抖身上雪花。', s: 3 },
  { t: '大雪停后，一只狐狸在月光井的冰面上用尾巴扫出自己的名字。笔画歪斜，最后一撇戳进一道冰裂细缝。它趴下来，把鼻尖贴住那条缝，呼出的热气在冰层下映出一枚凹陷的古老符文。', s: 3 },

  // §五 2.5 远方文明传闻（通用世界回响，需选过主线后才出现）
  { t: '商队带来一个传闻：山脉另一侧的谷地里，那边的狐狸在地底挖出了一种会燃烧的黑石头。据说那里的天空总是灰蒙蒙的，但夜晚比谁都亮。商队的脚夫说这话时，目光复杂，像是羡慕，又像是庆幸。', uq: { u: { branchLore: 1 } } },
  { t: '一位远行归来的斥候说，它在东边密林深处见到过一座没有烟火的村庄。屋顶上漂浮着淡蓝色的光球，溪水逆流而上汇入一口石井。住在那里的狐狸走路没有声音，说话像唱歌。它觉得自己不该再往前了，于是转身回来。', uq: { u: { branchLore: 1 } } },
  { t: '驿道尽头捡到一片碎铁牌，上面刻着不认识的文字和一个齿轮形状的徽记。翻过来，背面是一行小字，勉强能辨认："通往未来的路，比通往过去的路更窄。"铁牌的边缘有烧焦的痕迹。', uq: { u: { branchLore: 1 } } },
];

// ===== 远行目的地 =====
const EXD = {
  nearHill: {
    n: '荒丘', days: 100, narrative: true,
    d: '远山外背风处的一片低丘。',
    cost: [{ r: 'berry', a: 200 }, { r: 'coin', a: 8 }, { r: 'charm', a: 4 }],
    uq: { b: { trailroad: 2 }, u: { longJourney: 1 } },
    rewards: [
      { r: 'stone', min: 10, max: 20, prob: 1 },
      { r: 'leather', min: 1, max: 3, prob: 1 },
      { r: 'spice', min: 1, max: 1, prob: .4 },
    ],
    tip: ['石圈空着，但风把每一块石头都磨圆了。'],
  },
  forest: {
    n: '密林', days: 150, narrative: true,
    d: '更远处的一片古老森林。',
    cost: [{ r: 'berry', a: 300 }, { r: 'coin', a: 10 }, { r: 'charm', a: 8 }],
    uq: { b: { trailroad: 3 }, u: { longJourney: 1 }, exp: { nearHill: 1 } },
    rewards: [
      { r: 'wood', min: 15, max: 25, prob: 1 },
      { r: 'leather', min: 2, max: 4, prob: 1 },
      { r: 'silk', min: 1, max: 1, prob: .4 },
    ],
    tip: ['树和树之间的距离整齐得不像野林。'],
  },
  oldRuin: {
    n: '旧墟', days: 30, narrative: true,
    d: '山谷北端的废弃古城。',
    cost: [{ r: 'berry', a: 50 }, { r: 'coin', a: 2 }],
    uq: { b: { trailroad: 1 } },
    rewards: [
      { r: 'iron', min: 3, max: 6, prob: 1 },
      { r: 'ancCoin', min: 1, max: 2, prob: 1 },
      { r: 'spice', min: 1, max: 1, prob: .25 },
      { r: 'remnant', min: 1, max: 1, prob: .1 },
    ],
    tip: ['有的门还开着，像在等谁回来吃饭。'],
  },
  cloudRidge: {
    n: '云岭', days: 60, narrative: true,
    d: '西北方常年云雾的高山。',
    cost: [{ r: 'berry', a: 100 }, { r: 'coin', a: 5 }, { r: 'charm', a: 1 }],
    uq: { b: { trailroad: 1, watchtower: 1 }, exp: { oldRuin: 10 } },
    rewards: [
      { r: 'charm', min: 3, max: 5, prob: 1 },
      { r: 'ancCoin', min: 2, max: 3, prob: 1 },
    ],
    tip: ['从那上面看，村子小得像一个念头。'],
  },
  // ===== v0.14 文化远行（占位名） =====
  windRidge: {
    n: '枯风口', days: 80, narrative: true, wip: true,
    d: '山脊断裂处的天然隘口。',
    cost: [{ r: 'berry', a: 80 }, { r: 'coin', a: 4 }],
    uq: { b: { trailroad: 3 }, polity: true, exp: { forest: 1 } },
    rewards: [
      { r: 'scroll', min: 2, max: 4, prob: 1 },
      { r: 'spice', min: 1, max: 2, prob: 1 },
      { r: 'silk', min: 1, max: 1, prob: .1 },
      { r: 'ancCoin', min: 5, max: 10, prob: 1 },
    ],
    tip: ['山脊断裂处的天然隘口。'],
  },
};

// ===== 叙事碎片 =====
const NARR = {
  oldRuin: [
    '城墙根下翻出的第一块陶片，上面写着一行字——今日迁户十二，自东谷来，授田各三亩。东谷。一只狐狸把陶片贴在鼻子上看了很久，然后说了一句让整支队伍安静下来的话：陶片上的它们就是我们的邻居，传说里说的也就是它们——我们的祖先去过那里，被它们记在了陶片上。那天傍晚整支队伍围坐在废墟中央，把捡到的陶片一块一块拼起来，像在拼一个打碎了的家谱。',
    '铁器集中在废墟西北角。最先出土的是一截铁针，锈得快断了，针孔里还留着一小段炭化的线，爪子一碰就碎。拿针的狐狸说它们除了砌石头还会缝东西。接着翻出了刀、钉、不知用途的小钩，还有一枚铜印。一只老斥候蹲在地上把碎铁片排成一排，从大到小，从粗到细，排完之后沉默了一会儿，说：它们有铁匠，有裁缝，有工匠——这是一座城，村子撑不起这种规模。',
    '枯井井底堆着骨头。不是猎物的骨头——上面刻了字。和陶片的记账文字不同，骨头上的字很小很密，挤在巴掌大的一块骨片上。它们用炭粉填进凹槽拓出字来读：祭祀用羊三，鼓乐齐鸣，祈来年雨水。背面还有一行，字迹更潦草：雨来了，祭坛塌了半边，明年修。一只狐狸读完笑起来，笑到一半停住了，说：它们在记自己的日常。祭坛塌了、明年修，诸如此类。这些骨头算它们的日记，算不上档案。',
    '广场东侧有一排幼崽的坟墓，排列整齐，头朝东，每座墓旁一个很小的陶罐。打开陶罐，里面是炭化的粟，颗粒分明。十七座墓，十七个陶罐。一只年轻的狐狸数完之后没说话，因为根本不用解释：粟是给幼崽路上吃的，它们相信幼崽死后会去一个很远的地方，要带干粮。这个习俗和现在一模一样。那一刻在场的队伍都明白了为什么这座废墟让它们觉得熟悉——熟悉的是建筑里的狐狸和它们做着同样的事，建筑本身倒在其次。它们把陶罐按原样放回去，盖好土，在上面压了一块圆石。',
    '广场正中央那棵树的下面埋着一块巨大石盘，直径大概两只狐狸伸开爪子那么宽，盘面刻着同心圆，圆心处有一个孔。这个孔的形状和之前在西北角找到的那枚铜印的柄完全吻合。铜印插进去，转动，石盘跟着转，每转一格，顺着盘边的标记望出去，对应的是一座不同的远山。这是一个方向标记台，跟祭坛没关系。旧墟的狐狸站在这里，转动铜印，让举杆狐狸指向要出发的方向。一只狐狸说：它们一直在指路，指给离开的人看，指给留下来的人看，指给自己看。',
    '废墟外围的弃土里筛出了二十三颗牙齿，全部来自成年狐狸。其中七颗的牙冠上有褐色环纹——釉质发育不全。老斥候说这是幼崽时期严重营养不良留下的永久印记，是饥荒造成的，跟瘟疫无关——这么多狐狸小时候同时饿过肚子，说明这座城市在二十几只幼崽的童年时期发生过一次严重的粮食危机。有人活下来了，带着这些长褐环的牙齿活到成年，在废墟里工作、缝纫、刻字，最后死在这里。牙齿的主人没有离开过旧墟，一座城从头到尾都在它们的牙上。',
    '一段横梁半埋在土里，被藤蔓缠着，上面有字，是用铁刀刻的，笔迹和骨片上的日记不同——这只狐狸的手很稳，一笔一画都不潦草，像刻之前想了很久。信中写道：我们从东谷搬来的时候，这里只有石头。我们砌了墙，挖了井，种了树，生了幼崽，幼崽又生了幼崽。井水咸了那年开始，我们决定往南走，那边有更大的河。我们没有消失，我们只是搬家了。没有称呼，没有署名，但整支队伍都知道它是写给谁的——写给发现这封信的陌生狐狸，是我们。',
    '发现横梁之后的第三天，它们在城南找到了粮仓。是一个半地穴式的圆形土坑，坑壁拍得光滑坚硬，坑底还残留着一层炭化的谷物壳。规模很大，大到一只狐狸站在坑中央看不到坑沿。老斥候沿着坑边走了一圈，指给大家看坑壁上的一道裂缝：从顶部一直裂到坑底，填满了细腻的黄土。这道裂缝跟爪子无关，是土地本身的问题——地下水沿着裂缝渗进来，盐分上升，整个粮仓的粮食都坏了。井水咸了，粮仓坏了，它们存不住粮也靠不了这口井。这就是为什么它们决定往南走，那边有更大的河。',
    '遗物的分布顺序拼出了撤离计划的全貌。最先搬空的是粮仓，连谷壳都没剩多少，能吃的都带上了。其次是工作区，大件铁器还在，小件细巧工具全不见了——铁针、小刀、挂钩，这些最需要手工制作的东西被优先带走。最后是住房，锅碗瓢盆原样放着，不是仓皇出逃。刻名墙上最后那个刻了一半的名字停在一个不上不下的笔画上，刻刀整齐地搁在墙角——是稳稳放好的，没有匆忙丢弃的样子。把所有线索连起来，结论是一张时间表：工匠先走，带着工具去新的河边建房子；农夫第二批，带着种子；最后一批是老狐狸和刻名者。它们在空城里走完最后一圈，检查每一个角落，把想带走的东西带走了，把该留下的留下了，用至少三年时间分批撤离，最后一只狐狸搁下刻刀，关上门，朝南走了。',
    '春天再去的时候，它们在旧墟南边的山坡上发现了一条很老很老的路，被落叶和泥土盖了几百年，但路基还在——碎石铺的，宽度刚好够两只狐狸并肩走。路的方向朝南。斥候沿路走了三天，第三天傍晚在一条大河的岸边发现了一处新的木头废墟，木柱已经朽成土包，但排列得整整齐齐，和旧墟的广场布局一模一样，连朝向都一致。广场中央也有一棵树。它们在树下挖到了一块陶片，上面刻着一行字：井水还是甜的。而那块陶片上的笔迹，和横梁上那封信的笔迹，出自同一只爪子。',
  ],
  cloudRidge: [
    '登云岭的决定，是在旧墟横梁那封信被发现之后才正式做出的。信上说它们往南走了，但没有说它们有没有回头看，有没有在某个高处站一下，望一眼自己留下的城。一个年轻的斥候在篝火边说：如果我是它们，我会找个最高的地方，能望得最远的地方，把路标留在那里。这句话让整支队伍同时抬头看向了西北方那道终年云雾缭绕的山脉。第二天天没亮，它们就出发了。',
    '上山的路上，它们发现了第一枚狐狸掌印。印在石阶旁边的岩壁上，五指并拢，按得很深，掌垫的纹路在石面上保留得比任何刻刀都清晰。这枚爪印是故意按上去的——按完之后有人用炭灰沿着掌印描了一圈，让它在石头上更显眼。然后每隔一段就会出现一个，掌印有大有小，按的位置有高有低。最低的那个只有拇指大，是一个幼崽的爪印，按在一个需要蹲下来才能摸到的石缝旁边。一只狐狸说：这一串看着像在排队，不像随意做的标记。走在前面的按一个，后面的跟着按一个。它们把全家福留在了石壁上，从山脚一直排到云深处。',
    '岔路口的路标是用三块石头叠起来的。最底下那块最大，深深嵌在土里，上面两块依次减小，互相咬合得不用任何泥土都不会歪倒。这三块石头是精心磨合过的，绝非随手堆起；石头的接触面上都有专门凿出来的卡槽。它们把最上面那块石头翻开，在背面看到了字：左，旧墟来者。右，南河谷新地。这行字解答了一切。旧墟的狐狸在往南迁徙的途中，有一部分选择离开队伍，登上云岭——为的是刻路标，跟看风景无关。它们在这里设了指路点，为的是让后面来的狐狸能知道往南怎么走，也为的是让将来从南边回来的狐狸能找到回旧墟的路。它们没有忘记任何方向。',
    '峰顶平台上的那块扁平石头，就是旧墟石板广场的那一块。两块磨得一样平，凿着同样的同心圆，连圆心孔的尺寸都完全吻合，但终究是两块石头，并非同一块。它们把旧墟带回来的那枚铜印插进去，转了三个刻度，铜杆指向了正南方——南河谷的方向。然后它们发现石头的底座上另有刻字，字很小，藏在背面，对着山谷的位置：此峰可观两处。一是旧墟，二是新河。晴天可见炊烟。一只狐狸跪下来，把眼睛凑到铜杆顶端的扁圆孔上一看，扁圆孔正好框住了很远很远的地方，那里隐约能见到一条银色的细线，正是它们春天在南边找到的那条大河。这只铜杆其实是个望孔，标记方向只是它的副作用——举杆的狐狸通过它看着另一座城，一座它们即将抵达的城。站在云岭上，它同时看到了自己离开的地方和将要去的地方。',
    '封在岩石侧面松脂里的那只幼崽爪印，是所有发现里最小的一个。松脂来自山下的矮松林，山上常见的松树产不出这种成色——它是被人特意带上来的，裹着还没凝固的松脂一路爬到峰顶，涂在岩壁上，然后让一只幼崽把爪印按进了松脂里。最后它把一撮自己尾巴尖的毛也封了进去。几百年过去了，松脂变成了半透明的琥珀，那只幼崽的爪印和那撮灰毛还保持着刚按进去的姿势，像是昨天才发生的事。它们没有文字记录这场攀登，但它们用松脂封存了一家三代走完这段路的身体档案。老斥候把琥珀凑近鼻子闻了闻，说：还有松油的味道，它们刚走不久。这句话让在场的整支队伍都回头看了看来路，好像真的会在雾里看见一只灰毛狐狸领着幼崽，正从山顶往下望。',
    '在望孔的延伸线尽头，它们把沿途收集到的所有坐标信息编织进一幅完整的地图：旧墟的瓦当朝向、刻名墙的东南偏角、粮仓的冷季存粮、云岭石阶上由大至小按下的掌印、岔路口的定向石标、封在松脂里的幼崽爪印——所有这些选择，都不是偶然。旧墟的狐狸在城墙地图上标注了一条完整的、从旧墟到南河谷的迁徙路线，云岭是其中预设的第三座定向点，而在南河谷新城的遗址中，它们找到了与旧墟结构对偶的陶罐、向南继续延伸的石子路基、以及刻着"此去有水"的火成岩石碑，碑文笔迹和云岭峰顶那块"此峰可观两处"完全吻合。也就是说，它们把方向标定在了云岭的最高处，给后来者——给几百年后的我们——留了一条有据可查的路。做完这些之后，它们下山往南走了。上山时是四只狐狸，下山时还是四只，但它们觉得自己已经变成了一条路的一部分——路的这一端连着它们的爪子，那一端连着祖先的爪子。',
    '它们在峰顶平台边缘的岩石上发现了一处被凿掉的字。凿痕很深，凿了不止一次，像是在反复确认一个字都不剩。但在侧对着晨光的一个极偏的斜角下，残留下来的最浅的一道笔划在特定角度逆光时现出一道锐利的暗痕——那是一道指方向的箭头，朝南，并非一个字。凿掉它并非要隐藏它，恰恰相反。它们把字抹平，是不想让风雪磨损它，想让这个方向变成一个只有在日出时分、从特定的角度才能看见的光影标记。这种做法把信息保存得最深——藏进光里。一只狐狸对着那个角度站了很久，然后把眼睛移开，说了一句话：它们连指路都不愿意直说，它们留给我们的，都是要自己去找的。',
    '它们在峰顶停留的最后一天傍晚，雾散了——整片云海在下沉的落日中骤然塌陷，露出群山之间所有隐蔽的褶皱。一个年轻的斥候抓住了这个珍贵的窗口期，借着暮色和金星的微光，在望孔正南方向极远处的山脉缺口里，辨认出了一道斜出的山脊——像是人工修过的台地。它立刻转动铜印，将视线从正南偏西调整了一个刻度，当缺口、山脊与举杆狐狸的扁圆孔三点一线时，它看清了那道山脊上有一块半裸露的石面，石面上隐隐有一条垂直线——那是一根石碑，并非裂缝。几百年过去了，它还在那里，还站着。铜杆的扁圆孔构成了一道跨越代际的准星——举杆的狐狸穿过它看着将去的新河，后来的狐狸穿过它看见了祖先留下的碑。它们带着这个发现下山了。从今往后，狐灵祠的香火朝着正南偏西一个刻度的那道石门，那里有祖先留给它们的路标，站在那里，可以同时望见旧墟、新河、以及我们至今还在找的第三座城。',
  ],
  nearHill: [
    '远行队在干涸河道边遇到一只狂躁的土拨鼠。它正拼命往水里丢碎石和枯枝，试图筑坝拦住仅剩的细流。水从缝隙里漏走，它就急得用肚皮去堵，结果被水流冲得滑进水坑，喝了好几口泥水。带队的狐狸看不过去，从行囊里拿出一点采石场带出来的黏土，替它糊在缝隙上。水确实积高了一小洼，土拨鼠高兴得手舞足蹈，一头扎进水洼里洗澡。结果水太浅，它一头撞在底部的碎石上，顶着满头泥巴晕乎乎地转圈。远行队留下几颗野莓当医药费，趁着它还在转圈赶紧溜走，身后只留下水洼里扑腾的泥点子。',
    '队伍在正午的荒丘上行进，一只灰背鹰盯上了走在最外侧的小狐狸。鹰从云层俯冲而下，利爪擦着狐狸的背皮掠过，揪下了一撮毛。远行队迅速挤进两块巨石的夹缝里，把背囊顶在头上当盾牌。鹰在石头上盘旋，每次扑击都用爪尖敲出刺耳的刮擦声。僵持持续了很久，直到一只白鹤从远处飞过，鹰的注意力被更大的猎物吸引，振翅追了过去。远行队趁机冲出夹缝，一路狂奔直到跑出荒丘的边界，才敢停下来检查那个被鹰爪撕破的背囊——里面的香料撒了一半。',
    '起风的傍晚，远行队在枯草丛里发现一只迷路的小羊。它瘦得肋骨分明，冲着风声咩咩叫唤，腿抖得站不稳。队伍里年纪最大的狐狸走过去，把随身带的半块干粮嚼碎，一点一点喂进小羊嘴里。吃完东西，小羊就跟在狐狸身后，怎么赶都不走，甚至拿湿漉漉的鼻子去拱狐狸的前爪。远行队只好带着它赶路，好在没走多远就遇见了举着火把来找羊的牧人。牧人把小羊抱进厚厚的毡衣里，检查完四肢后，回赠了远行队一壶刚挤好的羊奶。那只老狐狸喝了一口羊奶，舔了舔嘴边的白胡子，继续带路朝荒丘深处走去。',
    '荒丘背风处有一条浅溪，三只河獭在溪流中间叠了一排圆木，硬生生造出个过路关卡。领头的河獭抱着一根树枝，拦住远行队，要求留下两卷丝帛才准过河。远行队绕到下游看了看，溪水只没过脚踝，根本不需要走桥。于是带队的狐狸大摇大摆地踩着水过了河，另外两只紧随其后，水花溅了河獭一脸。三只河獭气得在圆木上直跺脚，脚下一滑全摔进水里，辛辛苦苦搭的木桥也跟着散了架。远行队在河对岸抖了抖脚上的水，听着河獭在浅水里扑腾的咒骂声，头也不回地往前走。',
    '荒丘的清晨常起大雾。远行队走进一片白茫茫的雾气里，只听见前方传来叮叮当当的铃铛声。队伍循着声音摸索，在雾气最浓的地方踢到一个沉甸甸的布袋。打开一看，里面装满古币，币面上沾着湿漉漉的泥土。铃铛声就在耳边，却怎么也看不见摇铃的活物。一只胆大的狐狸抓起一把古币摇了摇，那铃铛声竟跟着停了。雾气很快散去，眼前只有几丛枯草和风吹过的沙沙声。远行队把布袋扎紧背在身上，谁也不知道这袋东西是从哪来的，只知道它现在归狐狸谷了。',
    '一只穿着破破烂烂彩衣的流浪艺人蹲在土坡上拉琴。琴弦断了两根，拉出来的声音像是在锯木头，引得周围几只土拨鼠纷纷钻进洞里堵住耳朵。远行队路过时，艺人拦住去路，非要演奏一首新曲换点吃食。队伍刚想掏野莓，艺人已经扯开嗓子唱了起来，调子跑到了几里外，惊飞了附近的全部飞鸟。带队的狐狸赶紧把一整袋野莓塞进艺人怀里，趁它低头翻找食物时，带着队伍飞快地逃离现场。那跑调的歌声还在荒丘上回荡，远行队跑出好远才敢放慢脚步，耳朵还在嗡嗡作响。',
    '深秋的荒丘冷得刺骨。远行队在背风的岩石下生起一小堆火，煮着铁锅里的野莓汤。一个裹着旧毡毯的孤独旅人慢慢挪过来，在火堆旁坐下，伸出冻僵的手取暖。队伍往锅里又丢了几颗野莓，用木碗盛了一碗红彤彤的热汤递过去。旅人接过木碗喝了一大口，僵硬的脸庞终于泛起血色。它没说话，只是从怀里摸出一张画满线段的卷轴，展开给远行队看。原来它是个测绘者，正在丈量荒丘的地貌。喝完汤，旅人在卷轴边缘画了一只小狐狸，然后收起东西朝荒丘另一侧走去。',
    '狂风卷着沙尘席卷荒丘，远行队根本睁不开眼。队伍用长绳把每只狐狸拴在一起，低着头艰难顶风前行。风沙越来越大，打在身上生疼，走在最前面的狐狸一脚踩空，半个身子陷进松软的沙坑里。它拼命挣扎，沙坑却在不断塌陷。后面的狐狸立刻收紧绳子，四只脚死死钉在坚硬的地面上，一点点把同伴往外拽。每拖出一点，风沙就把绳子往上埋一层。等风沙停息，远行队已经彻底偏离了方向，背囊里也灌满沙子。队伍抖净皮毛里的尘土，重新辨认太阳的方位，继续赶路。',
    '远行队在干裂的泥地上休息，一只尾巴亮蓝色的沙地蜥蜴窜出来，叼走了狐狸放在石头上的半块干粮。小狐狸气坏了，拔腿就追。蜥蜴跑得极快，还专挑裂缝和陡坡走。小狐狸跟着它上蹿下跳，绕着同一个土包跑了三圈，最后脚底一滑，一头栽进软绵绵的干草堆里。蜥蜴停在远处的石头上，嘴里的干粮已经吃完了，正冲着狐狸吐舌头。小狐狸爬起来，甩掉头上的草屑，气鼓鼓地走回队伍。带队的狐狸递给它一块新的干粮，顺便敲了敲它的脑袋，警告它别再追那条贼蜥蜴。',
    '初冬的雪比往年来得早，远行队被困在荒丘的半山腰。队伍找到一处废弃的牧人棚屋，四面漏风，好在屋顶还算完整。几只狐狸挤在角落里，用捡来的枯枝生起一堆火，把从铁匠铺带出来的废旧铁片垫在火边烤热，当成暖炉贴在肚皮上。外面的风雪呼啸了一整夜，棚屋里却暖烘烘的，大家挨在一起打盹。第二天清晨推开门，整片荒丘被白雪覆盖，天空晴朗得没有一丝云。远行队深一脚浅一脚地踩出一条路，身后的脚印很快又被新雪填平，仿佛这片荒丘上从来没有谁停留过。',
  ],
  forest: [
    '远行队越过荒丘最远的界标，第一次踏进密林的地界。空气变得潮湿，光线从头顶筛下来，照出一条条笔直的光柱。那些树排成整齐的行列，间距像是用绳子量过，枝桠在极高处搭成拱顶。一只狐狸抬头望，看见几十丈高的半空中悬着腐朽的木板，那是废弃树屋的残骸，被藤蔓缠成骨架。队伍里传来压低的议论，有人推测这片林子曾经住过某种比狐狸更灵巧的东西。话音未落，头顶枝叶哗啦一响，一道灰影掠过，落在前方最粗的那棵橡树分叉处。那是一只老迈的鼯鼠，毛皮灰白，眼睛却亮，正俯视着地面上的不速之客。',
    '那只鼯鼠自称灰绒。它没有请远行队上树，而是展开皮膜，从高处滑到低处一根横枝上，与领头的狐狸平视。灰绒说这些树是行道，很久以前的栽种者走后，由它的族群照管。它问狐狸从何处来，队里一只年轻狐狸便取出从荒丘带回来的一小包干香料，搁在树根上。灰绒嗅了嗅，没说什么，只是转身朝树冠深处跃去，尾巴在空中划了个弧线，示意整支队伍跟上。它们沿着由枝桠和藤桥组成的通道攀爬，那些通路狭窄却平整，分明是修过的。最高处的树屋比远看更破败，只剩三面墙和一张吊床，但吊床上晒着干果，说明这里仍住着活物。',
    '第二天清晨，小叶出现了。这只幼年的鼯鼠比灰绒小两圈，尾巴蓬松，对狐狸充满好奇。它趁远行队在修补一段藤桥时，叼走了一块风干的莓肉饼，蹲在远处树枝上咔嚓咔嚓地嚼。领头的狐狸没有追赶，反而又掏出一块放下。小叶迟疑片刻，把第二块也拖走了，这次它送回来一颗松果作为交换。灰绒从树屋里探出头，对着小叶吱了一声，像是责备，又像提醒。那一整天，远行队都在加固树冠西边的通道，小叶则在旁边学样，把藤条缠得乱七八糟。傍晚收工时，吊床上多了一小堆剥好的坚果，灰绒说是房租。',
    '灰绒带着远行队往密林北边去。树冠在那里变矮，阳光能照进底层，照亮一片长满蓝苔藓的空地。空地上有一口石砌的浅池，水很静，倒映着整齐的树干。灰绒说这是"静眼"，以前族群议事的地方。它用前爪抚摸池边一块被树根包住的石头，说过去这里有几十只鼯鼠共同维护行道，如今只剩它还在检查每一棵树的生长。一只狐狸问那些栽种者去了哪里，灰绒摇头，说它们只是走了，没有告别。风穿过林子，树叶发出同一种声调，像是很多人在齐声低语。远行队坐在池边吃了些干粮，没有打扰那只老鼯鼠的回忆。',
    '回来路上，灰绒在一棵山毛榉前停住。树干上出现了大片的褐斑，树皮翘卷，有细小的蛀孔。灰绒立刻紧张起来，耳朵贴平，沿着树干上下检查。它从树屋里取来一罐陈年的树脂，又指了指远行队携带的丝帛。队里的织纹师明白了意思，将丝帛裁成条，蘸上树脂，一圈圈裹住伤口。灰绒则爬上爬下，把调配好的药汁灌进蛀孔。小叶也想帮忙，结果把树脂蹭了一身，黏住了一片落叶，走路啪嗒啪嗒响。灰绒难得地笑了一下，帮它把叶子摘掉。那天晚上，远行队轮流值守，观察那棵山毛榉的状况，褐斑没有再扩散。',
    '天边聚起乌云，气压变低，一场大雨正在酝酿。灰绒要求远行队帮它检查所有行道树的"风索"——那些从高处垂下、固定在地面石桩上的老藤。如果风索断裂，整排树会在狂风中倾斜。队伍分成三路，在树冠间奔走。小叶负责传递藤条，它太急了，在一次飞跃时没抓稳，直直往下坠。一只狐狸从斜刺里跃出，在半空中用背接住了它，两者一起跌进厚厚的蕨丛里。小叶吓得僵住，狐狸舔了舔鼻子，把它放到安全的枝桠上。灰绒赶过来，看了一眼狐狸有没有受伤，然后递过来一块止痛的树皮。雨点开始落下时，最后一根风索终于栓紧。',
    '雨下了整整一夜。远行队挤在灰绒的树屋里，听着头顶木板呻吟。灰绒在墙角生起一小盆炭火，烤着囤存的野薯。它说起年轻时的事：那时密林边缘还能见到荒丘的牧羊人点火把，它也曾在月夜滑过狐狸山谷的上空，去看那里的灯火。一只狐狸问它为什么不再出去，灰绒用爪子拨弄炭火，说行道需要看守者，它答应了上一任老看守。小叶蜷在吊床角落睡着了，尾巴盖在脸上。火光照着树屋的四壁，那些木板上留着无数爪痕，是历代看守者量身高时留下的。雨声渐缓，远行队轮流打盹，谁也没有提离开的事。',
    '雨停后，东边升起雾气，却带来坏消息。湿热的空气催发了蛀虫，好几棵树的根部出现了蚁道，黑线一样往树冠蔓延。更糟的是，南风把荒丘方向的一点火星带了过来，林子边缘起了烟。灰绒站在最高的断墙上眺望，然后做出决定：启动"流浆仪式"。它解释说，这是让行道树在短时间内分泌大量树脂自我保护的方法，需要同时在七棵母树上敲打特定的节奏。但灰绒的体力已经不足以在树冠间高速穿行七趟。领头的狐狸站出来，让小叶带路，远行队分头执行。灰绒把七块不同形状的树皮令牌交给它们，每一块对应一棵树。',
    '远行队叼着令牌，在树冠间散开。狐狸不懂树语，但记得灰绒教的敲击方式：三快一慢，再两记重的。第一棵母树在林子中央，领头的狐狸用石块敲击树干，树脂果然从伤口涌出，散发出浓烈的气味。第二棵、第三棵也相继响应。小叶在枝桠间飞跃，替狐狸们纠正位置。到第七棵时，浓烟已经飘到树冠层，领头那只狐狸被呛得直咳。它坚持敲完最后一下，整片密林仿佛同时颤了一下——其实不是颤，是成千上万片叶子在同一秒翻转，露出背面的银白色，将光线反射成一片晃动的光幕。风借势改了道，把烟吹向无树的溪谷。蚁道被新鲜的树脂封死。',
    '远行队该回去了。灰绒没有下树送别，但它让小叶送来一片叶子——那是一片山毛榉的叶子，叶脉被树脂凝成了透明的纹路，像一张地图。灰绒的声音从高处传来，说行道已经记住了这些狐狸的气息，以后再来，风索不会绊住它们的脚。小叶把叶子塞进领头狐狸的嘴里，然后迅速窜上枝头，不敢看离别。远行队沿着来时的路往回走，整齐的树木在两侧列队。出了密林，一只狐狸回头望，看见最高的那棵橡树上，灰绒展开皮膜，像一面灰色的帆，久久停在半空，目送它们走向荒丘的方向。那片叶子被带回了山谷，压在仓库的地图册里，树脂永远没再干硬。',
  ],
  // v0.14 枯风口叙事碎片（6 段，全部占位待用户审核）
  windRidge: [
    '【占位 1】苍风岭顶上有一道天然形成的石门，风从那里穿过去会发出长长的、像在说话的声音。斥候在石门下站了很久，回来说：风里有别的村庄的味道，不是一种，是好几种。',
    '【占位 2】岭上的草被风梳得整整齐齐，全部朝向东南方。一只老斥候蹲下来摸了一把：这片草已经向东南弯了几十年了。它抬起头看那个方向，那里只有云。',
    '【占位 3】风口的岩石上有一组奇怪的凹痕，深浅不一但排列规整，像是一种刻意的标记。一只年轻狐狸用爪子比划：这是计数。每个凹痕代表一次什么——或许是经过这里的风季。',
    '【占位 4】半山腰的灌木丛里发现了一小撮褪色的丝帛，颜色已经辨认不清，但纹路独特：是用从未见过的染色法染的。一只狐狸说：把这撮丝带回去，让染坊的狐狸看看。',
    '【占位 5】下山的路上突然刮起一阵反向的风，把斥候吹得站不稳。等风停了，地上多了一颗野莓——是本地从来没长过的品种。它捡起来含在嘴里，甜得让眼睛眯起来。',
    '【占位 6】回到村里的那天傍晚，所有从苍风岭回来的斥候都同时打了个喷嚏。一只老狐狸笑着说：是岭上的风跟着你们回来了，要在这里安家。',
  ],
};

// ===== 商队定义 =====
const CVD = {
  wildcat: {
    n: '山猫行商',
    uq: {},
    sell: [
      { n: '香草', give: [{ r: 'spice', a: 2 }], cost: [{ r: 'coin', a: 8 }] },
      { n: '兽皮', give: [{ r: 'leather', a: 3 }], cost: [{ r: 'coin', a: 5 }] },
    ],
    buy: { n: '收购圆木', take: [{ r: 'wood', a: 30 }], give: [{ r: 'coin', a: 3 }] },
    blueprintPool: [
      { target: 'berryPatch', type: 'bld' }, { target: 'lumberYard', type: 'bld' },
      { target: 'quarry', type: 'bld' }, { target: 'gatherer', type: 'job' },
    ],
    bpCostS: [{ r: 'coin', a: 180 }, { r: 'spice', a: 1 }],
    bpCostA: [{ r: 'coin', a: 100 }, { r: 'spice', a: 1 }],
    arriveLog: '一只背着大包的山猫出现在村口，朝最近的狐狸点了点头。',
    leaveLog: '山猫行商收拾好包袱走了，临走在地上留了一撮香草当茶钱。',
  },
  otter: {
    n: '河獭商队',
    uq: { b: { watchtower: 1 } },
    sell: [
      { n: '丝帛', give: [{ r: 'silk', a: 2 }], cost: [{ r: 'coin', a: 10 }] },
      { n: '矿铁', give: [{ r: 'iron', a: 3 }], cost: [{ r: 'coin', a: 8 }] },
    ],
    buy: { n: '收购木板', take: [{ r: 'plank', a: 2 }], give: [{ r: 'coin', a: 5 }] },
    blueprintPool: [
      { target: 'tannery', type: 'bld' }, { target: 'smithy', type: 'bld' },
      { target: 'warehouse', type: 'bld' }, { target: 'woodcutter', type: 'job' },
      { target: 'miner', type: 'job' },
    ],
    bpCostS: [{ r: 'coin', a: 225 }, { r: 'silk', a: 1 }],
    bpCostA: [{ r: 'coin', a: 125 }, { r: 'silk', a: 1 }],
    arriveLog: '几只河獭沿着溪流摸上来了，推着满载丝帛的小木筏。',
    leaveLog: '河獭商队顺水滑走了，尾巴在水面拍了两下算是告别。',
  },
  crane: {
    n: '白鹤信使',
    uq: { b: { shrine: 1 } },
    sell: [
      { n: '卷轴', give: [{ r: 'scroll', a: 2 }], cost: [{ r: 'coin', a: 12 }] },
      { n: '符咒', give: [{ r: 'charm', a: 2 }], cost: [{ r: 'coin', a: 10 }] },
    ],
    buy: { n: '收购砖块', take: [{ r: 'brick', a: 3 }], give: [{ r: 'coin', a: 5 }] },
    blueprintPool: [
      { target: 'library', type: 'bld' }, { target: 'shrine', type: 'bld' },
      { target: 'scholar', type: 'job' }, { target: 'smith', type: 'job' },
    ],
    bpCostS: [{ r: 'coin', a: 270 }, { r: 'ancCoin', a: 1 }],
    bpCostA: [{ r: 'coin', a: 150 }, { r: 'ancCoin', a: 1 }],
    arriveLog: '一只白鹤落在灵狐祠的檐角上，脚上绑着一个小布包。',
    leaveLog: '白鹤信使展翅飞走了，盘旋了一圈像是在记路。',
  },
  ruinfolk: {
    n: '旧墟遗民',
    uq: { exp: { oldRuin: 1 } },
    sell: [
      { n: '古币', give: [{ r: 'ancCoin', a: 2 }], cost: [{ r: 'coin', a: 15 }] },
      { n: '符咒', give: [{ r: 'charm', a: 3 }], cost: [{ r: 'coin', a: 12 }] },
    ],
    buy: null,
    blueprintPool: [
      { target: 'hunter', type: 'job' }, { target: 'merchant', type: 'job' },
    ],
    bpCostS: [{ r: 'coin', a: 300 }, { r: 'ancCoin', a: 2 }],
    bpCostA: [{ r: 'coin', a: 175 }, { r: 'ancCoin', a: 2 }],
    arriveLog: '几只灰毛狐狸从驿道尽头走来，披着旧墟式样的斗篷。',
    leaveLog: '旧墟遗民沿来路返回了，走之前朝山谷的方向鞠了一躬。',
  },
};

// ===== 建筑专精定义 =====
const SPEC_BD = {
  berryPatch: {
    A: { n: '刨坑', d: '产量 +40%，造价 +25%', prodMul: 1.4, costMul: 1.25,
      tip: ['它跟地有仇。'] },
    B: { n: '糊弄学', d: '造价 -20%，产量 +10%', prodMul: 1.1, costMul: 0.8,
      tip: ['差不多得了，反正莓果自己也不挑地方长。'] },
    C: { n: '归隐式', d: '产量 +200%，造价 +200%（孤注一掷）', prodMul: 3.0, costMul: 3.0,
      tip: ['退到山里去，把一辈子的莓子都种在一处。'] },
  },
  lumberYard: {
    A: { n: '向山里走去', d: '圆木 +50%，每座消耗碎石 0.005/s', prodMul: 1.5, drain: { stone: 0.005 },
      tip: ['它明白，它明白，山下的树不够粗，于是转身向山里走去。'] },
    B: { n: '顺手牵皮', d: '圆木 +15%，额外产兽皮 0.01/s', prodMul: 1.15, extraP: { leather: 0.002 },
      tip: ['本来只是砍树，但树上挂着的东西也不能浪费嘛。'] },
  },
  quarry: {
    A: { n: '不惜爪', d: '碎石 +50%，每座消耗圆木 0.005/s', prodMul: 1.5, drain: { wood: 0.005 },
      tip: ['不惜爪的狐狸，爪子比石头还硬。'] },
    B: { n: '歪打正着', d: '碎石 +20%，额外产矿铁 0.005/s', prodMul: 1.2, extraP: { iron: 0.001 },
      tip: ['找石头找一半，铁先冒出来了。'] },
  },
  tannery: {
    A: { n: '嚼劲', d: '兽皮 +60%，全村野莓消耗 +10%', prodMul: 1.6, foxEatMul: 1.1,
      tip: ['嚼到腮帮子都发酸了。'] },
    B: { n: '二道贩子', d: '兽皮 +20%，持续转化兽皮为铜钱', prodMul: 1.2, convert: { from: 'leather', to: 'coin', drainRate: 0.01, gainRate: 0.005 },
      tip: ['左手收皮，右手出货，中间赚个差价，童叟无欺。'] },
  },
  smithy: {
    A: { n: '火力全开', d: '矿铁 +60%，每座消耗圆木 0.01/s', prodMul: 1.6, drain: { wood: 0.01 },
      tip: ['炉子自己都没想到还能这么塞。'] },
    B: { n: '一颗矿掰两颗用', d: '矿铁 +25%，所有建筑矿铁造价 -15%', prodMul: 1.25, costReduce: { res: 'iron', mul: 0.85 },
      tip: ['它眼里一块矿本来就是两块，铁也就跟着多出来。'] },
  },
  warehouse: {
    A: { n: '松鼠病', d: '上限效果翻倍', mxMul: 2,
      tip: ['塞不下了还在塞，这病没治。'] },
    B: { n: '猫冬', d: '野莓上限 +50%，寒冬产量倍率提升', berryMxMul: 1.5, winterBuff: 0.1,
      tip: ['天越冷，窝里越香。'] },
  },
  library: {
    A: { n: '四眼田狐', d: '学识 +50%，卷轴产出 +30%', loreProdMul: 1.5, scrollProdMul: 1.3,
      tip: ['看字清楚，看别狐不太清楚。'] },
    B: { n: '生狐勿近', d: '学识上限翻倍，学识 +15%', loreMxMul: 2, loreProdMul: 1.15,
      tip: ['别说话，我在思考。'] },
  },
  shrine: {
    A: { n: '摸摸头', d: '满意度额外 +3%/座', hapBonus: 0.03,
      tip: ['排队，摸完的从后门走。'] },
    B: { n: '灵气外泄', d: '符咒 +40%，灵术消耗 -20%', charmProdMul: 1.4, spellCostMul: 0.8,
      tip: ['香火烧得太旺，连院外的草都精神。'] },
  },
};

// ===== 职业天赋定义 =====
const SPEC_JD = {
  gatherer: {
    A: { n: '边吃边摘', d: '产量 +30%，每人多消耗野莓 0.05/s', prodMul: 1.3, extraEat: 0.05,
      tip: ['摘一颗吃两颗，摘两颗吃三颗。'] },
    B: { n: '摸鱼高手', d: '产量 +15%，手动采集量 +50%', prodMul: 1.15, gatherMul: 1.5,
      tip: ['摸鱼是一种信仰，篮子满了是神迹。'] },
  },
  woodcutter: {
    A: { n: '跟树杠上了', d: '产量 +40%', prodMul: 1.4,
      tip: ['树倒了，它还要跟树墩瞪一会儿。'] },
    B: { n: '踢到算我的', d: '产量 +15%，额外产碎石 0.05/s', prodMul: 1.15, extraP: { stone: 0.01 },
      tip: ['脚趾肿了，石头有了，反正不亏。'] },
  },
  miner: {
    A: { n: '只挖一个坑', d: '产量 +40%', prodMul: 1.4,
      tip: ['别的坑不去，就认准这一个，挖到地心算完。'] },
    B: { n: '咣当', d: '产量 +15%，额外产矿铁 0.01/s', prodMul: 1.15, extraP: { iron: 0.002 },
      tip: ['一镐下去声音不对——好消息，是铁。'] },
  },
  hunter: {
    A: { n: '憋着', d: '兽皮 +50%', prodMul: 1.5,
      tip: ['蹲了三天，腿都麻了。'] },
    B: { n: '顺嘴叼', d: '兽皮 +20%，额外产野莓 0.025/s', prodMul: 1.2, extraP: { berry: 0.005 },
      tip: ['十三岁的口欲期。'] },
  },
  scholar: {
    A: { n: '发呆冠军', d: '学识 +40%，卷轴 +30%', loreProdMul: 1.4, scrollProdMul: 1.3,
      tip: ['奖状没领，仍在发呆。'] },
    B: { n: '划重点', d: '学识 +20%，研究费用 -10%', loreProdMul: 1.2, resCostMul: 0.9,
      tip: ['别的狐狸抄整页，它只圈三个字。'] },
  },
  smith: {
    A: { n: '叮叮当当', d: '矿铁 +50%', prodMul: 1.5,
      tip: ['锤子敲一百下是练习，敲一万下是手艺。'] },
    B: { n: '边角料', d: '矿铁 +20%，锻造炉造价 -15%', prodMul: 1.2, bldCostReduce: { bld: 'smithy', mul: 0.85 },
      tip: ['好铁匠的本事在于废得少，炼得多倒在其次。'] },
  },
  merchant: {
    A: { n: '算盘精', d: '铜钱 +50%', prodMul: 1.5,
      tip: ['数钱的声音是世界上第二好听的声音。第一是进账。'] },
    B: { n: '野路子', d: '铜钱 +20%，商队图纸出现概率提升', prodMul: 1.2, bpChanceBonus: 0.10,
      tip: ['店没开张，货已经卖完了。'] },
  },
};

// ===== 抉择事件 =====
// 抉择事件：每条 requires 限定必须收集到的叙事碎片数（避免在叙事未铺垫前出现剧透）
const CHOICE_EVENTS = [
  { n: '刻名墙',
    t: '斥候在旧墟刻名墙前站了很久，回来说墙上有一个空位，大小刚好够再刻一个名字。它问：要不要把我们村的名字刻上去。',
    requires: { oldRuin: 2 },  // 刻名墙在旧墟碎片#2 出现
    opts: [
      { label: '刻上去，排在末位', desc: '消耗圆木×1，下次旧墟返回时古币+2' },
      { label: '不刻，那是它们的墙', desc: '下次旧墟返回时学识+5' },
  ]},
  { n: '南行',
    t: '横梁上的信已经反复念过很多遍了——"井水咸了那年开始，我们决定往南走。"一只年轻的狐狸抬头问你：我们也往南走吗，还是留在这里。',
    requires: { oldRuin: 7 },  // 横梁信在旧墟碎片#7
    opts: [
      { label: '先攒够了，再顺着它们的路走', desc: '下次密林与云岭返回奖励各×1.3' },
      { label: '我们的井还是甜的，留下', desc: '野莓+30、圆木+10，但下次旧墟返回古币-2' },
  ]},
  { n: '石标',
    t: '云岭岔路口的石标松动了。一只狐狸说应该拆掉重建，用新石头加固；另一只说原样扶正就好，别动祖先的手艺。',
    requires: { cloudRidge: 3 },  // 岔路口石标在云岭碎片#3
    opts: [
      { label: '拆掉重砌，用我们的手艺加固', desc: '消耗碎石×5，所有远行时间永久×0.95' },
      { label: '原样扶正，不动原来的卡槽', desc: '下次云岭返回符咒+1，但远行时间×1.2' },
  ]},
  { n: '掌印墙',
    t: '松脂里那只幼崽的爪印被完整临摹回来了。有狐狸提议，在村口也做一面掌印墙，让每一只幼崽都按一个，留给以后回来的狐狸看。',
    requires: { cloudRidge: 5 },  // 松脂幼崽爪印在云岭碎片#5
    opts: [
      { label: '做，从这批幼崽开始', desc: '消耗圆木×3、碎石×2，本季满意度+10%' },
      { label: '不做，我们留别的东西', desc: '学识+15，下次旧墟返回卷轴+1' },
  ]},
  { n: '归乡老狐',
    t: '旧墟遗民商队这次多带了一只老狐狸来，它说想在死之前回旧墟看一眼，问我们能不能在下次远行时带它一起去。它走得很慢，可能会拖慢队伍。',
    requires: { oldRuin: 4 },  // 中段足够熟悉旧墟后再触发
    opts: [
      { label: '带上它，慢慢走', desc: '下次旧墟远行时间×1.5，返回古币+8、卷轴+1' },
      { label: '让它在这里住下', desc: '人口+1，下次旧墟遗民商队价格减半' },
  ]},
];

// ===== 图纸强度分档 =====
// S 档（10 张）：纯强力、无副作用，定价更高
// A 档（其他 20 张）：有副作用 / 中等增益 / 条件性，定价略低（默认 A）
// 用于 rollBlueprint 时按 target+spec 查表选 S 或 A 价格
const STRONG_SPECS = [
  // 建筑专精 S
  'warehouse_A',  // 松鼠病 - 上限翻倍
  'library_A',    // 四眼田狐 - 学识 +50% + 卷轴 +30%
  'library_B',    // 生狐勿近 - 学识上限翻倍
  'smithy_B',     // 一颗矿掰两颗用 - 全建筑铁造价 -15%
  // 职业天赋 S
  'woodcutter_A', // 跟树杠上了 - +40% 木
  'miner_A',      // 只挖一个坑 - +40% 石
  'hunter_A',     // 憋着 - +50% 兽皮
  'scholar_A',    // 发呆冠军 - +40% 学识 +30% 卷轴
  'smith_A',      // 叮叮当当 - +50% 铁
  'merchant_A',   // 算盘精 - +50% 铜钱
];

// ===== 考拉·小曼 彩蛋（玩家直购图纸时 20% 概率出现）=====
// 设定：永远慢一拍的考拉，听到风声赶来时图纸已经被买走。
const KOALA_LATE_LOGS = [
  '考拉·小曼 慢悠悠走到村口，问："那张图纸……还在吗？"',
  '考拉·小曼 揉着眼睛赶来时，商队已经走远了。它原地坐了一会儿。',
  '考拉·小曼 翻了翻空空的图纸架，叹了口气，又趴回树上。',
  '考拉·小曼 来晚了。它似乎不太意外。',
  '考拉·小曼 还在路上。它听说图纸的事时，已经是第二天傍晚了。',
];

// ===== 竞拍系统文案池（草稿，暂未接入逻辑）=====
// 8 个种族 NPC × 4 类场景。{价} 是变量（如"铜钱 22, 丝帛 1"），{图纸}/{赢家} 同。
// 说明：小曼不参与竞拍，仅作"迟到段子"出现在拍卖结束后。
const AUCTION_LINES = {
  // 山猫·阿斑 — 急性子、爱抢手货
  lynx: {
    bid: [
      '阿斑爪子一拍：「这张归我。{价}」',
      '阿斑没等别狐开口，先把价钱报出去：「{价}」',
      '阿斑挤到前面：「我先。{价}」',
    ],
    outbid: [
      '阿斑斜了你一眼：「不好意思，{价}」',
      '阿斑爪子跟不上脑子，已经报出去了：「{价}」',
    ],
    win: [
      '阿斑抓起图纸就走，没跟谁打招呼。',
      '阿斑用 {价} 拿下 {图纸}，半路还回头瞪了你一眼。',
    ],
    lose: [
      '阿斑甩了下尾巴，骂骂咧咧走了。',
      '阿斑气得在村口磨爪子磨了半天。',
    ],
  },
  // 河獭·哗啦 — 随和、话多
  otter: {
    bid: [
      '哗啦哼着溪水的小调：「{价}吧，怎么样？」',
      '哗啦边玩水边说：「我也凑个数，{价}。」',
      '哗啦转着尾巴：「这玩意儿……{价}。」',
    ],
    outbid: [
      '哗啦笑嘻嘻地说：「别着急！{价}。」',
      '哗啦钻出水面：「先这样，{价}。」',
    ],
    win: [
      '哗啦挥着图纸，一路念叨着往溪边跑了。',
      '哗啦用 {价} 拿到了，临走前还跟你聊了两句天气。',
    ],
    lose: [
      '哗啦摆摆爪子：「下次吧，下次吧。」',
      '哗啦没赢，扭头去溪边洗澡了。',
    ],
  },
  // 白鹤·拂月 — 慢条斯理、最后致命
  crane: {
    bid: [
      '拂月一直没动，直到最后才开口：「{价}。」',
      '拂月低头看了看图纸，缓缓抬眼：「{价}。」',
      '拂月理了理羽毛，落价：「{价}。」',
    ],
    outbid: [
      '拂月轻轻抖了下翅膀：「{价}。」',
      '拂月没看你，只看图纸：「{价}。」',
    ],
    win: [
      '拂月施一礼，把图纸卷进翅膀里飞走了。',
      '拂月用 {价} 拿下，临走前对你点了点头。',
    ],
    lose: [
      '拂月对着天空望了一会儿，没说话就走了。',
      '拂月收起翅膀：「算了。」',
    ],
  },
  // 雪鸮·夜眼 — 神秘、偏爱罕物（仅偏好品出价）
  owl: {
    bid: [
      '夜眼从黑影里浮出来：「{价}。」',
      '夜眼眨了一下，价钱已经落定。{价}',
      '夜眼没说话，但出价比谁都狠。{价}',
    ],
    outbid: [
      '夜眼盯了你两眼，加价：「{价}。」',
      '夜眼飞到更高的栖木上，留下出价：「{价}」',
    ],
    win: [
      '夜眼把图纸一卷，消失在夜色里。',
      '夜眼用 {价} 拿走了，谁也没看清它怎么走的。',
    ],
    lose: [
      '夜眼盯了你很久，然后无声地飞走了。',
      '夜眼没出声，转身没了影。',
    ],
  },
  // 水鼠·囤囤 — 什么都要、试水、易缩
  ratter: {
    bid: [
      '囤囤怯生生举爪：「这个……我也要……{价}？」',
      '囤囤挤进来：「我也囤一份！{价}」',
      '囤囤数着自己手里的几样：「{价}……行不行？」',
    ],
    outbid: [
      '囤囤鼓起勇气咬牙：「{价}！」',
    ],
    win: [
      '囤囤抱着图纸钻进洞里，半天没出来。',
      '囤囤用 {价} 抢到了！它自己也没料到。',
    ],
    lose: [
      '囤囤缩了一下爪子：「好吧。」',
      '囤囤摆摆爪子：「下次……下次。」',
    ],
  },
  // 考拉·小曼 — 永远慢一拍（不参与竞拍，仅作拍卖结束后 30% 迟到段子）
  koala: {
    afterAuction: [
      '小曼姗姗来迟，发现拍卖已经结束。它在原地坐了一会儿。',
      '小曼正准备出价，发现一颗闪闪发光的树。它盯着发呆好久才回过神。',
      '小曼来时图纸已经被 {赢家} 拿走了。它看了看天，又趴回树上。',
      '小曼揉着眼睛走到广场，桌子已经空了。它喃喃说了一句没人听清的话。',
    ],
  },
  // 旧墟旁支·灰斗篷 — 沉默、对古墟相关图纸执着
  ruinkin: {
    bid: [
      '灰斗篷默默把价钱推到桌上：{价}。',
      '灰斗篷没说话，抬手画了个符号，意思是 {价}。',
      '灰斗篷掀起斗篷一角：「{价}。」',
    ],
    outbid: [
      '灰斗篷抬眼看了你一下，加价：{价}。',
      '灰斗篷没看你，只看图纸：{价}。',
    ],
    win: [
      '灰斗篷用 {价} 拿走了。它把图纸贴在斗篷里，转身没说话。',
      '灰斗篷以远超预期的价拿下了。它的眼睛湿润了一下。',
    ],
    lose: [
      '灰斗篷沉默地看了你很久。然后什么也没说，走了。',
      '灰斗篷点了点头，在原地兜了一圈。',
    ],
  },
  // 不明使者·? — 不可预测、爆冷大手笔
  unknown: {
    bid: [
      '? 出现在拍卖现场。它出价：{价}。',
      '没人看清它什么时候来的。{价}。',
      '桌上一下多了一摞东西，叮当作响。{价}。',
    ],
    outbid: [
      '? 把一袋东西倒在桌上：「{价}。」',
      '? 出价的方式没人看明白，但金额是：{价}。',
    ],
    win: [
      '? 用 {价} 拍走了。它消失的方式跟来时一样，没人看清。',
      '? 走了。空气里有一阵不属于这个季节的味道。',
    ],
    lose: [
      '? 看了看你，没说话，走了。',
      '? 没赢。但它走的时候笑了一下——也许。',
    ],
  },
};

// ===== 竞拍通用文案（不分种族）=====
const AUCTION_GENERIC = {
  start: '{商队} 带来一张图纸：{图纸}（{目标}）。竞拍开始，起拍 {价}。',
  playerBid: '你加价：{价}。',
  playerCancel: '你撤回了出价。{资源} 已归还。',
  noBid: '没人对 {图纸} 这张图纸感兴趣。商队带它走了。',
  playerWin: '图纸到手：{图纸}。',
  notEnough: '资源不够，没法加价到 {价}。',
};

// ===== v0.14 习俗定义（占位名，11 项） =====
// unlock 字段：u 研究、b 建筑、j 职业、r 资源阈值（>=）、custom 已激活习俗、choice 已完成抉择、spring 春季远行完成数 ≥ 1
// ongoing.kind: 'year'（年度结算）/ 'spring'（春季年度）/ 'perFox'（每狐每秒消耗）
// onActivate: 激活时一次性效果（trainScholar / ruinNarrAdvance）
const CUSTD = [
  { id: 'bonfire', n: '篝火夜歌',
    unlock: { u: ['folkLore'] },
    cost: [{ r: 'wood', a: 30 }, { r: 'ancCoin', a: 5 }],
    desc: '激活后，每次季节切换时本季全村满意度 +3%。',
    tip: ['跑调的那只唱得最大声。']
  },
  { id: 'newClothes', n: '新衣节',
    unlock: { u: ['folkLore'], r: { dye: 5 } },
    cost: [{ r: 'dye', a: 5 }],
    ongoing: { kind: 'spring', r: 'dye', a: 5 },
    desc: '全年满意度 +5%；春季每年消耗 5 彩络。',
    tip: ['旧衣服又没破——但新的好看。']
  },
  { id: 'shareHunt', n: '共狩日',
    unlock: { u: ['folkLore'], j: { hunter: 5 } },
    cost: [{ r: 'leather', a: 30 }],
    ongoing: { kind: 'year', r: 'leather', a: 30 },
    desc: '猎手兽皮产出 +15%；每年消耗 30 兽皮。',
    tip: ['分工是假的，抢功才是传统。']
  },
  { id: 'springMigrate', n: '春迁俗',
    unlock: { u: ['calendar'], spring: 1 },
    cost: [{ r: 'leather', a: 10 }, { r: 'wood', a: 20 }],
    desc: '春季远行时间 -15%。',
    tip: ['雪还没化完，行李已经收好了。']
  },
  { id: 'rainFeast', n: '谷雨宴',
    unlock: { u: ['calendar'], r: { wine: 5 } },
    cost: [{ r: 'wine', a: 5 }],
    desc: '寒冬野莓上限 +30%。',
    tip: ['喝完这顿，冬天的事就不许再提了。']
  },
  { id: 'nameStone', n: '铭石礼',
    unlock: { u: ['engraving'], b: { memorial: 1 } },
    cost: [{ r: 'stone', a: 50 }],
    ongoing: { kind: 'year', r: 'stone', a: 20 },
    desc: '学识上限 +50（一次性，与现有上限相加）；每年消耗 20 碎石。',
    tip: ['石头：我也没同意。狐狸：现在你同意了。']
  },
  { id: 'moonClass', n: '月话课',
    unlock: { u: ['engraving'], b: { moonStage: 1 } },
    cost: [{ r: 'scroll', a: 5 }, { r: 'ancCoin', a: 10 }],
    desc: '永久：学识上限 +30、学者产出 +10%。',
    tip: ['打呼的都给我坐后排。']
  },
  { id: 'watchNight', n: '守夜传统',
    unlock: { u: ['engraving'], b: { shrine: 3 } },
    cost: [{ r: 'spice', a: 5 }, { r: 'scroll', a: 3 }],
    ongoing: { kind: 'perFox', r: 'berry', a: 0.02 },
    desc: '灵狐祠符咒 +20%；每只狐狸每秒额外消耗 0.02 野莓。',
    tip: ['野莓吃完了，夜还没过半。']
  },
  { id: 'oldFire', n: '老火传承',
    unlock: { u: ['engraving'], b: { smithy: 3 } },
    cost: [{ r: 'iron', a: 20 }, { r: 'wood', a: 50 }],
    desc: '锻造炉产出 +10%。',
    tip: ['这团火比所有活着的狐狸年纪都大。']
  },
  { id: 'ancestorRite', n: '祖荫祭',
    unlock: { u: ['ancestry'], b: { ancestor: 1 } },
    cost: [{ r: 'ink', a: 2 }, { r: 'ancCoin', a: 30 }],
    desc: '灵狐祠符咒额外 +5%（与守夜传统叠加）。',
    tip: ['先祖未必在听，但念名字的时候最好假装它们在。']
  },
];

// ===== §五 2.9 成就系统 =====
const ACHIEVEMENT_DATA = {
  // --- 阶段一：基础成长（15 个）。n = 题名（短句风，无终止句号）；d = 解锁条件 ---
  firstBuild:     { n: '第一根木头',     d: '建造第一座建筑' },
  pop5:           { n: '围火五尾',       d: '拥有 5 只狐狸' },
  pop20:          { n: '名字越叫越多',   d: '拥有 20 只狐狸' },
  pop50:          { n: '山谷的口音',     d: '拥有 50 只狐狸' },
  firstResearch:  { n: '一卷读完',       d: '完成第一项研究' },
  firstCraft:     { n: '不是它们的东西', d: '手动制作第一件工艺品' },
  firstTrade:     { n: '第一笔便宜',     d: '与第一支商队完成交易' },
  firstExpedition:{ n: '走出谷口',       d: '完成第一次远行' },
  firstCustom:    { n: '谁都记得的规矩', d: '立起第一个习俗' },
  custom5:        { n: '默契成规',       d: '立起 5 个习俗' },
  berryHoard:     { n: '三千颗甜',       d: '囤积 3000 野莓' },
  lore100:        { n: '记得比忘的多',   d: '当前 100 学识' },
  scroll50:       { n: '满架还在塞',     d: '拥有 50 卷轴' },
  firstPolity:    { n: '写在外面的名字', d: '选定治风' },
  firstPolicy:    { n: '以后就这么办',   d: '选定第一个政策' },

  // --- 阶段二：分支觉醒（15 个）---
  branchChosen:   { n: '路口分叉',       d: '择定工业或灵修，深耕一道' },
  coal10:         { n: '袖口的黑',       d: '拥有 10 煤', br: 'I' },
  steel5:         { n: '一块硬过石头',   d: '拥有 5 钢', br: 'I' },
  mine3:          { n: '山的三个肚子',   d: '建造 3 座矿坑', br: 'I' },
  pollTier1:      { n: '风里的怪味',     d: '污染达到第一阶梯', br: 'I' },
  spirit10:       { n: '掌心被风舔',     d: '拥有 10 灵能', br: 'M' },
  fateSilk5:      { n: '五根未遇之线',   d: '拥有 5 命丝', br: 'M' },
  spiritWell3:    { n: '三处井底回响',   d: '建造 3 座灵泉', br: 'M' },
  unrestTier1:    { n: '不大不小的结',   d: '躁念达到第一阶梯', br: 'M' },
  firstSpell:     { n: '不该听懂的话',   d: '施放第一个灵术', br: 'M' },
  upgd5:          { n: '一次比一次轻',   d: '购买 5 个进阶升级' },
  year10:         { n: '记住幼狐的名字', d: '度过第 10 个年头' },
  year50:         { n: '别人的开头',     d: '度过第 50 个年头' },
  expDone3:       { n: '路也认得你',     d: '完成 3 次远行' },
  bld20:          { n: '山谷换了影子',   d: '建造总计 20 座建筑' },
};
