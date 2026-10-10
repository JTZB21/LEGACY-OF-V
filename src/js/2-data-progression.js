/* ===== PROGRESSION DATA ===== */
const TRAIN=[
 {id:'boulder',n:'Boulder Breaker',st:'str',g:'timing',d:'Strike when the marker enters the perfect zone. Three swings, each faster.'},
 {id:'dash',n:'Dash Course',st:'spd',g:'react',d:'Read each obstacle and react with Dodge, Jump, Slide or Dash in time.'},
 {id:'brace',n:'Endurance Training',st:'dur',g:'brace',d:'Brace at the right moment against increasingly fast blows.'},
 {id:'run',n:'Endurance Run',st:'vit',g:'pace',d:'Tap to hold your pace in the green zone. Too slow or too fast wastes the run.'},
 {id:'charge',n:'Power Charge',st:'mag',g:'mash',d:'Press CHARGE as fast as you can for six seconds to force your magic past its limit.'},
 {id:'balance',n:'Energy Balance',st:'ctl',g:'balance',d:'Keep your magic inside a moving control zone. Also raises magic mastery.'},
 {id:'meditate',n:'Meditation',st:'spr',g:'breath',d:'Tap at the top of each breath. Slow, steady and precise.'},
 {id:'memory',n:'Memory Training',st:'int',g:'memory',d:'Memorize the symbols, then tap them back in order as the sequence grows.'}
];
const TIERN=['Wood','Stone','Iron','Steel','Mithril','Enchanted'];
const TIERC=[0,80,400,2000,9000,40000];
const TIERM=[1,1.6,2.5,3.8,5.6,8];
const GRADES=[['S',.93,1.5,6,'#ffd85c'],['A',.78,1.2,4,'#57d27a'],['B',.58,1,3,'#4ea6ff'],['C',.38,.7,2,'#d9d4c7'],['D',0,.4,1,'#ff6b5c']];

