/* ===== LIFE SIM DATA ===== */
/* Event choice functions run later, using helpers from 3-life.js: R(stat,n) G(gold) X(raceXP) MX(magicXP) MER(merit) meet(kind) */
const EVENTS=[
 {a:[1,3],t:'A loud storm rattles the shutters all night.',c:[['Hide under the blankets',()=>R('spr',1)],['Watch the lightning',()=>R('int',1)+', '+R('mag',.5)]]},
 {a:[2,5],t:'You find a shiny beetle in the garden.',c:[['Study it closely',()=>R('int',1.5)],['Chase it everywhere',()=>R('spd',1.5)]]},
 {a:[2,5],t:'Another child grabs your favourite toy.',c:[['Take it back',()=>R('str',1.5)],['Let them share it',()=>R('spr',1.5)+'. '+meet('friend')]]},
 {a:[3,6],t:'You stack wooden blocks into a wobbling tower.',c:[['Build it slowly and carefully',()=>R('ctl',1.5)],['Knock it down with a shout',()=>R('str',1.5)]]},
 {a:[3,7],t:'A spark dances on your fingertip when you get upset.',c:[['Breathe until it fades',()=>R('ctl',2)+', '+MX(5)],['Let it burst',()=>R('mag',2)]]},
 {a:[4,8],t:'Your family takes you to the harvest festival.',c:[['Watch the knights parade',()=>R('str',1)+', '+R('dur',1)],['Visit the fortune teller',()=>R('spr',2)]]},
 {a:[6,12],t:'Older kids corner you behind the granary.',c:[['Fight back',()=>R('str',2)+', '+R('dur',1)],['Talk your way out',()=>R('int',2)],['Run for it',()=>R('spd',2)]]},
 {a:[6,12],t:'The village elder offers to teach you letters for 15 gold.',c:[['Pay for lessons',()=>S.P.gold>=15?(G(-15),R('int',3)):'You cannot afford it.'],['Decline',()=>'You spend the day outside instead.']]},
 {a:[7,12],t:'A retired knight drills children in the town square.',c:[['Join the drills',()=>R('str',1.5)+', '+R('dur',1.5)+'. '+meet('mentor')],['Watch from the fence',()=>R('int',1)]]},
 {a:[6,13],t:'You find a coin purse lying on the road.',c:[['Keep it',()=>G(30)],['Return it to its owner',()=>R('spr',2)+'. '+meet('friend')]]},
 {a:[8,14],t:'A stray wolf pup follows you home.',c:[['Raise it',()=>R('vit',2)+', '+R('spd',1)],['Return it to the woods',()=>R('spr',1.5)]]},
 {a:[9,15],t:'Your magic flares out of control during a lesson.',c:[['Practise alone at night',()=>R('ctl',2)+', '+MX(10)],['Ask a teacher for help',()=>R('int',2)+'. '+meet('mentor')]]},
 {a:[13,17],t:'Vigil recruiters are testing anyone brave enough.',c:[['Take the test',()=>combatClass()>=25?R('spr',2)+', '+X(25)+'. The recruiters take note of you.':R('dur',1)+'. You fail, but one recruiter nods at you.'],['Stay home',()=>'You watch from a distance.']]},
 {a:[13,18],t:'Someone mocks your magic in front of everyone.',c:[['Challenge them',()=>R('str',2)+'. '+meet('rival')],['Ignore them',()=>R('spr',2)]]},
 {a:[14,19],t:'A letter appears on your doorstep. Someone admires you.',c:[['Find out who sent it',()=>meet('romance')],['Leave it unanswered',()=>R('int',1)]]},
 {a:[13,20],t:'A travelling scholar offers to share their notes.',c:[['Study all night',()=>R('int',3)],['Trade a meal for a magic lesson',()=>R('mag',2)+', '+MX(8)]]},
 {a:[14,22],t:'You sneak into the old ruins outside town.',c:[['Explore deeper',()=>Math.random()<.6?X(20)+', '+G(40):(S.P.hp=Math.max(1,S.P.hp*.5),'A trap wounds you badly. HP halved.')],['Turn back',()=>R('spr',1)]]},
 {a:[15,25],t:'A merchant caravan is short a pair of hands.',c:[['Sign on',()=>G(60)+', '+R('str',1)],['Haggle for better pay',()=>G(45)+', '+R('int',1)]]},
 {a:[18,70],t:'A rival duellist insults your family name.',c:[['Accept the duel',()=>Math.random()<.55?R('str',3)+', '+G(50):(G(-Math.min(S.P.gold,40)),'You lose the duel and pay for the healer.')],['Walk away',()=>R('spr',2)]]},
 {a:[18,90],t:'A sick stranger collapses at your door.',c:[['Take them in',()=>Math.random()<.5?MX(40)+'. They were a retired mage and leave you their notes.':R('spr',2)+'. They recover and bless your house.'],['Send for the healer',()=>S.P.gold>=20?(G(-20),R('spr',1)):'You have no coin to spare.']]},
 {a:[18,999],t:'You discover a hidden spring humming with essence.',c:[['Meditate beside it',()=>X(30)+', '+R('spr',2)],['Report it to the Vigil',()=>G(80)+', '+MER(1)]]},
 {a:[20,999],t:'A ruined shrine glows when you touch it.',c:[['Pray',()=>R('spr',3)],['Search the rubble',()=>G(Math.round(rnd(30,130)))]]},
 {a:[22,999],t:'A young hopeful begs you to teach them.',c:[['Take them on',()=>R('int',2)+', '+R('ctl',1)+'. '+meet('friend')],['Turn them away',()=>'They bow and leave.']]},
 {a:[18,120],t:'An old friend invites you to a tavern night.',c:[['Go',()=>{bondAll(6);return 'Your friendships grow stronger. '+(Math.random()<.4?meet('romance'):'')}],['Stay in and train',()=>R('str',1.5)+', '+R('dur',1.5)]]},
 {a:[22,999],t:'Bandits demand a toll on the forest road.',c:[['Fight them',()=>Math.random()<.7?R('str',2)+', '+R('dur',2)+', '+G(40):(G(-Math.min(S.P.gold,60)),'They overwhelm you and take your purse.')],['Pay the toll',()=>G(-Math.min(S.P.gold,30))]]},
 {a:[28,999],t:'A noble offers a generous contract to guard their estate.',c:[['Accept',()=>G(150)+', '+R('dur',2)],['Refuse',()=>R('spr',1)]]},
 {a:[18,999],t:'The Vigil holds a grand tournament in the capital.',c:[['Compete',()=>Math.random()<.5?R('str',2)+', '+R('spd',2)+', '+MER(2)+'. You reach the final rounds!':R('dur',2)+'. You fall early but learn a lot.'],['Enjoy the feast',()=>{bondAll(4);return R('vit',1)}]]},
 {a:[45,999],t:'Old injuries ache more than they used to.',c:[['Keep training through it',()=>R('vit',2)],['Rest and reflect',()=>R('spr',2)+', '+R('int',1)]]}
];
const FLAVOUR=['A quiet year passes.','The harvest is average. You get by.','A bard sings of the Voidmarch in the tavern.','The Vigil bells ring for a fallen knight.','Rain for weeks. You practise indoors.','A good year for trade. The market is lively.','Strange lights flicker over the Skyward Spires.','A festival fills the square. You dance badly.'];
const REL_KIND={family:'Family',friend:'Friend',rival:'Rival',mentor:'Mentor',romance:'Crush',partner:'Partner',spouse:'Spouse',child:'Child'};
