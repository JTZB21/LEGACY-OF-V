# ChatGPT prompts for Lineage of the Vigil

How to use: start a new ChatGPT chat, paste **Prompt 0** first, then paste any of the task prompts below. Bring the output back to Claude (or a Claude Code session on LEGACY-OF-V) and ask for it to be added to the game. Every task asks for the exact code format the game uses, so results drop straight in.

---

## Prompt 0: Game primer (always paste this first)

```
You are helping me design content for my game, "Lineage of the Vigil". Read this brief and reply only "Ready" until I give you a task.

WHAT IT IS
A text-based fantasy life-sim RPG with incremental progression, played in the browser (single HTML page, vanilla JavaScript). You roll a "fate" (race, bloodline, innate magic, trait) across 8 rarity tiers: Common, Uncommon, Rare, Epic, Legendary, Mythic, Divine, Secret. You live year by year with the "+ Age" button: life stages, yearly choice events, family, friends, rivals, mentors, romance, marriage, children. When you die you continue as one of your children (heir) or roll a new fate. You train 8 stats with mini-games, work jobs, fight turn-based battles in regions and against bosses, and climb the ranks of a knightly order called the Vigil. Rebirth earns Merit for permanent upgrades.

STATS (internal keys in brackets)
Strength [str], Speed [spd], Durability [dur], Health [vit], Magic [mag], Magic Control [ctl], Spirit [spr], Intelligence [int]. Combat Class (CC) is the overall power rating. A starting adult is roughly CC 20 to 40, mid game 100 to 300, late game 500 to 2000.

AGE GATES
Training at 3, fighting at 6, work at 10 (ranked jobs 16), bosses and Vigil trials at 12, adulthood and marriage at 18, romance from 14.

RACES (lifespan in years)
Human (70-90), Stonebred mountain giants (400-700), Tidefolk sea folk (140-200), Skyborn cloud-city people (110-150), Sylvan forest fae (500-800), Ashborn ember/shadow folk (300-500), Lumen celestials (900-1200), Dragonkin (700-1000), Starforged (1200-1800), Voidtouched (1500-2500).

WORLD
Regions in order of danger: Whisperwood, Ashen Mines, Drowned Crypt, Skyward Spires, The Voidmarch, Starfall Rift, The Last Abyss. The Vigil ranks: Unsworn, Squire, Oathknight, Banner Captain, Warden Commander, Paragon, Grand Paragon.

HARD RULES
1. The setting is 100% original. Never use names, places, races, powers, items or terms from any existing anime, manga, game, book or film (for example no Seven Deadly Sins, Demon Slayer, My Hero Academia, Naruto, Dark Souls, D&D-specific names). If a name feels familiar, invent a different one.
2. No real-money or pay-to-win ideas.
3. Tone: grounded dark fantasy with warmth and occasional humour. Plain, readable English. Short sentences.
4. When I ask for code-format output, reply with ONLY a JavaScript code block in exactly the format I show, no commentary, no trailing explanations. Keep every id unique, lowercase, no spaces.
```

---

## Prompt 1: 40 new life events

