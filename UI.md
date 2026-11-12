# CLIFF terminal interface

CLIFF restores its original violet, cool-white, and slate palette, with a larger slash-and-cliff signature beside the six-row CLIFF wordmark. The tagline is **THE EDGE IS YOURS.** The UI uses the terminal's existing background instead of changing the user's terminal theme.

## Preview and tests

Run `npm run preview:ui` for a self-contained visual tour. It does not call Groq, read settings, ask for approval, or change files. On PowerShell systems that block npm.ps1, use `npm.cmd run preview:ui`.

Add `-- --interactive` to try the real readline approval prompt in this preview. Its decision only changes the displayed example receipt; it never writes a file.

Run `npm test` (or `npm.cmd test`) for presentation checks and isolated tool/graph integration tests. Tests use fake model responses and temporary files; no real API key is needed.

## Structure

- `src/ui/branding.js`: enlarged CLIFF wordmark, slash-and-cliff signature, and ASCII fallback. The logo is terminal text, not an embedded image.
- `src/ui/terminal.js`: shared violet/cool-white styles, welcome reveal, model menu, commands, response renderer, loading rail, tool receipts, numbered diffs, and input presentation. `createTerminalUI()` accepts an output stream for tests; the exported `ui` instance is shared by the application.
- `index.js`: welcome and top-level runtime error presentation. Version comes from package.json.
- `src/main.js` and `src/cli/`: existing decisions with presentation calls replacing console output and prompt strings.
- `src/graphs/nodes.js`: observes model token callbacks, renders the completed response when tokens are absent, and displays tool-call summaries. The existing invoke, graph routing, state, and returned messages are retained.
- `src/tools/`: presentation-only result receipts. Tool names, schemas, return formats, and file operations are retained.
- `src/utils/permission.utils.js`: existing approval and stale-content checks with a styled diff and prompt.

The renderer uses the existing Chalk dependency. No additional packages or terminal framework were added. There is one existing readline interface. UI questions share a presentation queue; other UI output is deferred while a question is active. The existing mutation queue still owns file-operation serialization.

## Terminal behavior

Color is disabled for redirected output, `TERM=dumb`, `FORCE_COLOR=0`, and `NO_COLOR` (including an empty value). Modern terminals with truecolor support use violet `#A78BFA`, cool white `#E5E7EB`, and slate `#80899E`; other terminals use the closest ANSI palette. Unicode has an ASCII fallback; set `CLIFF_ASCII=1` to request it explicitly. Set `CLIFF_NO_ANIMATION=1` to disable motion.

The arrival wordmark reveals from left to right over 24 frames (about 1.6 seconds), followed by an INITIALIZING stage around the actual existing setup operations. Loading uses a moving marker, not invented completion percentages. The READY signature appears only after the existing model initialization. No claims about context indexing or other unimplemented features appear. Animated startup is awaited before the main loop starts. Both the logo reveal and loading rail stop before input or other output and never hide the cursor. Narrow and redirected terminals get a static version.

Layout uses a compact wordmark on narrow terminals, bounded separators, and native terminal wrapping for long text. Code and diffs are never truncated. Diffs preserve source line numbers and use red/green signs; approvals keep the existing y/N rules. Markdown rendering intentionally supports headings, bold text, inline code, and fenced code only. Model/file text has terminal control sequences removed before display.

Token callbacks are rendered incrementally at newline boundaries, with the last partial line flushed on completion. This preserves code formatting and avoids duplicate final answers. The current Groq client does not enable streaming: the normal application still renders its completed invoke response. Enabling provider streaming is a separate behavior change.

## Existing functional blockers observed during this redesign

- `src/cli/commands/model.command.js` now imports `getSupportedChatModels`, but its function body still calls the nonexistent `getAllAIModels`. Startup can import the application, but `/changeModel` throws at runtime.
- `src/tools/writeFile.tool.js` contains a standalone `X` after its catch block. Nonempty write requests throw after processing the first file, potentially after that file was already written.
- Existing workspace checks do not resolve symlinks/junctions, and approval cannot distinguish a missing file from an empty existing file.
- Existing empty-model handling, settings validation, and API-key input visibility are unchanged.

These issues were not repaired because this task explicitly preserves business logic and configuration behavior. Tests cover isolated startup, API-key configuration, initial model selection, API-key changes, graph/tool routing, approval, and queued edits with fake services and temporary files. Live Groq requests are not exercised. Cross-platform fallbacks are tested with simulated terminal capabilities; native macOS and Linux sessions have not been exercised here.
