# Devlog

## 2026-02-19 — UI Refactor & Playback Stability Pass

### Summary
This cycle focused on a full playback-side UI polish and interaction reliability pass. The goal was to make the right pane feel production-ready: cleaner visual hierarchy, predictable controls, and fewer layout artifacts.

### UI Refactor Progress
- Refined playback window composition so the title bar and code surface feel like one connected component.
- Removed the “double-box” look by flattening the inner frame treatment under the title bar.
- Improved line-number gutter placement and visual balance.
- Made playback title editable inline (`code.js — bash`), with better typing behavior and no caret jump while editing.
- Simplified settings sidebar by removing unused/low-value controls:
  - Window Controls
  - Drop Shadow
  - Export Settings block
- Removed the non-working `Tpyr.wait(ms)` tip in the bottom-right info panel.

### Playback Interaction Improvements
- Reworked playback resizing behavior:
  - Resize no longer causes the window to drift/move unexpectedly.
  - Edge hit-testing now respects true bounds and uses tighter handle sensitivity.
  - Horizontal scroll behavior improved so line numbers stay visually fixed while code scrolls.
- Play/Pause control reliability fixed:
  - Migrated pause/resume handling to the Typed.js-compatible control path.
  - Prevented accidental auto-complete jumps by constraining typing advancement behavior.

### Rendering & Content Behavior
- Restored continuous line numbering and default-on line number state.
- Added playback horizontal overscroll behavior with hidden scrollbar for overflowed lines.
- Wired font-family selector into runtime theme/render state so selection updates are reflected in playback.

### Timing Work (Ongoing Accuracy Tuning)
- Reworked playback time estimation multiple times:
  - Stabilized total duration display to reduce jitter.
  - Added deterministic typing timing patch.
  - Added live ETA correction using observed pace + remaining pauses.
- Result: improved compared to baseline, but long-run timing still needs one more dedicated tuning pass to match real completion more tightly.

### Cache/Versioning Hygiene
- Incremented asset query versions repeatedly (`main.js?v=...`, `styles.css?v=...`) to avoid stale browser cache behavior while iterating.

### Next Suggested Step
- Add a small internal timing debug mode (hidden flag) to log:
  - observed ms/char,
  - consumed/remaining pause budget,
  - projected vs actual completion delta,
  so final timer calibration can be locked down in one focused pass.
