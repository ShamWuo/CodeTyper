# Code Typer

Code Typer is a browser-based typing simulator that turns real source code into a smooth playback you can export as looping GIFs. Paste or type code, preview the animation, and save GIFs locally or to the built-in compilation library.

## Features

- Play back code typing with precise millisecond control over the cursor speed.
- Insert non-blocking pauses with `Tpyr.wait()` directives that are ignored by the output text.
- Automatic trimming keeps playback performant during long sessions without flashing the cursor to the top.
- Adjustable stage width, minimum height, and reset height when you need roomy frames.
- Multiple color themes tuned for the custom highlight map.
- Optional line numbers render in the live stage and exported GIFs with a single toggle.
- Override syntax detection with a searchable language picker when auto-detect gets it wrong.
- Export ready-to-share GIFs or compile them into a temporary library without downloading immediately.

## Development Notes

The project is framework-free and ships static assets only:

- `main.js` holds the playback controller, highlight mapping, wait directive parser, and GIF export pipeline.
- `styles.css` styles the layout, stage controls, and compilation panel.
- `index.html` wires everything together and pulls in dependencies from public CDNs (Typed.js, Highlight.js, gif.js).

Clone or open the folder with any static server to test locally. No build step is required.