```
Task: write 40 new yearly life events in this exact JavaScript format.

{a:[MIN_AGE,MAX_AGE],t:'Event text the player reads.',c:[['Choice label',()=>EFFECT],['Choice label',()=>EFFECT]]},

EFFECT must be built only from these helper functions, joined with + ', ' + when combining:
R('stat',amount)  adds to a stat. stat is one of str spd dur vit mag ctl spr int. Amounts 1 to 3.
G(amount)         gold. Positive 20 to 200, or negative like G(-30) for costs.
X(amount)         race XP, 10 to 40.
MX(amount)        magic XP, 5 to 40.
MER(amount)       Merit, 1 or 2 only, rare.
meet('kind')      introduces a person. kind is friend, rival, mentor or romance. Romance only for ages 14+.
bondAll(n)        raises all bonds by n (3 to 8). Use as: {bondAll(5);return 'Text.'}

Examples from the game:
{a:[6,12],t:'Older kids corner you behind the granary.',c:[['Fight back',()=>R('str',2)+', '+R('dur',1)],['Talk your way out',()=>R('int',2)],['Run for it',()=>R('spd',2)]]},
{a:[18,70],t:'A rival duellist insults your family name.',c:[['Accept the duel',()=>Math.random()<.55?R('str',3)+', '+G(50):(G(-40),'You lose the duel and pay for the healer.')],['Walk away',()=>R('spr',2)]]},
{a:[14,19],t:'A letter appears on your doorstep. Someone admires you.',c:[['Find out who sent it',()=>meet('romance')],['Leave it unanswered',()=>R('int',1)]]},

Requirements:
- Spread across ages: 8 for ages 1-5, 8 for 6-12, 8 for 13-17, 10 for 18-60, 6 for 60-999 (long-lived races reach very old ages, so use 999 as the max for some adult events).
- 2 or 3 choices each. Every choice gives something; no choice should be strictly best.
- At most 6 events may use a risk roll with Math.random() like the duel example.
- Use single quotes inside the code; avoid apostrophes in text or escape them as \'.
- Original world only. Mention the Vigil, regions or races from the brief where it fits.
Output only the code block.
```

---

## Prompt 2: 16 new innate magics (to reach 40)

```
Task: write 16 new innate magics in this exact JavaScript format.

{id:'id',n:'Name',r:RARITY,d:'One-line description.',sk:[['Skill 1',MANA,POWER,'EFFECT'],['Skill 2',MANA,POWER,'EFFECT'],['Skill 3',MANA,POWER,'EFFECT']]},

RARITY is a number: 0 Common, 1 Uncommon, 2 Rare, 3 Epic, 4 Legendary, 5 Mythic, 6 Divine. (Do not make Secret, 7.)
MANA is the percent of max mana the skill costs.
POWER is the damage multiplier. Use 0 for pure utility skills (evade, counter).
EFFECT is one of: '' (plain damage), burn, stun, shield, heal, drain, pierce, multi, weaken, evade, counter.
Skill 1 unlocks at mastery 1, skill 2 at mastery 4, skill 3 at mastery 10, so skill 3 is the big one.

Balance guide by rarity (skill 1 / skill 3 power): Common 1.1-1.3 / 2.2-2.6. Uncommon 1.3-1.5 / 2.6-2.8. Rare 1.4-1.6 / 2.9-3.2. Epic 1.8 / 3.5-3.6. Legendary 2.1 / 4-4.2. Mythic 2.3-2.4 / 4.6-4.8. Divine 2.6-2.7 / 5.4-5.6.
Mana guide: skill 1 12-32, skill 2 18-40, skill 3 35-85, higher for higher rarity.

Existing magics you must not duplicate: Flame, Frost, Wind, Earth, Lightning, Nature, Shadow, Water, Iron, Sound, Healing Light, Blood, Gravity, Illusion, Storm, Solar Flame, Black Ice, Reversal, Starfall, Eclipse, Dragon Breath, Creation, Judgment, Oblivion.

Example:
{id:'sound',n:'Sound',r:1,d:'Turn noise into force.',sk:[['Sonic Pulse',14,1.3,''],['Discord',22,1,'weaken'],['Shatter Note',40,2.8,'pierce']]},

Give me: 4 Common, 4 Uncommon, 3 Rare, 2 Epic, 1 Legendary, 1 Mythic, 1 Divine. Make them feel distinct (e.g. glass, ink, bone, rust, mirrors, bees, ash, tides of memory). Output only the code block.
```

---

## Prompt 3: New bosses

