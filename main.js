(() => {
  const textarea = document.getElementById('code-input');
  const runButton = document.getElementById('run');
  const clearButton = document.getElementById('clear');
  const exportButton = document.getElementById('export-gif');
  const speedSlider = document.getElementById('speed');
  const speedInput = document.getElementById('speed-input');
  const speedValue = document.getElementById('speed-value');
  const statusLabel = document.getElementById('export-status');
  const highlightTarget = document.getElementById('typed-target');
  const bufferTarget = document.getElementById('typed-buffer');
  const themeSelect = document.getElementById('theme-select');
  const compileButton = document.getElementById('compile-gif');
  const compilationList = document.getElementById('compile-list');
  const stageWidthSlider = document.getElementById('stage-width');
  const stageWidthInput = document.getElementById('stage-width-input');
  const stageWidthDisplay = document.getElementById('stage-width-value');
  const stageHeightSlider = document.getElementById('stage-height');
  const stageHeightInput = document.getElementById('stage-height-input');
  const stageHeightDisplay = document.getElementById('stage-height-value');
  const resetHeightSlider = document.getElementById('height-reset');
  const resetHeightInput = document.getElementById('height-reset-input');
  const resetHeightDisplay = document.getElementById('height-reset-value');

  const PLACEHOLDER = '// Paste code and hit Play Typing.';
  const MAX_EXPORT_LENGTH = 1200;
  const GIF_WORKER = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js';
  const PREFERRED_LANGUAGES = ['javascript', 'typescript', 'xml', 'html', 'json', 'css'];
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

  const DEFAULT_RESET_LIMIT = 2400;

  let activeThemeKey = 'panda';
  let stageWidth = BASE_STAGE.width;
  let stageMinHeight = BASE_STAGE.minCodeHeight;
  let resetHeightLimit = DEFAULT_RESET_LIMIT;
  let typedInstance = null;
  let isExporting = false;
  let STAGE_THEME = { ...BASE_STAGE, ...THEMES[activeThemeKey] };

  const syncStageMetrics = () => {
    STAGE_THEME.width = stageWidth;
    STAGE_THEME.minCodeHeight = stageMinHeight;
  };

  syncStageMetrics();

  const buildHighlightMap = (theme) => ({
    default: theme.textColor,
    'hljs-comment': theme.commentColor,
    'hljs-quote': theme.commentColor,
    'hljs-keyword': theme.keywordColor,
    'hljs-selector-tag': theme.keywordColor,
    'hljs-selector-id': theme.constantColor || theme.keywordColor,
    'hljs-selector-class': theme.attributeColor || theme.variableColor,
    'hljs-selector-attr': theme.attributeColor || theme.keywordColor,
    'hljs-selector-pseudo': theme.keywordColor || theme.metaColor,
    'hljs-built_in': theme.variableBuiltinColor || theme.keywordColor,
    'hljs-built_in.hljs-color': theme.colorLiteralColor || theme.variableBuiltinColor || theme.keywordColor,
    'hljs-tag': theme.metaColor || theme.keywordColor,
    'hljs-name': theme.propertyColor || theme.keywordColor,
    'hljs-attr': theme.attributeColor,
    'hljs-attribute': theme.attributeColor,
    'hljs-attribute .hljs-name': theme.attributeColor,
    'hljs-attr-name': theme.attributeColor,
    'hljs-literal': theme.booleanColor || theme.numberColor,
    'hljs-literal.boolean-literal': theme.booleanColor || theme.numberColor,
    'hljs-literal.special-literal': theme.constantColor || theme.numberColor,
    'hljs-number': theme.numberColor,
    'hljs-variable': theme.variableColor,
    'hljs-template-variable': theme.variableColor,
    'hljs-template-variable.infix': theme.variableBuiltinColor || theme.variableColor,
    'hljs-template-tag': theme.metaColor || theme.keywordColor,
    'hljs-params': theme.variableColor,
    'hljs-variable.language_': theme.variableBuiltinColor || theme.variableColor,
    'hljs-variable.global_': theme.variableBuiltinColor || theme.variableColor,
    'hljs-variable.special_': theme.variableBuiltinColor || theme.variableColor,
    'hljs-variable.constant_': theme.constantColor,
    'hljs-constant': theme.constantColor,
    'hljs-title': theme.functionColor,
    'hljs-title.function_': theme.functionColor,
    'hljs-title.class_': theme.functionColor,
    'hljs-title.class_.inherited__': theme.constantColor || theme.functionColor,
    'hljs-function': theme.functionColor,
    'hljs-string': theme.stringColor,
    'hljs-string .hljs-subst': theme.variableBuiltinColor || theme.stringColor,
    'hljs-symbol': theme.propertyColor,
    'hljs-property': theme.propertyColor,
    'hljs-class': theme.propertyColor,
    'hljs-operator': theme.operatorColor,
    'hljs-punctuation': theme.operatorColor,
    'hljs-regexp': theme.metaColor || theme.stringColor,
    'hljs-link': theme.metaColor || theme.stringColor,
    'hljs-meta-keyword': theme.metaColor || theme.keywordColor,
    'hljs-hexcolor': theme.colorLiteralColor || theme.numberColor,
    'hljs-color': theme.colorLiteralColor || theme.numberColor,
    'hljs-meta': theme.metaColor,
    'hljs-meta .hljs-keyword': theme.metaColor,
    'hljs-meta .hljs-string': theme.stringColor,
    'hljs-doctag': theme.metaColor || theme.keywordColor,
    'hljs-subst': theme.variableBuiltinColor || theme.variableColor,
    'hljs-bullet': theme.constantColor || theme.metaColor,
    'hljs-emphasis': theme.stringColor,
    'hljs-strong': theme.keywordColor,
  });

  let highlightColorMap = buildHighlightMap(STAGE_THEME);
  let isResettingHeight = false;

  const activeCompilationUrls = new Set();
  let compilationCount = 0;

  const ensureCompilationPlaceholder = () => {
    if (!compilationList) {
      return;
    }
    if (compilationList.querySelector('.compile-empty')) {
      return;
    }
    const placeholder = document.createElement('p');
    placeholder.className = 'compile-empty';
    placeholder.textContent = 'No compilations yet. Compile your first GIF to store it here.';
    compilationList.appendChild(placeholder);
  };

  const removeCompilationPlaceholder = () => {
    if (!compilationList) {
      return;
    }
    const placeholder = compilationList.querySelector('.compile-empty');
    if (placeholder) {
      placeholder.remove();
    }
  };

  const formatFileSize = (bytes) => {
    if (!Number.isFinite(bytes)) {
      return '0 B';
    }
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTimestamp = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const addCompilationCard = (blob, url) => {
    if (!compilationList) {
      return;
    }

    removeCompilationPlaceholder();
    compilationCount += 1;
    activeCompilationUrls.add(url);

    const card = document.createElement('article');
    card.className = 'compile-card';

    const thumb = document.createElement('img');
    thumb.className = 'compile-thumb';
    thumb.src = url;
    thumb.alt = `Compilation ${String(compilationCount).padStart(2, '0')}`;

    const info = document.createElement('div');
    info.className = 'compile-info';

    const title = document.createElement('p');
    title.className = 'compile-title';
    title.textContent = `Compilation ${String(compilationCount).padStart(2, '0')}`;

    const detail = document.createElement('p');
    detail.className = 'compile-detail';
    detail.textContent = `${formatFileSize(blob.size)} • Saved ${formatTimestamp(new Date())}`;

    info.append(title, detail);

    const actions = document.createElement('div');
    actions.className = 'compile-card-actions';

    const downloadLink = document.createElement('a');
    downloadLink.className = 'compile-download';
    downloadLink.href = url;
    downloadLink.download = `compilation-${String(compilationCount).padStart(2, '0')}.gif`;
    downloadLink.textContent = 'Download';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'compile-remove';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      activeCompilationUrls.delete(url);
      URL.revokeObjectURL(url);
      card.remove();
      if (!compilationList.querySelector('.compile-card')) {
        ensureCompilationPlaceholder();
      }
    });

    actions.append(downloadLink, removeButton);
    card.append(thumb, info, actions);
    compilationList.appendChild(card);
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
    root.style.setProperty('--stage-width', `${stageWidth}px`);
    root.style.setProperty('--code-min-height', `${stageMinHeight}px`);
  };

  const updateStageWidthUI = () => {
    if (stageWidthDisplay) {
      stageWidthDisplay.textContent = `${stageWidth} px`;
    }
    if (stageWidthSlider && Number(stageWidthSlider.value) !== stageWidth) {
      stageWidthSlider.value = String(stageWidth);
    }
    if (stageWidthInput && Number(stageWidthInput.value) !== stageWidth) {
      stageWidthInput.value = String(stageWidth);
    }
  };

  const updateStageHeightUI = () => {
    if (stageHeightDisplay) {
      stageHeightDisplay.textContent = `${stageMinHeight} px`;
    }
    if (stageHeightSlider && Number(stageHeightSlider.value) !== stageMinHeight) {
      stageHeightSlider.value = String(stageMinHeight);
    }
    if (stageHeightInput && Number(stageHeightInput.value) !== stageMinHeight) {
      stageHeightInput.value = String(stageMinHeight);
    }
  };

  const updateResetHeightUI = () => {
    if (resetHeightDisplay) {
      resetHeightDisplay.textContent = `${resetHeightLimit} px`;
    }
    if (resetHeightSlider && Number(resetHeightSlider.value) !== resetHeightLimit) {
      resetHeightSlider.value = String(resetHeightLimit);
    }
    if (resetHeightInput && Number(resetHeightInput.value) !== resetHeightLimit) {
      resetHeightInput.value = String(resetHeightLimit);
    }
  };

  const getRangeBounds = (element, fallbackMin, fallbackMax) => {
    const min = Number(element?.min);
    const max = Number(element?.max);
    const resolvedMin = Number.isFinite(min) ? min : fallbackMin;
    const resolvedMax = Number.isFinite(max) ? max : fallbackMax;
    return {
      min: resolvedMin,
      max: resolvedMax,
    };
  };

  const applySpeedValue = (value, { restart = true } = {}) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      updateSpeedLabel();
      return;
    }

    const min = Number(speedSlider ? speedSlider.min : 3) || 3;
    const max = Number(speedSlider ? speedSlider.max : 200) || 200;
    const clamped = Math.min(max, Math.max(min, Math.round(numeric)));
    const previous = Number(speedSlider ? speedSlider.value : clamped);

    if (speedSlider && Number(speedSlider.value) !== clamped) {
      speedSlider.value = String(clamped);
    }
    if (speedInput && Number(speedInput.value) !== clamped) {
      speedInput.value = String(clamped);
    }

    updateSpeedLabel();

    if (restart && typedInstance && clamped !== previous) {
      startTyping();
    }
  };

  const applyStageWidth = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      updateStageWidthUI();
      return;
    }
    const { min, max } = getRangeBounds(stageWidthSlider || stageWidthInput, 100, 2600);
    const clamped = Math.min(max, Math.max(min, Math.round(numeric)));
    if (clamped === stageWidth) {
      updateStageWidthUI();
      return;
    }
    stageWidth = clamped;
    syncStageMetrics();
    applyThemeToRoot();
    updateStageWidthUI();
    applyHighlight();
  };

  const applyStageMinHeight = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      updateStageHeightUI();
      return;
    }
    const { min, max } = getRangeBounds(stageHeightSlider || stageHeightInput, 200, 3000);
    const clamped = Math.min(max, Math.max(min, Math.round(numeric)));
    if (clamped === stageMinHeight) {
      updateStageHeightUI();
      return;
    }
    stageMinHeight = clamped;
    syncStageMetrics();
    applyThemeToRoot();
    updateStageHeightUI();
    applyHighlight();
  };

  const enforceHeightReset = () => {
    if (isResettingHeight) {
      return false;
    }

    if (!resetHeightLimit || resetHeightLimit <= 0) {
      return false;
    }

    if (!highlightTarget || !bufferTarget) {
      return false;
    }

    const originalBuffer = bufferTarget.textContent || '';
    if (!originalBuffer) {
      return false;
    }

    const currentHeight = highlightTarget.scrollHeight;
    if (currentHeight <= resetHeightLimit) {
      return false;
    }

    isResettingHeight = true;
    const showCursor = typedInstance && !typedInstance.typingComplete;
    const renderBuffer = (text) => {
      const highlighted = text ? highlightCode(text) : '';
      renderHighlightedInto(highlightTarget, highlighted, { showCursor });
    };

    let trimmed = originalBuffer;
    let didTrim = false;
    let guard = 0;
    const MAX_PASSES = 5000;
    const CHUNK_SIZE = 120;

    while (trimmed && highlightTarget.scrollHeight > resetHeightLimit) {
      const newlineIndex = trimmed.indexOf('\n');
      if (newlineIndex === -1) {
        trimmed = trimmed.slice(Math.min(CHUNK_SIZE, trimmed.length));
      } else {
        trimmed = trimmed.slice(newlineIndex + 1);
      }
      bufferTarget.textContent = trimmed;
      renderBuffer(trimmed);
      didTrim = true;
      guard += 1;
      if (guard > MAX_PASSES) {
        break;
      }
    }

    if (!trimmed && highlightTarget.scrollHeight > resetHeightLimit) {
      bufferTarget.textContent = '';
      renderBuffer('');
      didTrim = true;
    }

    if (didTrim) {
      const finalBuffer = bufferTarget.textContent || '';
      const removedChars = (originalBuffer || '').length - finalBuffer.length;
      if (removedChars > 0) {
        queueTypedFrontTrim(removedChars);
      }
    }

    isResettingHeight = false;
    return didTrim;
  };

  const applyResetHeightLimit = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      updateResetHeightUI();
      return;
    }
    const { min, max } = getRangeBounds(resetHeightSlider || resetHeightInput, 100, 3200);
    const clamped = Math.min(max, Math.max(min, Math.round(numeric)));
    if (clamped === resetHeightLimit) {
      updateResetHeightUI();
      return;
    }
    resetHeightLimit = clamped;
    updateResetHeightUI();
    enforceHeightReset();
  };

  const setActiveTheme = (themeKey) => {
    const nextTheme = THEMES[themeKey];
    if (!nextTheme) {
      return;
    }

    activeThemeKey = themeKey;
    STAGE_THEME = { ...BASE_STAGE, ...nextTheme };
    syncStageMetrics();
    highlightColorMap = buildHighlightMap(STAGE_THEME);
    applyThemeToRoot();
    updateStageWidthUI();
    updateStageHeightUI();
    updateResetHeightUI();
    if (themeSelect && themeSelect.value !== themeKey) {
      themeSelect.value = themeKey;
    }
    applyHighlight();
  };

  let workerScriptURL = null;

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

  const getColorForClasses = (classList) => {
    if (!classList || !classList.length) {
      return highlightColorMap.default;
    }

    // Try direct class match first
    for (let i = 0; i < classList.length; i += 1) {
      const cls = classList[i];
      if (highlightColorMap[cls]) {
        return highlightColorMap[cls];
      }
    }

    // Check for composite mappings (e.g., "hljs-meta hljs-keyword")
    const joined = classList.join(' ');
    const compositeKey = Object.keys(highlightColorMap).find((key) => key.includes('.') && joined.includes(key.replace(/\s*\.\s*/g, ' ')));
    if (compositeKey && highlightColorMap[compositeKey]) {
      return highlightColorMap[compositeKey];
    }

    return highlightColorMap.default;
  };

  const parseHighlighted = (html) => {
    const container = document.createElement('div');
    container.innerHTML = (html || '').replace(/\t/g, '  ');

    const lines = [[]];

    const walk = (node, inheritedClasses = []) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const rawText = node.nodeValue || '';
        const parts = rawText.split('\n');
        parts.forEach((segment, idx) => {
          if (idx > 0) {
            lines.push([]);
          }
          if (segment.length) {
            lines[lines.length - 1].push({
              text: segment,
              color: getColorForClasses(inheritedClasses),
            });
          }
        });
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const nextClasses = [...inheritedClasses];
        if (node.classList && node.classList.length) {
          node.classList.forEach((cls) => nextClasses.push(cls));
        }
        node.childNodes.forEach((child) => walk(child, nextClasses));
      }
    };

    container.childNodes.forEach((child) => walk(child, []));

    return lines.length ? lines : [[]];
  };

  const renderHighlightedInto = (container, html, { showCursor = false } = {}) => {
    const lines = parseHighlighted(html);
    const effectiveLines = lines.length ? lines : [[]];

    container.classList.add('hljs');
    container.replaceChildren();

    effectiveLines.forEach((fragments, lineIndex) => {
      const actualFragments = fragments.length ? fragments : [{ text: ' ', color: highlightColorMap.default }];
      actualFragments.forEach(({ text, color }) => {
        const span = document.createElement('span');
        span.style.color = color || highlightColorMap.default;
        span.textContent = text;
        container.appendChild(span);
      });

      if (lineIndex < effectiveLines.length - 1) {
        container.appendChild(document.createTextNode('\n'));
      }
    });

    if (showCursor) {
      const cursor = document.createElement('span');
      cursor.className = 'typed-cursor proxy';
      cursor.textContent = '|';
      container.appendChild(cursor);
    }
  };

  const JS_KEYWORDS = new Set([
    'await', 'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete',
    'do', 'else', 'export', 'extends', 'finally', 'for', 'from', 'function', 'get', 'if', 'import',
    'in', 'instanceof', 'let', 'new', 'of', 'return', 'set', 'switch', 'super', 'this', 'throw',
    'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'as', 'implements', 'interface', 'package',
    'private', 'protected', 'public', 'static', 'enum', 'declare', 'type', 'namespace', 'module', 'abstract', 'readonly'
  ]);

  const JS_LITERALS = new Set(['true', 'false', 'null', 'undefined', 'NaN', 'Infinity']);
  const JS_BOOLEAN_LITERALS = new Set(['true', 'false']);

  const manualHighlightJavascript = (code) => {
    const tokens = [];
    const push = (text, className = null) => {
      if (!text) {
        return;
      }
      tokens.push({ text, className });
    };

    const commentRegex = /\/\*[\s\S]*?\*\/|\/\/[^\n]*/y;
    const stringRegex = /`(?:\\[\s\S]|[^`])*?`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y;
    const numberRegex = /\b(?:0x[\da-fA-F]+|0b[01]+|0o[0-7]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/y;
    const identifierRegex = /[A-Za-z_$][\w$]*/y;

    let index = 0;
    while (index < code.length) {
      commentRegex.lastIndex = index;
      const commentMatch = commentRegex.exec(code);
      if (commentMatch && commentMatch.index === index) {
        push(commentMatch[0], 'hljs-comment');
        index = commentRegex.lastIndex;
        continue;
      }

      stringRegex.lastIndex = index;
      const stringMatch = stringRegex.exec(code);
      if (stringMatch && stringMatch.index === index) {
        push(stringMatch[0], 'hljs-string');
        index = stringRegex.lastIndex;
        continue;
      }

      numberRegex.lastIndex = index;
      const numberMatch = numberRegex.exec(code);
      if (numberMatch && numberMatch.index === index) {
        push(numberMatch[0], 'hljs-number');
        index = numberRegex.lastIndex;
        continue;
      }

      identifierRegex.lastIndex = index;
      const idMatch = identifierRegex.exec(code);
      if (idMatch && idMatch.index === index) {
        const value = idMatch[0];
        if (JS_KEYWORDS.has(value)) {
          push(value, 'hljs-keyword');
        } else if (JS_LITERALS.has(value)) {
          if (JS_BOOLEAN_LITERALS.has(value)) {
            push(value, 'hljs-literal boolean-literal');
          } else {
            push(value, 'hljs-literal special-literal');
          }
        } else {
          push(value, 'hljs-variable');
        }
        index = identifierRegex.lastIndex;
        continue;
      }

      push(code[index], null);
      index += 1;
    }

    return tokens.map(({ text, className }) => {
      const escaped = escapeHtml(text);
      return className ? `<span class="${className}">${escaped}</span>` : escaped;
    }).join('');
  };

  const createCanvasRenderer = () => {
    const scale = Math.min(3, Math.max(window.devicePixelRatio || 1, 2));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    return { canvas, ctx, scale };
  };

  const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const renderCanvasFrame = (renderer, highlightedHtml, { showCursor = false } = {}) => {
    const { canvas, ctx, scale } = renderer;
    const lines = parseHighlighted(highlightedHtml);

    if (showCursor) {
      const lastLine = lines[lines.length - 1] || [];
      lastLine.push({ text: '|', color: STAGE_THEME.cursorColor });
      if (lines.length === 0) {
        lines.push(lastLine);
      }
    }

    const effectiveLines = lines.length ? lines : [[]];
    const textLines = effectiveLines.map((fragments) => (fragments.length ? fragments : [{ text: ' ', color: STAGE_THEME.textColor }]));

    const combinedInset = (STAGE_THEME.paddingX + STAGE_THEME.innerPadding) * 2;
    const minimumFrameWidth = combinedInset + 40;
    const frameWidth = Math.max(STAGE_THEME.width, minimumFrameWidth);
    const textStartX = STAGE_THEME.paddingX + STAGE_THEME.innerPadding;
    const textStartY = STAGE_THEME.paddingY + STAGE_THEME.topBarHeight + STAGE_THEME.innerPadding;
    const textAreaWidth = Math.max(40, frameWidth - combinedInset);
    const totalTextHeight = textLines.length * STAGE_THEME.lineHeight;
    const contentHeight = Math.max(totalTextHeight, STAGE_THEME.minCodeHeight);
    const frameHeight = STAGE_THEME.innerPadding * 2 + contentHeight;
    const totalHeight = STAGE_THEME.paddingY * 2 + STAGE_THEME.topBarHeight + frameHeight;

    canvas.width = Math.round(frameWidth * scale);
    canvas.height = Math.round(totalHeight * scale);

    ctx.save();
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, frameWidth, totalHeight);

    ctx.fillStyle = STAGE_THEME.background;
    ctx.fillRect(0, 0, frameWidth, totalHeight);

    // Draw frame with drop shadow
    ctx.save();
    ctx.shadowColor = STAGE_THEME.shadowColor;
    ctx.shadowBlur = 40;
    drawRoundedRect(
      ctx,
      STAGE_THEME.paddingX,
      STAGE_THEME.paddingY + STAGE_THEME.topBarHeight,
      frameWidth - STAGE_THEME.paddingX * 2,
      frameHeight,
      STAGE_THEME.frameRadius,
    );
    ctx.fillStyle = STAGE_THEME.frameBackground;
    ctx.fill();
    ctx.restore();

    // Window controls
    const dotsY = STAGE_THEME.paddingY + STAGE_THEME.topBarHeight / 2 + 8;
    const dotXStart = STAGE_THEME.paddingX + STAGE_THEME.dotOffset;
    const dotColors = ['#ff5f56', '#ffbd2e', '#27c93f'];
    dotColors.forEach((color, index) => {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(dotXStart + index * STAGE_THEME.dotSpacing, dotsY, STAGE_THEME.dotRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Text content
    ctx.textBaseline = 'top';
    ctx.font = `${STAGE_THEME.fontSize}px ${STAGE_THEME.fontFamily}`;

    textLines.forEach((fragments, lineIndex) => {
      let cursorX = textStartX;
      const baselineY = textStartY + lineIndex * STAGE_THEME.lineHeight;

      fragments.forEach(({ text, color }) => {
        ctx.fillStyle = color || STAGE_THEME.textColor;
        const safeText = text.replace(/\s/g, (space) => (space === '\t' ? '  ' : space));
        ctx.fillText(safeText, cursorX, baselineY, textAreaWidth);
        cursorX += ctx.measureText(safeText).width;
      });
    });

    ctx.restore();

    return canvas;
  };

  const demoSnippet = `// Code Typer demo
