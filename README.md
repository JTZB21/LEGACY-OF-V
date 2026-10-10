# Lineage of the Vigil

A text-based fantasy progression RPG that runs in the browser. Roll your fate, train through mini-games, fight tactical turn-based battles, climb the ranks of the Vigil and rebirth for permanent upgrades.

**Play:** open `index.html` in a browser. Progress saves in that browser's local storage; use Settings → Export to back it up.

## Features
- **Fate rolls:** race, bloodline, magic and trait, each across 8 rarity tiers (Common 45% to Secret 0.2%), with free spins, Merit rerolls and exact-fate picks
- **8 stats** and a Combat Class rating
- **8 training mini-games** with grades, mastery and gear tiers, plus a passive drill
- **Work tab:** 10 jobs with stat and rank requirements and promotions
- **Combat:** turn-based with HP, mana and stamina; enemies telegraph moves; block, dodge, heavy blows and magic skills
- **7 regions, 8 bosses, 6 rank trials, an armory and potions**
- **Rebirth:** end a life for Merit, which buys permanent upgrades; a codex rewards first-time discoveries
- **Optional assists** in Settings (auto training, 2x gains, time skip, god mode). No paid features.

## Project layout
```
src/shell.html               page title, fonts, CSS and HTML skeleton
src/js/1-data-fate.js        rarities, races, bloodlines, magics, traits, backstories
src/js/2-data-progression.js training, ranks, enemies, regions, bosses, gear, legacy, jobs
src/js/3-core.js             state, stat formulas, fate rolling, training, work, rebirth, save/load
src/js/4-combat.js           combat engine
src/js/5-minigames.js        training mini-games
src/js/6-ui-screens.js       tab screens
src/js/7-ui-overlays.js      combat/mini-game/modal overlays, events, boot
build.sh                     joins src/ into index.html and dist/artifact.html
```
Edit files in `src/`, then run `./build.sh`. JS files are concatenated in filename order and share one global scope.

## Roadmap
- Life simulation layer: aging, life events, relationships, marriage, children and heirs
- More magics (goal: 40+), regions and bosses
- Character appearance customization
