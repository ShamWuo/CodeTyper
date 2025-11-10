# Code Typer

Code Typer is a browser-based typing simulator that turns real source code into a smooth playback you can export as looping GIFs. The interface runs entirely in the browser—paste or type code, preview the animation, and save GIFs locally or to the built-in compilation library.

## Features

- Play back code typing with precise millisecond control over the cursor speed.
- Insert non-blocking pauses with `Tpyr.wait()` directives that are ignored by the output text.
- Automatic trimming keeps playback performant during long sessions without flashing the cursor to the top.
- Adjustable stage width, minimum height, and reset height when you need roomy frames.
- Multiple color themes tuned for the custom highlight map.
- Optional line numbers render in the live stage and exported GIFs with a single toggle.
- Override syntax detection with a searchable language picker when auto-detect gets it wrong.
- Export ready-to-share GIFs or compile them into a temporary library without downloading immediately.

## Quick Start

1. Paste code into the left editor and press **Play Typing** (or `Ctrl + Enter`).
2. Use the **Speed** slider/input to set the delay between characters in milliseconds.
3. Tweak the **Stage** controls to widen the frame or increase the minimum code height before exporting.
4. Hit **Export GIF** when you like the playback, or **Compile & Save** to stash it in the library panel.

## Pause Directives
## Language Selection

The app auto-detects the language for syntax highlighting, but you can override it at any time:

- Use the **Language** combobox to search for a language or select **auto** to return to detection.
- Highlight.js powers most languages, while JavaScript/TypeScript still fall back to the custom highlighter if the CDN script fails to load.
- The selection carries through to GIF exports so rendered frames match the preview.


Use `Tpyr.wait()` anywhere in your code to insert a natural pause while keeping the text intact.

- `Tpyr.wait(2);` pauses for 2 seconds (default unit is seconds).
- `Tpyr.wait(750, 'ms');` pauses for 750 milliseconds.
- Repeat directives as often as you need; the parser reads the literal line and appends the delay to the playback script.

If the directive cannot be parsed (for example, it contains a variable instead of a literal), the line is left untouched.

## Height Reset & Trimming

The **Reset Height** control guards against runaway scroll heights. When the rendered output grows beyond the limit, the oldest lines are trimmed from the playback buffer while keeping Typed.js cursors aligned. This keeps long recordings smooth and prevents export slowdowns. Adjust the value or set it high if you want to keep the full history in view during short sessions.

## Compilation Library

Use **Compile & Save** to render a GIF into the on-page library. Each entry lists its size and the capture time, provides a thumbnail, and includes **Download** and **Remove** actions. Compiled entries persist until you refresh the page or remove them manually. Downloaded GIF URLs are revoked automatically after one minute to avoid leaking object URLs.

## Development Notes

The project is framework-free and ships static assets only:

- `main.js` holds the playback controller, highlight mapping, wait directive parser, and GIF export pipeline.
- `styles.css` styles the layout, stage controls, and compilation panel.
- `index.html` wires everything together and pulls in dependencies from public CDNs (Typed.js, Highlight.js, gif.js).

Clone or open the folder with any static server to test locally. No build step is required.
