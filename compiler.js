(() => {
  const textarea = document.getElementById('html-input');
  const compileButton = document.getElementById('compile-html');
  const resetButton = document.getElementById('reset-html');
  const exportButton = document.getElementById('export-gif');
  const themeSelect = document.getElementById('compiler-theme');
  const statusLabel = document.getElementById('status-text');
  const previewFrame = document.getElementById('html-preview');
  const gifDurationSlider = document.getElementById('gif-duration');
  const gifDurationInput = document.getElementById('gif-duration-input');
  const gifDurationValue = document.getElementById('gif-duration-value');

  const PLACEHOLDER = `<!-- Sample landing section -->\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>Hello World</title>\n  <style>\n    body {\n      margin: 0;\n      font-family: "Inter", sans-serif;\n      background: radial-gradient(circle at 20% 15%, #38bdf8 0%, transparent 40%),\n        radial-gradient(circle at 80% 0%, #a855f7 0%, transparent 35%),\n        #0f172a;\n      color: #e2e8f0;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      min-height: 100vh;\n    }\n    .card {\n      background: rgba(15, 23, 42, 0.65);\n      border: 1px solid rgba(148, 163, 184, 0.35);\n      border-radius: 24px;\n      padding: 36px 44px;\n      box-shadow: 0 18px 48px rgba(15, 23, 42, 0.6);\n      max-width: 460px;\n      text-align: center;\n    }\n    .card h1 {\n      margin: 0 0 18px;\n      font-size: 2.25rem;\n    }\n    .card p {\n      margin: 0 0 28px;\n      color: #b3c0d1;\n      line-height: 1.6;\n    }\n    .card button {\n      border: none;\n      border-radius: 999px;\n      padding: 12px 28px;\n      background: linear-gradient(135deg, #38bdf8, #a855f7);\n      color: #0b1120;\n      font-size: 0.95rem;\n      font-weight: 600;\n      cursor: pointer;\n      box-shadow: 0 12px 22px rgba(56, 189, 248, 0.35);\n    }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h1>Launch faster</h1>\n    <p>Build rich mockups, export code snippets, and share your prototypes effortlessly.</p>\n    <button>Get Started</button>\n  </div>\n</body>\n</html>`;

  const GIF_WORKER = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js';
  const DEFAULT_GIF_DURATION = 3000;

  const THEMES = {
    panda: {
      background: '#abb8c3',
      frameBackground: '#1f1f22',
      shadowColor: 'rgba(15, 23, 42, 0.45)',
      textColor: '#f2f4f8',
      commentColor: '#61697a',
      keywordColor: '#f46fd6',
      stringColor: '#4ff4ec',
      numberColor: '#f6b979',
      propertyColor: '#5ff0cf',
      metaColor: '#8f72ff',
      variableColor: '#fca5ff',
      functionColor: '#a5b4ff',
      variableBuiltinColor: '#b5c9ff',
      operatorColor: '#82aaff',
      attributeColor: '#ffb86c',
      constantColor: '#ff9aa2',
      booleanColor: '#fb923c',
      colorLiteralColor: '#f4f8a4',
      cursorColor: '#f46fd6',
    },
    midnight: {
      background: '#101525',
      frameBackground: '#0b1120',
      shadowColor: 'rgba(7, 12, 24, 0.65)',
      textColor: '#f8fafc',
      commentColor: '#64748b',
      keywordColor: '#60a5fa',
      stringColor: '#34d399',
      numberColor: '#facc15',
      propertyColor: '#f472b6',
      metaColor: '#a855f7',
      variableColor: '#93c5fd',
      functionColor: '#f97316',
      variableBuiltinColor: '#38bdf8',
      operatorColor: '#94a3b8',
      attributeColor: '#c4b5fd',
      constantColor: '#fbbf24',
      booleanColor: '#38bdf8',
      colorLiteralColor: '#fbbf24',
      cursorColor: '#60a5fa',
    },
    sunset: {
      background: '#ffddb0',
      frameBackground: '#25171c',
      shadowColor: 'rgba(110, 40, 55, 0.45)',
      textColor: '#fde68a',
      commentColor: '#fca5a5',
      keywordColor: '#fb7185',
      stringColor: '#fb923c',
      numberColor: '#fde047',
      propertyColor: '#f43f5e',
      metaColor: '#fb7185',
      variableColor: '#fecdd3',
      functionColor: '#fcd34d',
      variableBuiltinColor: '#fda4af',
      operatorColor: '#fee2e2',
      attributeColor: '#fcd34d',
      constantColor: '#fb7185',
      booleanColor: '#f97316',
      colorLiteralColor: '#fde68a',
      cursorColor: '#fb7185',
    },
    forest: {
      background: '#cce3d4',
      frameBackground: '#10211b',
      shadowColor: 'rgba(16, 33, 27, 0.45)',
      textColor: '#e2f7ec',
      commentColor: '#a3bfb2',
      keywordColor: '#34d399',
      stringColor: '#bbf7d0',
      numberColor: '#facc15',
      propertyColor: '#4ade80',
      metaColor: '#22d3ee',
      variableColor: '#86efac',
      functionColor: '#bef264',
      variableBuiltinColor: '#22d3ee',
      operatorColor: '#d1fae5',
      attributeColor: '#fcd34d',
      constantColor: '#f97316',
      booleanColor: '#4ade80',
      colorLiteralColor: '#facc15',
      cursorColor: '#34d399',
    },
    ocean: {
      background: '#a5f3fc',
      frameBackground: '#062637',
      shadowColor: 'rgba(6, 38, 55, 0.55)',
      textColor: '#e0f2fe',
      commentColor: '#7dd3fc',
      keywordColor: '#38bdf8',
      stringColor: '#f0abfc',
      numberColor: '#f9a8d4',
      propertyColor: '#2dd4bf',
      metaColor: '#c084fc',
      variableColor: '#22d3ee',
      functionColor: '#bae6fd',
      variableBuiltinColor: '#67e8f9',
      operatorColor: '#93c5fd',
      attributeColor: '#facc15',
      constantColor: '#f9a8d4',
      booleanColor: '#22d3ee',
      colorLiteralColor: '#facc15',
      cursorColor: '#38bdf8',
    },
    crimson: {
      background: '#f6c9d4',
      frameBackground: '#33121c',
      shadowColor: 'rgba(51, 18, 28, 0.55)',
      textColor: '#ffe4e6',
      commentColor: '#f9a8d4',
      keywordColor: '#fb7185',
      stringColor: '#f472b6',
      numberColor: '#fbbf24',
      propertyColor: '#fda4af',
      metaColor: '#fda4af',
      variableColor: '#fdba74',
      functionColor: '#fde68a',
      variableBuiltinColor: '#fb7185',
      operatorColor: '#fef3c7',
      attributeColor: '#f9a8d4',
      constantColor: '#fcd34d',
      booleanColor: '#fda4af',
      colorLiteralColor: '#fde68a',
      cursorColor: '#fb7185',
    },
    mono: {
      background: '#d9d9d9',
      frameBackground: '#1b1b1b',
      shadowColor: 'rgba(0, 0, 0, 0.55)',
      textColor: '#f5f5f5',
      commentColor: '#9ca3af',
      keywordColor: '#f97316',
      stringColor: '#34d399',
      numberColor: '#facc15',
      propertyColor: '#60a5fa',
      metaColor: '#c084fc',
      variableColor: '#67e8f9',
      functionColor: '#c4b5fd',
      variableBuiltinColor: '#a5b4fc',
      operatorColor: '#e5e7eb',
      attributeColor: '#fde68a',
      constantColor: '#f97316',
      booleanColor: '#fbbf24',
      colorLiteralColor: '#fde68a',
      cursorColor: '#f97316',
    },
  };

  const BASE_STAGE = {
    width: 680,
    minCodeHeight: 260,
    paddingX: 56,
    paddingY: 56,
    innerPadding: 34,
    topBarHeight: 24,
    frameRadius: 18,
    dotRadius: 6,
    dotSpacing: 18,
    dotOffset: 16,
    fontFamily: '"Hack", "Fira Code", "Source Code Pro", Consolas, monospace',
    fontSize: 14,
    lineHeight: 14 * 1.33,
    maxFrames: 140,
  };

  let activeThemeKey = 'panda';
  let STAGE_THEME = { ...BASE_STAGE, ...THEMES[activeThemeKey] };
  let compiledContent = PLACEHOLDER;
  let workerScriptURL = null;
  let isExporting = false;
  let activeDownloadUrl = null;
  let gifDuration = DEFAULT_GIF_DURATION;
  let previewReady = Promise.resolve();

  const setStatus = (message = '') => {
    if (statusLabel) {
      statusLabel.textContent = message;
    }
  };

  const applyThemeToRoot = () => {
    const root = document.documentElement;
    if (!root) {
      return;
    }

    root.style.setProperty('--stage-bg', STAGE_THEME.background);
    root.style.setProperty('--stage-shadow', `0 20px 68px ${STAGE_THEME.shadowColor}`);
    root.style.setProperty('--code-bg', STAGE_THEME.frameBackground);
    root.style.setProperty('--code-text', STAGE_THEME.textColor);
    root.style.setProperty('--code-comment', STAGE_THEME.commentColor);
    root.style.setProperty('--code-keyword', STAGE_THEME.keywordColor);
    root.style.setProperty('--code-string', STAGE_THEME.stringColor);
    root.style.setProperty('--code-number', STAGE_THEME.numberColor);
    root.style.setProperty('--code-variable', STAGE_THEME.variableColor);
    root.style.setProperty('--code-function', STAGE_THEME.functionColor);
    root.style.setProperty('--code-builtin', STAGE_THEME.variableBuiltinColor || STAGE_THEME.variableColor);
    root.style.setProperty('--code-property', STAGE_THEME.propertyColor);
    root.style.setProperty('--code-meta', STAGE_THEME.metaColor);
    root.style.setProperty('--code-operator', STAGE_THEME.operatorColor || STAGE_THEME.textColor);
    root.style.setProperty('--code-attribute', STAGE_THEME.attributeColor || STAGE_THEME.stringColor);
    root.style.setProperty('--code-constant', STAGE_THEME.constantColor || STAGE_THEME.numberColor);
    root.style.setProperty('--code-boolean', STAGE_THEME.booleanColor || STAGE_THEME.numberColor);
    root.style.setProperty('--code-color', STAGE_THEME.colorLiteralColor || STAGE_THEME.stringColor);
    root.style.setProperty('--accent-cursor', STAGE_THEME.cursorColor);
    root.style.setProperty('--stage-width', `${BASE_STAGE.width}px`);
    root.style.setProperty('--code-min-height', `${BASE_STAGE.minCodeHeight}px`);
  };

  const getTextareaContent = () => (textarea ? textarea.value.replace(/\r\n/g, '\n') : '');

  const getNormalizedContent = () => {
    const raw = getTextareaContent();
    return raw.trim() ? raw : PLACEHOLDER;
  };

  const composePreviewDocument = (source) => {
    const baseStyles = `\n<style id="compiler-base-style">\n  html, body {\n    margin: 0;\n    min-height: 100%;\n    background: ${STAGE_THEME.frameBackground};\n    color: ${STAGE_THEME.textColor};\n  }\n</style>`;

    if (/<head[\s>]/i.test(source)) {
      return source.replace(/<head([^>]*)>/i, `<head$1>${baseStyles}`);
    }

    if (/<html[\s>]/i.test(source)) {
      return source.replace(
        /<html([^>]*)>/i,
        `<html$1><head><meta charset="UTF-8" />${baseStyles}</head>`
      );
    }

    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />${baseStyles}\n</head>\n<body>\n${source}\n</body>\n</html>`;
  };

  const queuePreviewRefresh = () => {
    if (!previewFrame) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      previewFrame.addEventListener('load', () => resolve(), { once: true });
    });
  };

  const compileHtml = ({ silent = false } = {}) => {
    compiledContent = getNormalizedContent();

    if (previewFrame) {
      previewReady = queuePreviewRefresh();
      previewFrame.srcdoc = composePreviewDocument(compiledContent);
    } else {
      previewReady = Promise.resolve();
    }

    if (!silent) {
      setStatus('Preview refreshed.');
    }

    return previewReady;
  };

  const resetHtml = () => {
    if (textarea) {
      textarea.value = PLACEHOLDER;
    }
    compileHtml({ silent: true });
    setStatus('Reset to starter markup.');
  };

  const updateGifDurationUI = () => {
    if (gifDurationSlider && Number(gifDurationSlider.value) !== gifDuration) {
      gifDurationSlider.value = String(gifDuration);
    }
    if (gifDurationInput && Number(gifDurationInput.value) !== gifDuration) {
      gifDurationInput.value = String(gifDuration);
    }
    if (gifDurationValue) {
      gifDurationValue.textContent = `${(gifDuration / 1000).toFixed(1)} s`;
    }
  };

  const applyGifDuration = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      updateGifDurationUI();
      return;
    }

    const min = Number(gifDurationSlider ? gifDurationSlider.min : 1000) || 1000;
    const max = Number(gifDurationSlider ? gifDurationSlider.max : 10000) || 10000;
    const clamped = Math.min(max, Math.max(min, Math.round(numeric)));

    gifDuration = clamped;
    updateGifDurationUI();
  };

  const toggleControls = (disabled) => {
    [compileButton, resetButton, exportButton, themeSelect].forEach((el) => {
      if (el) {
        el.disabled = disabled;
      }
    });

    if (gifDurationSlider) {
      gifDurationSlider.disabled = disabled;
    }
    if (gifDurationInput) {
      gifDurationInput.disabled = disabled;
    }
    if (textarea) {
      textarea.readOnly = disabled;
    }
  };

  const renderGif = (gif) => new Promise((resolve, reject) => {
    gif.on('finished', (blob) => resolve(blob));
    gif.on('abort', () => reject(new Error('GIF rendering aborted.')));
    gif.render();
  });

  const getWorkerScriptURL = async () => {
    if (workerScriptURL) {
      return workerScriptURL;
    }

    try {
      const response = await fetch(GIF_WORKER, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) {
        throw new Error(`Worker fetch failed with status ${response.status}`);
      }
      const scriptText = await response.text();
      workerScriptURL = URL.createObjectURL(new Blob([scriptText], { type: 'application/javascript' }));
      return workerScriptURL;
    } catch (error) {
      console.error('Unable to prepare GIF worker:', error);
      throw new Error('Gif worker could not be loaded (CORS issue).');
    }
  };

  const getPreviewBackgroundColor = () => {
    try {
      if (previewFrame && previewFrame.contentWindow && previewFrame.contentDocument) {
        const target = previewFrame.contentDocument.body || previewFrame.contentDocument.documentElement;
        if (target) {
          return previewFrame.contentWindow.getComputedStyle(target).backgroundColor || STAGE_THEME.frameBackground;
        }
      }
    } catch (error) {
      // Ignore errors when reading styles from the preview.
    }
    return STAGE_THEME.frameBackground;
  };

  const capturePreviewCanvas = async () => {
    if (!previewFrame || !previewFrame.contentDocument) {
      throw new Error('Preview is not ready.');
    }
    if (typeof window.html2canvas !== 'function') {
      throw new Error('Preview capture library is unavailable.');
    }

    const bounds = previewFrame.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));

    if (width === 0 || height === 0) {
      throw new Error('Preview area is collapsed.');
    }

    const iframeWindow = previewFrame.contentWindow;
    const backgroundColor = getPreviewBackgroundColor();

    // Capture the iframe document at the visible size so the GIF mirrors the preview surface.
    return window.html2canvas(previewFrame.contentDocument.documentElement, {
      backgroundColor,
      useCORS: true,
      logging: false,
      width,
      height,
      windowWidth: iframeWindow ? iframeWindow.innerWidth || width : width,
      windowHeight: iframeWindow ? iframeWindow.innerHeight || height : height,
      scrollX: 0,
      scrollY: 0,
    });
  };

  const exportToGif = async () => {
    if (typeof GIF === 'undefined') {
      setStatus('GIF encoder failed to load. Refresh and try again.');
      return;
    }

    if (isExporting) {
      return;
    }

    try {
      isExporting = true;
      toggleControls(true);
      setStatus('Rendering GIF…');

      const waitForPreview = compileHtml({ silent: true });
      await waitForPreview;

      const workerScript = await getWorkerScriptURL();
      const canvas = await capturePreviewCanvas();

      const gif = new GIF({
        workerScript,
        workers: 4,
        quality: 10,
        background: getPreviewBackgroundColor(),
        width: canvas.width,
        height: canvas.height,
        transparent: null,
      });

      gif.addFrame(canvas, { delay: gifDuration, copy: true });

      const blob = await renderGif(gif);
      const url = URL.createObjectURL(blob);
      activeDownloadUrl = url;

      const link = document.createElement('a');
      link.href = url;
      link.download = 'html-preview.gif';
      document.body.appendChild(link);
      link.click();
      link.remove();

      setStatus('GIF ready! Download started.');

      setTimeout(() => {
        setStatus('');
      }, 8000);

      setTimeout(() => {
        if (activeDownloadUrl) {
          URL.revokeObjectURL(activeDownloadUrl);
          activeDownloadUrl = null;
        }
      }, 60000);
    } catch (error) {
      console.error(error);
      setStatus(`GIF export failed: ${error && error.message ? error.message : 'unknown error'}.`);
    } finally {
      toggleControls(false);
      if (textarea) {
        textarea.readOnly = false;
      }
      isExporting = false;
    }
  };

  const setActiveTheme = (themeKey, { refreshPreview = true } = {}) => {
    const nextTheme = THEMES[themeKey];
    if (!nextTheme) {
      return;
    }

    activeThemeKey = themeKey;
    STAGE_THEME = { ...BASE_STAGE, ...nextTheme };
    applyThemeToRoot();
    if (themeSelect && themeSelect.value !== themeKey) {
      themeSelect.value = themeKey;
    }

    if (refreshPreview) {
      compileHtml({ silent: true });
    }
  };

  if (compileButton) {
    compileButton.addEventListener('click', () => {
      compileHtml();
    });
  }

  if (resetButton) {
    resetButton.addEventListener('click', resetHtml);
  }

  if (exportButton) {
    exportButton.addEventListener('click', async () => {
      if (isExporting) {
        return;
      }
      await exportToGif();
    });
  }

  if (themeSelect) {
    themeSelect.addEventListener('change', (event) => {
      const { value } = event.target;
      if (value && value !== activeThemeKey) {
        setActiveTheme(value);
      }
    });
  }

  if (textarea) {
    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault();
        compileHtml();
      }
    });
  }

  if (gifDurationSlider) {
    gifDurationSlider.addEventListener('input', (event) => {
      applyGifDuration(event.target.value);
    });
  }

  if (gifDurationInput) {
    gifDurationInput.addEventListener('change', (event) => {
      applyGifDuration(event.target.value);
    });
    gifDurationInput.addEventListener('blur', () => {
      applyGifDuration(gifDurationInput.value);
    });
  }

  window.addEventListener('beforeunload', () => {
    if (activeDownloadUrl) {
      URL.revokeObjectURL(activeDownloadUrl);
      activeDownloadUrl = null;
    }
    if (workerScriptURL) {
      URL.revokeObjectURL(workerScriptURL);
    }
  });

  textarea.value = PLACEHOLDER;
  gifDuration = Number(gifDurationSlider ? gifDurationSlider.value : DEFAULT_GIF_DURATION) || DEFAULT_GIF_DURATION;
  updateGifDurationUI();
  applyThemeToRoot();
  setActiveTheme(activeThemeKey, { refreshPreview: false });
  compileHtml({ silent: true });
  setStatus('Ready to compile.');
})();