```
Task: write 6 new bosses in this exact JavaScript format.

{id:'id',n:'Boss Name',cc:COMBAT_CLASS,hp:HP_MULT,a:'ARCHETYPE',i:{INTENT:WEIGHT,...},d:'One-line description.',title:'Title earned'},

ARCHETYPE: brute, caster, swift, tank or duel.
Intents (weights 1-3): strike, heavy, spell, flurry, guard, charge, heal, drain. Use 3 to 5 intents.
HP_MULT between 1.7 and 3.8, higher for later bosses.
Existing bosses by CC: Bramble Matriarch 45, Cinder Golem King 100, The Drowned Captain 180, Storm Roc Empress 300, The Pale Regent 480, Star-eater 780, The Fallen Paragon 1250, Herald of Oblivion 2000.
Place the new ones in gaps or beyond: CC 70, 140, 240, 390, 620, 3000.
Each needs a unique title the player earns (one or two words, e.g. 'Kingsmelter').
Example:
{id:'golemking',n:'Cinder Golem King',cc:100,hp:1.8,a:'tank',i:{heavy:3,charge:2,guard:2,strike:2},d:'A furnace given a crown.',title:'Kingsmelter'},
Output only the code block.
```

---

## Prompt 4: Energy system redesign (discussion, not code)

```
Task: help me redesign the energy system. Do not write code; give me 3 distinct designs and a recommendation.

CURRENT SYSTEM
- Energy is real-time: max 10 (upgrades add +2 per level), regenerates 1 point every 15 seconds, even while offline (offline progress at half rate, capped at 8 hours).
- Costs: training mini-game 1, work shift 1, region fight 1, sparring 1, rival duel 1, rest 2, boss fight 2, Vigil trial 2.
- Separately, each in-game year gives 4 social actions for the People tab, refreshed when you press + Age.
- Aging is manual (+ Age button, or 5x/10x skips). Nothing about energy is tied to age.

PROBLEM
Energy is tied to real time while life progresses by pressing + Age, so the two clocks fight each other. You can age 50 years in seconds without training, or sit at one age forever farming energy.

WHAT I WANT
Something that makes each year feel like a meaningful chunk of time, keeps an incremental "numbers go up" feel, stays fair without any paid shortcuts, and works with 5x/10x age skips.

For each design give: how it works, what each action costs, how upgrades and race lifespan interact with it, how skips work, one risk, and how it feels to play. Then recommend one and list the exact numbers you would start with.
```

---

## Prompt 5: New jobs and careers

```
Task: write 10 new jobs in this exact JavaScript format.

{id:'id',n:'Job Name',st:'stat',b:BASE_PAY,k:PAY_PER_STAT,req:STAT_REQUIRED,rank:RANK_REQUIRED,d:'One-line description.'},

stat is one of str spd dur vit mag ctl spr int. rank is 0 to 6 (0 Unsworn ... 6 Grand Paragon).
Existing jobs for balance: Stablehand str b10 k.5 req0 rank0; Scribe int b16 k.7 req30 rank0; Caravan Guard dur b30 k.8 req45 rank1; Arcane Tutor mag b70 k1 req110 rank2; Royal Bodyguard dur b260 k1.2 req330 rank4; Court Archmage mag b450 k1.4 req520 rank5.
Cover stats that have few jobs (vit, spr, spd, ctl) and fill rank gaps. Pay rises with requirement. Original world only. Output only the code block.
```

---

## Prompt 6: Code review (for ChatGPT's coding agent with repo access)

```
Repository: JTZB21/LEGACY-OF-V. Read AGENTS.md (or CLAUDE.md) first and follow it exactly.
Task: review src/js/ for bugs only. Do not change design, balance or visuals.
Look for: runtime errors, state that can get stuck (an event or death screen that cannot be closed, energy going negative, NaN stats), save/load problems, and anything that breaks at phone width.
Work on a new branch named review-fixes, keep each fix small, rebuild with ./build.sh, and open a pull request listing each bug, how to reproduce it, and the fix. Do not push to main.
```
