/* ===== FATE DATA ===== */
const RAR=[
  {n:'Common',w:45,c:'#d9d4c7'},{n:'Uncommon',w:25,c:'#57d27a'},{n:'Rare',w:14,c:'#4ea6ff'},{n:'Epic',w:7,c:'#b678ff'},
  {n:'Legendary',w:4.5,c:'#ffb340'},{n:'Mythic',w:2.7,c:'#ff4f8b'},{n:'Divine',w:1.6,c:'#fff0a0'},{n:'Secret',w:.2,c:'#ff3030'}
];
const STK=['str','spd','dur','vit','mag','ctl','spr','int'];
const STN={str:'Strength',spd:'Speed',dur:'Durability',vit:'Health',mag:'Magic',ctl:'Magic Control',spr:'Spirit',int:'Intelligence'};
const XN={learn:'training gains',gold:'gold earned',crit:'critical chance',all:'all stats'};

const RACES=[
 {id:'human',n:'Human',r:0,d:'Adaptable and driven. Learns faster than anyone.',m:{learn:.15,gold:.1},st:'Grit|Quick Study|Battle Sense|Iron Will|Awakened Potential|Hero\'s Resolve|Paragon of Man'},
 {id:'stonebred',n:'Stonebred',r:1,d:'Towering mountain clans built like cliffs.',m:{str:.35,vit:.35,dur:.3,spd:-.15},st:'Enhanced Strength|Stone Skin|Earth Shaping|War Chant|Mountain Heart|Titan Mastery|Mountain King Candidate'},
 {id:'tidefolk',n:'Tidefolk',r:1,d:'Sea-born folk with calm, deep minds.',m:{vit:.2,ctl:.25,spr:.15},st:'Gill Breath|Current Sense|Tide Calling|Deep Pressure|Pearl Heart|Maelstrom|Tide Sovereign'},
 {id:'skyborn',n:'Skyborn',r:2,d:'Cloud-city people, light and swift.',m:{spd:.4,int:.2,dur:-.1},st:'Feather Step|Wind Reading|Glide|Updraft|Storm Eyes|Sky Dancer|Herald of the Winds'},
 {id:'sylvan',n:'Sylvan',r:2,d:'Forest-born fae steeped in old magic.',m:{mag:.35,spd:.2,spr:.15,str:-.2},st:'Leafsong|Bloom|Grove Bond|Wild Growth|Ancient Bark|Heartwood|Sylvan Monarch'},
 {id:'ashborn',n:'Ashborn',r:3,d:'Born of ember and shadow. Hungry for battle.',m:{str:.3,mag:.3,vit:.15,spr:-.1},st:'Ember Blood|Dark Flame|Hellish Regrowth|Crimson Horns|Twin Hearts|Inferno Core|Ash Lord'},
 {id:'lumen',n:'Lumen',r:4,d:'Radiant beings descended from the high heavens.',m:{mag:.35,spr:.4,ctl:.2},st:'Halo|Radiant Wings|Purifying Light|Sanctuary|Celestial Song|Seraph Form|Archon'},
 {id:'dragonkin',n:'Dragonkin',r:5,d:'Scaled descendants of the old wyrms.',m:{str:.4,dur:.4,vit:.3,mag:.25},st:'Scales|Fire Lungs|Wyrm Eyes|Wings|Dragon Heart|Ancient Roar|Elder Wyrm'},
 {id:'starforged',n:'Starforged',r:6,d:'Shaped from fallen starlight.',m:{all:.45},st:'Spark|Constellation|Nova Pulse|Gravity Core|Supernova|Celestial Body|Living Star'},
 {id:'voidtouched',n:'Voidtouched',r:7,d:'Something from beyond answered when you were born.',m:{all:.7,learn:.2},st:'Hollow|Unseen|Void Step|Unmaking|Null Heart|Reality Tear|Beyond'}
];
const BLOODS=[
 {id:'common',n:'Common Line',r:0,d:'An ordinary family with nothing to live up to.',m:{learn:.05}},
 {id:'farm',n:'Farmhand Line',r:0,d:'Generations of hard labour.',m:{vit:.1,str:.05}},
 {id:'hunter',n:'Hunter Line',r:1,d:'Trackers and archers of the deep woods.',m:{spd:.15,int:.08}},
 {id:'soldier',n:'Soldier Line',r:1,d:'A family of footsoldiers.',m:{str:.12,dur:.12}},
 {id:'scholar',n:'Scholar Line',r:1,d:'Keepers of old libraries.',m:{int:.2,ctl:.08}},
 {id:'knight',n:'Knight Lineage',r:2,d:'Sworn knights for five generations.',m:{str:.15,dur:.15,vit:.1}},
 {id:'mage',n:'Court Mage Lineage',r:2,d:'A line of court mages.',m:{mag:.2,ctl:.15}},
 {id:'royal',n:'Royal Blood',r:3,d:'Distant royal blood and the wealth that comes with it.',m:{all:.12,gold:.3}},
 {id:'champion',n:'Champion\'s Blood',r:4,d:'Descended from a legendary champion.',m:{str:.25,spd:.2,dur:.2,vit:.2}},
 {id:'archmage',n:'Archmage Line',r:4,d:'Heirs of a famous archmage.',m:{mag:.3,ctl:.3,spr:.15}},
 {id:'ancient',n:'Ancient Blood',r:5,d:'Blood older than the kingdoms.',m:{all:.25}},
 {id:'divine',n:'Godtouched Blood',r:6,d:'Marked by a forgotten god.',m:{all:.35,learn:.15}},
 {id:'primordial',n:'Primordial Blood',r:7,d:'The first blood. Nothing else compares.',m:{all:.55,learn:.25}}
];
/* skills: [name, mana, power, effect] — effects: burn stun shield heal drain pierce multi weaken evade counter */
const MAGICS=[
 {id:'flame',n:'Flame',r:0,d:'Conjure and hurl fire.',sk:[['Fireball',15,1.3,''],['Flame Wall',20,.8,'shield'],['Blazing Lance',35,2.4,'burn']]},
 {id:'frost',n:'Frost',r:0,d:'Freeze water out of the air.',sk:[['Ice Shard',14,1.2,''],['Frozen Hold',25,.9,'stun'],['Glacier Spike',38,2.5,'pierce']]},
 {id:'wind',n:'Wind',r:0,d:'Command the breeze.',sk:[['Gale Cut',12,1.1,'multi'],['Tailwind',18,0,'evade'],['Cyclone',36,2.3,'multi']]},
 {id:'earth',n:'Earth',r:0,d:'Shape stone and soil.',sk:[['Rock Throw',14,1.25,''],['Stone Armor',22,.7,'shield'],['Landslide',40,2.6,'stun']]},
 {id:'spark',n:'Lightning',r:0,d:'Snap sparks between your fingers.',sk:[['Spark Bolt',13,1.3,''],['Static Field',22,1,'weaken'],['Thunderclap',38,2.5,'stun']]},
 {id:'nature',n:'Nature',r:0,d:'Make plants grow on command.',sk:[['Thorn Lash',13,1.2,''],['Regrowth',24,1.3,'heal'],['Strangling Roots',36,2.2,'weaken']]},
 {id:'shadow',n:'Shadow',r:1,d:'Move and strike through living darkness.',sk:[['Shade Strike',15,1.4,'pierce'],['Shadow Veil',20,0,'evade'],['Binding Dark',40,2.6,'stun']]},
 {id:'water',n:'Water',r:1,d:'Bend rivers and rain.',sk:[['Water Whip',14,1.3,''],['Healing Tide',26,1.5,'heal'],['Tidal Crush',40,2.7,'']]},
 {id:'iron',n:'Iron',r:1,d:'Harden and shape metal.',sk:[['Iron Fist',15,1.5,''],['Steel Skin',22,1,'shield'],['Blade Storm',42,2.6,'multi']]},
 {id:'sound',n:'Sound',r:1,d:'Turn noise into force.',sk:[['Sonic Pulse',14,1.3,''],['Discord',22,1,'weaken'],['Shatter Note',40,2.8,'pierce']]},
 {id:'light',n:'Healing Light',r:1,d:'A gentle light that mends wounds.',sk:[['Light Mote',13,1.2,''],['Mend',25,1.8,'heal'],['Radiant Burst',40,2.5,'']]},
 {id:'blood',n:'Blood',r:2,d:'Command the life within veins.',sk:[['Blood Needle',16,1.5,'drain'],['Crimson Pact',22,1.2,'drain'],['Hemorrhage',45,3,'burn']]},
 {id:'gravity',n:'Gravity',r:2,d:'Make things crushingly heavy.',sk:[['Crush',18,1.6,''],['Weightless',20,0,'evade'],['Collapse',48,3.1,'stun']]},
 {id:'illusion',n:'Illusion',r:2,d:'Bend what others see.',sk:[['Phantom',16,1.4,''],['Mirror Image',22,0,'evade'],['Nightmare',45,2.9,'weaken']]},
 {id:'storm',n:'Storm',r:2,d:'Rain, wind and thunder at once.',sk:[['Storm Bolt',18,1.6,''],['Squall',26,1.4,'multi'],['Tempest',50,3.2,'stun']]},
 {id:'solar',n:'Solar Flame',r:3,d:'A fire as bright as noon.',sk:[['Sunray',20,1.8,'burn'],['Noon Shield',26,1.5,'shield'],['Solar Flare',55,3.6,'burn']]},
 {id:'blackice',n:'Black Ice',r:3,d:'Cold so deep it burns.',sk:[['Black Shard',20,1.8,'pierce'],['Frostbite',28,1.6,'weaken'],['Absolute Zero',55,3.5,'stun']]},
 {id:'reversal',n:'Reversal',r:4,d:'Turn an enemy\'s force back on them.',sk:[['Deflect',20,0,'counter'],['Rebound',28,2.1,''],['Perfect Return',60,4,'pierce']]},
 {id:'starfall',n:'Starfall',r:4,d:'Pull meteors from the sky.',sk:[['Meteor',24,2.1,''],['Star Shield',30,2,'shield'],['Starfall',65,4.2,'multi']]},
 {id:'eclipse',n:'Eclipse',r:5,d:'Swallow light itself.',sk:[['Umbra',26,2.3,'drain'],['Corona',34,2,'burn'],['Total Eclipse',70,4.6,'stun']]},
 {id:'dragon',n:'Dragon Breath',r:5,d:'Breathe the fire of wyrms.',sk:[['Breath',26,2.4,'burn'],['Wyrm Scales',32,2.2,'shield'],['Cataclysm',72,4.8,'pierce']]},
 {id:'creation',n:'Creation',r:6,d:'Make anything from nothing.',sk:[['Forge Weapon',28,2.6,''],['Make Wall',34,2.6,'shield'],['Genesis',80,5.4,'drain']]},
 {id:'judgment',n:'Judgment',r:6,d:'A divine verdict on the guilty.',sk:[['Verdict',30,2.7,'pierce'],['Sanctify',36,2.4,'heal'],['Final Judgment',85,5.6,'stun']]},
 {id:'oblivion',n:'Oblivion',r:7,d:'Erase things from existence.',sk:[['Unmake',32,3.2,'pierce'],['Null Field',40,3,'weaken'],['Erasure',90,7,'pierce']]}
];
const SK_UNLOCK=[1,4,10];
const EFFN={burn:'Burns for 3 turns',stun:'Stuns the enemy',shield:'Creates a shield',heal:'Heals you',drain:'Heals 40% of damage dealt',pierce:'Ignores most defence',multi:'Hits 3 times',weaken:'Enemy deals 35% less for 3 turns',evade:'Next enemy attack very likely to miss',counter:'Reflects the next physical attack'};
const TRAITS=[
 {id:'intelligent',n:'Intelligent',r:0,d:'You absorb knowledge with ease.',m:{int:.12,learn:.1,ctl:.05}},
 {id:'strong',n:'Strong',r:0,d:'Naturally powerful muscles.',m:{str:.12}},
 {id:'swift',n:'Swift',r:0,d:'Quick on your feet.',m:{spd:.12}},
 {id:'tough',n:'Tough',r:0,d:'Hard to put down.',m:{dur:.12,vit:.05}},
 {id:'calm',n:'Calm',r:0,d:'Steady breathing, steady magic.',m:{ctl:.12,spr:.05}},
 {id:'worker',n:'Hard Worker',r:1,d:'You never skip a session.',m:{learn:.2}},
 {id:'gifted',n:'Gifted',r:1,d:'Magic comes easily to you.',m:{mag:.15,ctl:.05}},
 {id:'lucky',n:'Lucky',r:1,d:'Coins and openings find you.',m:{gold:.25,crit:.05}},
 {id:'hot',n:'Hot-Blooded',r:1,d:'You fight with fire in your chest.',m:{str:.12,mag:.08}},
 {id:'prodigy',n:'Prodigy',r:2,d:'You learn in days what takes others years.',m:{learn:.3}},
 {id:'warborn',n:'Warborn',r:2,d:'Born for the battlefield.',m:{str:.15,dur:.15,spd:.08}},
 {id:'ironmind',n:'Iron Mind',r:2,d:'Your focus never breaks.',m:{spr:.2,int:.15}},
 {id:'genius',n:'Genius',r:3,d:'A once-in-a-generation mind.',m:{int:.3,learn:.25,ctl:.1}},
 {id:'berserker',n:'Berserker',r:3,d:'Pain only makes you hit harder.',m:{str:.3,vit:.1,dur:-.1,crit:.05}},
 {id:'chosen',n:'Chosen',r:4,d:'Fate itself leans your way.',m:{all:.15,learn:.2}},
 {id:'unbreakable',n:'Unbreakable',r:4,d:'Nothing has ever broken you.',m:{dur:.4,vit:.3}},
 {id:'monster',n:'Monster',r:5,d:'Others whisper that you are not human.',m:{str:.35,vit:.35,dur:.25,spd:.15}},
 {id:'ascendant',n:'Ascendant',r:6,d:'Your ceiling keeps rising.',m:{all:.3,learn:.3}},
 {id:'anomaly',n:'Anomaly',r:7,d:'You should not exist.',m:{all:.5,learn:.5,crit:.1}}
];
const BACKS=[
 {id:'noble',n:'Noble Heir',d:'Raised by tutors and court mages. Strong magical fundamentals, but less hardened by hardship.',raw:{mag:8,ctl:8,int:6,dur:-3},gold:400},
 {id:'slums',n:'Slums Survivor',d:'A hard childhood built strength, speed, durability and fierce resilience.',raw:{str:7,spd:7,dur:7,vit:4},gold:0},
 {id:'knight',n:'Knight Household',d:'Discipline and sparring shaped a balanced warrior. Starts with an Iron Sword.',raw:{str:5,dur:5,vit:5,spd:3,spr:3},gold:100,wpn:'iron'},
 {id:'scholar',n:'Wandering Scholar',d:'Travel, books and observation sharpened magic, spirit and intelligence.',raw:{mag:6,spr:7,int:8},gold:120}
];
const CATS=[['race','Race',RACES],['bl','Bloodline',BLOODS],['mag','Magic',MAGICS],['trait','Trait',TRAITS]];
const FIRST=['Aldric','Brenna','Cael','Dara','Eamon','Fenna','Gareth','Halric','Isolde','Joren','Kestra','Lysa','Maren','Nolan','Orin','Perrin','Rhea','Soren','Talia','Ulric','Vessa','Wren','Yara','Zeph','Mira','Torin','Elka','Bram','Ione','Miles','Kael','Sable'];
