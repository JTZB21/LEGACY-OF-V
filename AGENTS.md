<!-- Same rules as CLAUDE.md, for OpenAI's coding agent. Keep the two in sync. -->
# Notes for Claude

- Single-page vanilla JS game, no framework or dependencies. Source lives in `src/`; `index.html` and `dist/artifact.html` are build outputs from `./build.sh`. Always edit `src/`, then rebuild, and commit the rebuilt outputs too.
- JS files are concatenated in numeric order into one `<script>`, so they share globals. Data files (1, 2) must stay free of references to later files at load time.
- Save key is `vigil_save_v3` in localStorage with `S.v===3`. If the save shape changes incompatibly, bump both and accept that old saves reset, or add a migration in `migrate()` in `3-core.js` (already used to give pre-life-sim saves an age, gender and family).
- Visual direction (the owner's choice): black background, gold borders, crimson buttons, parchment log panels; Cinzel for the logo, Montserrat for UI. Must work at phone width (~400px).
- The setting is original. Don't use names, places or terms from existing anime or games.
- No pay-to-win: paid-pass style effects exist only as free optional toggles in Settings → Assists.
- Balance: enemy stats mirror player formulas so an enemy at CC X is an even match for a player at CC X. Regular enemies use 0.5x HP; bosses have per-boss HP multipliers, and their rank lock, Merit reward and attack bonus all come from CC (bossRank, bossMerit in 2-data-progression.js), so the list can grow in any order. Target: about 20-60% wins at the listed CC, 95%+ at 1.3x. Re-check win rates with a headless simulation after changing combat numbers.
- The live artifact is published from `dist/artifact.html`.
- Age gates live in `3-life.js`: training 3, fighting 6, work 10 (rank jobs 16), bosses and trials 12, adulthood 18. Multi-year age-ups skip events on purpose.
- Glob order matters: files sort by name, so keep the numeric prefixes (e.g. `2-data-life.js` loads before `2-data-progression.js`, `3-core.js` before `3-life.js`).
- There is no real-time progress: `tick()` and `offline()` are intentionally empty. Each year gives `maxEnergy()` activity points (`P.energy`, reset in `yearPass()` in `3-life.js`), 4 social actions, a full heal and rank salary. Leftover points can be spent by `runRoutine()`.
- Growth balance: `growth()` in `3-core.js` scales training, work, combat stat gains, events and race/magic XP by `62 / (mid-lifespan - 18)` (Human 1.0). Mini-game grades add 0-20% over the routine result.