const RANKS=[
 {n:'Unsworn',cc:0,sal:0},{n:'Squire',cc:35,sal:.4},{n:'Oathknight',cc:80,sal:1.2},{n:'Banner Captain',cc:150,sal:3},
 {n:'Warden Commander',cc:270,sal:8},{n:'Paragon',cc:460,sal:20},{n:'Grand Paragon',cc:800,sal:50}
];
/* enemy archetypes: stat shape + intent weights */
const ARCH={
 brute:{hp:1,str:1.15,mag:.6,dur:1,spd:.8,i:{strike:4,heavy:3,charge:1}},
 caster:{hp:.85,str:.6,mag:1.25,dur:.8,spd:1,i:{spell:5,strike:2,guard:1}},
 swift:{hp:.8,str:.95,mag:.6,dur:.7,spd:1.4,i:{strike:4,flurry:3}},
 tank:{hp:1.3,str:.9,mag:.6,dur:1.25,spd:.7,i:{strike:3,guard:3,heavy:2}},
 duel:{hp:1,str:1,mag:1,dur:1,spd:1,i:{strike:3,heavy:2,spell:2,guard:1,charge:1}}
};
const INTN={strike:'Strike',heavy:'Heavy blow',spell:'Spell',flurry:'Flurry (3 hits)',guard:'Guard',charge:'Gathering power',unleash:'UNLEASH',heal:'Heal',drain:'Life drain'};
const INTW={heavy:1,charge:1,unleash:1,spell:1,flurry:1};
const REGIONS=[
 {id:'wood',n:'Whisperwood',rank:0,cc:20,f:[['Thicket Wolf','swift'],['Moss Goblin','brute'],['Bramble Imp','caster'],['Hollow Stag','tank']]},
 {id:'mines',n:'Ashen Mines',rank:1,cc:50,f:[['Slag Crawler','tank'],['Cave Bat Swarm','swift'],['Cinder Golem','brute'],['Pit Shaman','caster']]},
 {id:'crypt',n:'Drowned Crypt',rank:2,cc:100,f:[['Drowned Knight','tank'],['Bone Eel','swift'],['Grave Matron','caster'],['Salt Ghoul','brute']]},
 {id:'spires',n:'Skyward Spires',rank:3,cc:190,f:[['Storm Harpy','swift'],['Spire Sentinel','tank'],['Wind Priest','caster'],['Thunder Roc','brute']]},
 {id:'void',n:'The Voidmarch',rank:4,cc:330,f:[['Rift Hound','swift'],['Husk of Nothing','tank'],['Void Seer','caster'],['Null Brute','brute']]},
 {id:'rift',n:'Starfall Rift',rank:5,cc:560,f:[['Star Wraith','caster'],['Comet Beast','brute'],['Shard Knight','tank'],['Nova Sprite','swift']]},
 {id:'abyss',n:'The Last Abyss',rank:6,cc:950,f:[['Abyssal Titan','brute'],['Hollow Choir','caster'],['Endless Maw','tank'],['Shade Duelist','swift']]}
];
const BOSSES=[
 {id:'matriarch',n:'Bramble Matriarch',cc:45,hp:1.7,a:'caster',i:{strike:3,spell:3,heal:1,heavy:1},d:'Mother of the Whisperwood thickets.',title:'Thornbreaker'},
 {id:'golemking',n:'Cinder Golem King',cc:100,hp:1.8,a:'tank',i:{heavy:3,charge:2,guard:2,strike:2},d:'A furnace given a crown.',title:'Kingsmelter'},
 {id:'captain',n:'The Drowned Captain',cc:180,hp:1.8,a:'duel',i:{strike:3,heavy:2,drain:2,guard:1},d:'He still commands a crew of corpses.',title:'Tidebreaker'},
 {id:'roc',n:'Storm Roc Empress',cc:300,hp:2.8,a:'swift',i:{flurry:3,spell:2,charge:1,strike:2},d:'Her wings carry the thunder.',title:'Skyfeller'},
 {id:'regent',n:'The Pale Regent',cc:480,hp:2.7,a:'caster',i:{spell:3,drain:2,guard:1,charge:1},d:'Ruler of the Voidmarch\'s silent court.',title:'Regicide'},
 {id:'stareater',n:'Star-eater',cc:780,hp:3,a:'brute',i:{heavy:3,charge:2,strike:2,heal:1},d:'It swallowed three constellations.',title:'Starsaver'},
 {id:'paragon',n:'The Fallen Paragon',cc:1250,hp:3.3,a:'duel',i:{strike:3,heavy:2,spell:2,charge:1,heal:1},d:'Once the greatest of the Vigil.',title:'Oathkeeper'},
 {id:'herald',n:'Herald of Oblivion',cc:2000,hp:3.8,a:'caster',i:{spell:3,drain:2,charge:2,heavy:1},d:'The end of all things, wearing a mask.',title:'Last Light'}
];
const GEAR=[
 {id:'iron',n:'Iron Sword',s:'w',b:.10,c:120},{id:'longsword',n:'Knight\'s Longsword',s:'w',b:.22,c:700},
 {id:'hammer',n:'Warhammer',s:'w',b:.35,c:3000},{id:'spear',n:'Runed Spear',s:'w',b:.5,c:10000},
 {id:'wyrm',n:'Wyrmbone Blade',s:'w',b:.75,c:40000},{id:'starmetal',n:'Starmetal Greatsword',s:'w',b:1.1,c:150000},
 {id:'wand',n:'Apprentice Wand',s:'f',b:.12,c:150},{id:'orb',n:'Crystal Orb',s:'f',b:.25,c:900},
 {id:'runestaff',n:'Rune Staff',s:'f',b:.4,c:4000},{id:'archstaff',n:'Archmage Staff',s:'f',b:.6,c:15000},
 {id:'codex',n:'Star Codex',s:'f',b:.9,c:60000}
];
const LEGACY=[
 {id:'talent',n:'Inherited Talent',d:'+10% training gains per level',c:15,max:50},
 {id:'coin',n:'Old Coin',d:'+15% gold per level',c:10,max:30},
 {id:'head',n:'Head Start',d:'+4 to every starting stat per level',c:12,max:25},
 {id:'reserve',n:'Deep Reserves',d:'+2 max energy and +10% energy regen per level',c:20,max:15},
 {id:'favor',n:'Fate\'s Favor',d:'+2 free spins per category per life',c:15,max:10},
 {id:'memory',n:'Battle Memory',d:'+15% race and magic XP per level',c:15,max:30}
];
const ASSISTS=[
 ['auto','Auto training','Skip mini-games and complete training at Grade A.'],
 ['train2','2x training','Doubles stat gains, mastery and race XP from training.'],
 ['gold2','2x gold','Doubles gold from fights, work and salary.'],
 ['speed','Time skip','Energy, recovery and passive drills run 5x faster.'],
 ['god','God mode','You take no damage in combat.'],
 ['spins','Unlimited fate spins','Rolling fate costs nothing.']
];
const RACE_XP=[60,200,500,1200,2800,6000,12000];
const MERIT_CODEX=[1,2,4,8,15,30,60,150];
const EXACT_COST=[5,10,20,40,80,150,300];

/* jobs: base pay, stat, pay per stat point, requirement */
const JOBS=[
 {id:'stable',n:'Stablehand',st:'str',b:10,k:.5,req:0,rank:0,d:'Muck stalls and haul feed for the town stables.'},
 {id:'courier',n:'Courier',st:'spd',b:14,k:.6,req:20,rank:0,d:'Run letters and parcels between villages.'},
 {id:'scribe',n:'Scribe',st:'int',b:16,k:.7,req:30,rank:0,d:'Copy contracts and old scrolls for the guild hall.'},
 {id:'guard',n:'Caravan Guard',st:'dur',b:30,k:.8,req:45,rank:1,d:'Escort merchant wagons through the Whisperwood.'},
 {id:'apoth',n:'Apothecary Assistant',st:'ctl',b:45,k:.9,req:70,rank:1,d:'Brew remedies. Sometimes you get to keep a Healing Draught.'},
 {id:'tutor',n:'Arcane Tutor',st:'mag',b:70,k:1,req:110,rank:2,d:'Teach noble children their first spells.'},
 {id:'chaplain',n:'Vigil Chaplain',st:'spr',b:110,k:1.05,req:170,rank:2,d:'Lead the knights in prayer and keep their spirits steady.'},
 {id:'instructor',n:'Vigil Instructor',st:'str',b:150,k:1.1,req:220,rank:3,d:'Drill new squires in the training yard.'},
 {id:'bodyguard',n:'Royal Bodyguard',st:'dur',b:260,k:1.2,req:330,rank:4,d:'Stand between nobility and every blade aimed at them.'},
 {id:'archmage',n:'Court Archmage',st:'mag',b:450,k:1.4,req:520,rank:5,d:'Advise the crown on matters of magic and war.'}
];
const JOBLV=[0,10,25,50,100,200];
const JOBT=['Trainee','Regular','Skilled','Senior','Master','Legend'];