const greet = (name) => {
  const message = \`Welcome back, \${name}\`;
  console.log(message);
};

greet('Creator');`;

  const observer = new MutationObserver(() => {
    applyHighlight();
  });

  const updateSpeedLabel = () => {
    if (!speedSlider) {
      return;
    }
    const current = Number(speedSlider.value);
    speedValue.textContent = `${current} ms`;
    if (speedInput && Number(speedInput.value) !== current) {
      speedInput.value = String(current);
    }
  };

  const setStatus = (message = '', { html = false } = {}) => {
    if (html) {
      statusLabel.innerHTML = message;
    } else {
      statusLabel.textContent = message;
    }
  };

  const getNormalizedContent = () => {
    const raw = textarea.value.replace(/\r\n/g, '\n');
    return raw.trim() ? raw : PLACEHOLDER;
  };

  const destroyTyped = () => {
    if (typedInstance) {
      typedInstance._queuedFrontTrim = 0;
      typedInstance.destroy();
      typedInstance = null;
    }
    observer.disconnect();
  };

  const escapeHtml = (value) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const detectLanguage = (code) => {
    const trimmed = code.trim();
    if (!trimmed) {
      return 'plaintext';
    }

    if (/^<[a-z!]/i.test(trimmed) && />/.test(trimmed)) {
      return 'html';
    }

    if (/\b(import|export|from|class|interface|type)\b/.test(trimmed) && /:\s*\w+/.test(trimmed)) {
      return 'typescript';
    }

    if (/\b(const|let|var|function|=>|console\.log|return)\b/.test(trimmed)) {
      return 'javascript';
    }

    if (/[{([]\s*['"].*['"]\s*[})\]]/.test(trimmed)) {
      return 'javascript';
    }

    return 'javascript';
  };

  const WAIT_DIRECTIVE_PATTERN = /^\s*Tpyr\.wait\(\s*([0-9]+(?:\.[0-9]+)?)?\s*(?:,?\s*(?:['\"])?(ms|s)(?:['\"])?\s*)?\)\s*;?(?:\s*\/\/.*)?$/i;
  const DEFAULT_WAIT_SECONDS = 1;

  const applyWaitDirectivesToPlayback = (code) => {
    if (!code) {
      return code;
    }

    const lines = code.split('\n');
    let didMutate = false;

    const processed = lines.map((line) => {
      const match = WAIT_DIRECTIVE_PATTERN.exec(line);
      if (!match) {
        return line;
      }

      const rawValue = match[1];
      const unit = (match[2] || 's').toLowerCase();
      const parsed = rawValue === undefined || rawValue === null || rawValue === ''
        ? DEFAULT_WAIT_SECONDS
        : Number.parseFloat(rawValue);

      if (!Number.isFinite(parsed)) {
        return line;
      }

      const durationMs = unit === 'ms'
        ? Math.max(0, Math.round(parsed))
        : Math.max(0, Math.round(parsed * 1000));

      if (durationMs <= 0) {
        return line;
      }

      didMutate = true;
      return `${line}^${durationMs}`;
    });

    return didMutate ? processed.join('\n') : code;
  };

  let typedTrimPatchApplied = false;

  const ensureTypedTrimPatch = () => {
    if (typedTrimPatchApplied) {
      return;
    }

    if (typeof Typed === 'undefined' || !Typed || !Typed.prototype || typeof Typed.prototype.keepTyping !== 'function') {
      return;
    }

    const consumeFrontTrim = function consumeFrontTrim(currentString, nextIndex) {
      const queue = Number(this._queuedFrontTrim) || 0;
      if (!queue || !currentString) {
        return {
          string: currentString,
          index: nextIndex,
        };
      }

      const trimAmount = Math.min(queue, Math.max(0, nextIndex));
      if (trimAmount <= 0) {
        return {
          string: currentString,
          index: nextIndex,
        };
      }

      const trimmedString = currentString.substring(trimAmount);
      const trimmedIndex = Math.max(0, nextIndex - trimAmount);

      this._queuedFrontTrim = Math.max(0, queue - trimAmount);

      if (this.pause && typeof this.pause.curString === 'string') {
        const pauseTrim = Math.min(trimAmount, this.pause.curString.length);
        this.pause.curString = this.pause.curString.substring(pauseTrim);
        this.pause.curStrPos = Math.max(0, (this.pause.curStrPos || 0) - pauseTrim);
      }

      return {
        string: trimmedString,
        index: trimmedIndex,
      };
    };

    Typed.prototype._consumeFrontTrim = consumeFrontTrim;

    const patchedKeepTyping = function patchedKeepTyping(currentString, indexBeforeStep, step) {
      const effectiveStep = Number.isFinite(step) ? step : 0;
      if (indexBeforeStep === 0) {
        this.toggleBlinking(!1);
        this.options.preStringTyped(this.arrayPos, this);
      }

      const incrementedIndex = indexBeforeStep + effectiveStep;
      const consumed = this._consumeFrontTrim
        ? this._consumeFrontTrim(currentString, incrementedIndex)
        : {
            string: currentString,
            index: incrementedIndex,
          };

      const safeString = typeof consumed.string === 'string' ? consumed.string : '';
      const safeIndex = Math.max(0, Number.isFinite(consumed.index) ? consumed.index : incrementedIndex);
      const output = safeString.substring(0, safeIndex);

      this.replaceText(output);
      this.typewrite(safeString, safeIndex);
    };

    Typed.prototype.keepTyping = patchedKeepTyping;

    typedTrimPatchApplied = true;
  };

  const queueTypedFrontTrim = (amount) => {
    if (!typedInstance) {
      return;
    }
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return;
    }
    typedInstance._queuedFrontTrim = (Number(typedInstance._queuedFrontTrim) || 0) + Math.floor(numeric);
  };

  const highlightCode = (code) => {
    if (!code.trim()) {
      return '';
    }

    const language = detectLanguage(code);

    if (typeof hljs === 'undefined') {
      return language === 'javascript' || language === 'typescript'
        ? manualHighlightJavascript(code)
        : escapeHtml(code);
    }

    try {
      if (language !== 'plaintext') {
        return hljs.highlight(code, { language, ignoreIllegals: true }).value;
      }
      const { value } = hljs.highlightAuto(code, PREFERRED_LANGUAGES);
      return value;
    } catch (error) {
      console.warn('Highlighting failed, using manual fallback.', error);
      if (language === 'javascript' || language === 'typescript') {
        return manualHighlightJavascript(code);
      }
      return escapeHtml(code);
    }
  };

  const applyHighlight = () => {
    const text = bufferTarget ? bufferTarget.textContent : '';
    const highlighted = text ? highlightCode(text) : '';
    const needsCursor = typedInstance && !typedInstance.typingComplete;
    const fallback = text ? highlighted : '';
    renderHighlightedInto(highlightTarget, highlighted || fallback, { showCursor: needsCursor });
    if (!isResettingHeight) {
      enforceHeightReset();
    }
  };

  const startTyping = () => {
    const content = getNormalizedContent();
    setStatus('');

    destroyTyped();
    bufferTarget.textContent = '';
    applyHighlight();

    const playbackContent = applyWaitDirectivesToPlayback(content);

    ensureTypedTrimPatch();

    typedInstance = new Typed('#typed-buffer', {
      strings: [playbackContent],
      typeSpeed: Number(speedSlider.value),
      backSpeed: 0,
      startDelay: 350,
      loop: false,
      smartBackspace: false,
      showCursor: true,
      cursorChar: '|',
      contentType: 'null',
      onBegin: () => applyHighlight(),
      onStringTyped: () => applyHighlight(),
      onTypingPaused: () => applyHighlight(),
      onTypingResumed: () => applyHighlight(),
      onComplete: () => applyHighlight(),
    });

    if (typedInstance) {
      typedInstance._queuedFrontTrim = 0;
    }

    observer.disconnect();
    observer.observe(bufferTarget, {
      characterData: true,
      subtree: true,
      childList: true,
    });
  };

  const toggleControls = (disabled) => {
    [runButton, clearButton, exportButton, compileButton].forEach((button) => {
      if (button) {
        button.disabled = disabled;
      }
    });
    if (speedSlider) {
      speedSlider.disabled = disabled;
    }
    if (speedInput) {
      speedInput.disabled = disabled;
    }
    if (stageWidthSlider) {
      stageWidthSlider.disabled = disabled;
    }
    if (stageWidthInput) {
      stageWidthInput.disabled = disabled;
    }
    if (stageHeightSlider) {
      stageHeightSlider.disabled = disabled;
    }
    if (stageHeightInput) {
      stageHeightInput.disabled = disabled;
    }
    if (resetHeightSlider) {
      resetHeightSlider.disabled = disabled;
    }
    if (resetHeightInput) {
      resetHeightInput.disabled = disabled;
    }
    textarea.readOnly = disabled;
  };

  const renderGif = (gif) => new Promise((resolve, reject) => {
    gif.on('finished', (blob) => resolve(blob));
    gif.on('abort', () => reject(new Error('GIF rendering aborted.')));
    gif.render();
  });

  const exportToGif = async (content, options = {}) => {
    if (typeof GIF === 'undefined') {
      setStatus('GIF encoder failed to load. Refresh and try again.');
      return;
    }

    const {
      download = true,
      label = 'GIF',
      filename = 'code-typing.gif',
      successMessage,
      onComplete,
    } = options;

    try {
      isExporting = true;
      toggleControls(true);
      setStatus(`Rendering ${label}…`);

      const renderer = createCanvasRenderer();
      const frameDelay = Math.max(20, Number(speedSlider.value));
      const step = Math.max(1, Math.ceil(content.length / Math.max(1, STAGE_THEME.maxFrames - 1)));
      const estimatedFrames = Math.min(STAGE_THEME.maxFrames, Math.floor(content.length / step) + 1);

      let processedFrames = 0;
      let addedFinalFrame = false;
      let gif = null;
      const workerScript = await getWorkerScriptURL();

      for (let index = 0; index <= content.length; index += step) {
        const isLastStep = index + step >= content.length;
        const sliceIndex = isLastStep ? content.length : index;
        const slice = content.slice(0, sliceIndex);
        const html = highlightCode(slice) || '';
        const canvas = renderCanvasFrame(renderer, html, { showCursor: !isLastStep });
        const delay = isLastStep ? Math.max(1000, frameDelay * 8) : frameDelay;

        if (!gif) {
          gif = new GIF({
            workerScript,
            workers: 4,
            quality: 10,
            background: STAGE_THEME.background,
            width: canvas.width,
            height: canvas.height,
            transparent: null,
          });
        }

        gif.addFrame(canvas, { delay, copy: true });
        processedFrames += 1;
        if (isLastStep) {
          addedFinalFrame = true;
        }

        if (estimatedFrames > 0 && processedFrames % 5 === 0) {
          const percent = Math.min(100, Math.round((processedFrames / estimatedFrames) * 100));
          setStatus(`Rendering ${label}… ${percent}% (${processedFrames}/${estimatedFrames})`);
        }

        if (processedFrames % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        if (processedFrames >= STAGE_THEME.maxFrames) {
          break;
        }
      }

      if (!addedFinalFrame) {
        const finalHtml = highlightCode(content) || '';
        const finalCanvas = renderCanvasFrame(renderer, finalHtml, { showCursor: false });
        const finalDelay = Math.max(1000, frameDelay * 8);
        if (!gif) {
          gif = new GIF({
            workerScript,
            workers: 4,
            quality: 10,
            background: STAGE_THEME.background,
            width: finalCanvas.width,
            height: finalCanvas.height,
            transparent: null,
          });
        }
        gif.addFrame(finalCanvas, { delay: finalDelay, copy: true });
      }

      if (!gif) {
        setStatus('Nothing to export.');
        return;
      }

      setStatus(`Finalizing ${label}…`);

      const blob = await renderGif(gif);
      const url = URL.createObjectURL(blob);

      if (download) {
        const autoLink = document.createElement('a');
        autoLink.href = url;
        autoLink.download = filename;
        document.body.appendChild(autoLink);
        autoLink.click();
        autoLink.remove();

        setStatus(
          `${label} ready! <a href="${url}" download="${filename}">Click here if the download didn’t start.</a>`,
          { html: true },
        );

        setTimeout(() => {
          setStatus('');
          URL.revokeObjectURL(url);
        }, 60000);
      } else {
        if (typeof onComplete === 'function') {
          onComplete(blob, url);
        }
        setStatus(successMessage || `${label} added to your library.`);
        setTimeout(() => {
          setStatus('');
        }, 8000);
      }
    } catch (error) {
      console.error(error);
      setStatus(`${label} export failed: ${error && error.message ? error.message : 'unknown error'}.`);
    } finally {
      toggleControls(false);
      textarea.readOnly = false;
      isExporting = false;
    }
  };

  runButton.addEventListener('click', startTyping);

  clearButton.addEventListener('click', () => {
    textarea.value = '';
    destroyTyped();
    bufferTarget.textContent = '';
    applyHighlight();
    textarea.focus();
    setStatus('');
  });

  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      startTyping();
    }
  });

  if (speedSlider) {
    speedSlider.addEventListener('input', (event) => {
      applySpeedValue(event.target.value);
    });
  }

  if (speedInput) {
    speedInput.addEventListener('change', (event) => {
      applySpeedValue(event.target.value);
    });
    speedInput.addEventListener('blur', () => {
      applySpeedValue(speedInput.value);
    });
  }

  if (stageWidthSlider) {
    stageWidthSlider.addEventListener('input', (event) => {
      applyStageWidth(event.target.value);
    });
  }

  if (stageWidthInput) {
    stageWidthInput.addEventListener('change', (event) => {
      applyStageWidth(event.target.value);
    });
    stageWidthInput.addEventListener('blur', () => {
      applyStageWidth(stageWidthInput.value);
    });
  }

  if (stageHeightSlider) {
    stageHeightSlider.addEventListener('input', (event) => {
      applyStageMinHeight(event.target.value);
    });
  }

  if (stageHeightInput) {
    stageHeightInput.addEventListener('change', (event) => {
      applyStageMinHeight(event.target.value);
    });
    stageHeightInput.addEventListener('blur', () => {
      applyStageMinHeight(stageHeightInput.value);
    });
  }

  if (resetHeightSlider) {
    resetHeightSlider.addEventListener('input', (event) => {
      applyResetHeightLimit(event.target.value);
    });
  }

  if (resetHeightInput) {
    resetHeightInput.addEventListener('change', (event) => {
      applyResetHeightLimit(event.target.value);
    });
    resetHeightInput.addEventListener('blur', () => {
      applyResetHeightLimit(resetHeightInput.value);
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

  exportButton.addEventListener('click', async () => {
    if (isExporting) {
      return;
    }

    const content = getNormalizedContent();

    if (content === PLACEHOLDER) {
      setStatus('Paste code before exporting a GIF.');
      return;
    }

    if (content.length > MAX_EXPORT_LENGTH) {
      setStatus(`Trim code to ${MAX_EXPORT_LENGTH} characters or fewer for GIF export.`);
      return;
    }

    await exportToGif(content);
  });

  if (compileButton) {
    compileButton.addEventListener('click', async () => {
      if (isExporting) {
        return;
      }

      const content = getNormalizedContent();

      if (content === PLACEHOLDER) {
        setStatus('Paste code before compiling a GIF.');
        return;
      }

      if (content.length > MAX_EXPORT_LENGTH) {
        setStatus(`Trim code to ${MAX_EXPORT_LENGTH} characters or fewer for GIF export.`);
        return;
      }

      await exportToGif(content, {
        download: false,
        label: 'Compilation GIF',
        successMessage: 'Compilation added to the library.',
        onComplete: (blob, url) => addCompilationCard(blob, url),
      });
    });
  }

  window.addEventListener('beforeunload', () => {
    activeCompilationUrls.forEach((url) => URL.revokeObjectURL(url));
    activeCompilationUrls.clear();
  });

  textarea.value = demoSnippet;
  updateSpeedLabel();
  setActiveTheme(activeThemeKey);
  startTyping();
})();
