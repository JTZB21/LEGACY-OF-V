# Notes for Claude

- Single-page vanilla JS game, no framework or dependencies. Source lives in `src/`; `index.html` and `dist/artifact.html` are build outputs from `./build.sh`. Always edit `src/`, then rebuild, and commit the rebuilt outputs too.
- JS files are concatenated in numeric order into one `<script>`, so they share globals. Data files (1, 2) must stay free of references to later files at load time.
- Save key is `vigil_save_v3` in localStorage with `S.v===3`. If the save shape changes incompatibly, bump both and accept that old saves reset, or add a migration in `load()` in `3-core.js`.
- Visual direction (the owner's choice): black background, gold borders, crimson buttons, parchment log panels; Cinzel for the logo, Montserrat for UI. Must work at phone width (~400px).
- The setting is original. Don't use names, places or terms from existing anime or games.
- No pay-to-win: paid-pass style effects exist only as free optional toggles in Settings → Assists.
- Balance: enemy stats mirror player formulas so an enemy at CC X is an even match for a player at CC X. Regular enemies use 0.5x HP; bosses have per-boss HP multipliers. Re-check win rates with a headless simulation after changing combat numbers.
- The live artifact is published from `dist/artifact.html`.
