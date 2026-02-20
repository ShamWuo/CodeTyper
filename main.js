(async () => {
  const textarea = document.getElementById('code-input');
  const runButton = document.getElementById('run');
  const clearButton = document.getElementById('clear');
  const exportButton = document.getElementById('export-gif');
  const fastExportToggle = document.getElementById('fast-export-toggle');
  const gifSpeedMultiplierInput = document.getElementById('gif-speed-multiplier');
  const speedSlider = document.getElementById('speed');
  const speedInput = document.getElementById('speed-input');
  const speedValue = document.getElementById('speed-value');
  const statusLabel = document.getElementById('export-status');
  const highlightTarget = document.getElementById('typed-target');
  const bufferTarget = document.getElementById('typed-buffer');
  const themeSelect = document.getElementById('theme-select');
  const fontSelect = document.getElementById('font-select');
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
  const lineNumberToggle = document.getElementById('toggle-line-numbers');
  const playbackTitle = document.getElementById('playback-title');
  const codeFrame = document.getElementById('code-frame');
  const playbackFrame = document.querySelector('#playback-container .code-frame');
  const languageInput = document.getElementById('language-input');
  const playbackContainer = document.getElementById('playback-container');
  const playbackContext = document.getElementById('playback-context');
  const settingsButton = document.getElementById('settings-btn');
  const settingsPane = document.getElementById('settings-pane');
  const settingsResizeHandle = document.getElementById('resize-handle-settings');
  const playbackMinimizeBtn = document.getElementById('playback-minimize');
  const playbackMaximizeBtn = document.getElementById('playback-maximize');
  const timeDisplay = document.getElementById('time-display');

  if (playbackFrame) {
    playbackFrame.classList.remove('p-6');
    playbackFrame.style.borderRadius = '0';
    playbackFrame.style.border = '0';
    playbackFrame.style.boxShadow = 'none';
    const playbackTarget = playbackFrame.querySelector('#typed-target');
    if (playbackTarget) {
      playbackTarget.style.background = 'transparent';
    }
  }

  // Syntax Highlighting Setup
  const highlightOverlay = document.getElementById('code-input-highlight');
  const highlightOverlayCode = highlightOverlay ? highlightOverlay.querySelector('code') : null;
  const lineNumbersDiv = document.getElementById('line-numbers');
  const editorRoot = document.documentElement;

  const syncSourceEditorMetrics = () => {
    if (!textarea || !highlightOverlay || !highlightOverlayCode || !editorRoot) {
      return;
    }

    const style = window.getComputedStyle(textarea);
    const setVar = (name, value) => {
      if (value) {
        editorRoot.style.setProperty(name, value);
      }
    };

    setVar('--editor-font-size', style.fontSize);
    setVar('--editor-line-height', style.lineHeight);
    setVar('--editor-pad-top', style.paddingTop);
    setVar('--editor-pad-right', style.paddingRight);
    setVar('--editor-pad-bottom', style.paddingBottom);
    setVar('--editor-pad-left', style.paddingLeft);
    setVar('--editor-tab-size', style.tabSize || style.MozTabSize || '2');

    highlightOverlay.style.fontFamily = style.fontFamily;
    highlightOverlay.style.fontSize = style.fontSize;
    highlightOverlay.style.lineHeight = style.lineHeight;
    highlightOverlay.style.letterSpacing = style.letterSpacing;
    highlightOverlay.style.tabSize = style.tabSize || style.MozTabSize || '2';

    highlightOverlayCode.style.fontFamily = style.fontFamily;
    highlightOverlayCode.style.fontSize = style.fontSize;
    highlightOverlayCode.style.lineHeight = style.lineHeight;
    highlightOverlayCode.style.letterSpacing = style.letterSpacing;
    highlightOverlayCode.style.tabSize = style.tabSize || style.MozTabSize || '2';

    if (lineNumbersDiv) {
      lineNumbersDiv.style.fontFamily = style.fontFamily;
      lineNumbersDiv.style.fontSize = style.fontSize;
      lineNumbersDiv.style.lineHeight = style.lineHeight;
    }
  };

  const updateLineNumbers = () => {
    if (!lineNumbersDiv || !textarea) return;
    const lineCount = textarea.value.split('\n').length;
    let lineNumbersHtml = '';
    for (let i = 1; i <= lineCount; i++) {
      lineNumbersHtml += `<div>${i}</div>`;
    }
    lineNumbersDiv.innerHTML = lineNumbersHtml;
  };

  const updateHighlighting = () => {
    if (!highlightOverlayCode || !textarea) {
      return;
    }
    const code = textarea.value;
    highlightOverlayCode.textContent = code;
    
    // Auto-detect language and apply highlighting
    if (typeof hljs !== 'undefined') {
      delete highlightOverlayCode.dataset.highlighted;
      hljs.highlightElement(highlightOverlayCode);
    }

    // Update line numbers
    updateLineNumbers();
  };

  // Sync scrolling between textarea and highlight overlay
  const syncScroll = () => {
    if (highlightOverlay && textarea) {
      highlightOverlay.scrollTop = textarea.scrollTop;
      highlightOverlay.scrollLeft = textarea.scrollLeft;
    }
    if (lineNumbersDiv && textarea) {
      lineNumbersDiv.scrollTop = textarea.scrollTop;
    }
  };

  if (textarea) {
    textarea.addEventListener('input', updateHighlighting);
    textarea.addEventListener('scroll', syncScroll);

    syncSourceEditorMetrics();
    window.addEventListener('resize', syncSourceEditorMetrics);

    if (document.fonts && typeof document.fonts.ready?.then === 'function') {
      document.fonts.ready.then(() => {
        syncSourceEditorMetrics();
        updateHighlighting();
        syncScroll();
      });
    }
    
    // Initialize highlighting and line numbers immediately
    setTimeout(() => {
      syncSourceEditorMetrics();
      updateHighlighting();
      syncScroll();
    }, 100);
  }

  // Playback edge-resize setup (drag on actual playback edges)
  let isResizing = false;
  let resizeEdge = '';
  let startX = 0;
  let startY = 0;
  let startWidth = 680;
  let startHeight = 450;
  let contextWidth = 0;
  let contextHeight = 0;
  const edgeHitSize = 3;

  const getResizeEdge = (event) => {
    if (!playbackContainer) {
      return '';
    }

    const rect = playbackContainer.getBoundingClientRect();
    const leftDistance = event.clientX - rect.left;
    const rightDistance = rect.right - event.clientX;
    const topDistance = event.clientY - rect.top;
    const bottomDistance = rect.bottom - event.clientY;

    const insideX = leftDistance >= 0 && rightDistance >= 0;
    const insideY = topDistance >= 0 && bottomDistance >= 0;

    const onLeft = insideY && leftDistance >= 0 && leftDistance <= edgeHitSize;
    const onRight = insideY && rightDistance >= 0 && rightDistance <= edgeHitSize;
    const onTop = insideX && topDistance >= 0 && topDistance <= edgeHitSize;
    const onBottom = insideX && bottomDistance >= 0 && bottomDistance <= edgeHitSize;

    const vertical = onTop ? 'n' : onBottom ? 's' : '';
    const horizontal = onLeft ? 'w' : onRight ? 'e' : '';
    return `${vertical}${horizontal}`;
  };

  const edgeToCursor = (edge) => {
    const cursors = {
      n: 'n-resize',
      s: 's-resize',
      e: 'e-resize',
      w: 'w-resize',
      ne: 'ne-resize',
      nw: 'nw-resize',
      se: 'se-resize',
      sw: 'sw-resize',
    };
    return cursors[edge] || '';
  };

  const startResize = (event) => {
    if (!playbackContainer || event.button !== 0) {
      return;
    }

    const edge = getResizeEdge(event);
    if (!edge) {
      return;
    }

    const rect = playbackContainer.getBoundingClientRect();
    const contextElement = playbackContainer.parentElement || playbackContext || playbackContainer;
    const contextRect = contextElement.getBoundingClientRect();

    isResizing = true;
    resizeEdge = edge;
    startX = event.clientX;
    startY = event.clientY;
    startWidth = rect.width;
    startHeight = rect.height;
    contextWidth = contextRect.width;
    contextHeight = contextRect.height;

    playbackContainer.style.width = `${startWidth}px`;
    playbackContainer.style.height = `${startHeight}px`;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = edgeToCursor(edge);
    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
    event.preventDefault();
  };

  const doResize = (event) => {
    if (!isResizing || !playbackContainer) {
      return;
    }

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const minWidth = 320;
    const minHeight = 220;

    let newWidth = startWidth;
    let newHeight = startHeight;

    if (resizeEdge.includes('e')) {
      newWidth = startWidth + deltaX;
    }
    if (resizeEdge.includes('w')) {
      newWidth = startWidth - deltaX;
    }
    if (resizeEdge.includes('s')) {
      newHeight = startHeight + deltaY;
    }
    if (resizeEdge.includes('n')) {
      newHeight = startHeight - deltaY;
    }

    if (newWidth < minWidth) {
      newWidth = minWidth;
    }
    if (newHeight < minHeight) {
      newHeight = minHeight;
    }

    newWidth = Math.min(newWidth, contextWidth);
    newHeight = Math.min(newHeight, contextHeight);

    playbackContainer.style.width = `${newWidth}px`;
    playbackContainer.style.height = `${newHeight}px`;
  };

  const stopResize = () => {
    if (!isResizing) {
      return;
    }
    isResizing = false;
    resizeEdge = '';
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    if (playbackContext) {
      playbackContext.style.cursor = '';
    }
    if (playbackContainer) {
      playbackContainer.style.cursor = '';
    }
    window.removeEventListener('mousemove', doResize);
    window.removeEventListener('mouseup', stopResize);
  };

  const updateResizeCursor = (event) => {
    if (isResizing || !playbackContainer) {
      return;
    }
    const edge = getResizeEdge(event);
    const cursor = edgeToCursor(edge) || 'default';
    playbackContainer.style.cursor = cursor;
    if (playbackContext) {
      playbackContext.style.cursor = cursor;
    }
  };

  const resizeEventTarget = playbackContext || playbackContainer;
  if (resizeEventTarget && playbackContainer) {
    resizeEventTarget.addEventListener('mousemove', updateResizeCursor);
    resizeEventTarget.addEventListener('mouseleave', () => {
      if (!isResizing) {
        playbackContainer.style.cursor = 'default';
        if (playbackContext) {
          playbackContext.style.cursor = 'default';
        }
      }
    });
    resizeEventTarget.addEventListener('mousedown', startResize);
  }

  let isMinimized = false;
  let beforeMinimizeHeight = 450;

  if (playbackMinimizeBtn) {
    playbackMinimizeBtn.addEventListener('click', () => {
      isMinimized = !isMinimized;
      if (isMinimized) {
        beforeMinimizeHeight = playbackContainer.offsetHeight;
        playbackContainer.style.height = '40px';
        playbackContainer.style.overflow = 'hidden';
        playbackMinimizeBtn.textContent = '+';
      } else {
        playbackContainer.style.height = `${beforeMinimizeHeight}px`;
        playbackContainer.style.overflow = 'visible';
        playbackMinimizeBtn.textContent = '−';
      }
    });
  }

  if (playbackMaximizeBtn) {
    playbackMaximizeBtn.addEventListener('click', () => {
      const isMaximized = playbackContainer.style.width === '90vw' || playbackContainer.classList.contains('maximized');
      if (!isMaximized) {
        playbackContainer.style.left = '50%';
        playbackContainer.style.top = '50%';
        playbackContainer.style.transform = 'translate(-50%, -50%)';
        playbackContainer.style.width = '90vw';
        playbackContainer.style.height = '90vh';
        playbackContainer.classList.add('maximized');
        playbackMaximizeBtn.textContent = '⊡';
      } else {
        playbackContainer.style.width = '680px';
        playbackContainer.style.height = '450px';
        playbackContainer.classList.remove('maximized');
        playbackMaximizeBtn.textContent = '⛶';
      }
    });
  }

  // Play/Pause/Skip button setup
  const playBtn = document.getElementById('play-button');
  const pauseBtn = document.getElementById('pause-btn');
  const skipPrevBtn = document.getElementById('skip-prev');
  let isPaused = false;
  let playbackTimerId = null;
  let playbackStartTs = 0;
  let playbackPausedTs = 0;
  let playbackPausedAccumulatedMs = 0;
  let playbackEstimatedTotalMs = 0;
  let playbackExpectedChars = 0;
  let playbackStaticEstimateMs = 0;
  let playbackPauseMarkers = [];
  let playbackTotalPauseMs = 0;
  let playbackConfiguredMsPerChar = 50;
  let playbackObservedMsPerChar = 50;

  const formatTimeMs = (ms) => {
    const safe = Math.max(0, Math.round(Number(ms) || 0));
    const totalSeconds = Math.floor(safe / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const setTimeDisplay = (elapsedMs = 0, totalMs = 0) => {
    if (!timeDisplay) {
      return;
    }
    timeDisplay.textContent = `${formatTimeMs(elapsedMs)} / ${formatTimeMs(totalMs)}`;
  };

  const stopPlaybackTimer = () => {
    if (playbackTimerId) {
      clearInterval(playbackTimerId);
      playbackTimerId = null;
    }
  };

  const analyzePlaybackString = (playbackContent) => {
    const text = typeof playbackContent === 'string' ? playbackContent : '';
    let typedChars = 0;
    let pauseMs = 0;
    const pauseMarkers = [];

    for (let index = 0; index < text.length;) {
      const char = text[index];
      if (char === '^') {
        if (text[index + 1] === '^') {
          typedChars += 1;
          index += 2;
          continue;
        }

        let cursor = index + 1;
        let digits = '';
        while (cursor < text.length && /[0-9]/.test(text[cursor])) {
          digits += text[cursor];
          cursor += 1;
        }

        if (digits) {
          const duration = Math.max(0, Number.parseInt(digits, 10) || 0);
          pauseMs += duration;
          pauseMarkers.push({ atChar: typedChars, duration });
          index = cursor;
          continue;
        }
      }

      typedChars += 1;
      index += 1;
    }

    return {
      typedChars,
      pauseMs,
      pauseMarkers,
    };
  };

  const getConsumedPauseMs = (typedCharsNow) => {
    if (!Array.isArray(playbackPauseMarkers) || playbackPauseMarkers.length === 0) {
      return 0;
    }
    let consumed = 0;
    for (let i = 0; i < playbackPauseMarkers.length; i += 1) {
      const marker = playbackPauseMarkers[i];
      if (typedCharsNow >= marker.atChar) {
        consumed += marker.duration;
      }
    }
    return consumed;
  };

  const getRemainingPauseMs = (typedCharsNow) => {
    return Math.max(0, playbackTotalPauseMs - getConsumedPauseMs(typedCharsNow));
  };

  const estimatePlaybackTotalMs = (playbackContent) => {
    const analysis = analyzePlaybackString(playbackContent);
    const speedMsPerChar = Math.max(1, Number(speedSlider ? speedSlider.value : 50) || 50);
    const startDelayMs = 350;
    playbackExpectedChars = analysis.typedChars;
    playbackPauseMarkers = analysis.pauseMarkers;
    playbackTotalPauseMs = analysis.pauseMs;
    playbackConfiguredMsPerChar = speedMsPerChar;
    playbackObservedMsPerChar = speedMsPerChar;
    return Math.max(0, Math.round(startDelayMs + playbackExpectedChars * speedMsPerChar + playbackTotalPauseMs));
  };

  const getElapsedPlaybackMs = () => {
    if (!playbackStartTs) {
      return 0;
    }
    const now = performance.now();
    const pausedContribution = playbackPausedTs ? now - playbackPausedTs : 0;
    return Math.max(0, now - playbackStartTs - playbackPausedAccumulatedMs - pausedContribution);
  };

  const tickPlaybackTime = () => {
    if (!playbackStartTs) {
      setTimeDisplay(0, playbackEstimatedTotalMs);
      return;
    }
    const elapsed = getElapsedPlaybackMs();
    const typedCharsNow = Math.max(0, (bufferTarget && typeof bufferTarget.textContent === 'string')
      ? bufferTarget.textContent.length
      : 0);

    if (typedCharsNow >= 1 && playbackExpectedChars > 0) {
      const startDelayMs = 350;
      const consumedPauseMs = getConsumedPauseMs(typedCharsNow);
      const observedTypingElapsed = Math.max(0, elapsed - startDelayMs - consumedPauseMs);

      if (observedTypingElapsed > 0) {
        const observedMsPerChar = observedTypingElapsed / typedCharsNow;
        const minMsPerChar = playbackConfiguredMsPerChar * 0.6;
        const maxMsPerChar = playbackConfiguredMsPerChar * 5;
        const adjustedMsPerChar = Math.min(maxMsPerChar, Math.max(minMsPerChar, observedMsPerChar));

        playbackObservedMsPerChar = (playbackObservedMsPerChar * 0.85) + (adjustedMsPerChar * 0.15);

        const remainingChars = Math.max(0, playbackExpectedChars - typedCharsNow);
        const remainingPauseMs = getRemainingPauseMs(typedCharsNow);
        const etaMs = remainingChars * playbackObservedMsPerChar + remainingPauseMs;
        const projectedTotal = elapsed + etaMs;
        playbackEstimatedTotalMs = Math.max(elapsed, Math.round(projectedTotal));
      }
    }

    playbackEstimatedTotalMs = Math.max(playbackEstimatedTotalMs || playbackStaticEstimateMs, elapsed);
    setTimeDisplay(elapsed, playbackEstimatedTotalMs);
  };

  const startPlaybackTimer = (playbackContent) => {
    stopPlaybackTimer();
    playbackStaticEstimateMs = estimatePlaybackTotalMs(playbackContent);
    playbackEstimatedTotalMs = playbackStaticEstimateMs;
    playbackStartTs = performance.now();
    playbackPausedTs = 0;
    playbackPausedAccumulatedMs = 0;
    tickPlaybackTime();
    playbackTimerId = window.setInterval(tickPlaybackTime, 100);
  };

  const pausePlaybackTimer = () => {
    if (!playbackStartTs || playbackPausedTs) {
      return;
    }
    playbackPausedTs = performance.now();
    tickPlaybackTime();
  };

  const resumePlaybackTimer = () => {
    if (!playbackStartTs || !playbackPausedTs) {
      return;
    }
    playbackPausedAccumulatedMs += performance.now() - playbackPausedTs;
    playbackPausedTs = 0;
    tickPlaybackTime();
  };

  const completePlaybackTimer = () => {
    const elapsed = getElapsedPlaybackMs();
    stopPlaybackTimer();
    const finalTotal = Math.max(elapsed, playbackEstimatedTotalMs || playbackStaticEstimateMs);
    setTimeDisplay(finalTotal, finalTotal);
    playbackStartTs = 0;
    playbackPausedTs = 0;
    playbackPausedAccumulatedMs = 0;
    playbackExpectedChars = 0;
    playbackStaticEstimateMs = 0;
    playbackPauseMarkers = [];
    playbackTotalPauseMs = 0;
    playbackConfiguredMsPerChar = 50;
    playbackObservedMsPerChar = 50;
  };

  const pauseTyping = () => {
    if (!typedInstance) {
      return false;
    }
    pausePlaybackTimer();
    if (typeof typedInstance.stop === 'function') {
      typedInstance.stop();
      return true;
    }
    if (typeof typedInstance.pause === 'function') {
      typedInstance.pause();
      return true;
    }
    return false;
  };

  const resumeTyping = () => {
    if (!typedInstance) {
      return false;
    }
    resumePlaybackTimer();
    if (typeof typedInstance.start === 'function') {
      typedInstance.start();
      return true;
    }
    if (typeof typedInstance.resume === 'function') {
      typedInstance.resume();
      return true;
    }
    return false;
  };

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (!typedInstance) {
        isPaused = false;
        startTyping();
      } else if (isPaused) {
        isPaused = !resumeTyping() ? isPaused : false;
      }
    });
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (typedInstance && !isPaused) {
        isPaused = pauseTyping();
      }
    });
  }

  if (skipPrevBtn) {
    skipPrevBtn.addEventListener('click', () => {
      isPaused = false;
      startTyping();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && typedInstance && !isPaused) {
      isPaused = pauseTyping();
    }
  });

  const PLACEHOLDER = '// Paste code and hit Play Typing.';
  const MAX_EXPORT_LENGTH = 12000;
  const GIF_WORKER = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js';
  const MIN_GIF_SPEED_MULTIPLIER = 0.1;
  // Minimum encoder-friendly frame unit (ms). Some GIF players and encoders
  // quantize frame delays to a coarse granularity (commonly 50ms). To ensure
  // accurate timing we split requested delays into multiple hold-frames of
  // this unit so the resulting encoded GIF duration approximates the target.
  // Prefer the GIF logical delay unit (10ms) but use 10ms to improve
  // fidelity across players; a smaller hold unit allows closer matching to
  // playback timing.
  const MIN_ENCODER_FRAME_MS = 10;
  const MAX_GIF_SPEED_MULTIPLIER = 5;
  const PREFERRED_LANGUAGES = ['javascript', 'typescript', 'xml', 'html', 'json', 'css', 'python', 'java', 'csharp', 'cpp', 'php', 'ruby', 'go', 'bash', 'markdown', 'yaml', 'sql'];
  const LANGUAGE_OPTIONS = [
    { value: 'auto', aliases: ['auto', 'detect', 'default', 'auto (detect)'] },
    { value: 'javascript', aliases: ['javascript', 'js', 'node'] },
    { value: 'typescript', aliases: ['typescript', 'ts'] },
    { value: 'html', aliases: ['html', 'markup', 'xml'] },
    { value: 'css', aliases: ['css'] },
    { value: 'json', aliases: ['json'] },
    { value: 'python', aliases: ['python', 'py'] },
    { value: 'java', aliases: ['java'] },
    { value: 'csharp', aliases: ['c#', 'csharp', 'cs'] },
    { value: 'cpp', aliases: ['c++', 'cpp'] },
    { value: 'go', aliases: ['go', 'golang'] },
    { value: 'php', aliases: ['php'] },
    { value: 'ruby', aliases: ['ruby', 'rb'] },
    { value: 'bash', aliases: ['bash', 'shell', 'sh'] },
    { value: 'markdown', aliases: ['markdown', 'md'] },
    { value: 'yaml', aliases: ['yaml', 'yml'] },
    { value: 'sql', aliases: ['sql'] },
    { value: 'plaintext', aliases: ['plaintext', 'plain', 'text', 'txt'] },
  ];
  const LANGUAGE_ALIAS_MAP = new Map();
  LANGUAGE_OPTIONS.forEach(({ value, aliases }) => {
    aliases.forEach((alias) => {
      LANGUAGE_ALIAS_MAP.set(alias.toLowerCase(), value);
    });
  });
  const HLJS_LANGUAGE_OVERRIDES = {
    html: 'xml',
    markup: 'xml',
    csharp: 'cs',
    cs: 'cs',
    cpp: 'cpp',
    'c++': 'cpp',
    bash: 'shell',
    shell: 'shell',
  };
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
    paddingX: 0,
    paddingY: 0,
    innerPadding: 34,
    topBarHeight: 0,
    frameRadius: 18,
    dotRadius: 6,
    dotSpacing: 18,
    dotOffset: 16,
    fontFamily: '"Hack", "Fira Code", "Source Code Pro", Consolas, monospace',
    fontSize: 14,
    lineHeight: 14 * 1.33,
  maxFrames: 480,
    lineNumberGutterWidth: 48,
    lineNumberPadding: 12,
  };

  const DEFAULT_RESET_LIMIT = 2400;
  const FONT_FAMILIES = {
    hack: '"JetBrains Mono", "Fira Code", "Source Code Pro", Consolas, monospace',
    firacode: '"Fira Code", "JetBrains Mono", "Source Code Pro", Consolas, monospace',
    sourcecodepro: '"Source Code Pro", "Fira Code", "JetBrains Mono", Consolas, monospace',
    consolas: 'Consolas, "Source Code Pro", "Fira Code", "JetBrains Mono", monospace',
  };

  let activeThemeKey = 'panda';
  let activeFontKey = 'hack';
  let stageWidth = BASE_STAGE.width;
  let stageMinHeight = BASE_STAGE.minCodeHeight;
  let resetHeightLimit = DEFAULT_RESET_LIMIT;
  let typedInstance = null;
  let isExporting = false;
  let STAGE_THEME = { ...BASE_STAGE, ...THEMES[activeThemeKey] };
  let showLineNumbers = true;
  let manualLanguage = 'auto';

  const ensureThemeDefaults = () => {
    STAGE_THEME.lineNumberColor = STAGE_THEME.lineNumberColor || STAGE_THEME.commentColor || STAGE_THEME.textColor;
  };

  ensureThemeDefaults();

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
    'hljs-attribute.hljs-name': theme.attributeColor,
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
    'hljs-string.hljs-subst': theme.variableBuiltinColor || theme.stringColor,
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
    'hljs-meta.hljs-keyword': theme.metaColor,
    'hljs-meta.hljs-string': theme.stringColor,
    'hljs-doctag': theme.metaColor || theme.keywordColor,
    'hljs-subst': theme.variableBuiltinColor || theme.variableColor,
    'hljs-bullet': theme.constantColor || theme.metaColor,
    'hljs-emphasis': theme.stringColor,
    'hljs-strong': theme.keywordColor,
  });

  let highlightColorMap = buildHighlightMap(STAGE_THEME);
  let isResettingHeight = false;
  let lineNumberOffset = 0;

  const activeCompilationUrls = new Set();
  let compilationCount = 0;
  let settingsPaneVisible = true;
  let settingsPaneLastWidth = 280;

  const setSettingsPaneVisible = (visible) => {
    if (!settingsPane) {
      return;
    }

    settingsPaneVisible = Boolean(visible);

    if (settingsPaneVisible) {
      const widthToApply = Math.max(220, settingsPaneLastWidth || 280);
      settingsPane.style.width = `${widthToApply}px`;
      settingsPane.style.minWidth = '';
      settingsPane.style.borderLeftWidth = '';
      settingsPane.style.overflowY = 'auto';
      settingsPane.style.padding = '';
      if (settingsResizeHandle) {
        settingsResizeHandle.style.display = '';
      }
    } else {
      const currentWidth = settingsPane.getBoundingClientRect().width;
      if (currentWidth > 40) {
        settingsPaneLastWidth = Math.round(currentWidth);
      }
      settingsPane.style.width = '0px';
      settingsPane.style.minWidth = '0px';
      settingsPane.style.borderLeftWidth = '0px';
      settingsPane.style.overflow = 'hidden';
      settingsPane.style.padding = '0';
      if (settingsResizeHandle) {
        settingsResizeHandle.style.display = 'none';
      }
    }

    if (settingsButton) {
      settingsButton.setAttribute('aria-pressed', settingsPaneVisible ? 'true' : 'false');
      settingsButton.classList.toggle('text-white', settingsPaneVisible);
      settingsButton.classList.toggle('text-slate-300', !settingsPaneVisible);
    }
  };

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
    root.style.setProperty('--code-line-number', STAGE_THEME.lineNumberColor || STAGE_THEME.commentColor || STAGE_THEME.textColor);
    root.style.setProperty('--accent-cursor', STAGE_THEME.cursorColor);
    root.style.setProperty('--stage-width', `${stageWidth}px`);
    root.style.setProperty('--code-min-height', `${stageMinHeight}px`);
    root.style.setProperty('--line-number-gutter', `${STAGE_THEME.lineNumberGutterWidth || 48}px`);
    root.style.setProperty('--font-code', STAGE_THEME.fontFamily || BASE_STAGE.fontFamily);
  };

  const getFontFamilyFromKey = (fontKey) => FONT_FAMILIES[fontKey] || FONT_FAMILIES.hack;

  const applyActiveFontFamily = ({ rerender = true } = {}) => {
    STAGE_THEME.fontFamily = getFontFamilyFromKey(activeFontKey);
    if (textarea) {
      textarea.style.fontFamily = STAGE_THEME.fontFamily;
      syncSourceEditorMetrics();
    }
    applyThemeToRoot();
    if (fontSelect && fontSelect.value !== activeFontKey) {
      fontSelect.value = activeFontKey;
    }
    if (rerender) {
      applyHighlight();
    }
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

  const min = Number(speedSlider ? speedSlider.min : 1) || 1;
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

  const clampGifSpeedMultiplier = (value) => {
    if (!Number.isFinite(value)) {
      return 1;
    }
    return Math.min(MAX_GIF_SPEED_MULTIPLIER, Math.max(MIN_GIF_SPEED_MULTIPLIER, value));
  };

  const parseGifSpeedMultiplierInput = (value) => {
    if (value === '' || value === null || value === undefined) {
      return 1;
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return 1;
    }
    return numeric;
  };

  const applyGifSpeedMultiplier = (value) => {
    const numeric = parseGifSpeedMultiplierInput(value);
    const clamped = clampGifSpeedMultiplier(numeric);
    if (gifSpeedMultiplierInput && Number(gifSpeedMultiplierInput.value) !== clamped) {
      gifSpeedMultiplierInput.value = String(clamped);
    }
    return clamped;
  };

  const getGifSpeedMultiplier = () => {
    if (!gifSpeedMultiplierInput) {
      return 1;
    }
    const numeric = parseGifSpeedMultiplierInput(gifSpeedMultiplierInput.value);
    return clampGifSpeedMultiplier(numeric);
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
    const codeDisplay = document.querySelector('.code-display');

    if (!codeDisplay) {
      return false;
    }

    codeDisplay.style.maxHeight = 'none';
    codeDisplay.style.overflowX = 'auto';
    codeDisplay.style.overflowY = 'auto';
    return false;
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
    STAGE_THEME.fontFamily = getFontFamilyFromKey(activeFontKey);
  ensureThemeDefaults();
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

    const classes = Array.isArray(classList) ? classList : Array.from(classList);

    // Try direct class match, preferring the most specific (latest) class
    for (let i = classes.length - 1; i >= 0; i -= 1) {
      const cls = classes[i];
      if (highlightColorMap[cls]) {
        return highlightColorMap[cls];
      }
    }

    // Check for composite mappings (e.g., "hljs-meta.hljs-keyword")
    // Try matching combinations of classes in reverse order for specificity
    for (let i = classes.length - 1; i >= 0; i -= 1) {
      for (let j = i - 1; j >= 0; j -= 1) {
        const compositeKey = `${classes[j]}.${classes[i]}`;
        if (highlightColorMap[compositeKey]) {
          return highlightColorMap[compositeKey];
        }
      }
    }

    return highlightColorMap.default;
  };

  const countLines = (value) => {
    if (!value) {
      return 0;
    }
    const matches = value.match(/\n/g);
    return matches ? matches.length + 1 : 1;
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
              classes: inheritedClasses.length ? Array.from(new Set(inheritedClasses)) : [],
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
      const actualFragments = fragments.length
        ? fragments
        : [{ text: ' ', color: highlightColorMap.default, classes: [], classKey: '' }];
      const lineElement = document.createElement('span');
      lineElement.className = 'code-line';
      lineElement.dataset.line = String(lineNumberOffset + lineIndex + 1);

      actualFragments.forEach(({ text, color, classes }) => {
        const span = document.createElement('span');
        span.style.color = color || highlightColorMap.default;
        if (classes && classes.length) {
          span.className = classes.join(' ');
        }
        span.textContent = text;
        lineElement.appendChild(span);
      });

      container.appendChild(lineElement);
    });

    if (showCursor) {
      let cursorLine = container.lastElementChild;
      if (!cursorLine) {
        cursorLine = document.createElement('span');
        cursorLine.className = 'code-line';
        cursorLine.dataset.line = '1';
        container.appendChild(cursorLine);
      }

      const cursor = document.createElement('span');
      cursor.className = 'typed-cursor proxy';
      cursor.textContent = '|';
      cursorLine.appendChild(cursor);
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

  function manualHighlightJavascript(code) {
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
  }

  function manualHighlightCss(code) {
    let output = '';
    const length = code.length;
    let index = 0;
    let inBlock = false;
    let expectingProperty = false;

    const append = (text, className = null) => {
      if (!text) {
        return;
      }
      const escaped = escapeHtml(text);
      output += className ? `<span class="${className}">${escaped}</span>` : escaped;
    };

  const whitespaceRegex = /\s+/y;
  const commentRegex = /\/\*[\s\S]*?\*\//y;
  const stringRegex = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/y;
  const numberRegex = /\b\d+(?:\.\d+)?(?:%|px|em|rem|vh|vw|vmin|vmax|s|ms|deg|rad|turn)?\b/y;
  const hexColorRegex = /#[0-9a-fA-F]{3,8}\b/y;
    const identifierRegex = /[A-Za-z_-][A-Za-z0-9_-]*/y;

    while (index < length) {
      whitespaceRegex.lastIndex = index;
      const wsMatch = whitespaceRegex.exec(code);
      if (wsMatch && wsMatch.index === index) {
        append(wsMatch[0], null);
        index = whitespaceRegex.lastIndex;
        continue;
      }

      commentRegex.lastIndex = index;
      const commentMatch = commentRegex.exec(code);
      if (commentMatch && commentMatch.index === index) {
        append(commentMatch[0], 'hljs-comment');
        index = commentRegex.lastIndex;
        continue;
      }

      stringRegex.lastIndex = index;
      const stringMatch = stringRegex.exec(code);
      if (stringMatch && stringMatch.index === index) {
        append(stringMatch[0], 'hljs-string');
        index = stringRegex.lastIndex;
        continue;
      }

      if (code[index] === '{') {
        append('{', 'hljs-punctuation');
        index += 1;
        inBlock = true;
        expectingProperty = true;
        continue;
      }

      if (code[index] === '}') {
        append('}', 'hljs-punctuation');
        index += 1;
        inBlock = false;
        expectingProperty = false;
        continue;
      }

      if (code[index] === ';') {
        append(';', 'hljs-punctuation');
        index += 1;
        expectingProperty = true;
        continue;
      }

      if (!inBlock) {
        if (code[index] === ':' ) {
          let colonCount = 0;
          while (code[index + colonCount] === ':' && colonCount < 2) {
            colonCount += 1;
          }
          const pseudoMatch = /^[A-Za-z-]+/.exec(code.slice(index + colonCount));
          if (pseudoMatch) {
            append(code.slice(index, index + colonCount), 'hljs-selector-pseudo');
            append(pseudoMatch[0], 'hljs-selector-pseudo');
            index += colonCount + pseudoMatch[0].length;
            continue;
          }
        }

        if (code[index] === '.') {
          const classMatch = /^\.[A-Za-z0-9_-]+/.exec(code.slice(index));
          if (classMatch) {
            append(classMatch[0], 'hljs-selector-class');
            index += classMatch[0].length;
            continue;
          }
        }

        if (code[index] === '#') {
          const idMatch = /^#[A-Za-z0-9_-]+/.exec(code.slice(index));
          if (idMatch) {
            append(idMatch[0], 'hljs-selector-id');
            index += idMatch[0].length;
            continue;
          }
        }

        if (code[index] === '@') {
          const atMatch = /^@[A-Za-z_-]+/.exec(code.slice(index));
          if (atMatch) {
            append(atMatch[0], 'hljs-keyword');
            index += atMatch[0].length;
            continue;
          }
        }

        if (code[index] === '[') {
          const endAttr = code.indexOf(']', index + 1);
          const fragment = code.slice(index, endAttr >= 0 ? endAttr + 1 : length);
          append(fragment, 'hljs-attr');
          index = endAttr >= 0 ? endAttr + 1 : length;
          continue;
        }

        if (/[>+~,]/.test(code[index])) {
          append(code[index], 'hljs-operator');
          index += 1;
          continue;
        }

        identifierRegex.lastIndex = 0;
        const selectorMatch = identifierRegex.exec(code.slice(index));
        if (selectorMatch) {
          append(selectorMatch[0], 'hljs-selector-tag');
          index += selectorMatch[0].length;
          continue;
        }

        append(code[index], null);
        index += 1;
        continue;
      }

      if (code[index] === ':') {
        append(':', 'hljs-operator');
        index += 1;
        expectingProperty = false;
        continue;
      }

      if (expectingProperty) {
        identifierRegex.lastIndex = 0;
        const propertyMatch = identifierRegex.exec(code.slice(index));
        if (propertyMatch) {
          append(propertyMatch[0], 'hljs-attr');
          index += propertyMatch[0].length;
          continue;
        }
      }

      if (code.startsWith('url(', index)) {
        append('url', 'hljs-built_in');
        index += 3;
        continue;
      }

      if (code[index] === '(' || code[index] === ')') {
        append(code[index], 'hljs-punctuation');
        index += 1;
        continue;
      }

      if (code[index] === ',') {
        append(',', 'hljs-punctuation');
        index += 1;
        continue;
      }

      hexColorRegex.lastIndex = index;
      const hexMatch = hexColorRegex.exec(code);
      if (hexMatch && hexMatch.index === index) {
        append(hexMatch[0], 'hljs-hexcolor');
        index = hexColorRegex.lastIndex;
        continue;
      }

      numberRegex.lastIndex = index;
      const numberMatch = numberRegex.exec(code);
      if (numberMatch && numberMatch.index === index) {
        append(numberMatch[0], 'hljs-number');
        index = numberRegex.lastIndex;
        continue;
      }

      identifierRegex.lastIndex = 0;
      const valueIdentifier = identifierRegex.exec(code.slice(index));
      if (valueIdentifier) {
        append(valueIdentifier[0], 'hljs-literal');
        index += valueIdentifier[0].length;
        continue;
      }

      append(code[index], null);
      index += 1;
    }

    return output;
  }

  function highlightUsingLanguage(code, language) {
    const normalized = typeof language === 'string' ? language.toLowerCase() : '';
    const mapped = normalized && HLJS_LANGUAGE_OVERRIDES[normalized]
      ? HLJS_LANGUAGE_OVERRIDES[normalized]
      : normalized;

    if (!mapped || mapped === 'plaintext') {
      return escapeHtml(code);
    }

    if (typeof hljs !== 'undefined' && hljs.getLanguage && hljs.getLanguage(mapped)) {
      try {
        return hljs.highlight(code, { language: mapped, ignoreIllegals: true }).value;
      } catch (inlineError) {
        console.warn(`Inline ${mapped} highlight failed, using fallback.`, inlineError);
      }
    }

    if (mapped === 'javascript' || mapped === 'typescript') {
      return manualHighlightJavascript(code);
    }

    if (mapped === 'css') {
      return manualHighlightCss(code);
    }

    return escapeHtml(code);
  }

  function manualHighlightMarkup(code) {
    let output = '';
    const length = code.length;
    const lowerCode = code.toLowerCase();
    let index = 0;

    const append = (text, className = null) => {
      if (!text) {
        return;
      }
      const escaped = escapeHtml(text);
      output += className ? `<span class="${className}">${escaped}</span>` : escaped;
    };

    const appendRaw = (html) => {
      if (!html) {
        return;
      }
      output += html;
    };

    const isWhitespace = (char) => /\s/.test(char);

    while (index < length) {
      if (code.startsWith('<!--', index)) {
        const end = code.indexOf('-->', index + 4);
        const fragment = code.slice(index, end >= 0 ? end + 3 : length);
        append(fragment, 'hljs-comment');
        index = end >= 0 ? end + 3 : length;
        continue;
      }

      if (code.startsWith('<!', index)) {
        const end = code.indexOf('>', index + 2);
        const fragment = code.slice(index, end >= 0 ? end + 1 : length);
        append(fragment, 'hljs-meta');
        index = end >= 0 ? end + 1 : length;
        continue;
      }

      if (code[index] === '<') {
        let isClosing = false;
        let isSelfClosing = false;
        index += 1;
        if (code[index] === '/') {
          append('</', 'hljs-tag');
          index += 1;
          isClosing = true;
        } else {
          append('<', 'hljs-tag');
        }

        const nameMatch = /[A-Za-z][A-Za-z0-9:_-]*/.exec(code.slice(index));
        let tagName = '';
        if (nameMatch) {
          tagName = nameMatch[0];
          append(tagName, 'hljs-name');
          index += tagName.length;
        }

        while (index < length) {
          if (code[index] === '>') {
            append('>', 'hljs-tag');
            index += 1;
            break;
          }

          if (code[index] === '/' && code[index + 1] === '>') {
            append('/>', 'hljs-tag');
            index += 2;
            isSelfClosing = true;
            break;
          }

          if (isWhitespace(code[index])) {
            const wsStart = index;
            while (index < length && isWhitespace(code[index])) {
              index += 1;
            }
            append(code.slice(wsStart, index), null);
            continue;
          }

          const attrMatch = /[A-Za-z_:][A-Za-z0-9:._-]*/.exec(code.slice(index));
          if (attrMatch) {
            append(attrMatch[0], 'hljs-attr');
            index += attrMatch[0].length;

            while (index < length && isWhitespace(code[index])) {
              const wsStart = index;
              while (index < length && isWhitespace(code[index])) {
                index += 1;
              }
              append(code.slice(wsStart, index), null);
            }

            if (code[index] === '=') {
              append('=', 'hljs-operator');
              index += 1;

              while (index < length && isWhitespace(code[index])) {
                const wsStart = index;
                while (index < length && isWhitespace(code[index])) {
                  index += 1;
                }
                append(code.slice(wsStart, index), null);
              }

              if (code[index] === '"' || code[index] === "'") {
                const quote = code[index];
                const strStart = index;
                index += 1;
                while (index < length && code[index] !== quote) {
                  index += 1;
                }
                if (index < length) {
                  index += 1;
                }
                append(code.slice(strStart, index), 'hljs-string');
              } else {
                const unquoted = /[^\s>]+/.exec(code.slice(index));
                if (unquoted) {
                  append(unquoted[0], 'hljs-string');
                  index += unquoted[0].length;
                }
              }
            }
            continue;
          }

          append(code[index], null);
          index += 1;
        }

        const tagNameLower = tagName.toLowerCase();
        if (!isClosing && !isSelfClosing && (tagNameLower === 'script' || tagNameLower === 'style')) {
          const closingNeedle = `</${tagNameLower}`;
          const closingIndex = lowerCode.indexOf(closingNeedle, index);
          const contentEnd = closingIndex >= 0 ? closingIndex : length;
          const innerContent = code.slice(index, contentEnd);
          const forcedLanguage = tagNameLower === 'style' ? 'css' : 'javascript';
          const highlightedInner = highlightUsingLanguage(innerContent, forcedLanguage) || escapeHtml(innerContent);
          appendRaw(highlightedInner);
          index = contentEnd;
        }

        continue;
      }

      const nextTag = code.indexOf('<', index);
      const textEnd = nextTag === -1 ? length : nextTag;
      append(code.slice(index, textEnd), null);
      index = textEnd;
    }

    return output;
  }

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

  const normalizeDisplayText = (value) => value.replace(/\t/g, '  ');

  const consumeFittingChunk = (text, availableWidth, measure) => {
    if (!text.length) {
      return { chunk: '', width: 0, rest: '' };
    }

    const fullWidth = measure(text);
    if (fullWidth <= availableWidth) {
      return { chunk: text, width: fullWidth, rest: '' };
    }

    let low = 1;
    let high = text.length;
    let best = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const slice = text.slice(0, mid);
      const sliceWidth = measure(slice);
      if (sliceWidth <= availableWidth) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    if (best <= 0) {
      const firstChar = text.slice(0, 1);
      return { chunk: firstChar, width: measure(firstChar), rest: text.slice(1) };
    }

    let breakIndex = best;
    if (breakIndex < text.length) {
      const candidate = text.slice(0, breakIndex);
      const lastSpace = Math.max(candidate.lastIndexOf(' '), candidate.lastIndexOf('\u00A0'));
      if (lastSpace > 0) {
        breakIndex = lastSpace + 1;
      }
    }

    const chunk = text.slice(0, breakIndex);
    const width = measure(chunk);
    const rest = text.slice(breakIndex);
    return { chunk, width, rest };
  };

  const wrapFragmentsForWidth = (fragments, maxWidth, ctx) => {
    const wrappedLines = [];
    const measure = (value) => ctx.measureText(value).width;
    const sourceFragments = fragments.length
      ? fragments
      : [{ text: ' ', color: STAGE_THEME.textColor, classes: [], classKey: '' }];

    let currentLine = [];
    let currentWidth = 0;
    let emitted = false;

    const emitLine = () => {
      const segments = currentLine.length
        ? currentLine.map((segment) => ({
            text: segment.text,
            color: segment.color,
            classes: segment.classes ? [...segment.classes] : [],
            classKey: segment.classKey || (segment.classes ? segment.classes.join(' ') : ''),
          }))
        : [{ text: ' ', color: STAGE_THEME.textColor, classes: [], classKey: '' }];
      wrappedLines.push({ fragments: segments });
      currentLine = [];
      currentWidth = 0;
      emitted = true;
    };

    sourceFragments.forEach(({ text, color, classes }) => {
      let remaining = normalizeDisplayText(text || '');
      if (!remaining.length) {
        return;
      }

      const fragmentColor = color || STAGE_THEME.textColor;
      const fragmentClasses = Array.isArray(classes) ? classes : [];
      const fragmentClassKey = fragmentClasses.length ? fragmentClasses.join(' ') : '';

      while (remaining.length) {
        const available = Math.max(0, maxWidth - currentWidth);
        if (available <= 0) {
          emitLine();
          continue;
        }

        const { chunk, width, rest } = consumeFittingChunk(remaining, available, measure);
        if (!chunk) {
          break;
        }

        const lastSegment = currentLine[currentLine.length - 1];
        if (lastSegment && lastSegment.color === fragmentColor && lastSegment.classKey === fragmentClassKey) {
          lastSegment.text += chunk;
        } else {
          currentLine.push({
            text: chunk,
            color: fragmentColor,
            classes: fragmentClasses.slice(),
            classKey: fragmentClassKey,
          });
        }
        currentWidth += width;
        remaining = rest;
      }
    });

    if (currentLine.length || !emitted) {
      emitLine();
    }

    return wrappedLines;
  };

  const wrapTextLinesForWidth = (lines, maxWidth, ctx) => {
    const wrapped = [];
    lines.forEach((fragments, lineIndex) => {
      const perLine = wrapFragmentsForWidth(fragments, maxWidth, ctx);
      perLine.forEach((entry, segmentIndex) => {
        wrapped.push({
          lineNumber: lineIndex + 1,
          fragments: entry.fragments,
          continuation: segmentIndex > 0,
        });
      });
    });
    return wrapped;
  };

  const renderCanvasFrame = (renderer, highlightedHtml, { showCursor = false } = {}) => {
    const { canvas, ctx, scale } = renderer;
    const lines = parseHighlighted(highlightedHtml);

    if (showCursor) {
      const lastLine = lines[lines.length - 1] || [];
      lastLine.push({ text: '|', color: STAGE_THEME.cursorColor, classes: [] });
      if (lines.length === 0) {
        lines.push(lastLine);
      }
    }

    const effectiveLines = lines.length ? lines : [[]];

  const combinedInset = (STAGE_THEME.paddingX + STAGE_THEME.innerPadding) * 2;
  const gutterWidth = showLineNumbers ? (STAGE_THEME.lineNumberGutterWidth || 48) : 0;
  const minimumFrameWidth = combinedInset + gutterWidth + 40;
    const frameWidth = Math.max(STAGE_THEME.width, minimumFrameWidth);
    const textStartX = STAGE_THEME.paddingX + STAGE_THEME.innerPadding + gutterWidth;
    const textStartY = STAGE_THEME.paddingY + STAGE_THEME.topBarHeight + STAGE_THEME.innerPadding;
    const textAreaWidth = Math.max(40, frameWidth - combinedInset - gutterWidth);
    ctx.font = `${STAGE_THEME.fontSize}px ${STAGE_THEME.fontFamily}`;
    let wrappedLines = wrapTextLinesForWidth(effectiveLines, textAreaWidth, ctx);

    if (resetHeightLimit && resetHeightLimit > 0) {
      const maxVisibleLines = Math.max(1, Math.floor(resetHeightLimit / STAGE_THEME.lineHeight));
      if (wrappedLines.length > maxVisibleLines) {
        wrappedLines = wrappedLines.slice(wrappedLines.length - maxVisibleLines);
      }
    }

  const totalTextHeight = wrappedLines.length * STAGE_THEME.lineHeight;
    const contentHeight = Math.max(totalTextHeight, STAGE_THEME.minCodeHeight);
    const frameHeight = STAGE_THEME.innerPadding * 2 + contentHeight;
    const totalHeight = STAGE_THEME.paddingY * 2 + STAGE_THEME.topBarHeight + frameHeight;

    canvas.width = Math.round(frameWidth * scale);
    canvas.height = Math.round(totalHeight * scale);

    ctx.save();
    ctx.scale(scale, scale);
    ctx.clearRect(0, 0, frameWidth, totalHeight);

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

    // Text content
    ctx.textBaseline = 'top';
    ctx.font = `${STAGE_THEME.fontSize}px ${STAGE_THEME.fontFamily}`;

    wrappedLines.forEach((lineEntry, lineIndex) => {
      const { fragments, lineNumber, continuation } = lineEntry;
      let cursorX = textStartX;
      const baselineY = textStartY + lineIndex * STAGE_THEME.lineHeight;

      ctx.textAlign = 'left';
      if (showLineNumbers && gutterWidth > 0) {
        const numberText = continuation ? '' : String(lineNumber);
        if (numberText) {
          ctx.fillStyle = STAGE_THEME.lineNumberColor || STAGE_THEME.commentColor || STAGE_THEME.textColor;
          ctx.textAlign = 'right';
          const numberX = textStartX - (STAGE_THEME.lineNumberPadding || 12);
          ctx.fillText(numberText, numberX, baselineY);
          ctx.textAlign = 'left';
        }
      }

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

  const getExportButtonLabelTarget = () => {
    if (!exportButton) {
      return null;
    }
    return exportButton.querySelector('.truncate') || exportButton;
  };

  const exportButtonBaseLabel = (() => {
    const labelTarget = getExportButtonLabelTarget();
    if (!labelTarget) {
      return 'Export GIF';
    }
    const text = (labelTarget.textContent || '').trim();
    return text || 'Export GIF';
  })();

  const setExportProgress = (percent = 0, phase = 'Exporting') => {
    if (!exportButton) {
      return;
    }

    const clamped = Math.max(0, Math.min(100, Number.isFinite(percent) ? Math.round(percent) : 0));
    exportButton.classList.add('is-exporting');
    exportButton.style.setProperty('--export-progress', `${clamped}%`);
    exportButton.setAttribute('aria-busy', 'true');
    exportButton.setAttribute('aria-valuemin', '0');
    exportButton.setAttribute('aria-valuemax', '100');
    exportButton.setAttribute('aria-valuenow', String(clamped));
    exportButton.setAttribute('aria-valuetext', `${phase} ${clamped}%`);

    const labelTarget = getExportButtonLabelTarget();
    if (labelTarget) {
      labelTarget.textContent = `${phase} ${clamped}%`;
    }
  };

  const resetExportProgress = () => {
    if (!exportButton) {
      return;
    }

    exportButton.classList.remove('is-exporting');
    exportButton.style.setProperty('--export-progress', '0%');
    exportButton.setAttribute('aria-busy', 'false');
    exportButton.removeAttribute('aria-valuemin');
    exportButton.removeAttribute('aria-valuemax');
    exportButton.removeAttribute('aria-valuenow');
    exportButton.removeAttribute('aria-valuetext');

    const labelTarget = getExportButtonLabelTarget();
    if (labelTarget) {
      labelTarget.textContent = exportButtonBaseLabel;
    }
  };

  const getNormalizedContent = () => {
    const raw = textarea.value.replace(/\r\n/g, '\n');
    return raw.trim() ? raw : PLACEHOLDER;
  };

  const destroyTyped = () => {
    stopPlaybackTimer();
    playbackStartTs = 0;
    playbackPausedTs = 0;
    playbackPausedAccumulatedMs = 0;
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

    if (/^<[a-z!]/i.test(trimmed)) {
      if (/>/.test(trimmed) || /<\//.test(trimmed) || /\/>/.test(trimmed)) {
        return 'html';
      }
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

  const resolveLanguage = (code) => {
    if (manualLanguage && manualLanguage !== 'auto') {
      return manualLanguage;
    }
    return detectLanguage(code);
  };

  const setManualLanguage = (value) => {
    const normalized = typeof value === 'string' ? value.trim().toLowerCase() : 'auto';
    const resolved = LANGUAGE_ALIAS_MAP.get(normalized) || normalized;
    manualLanguage = LANGUAGE_ALIAS_MAP.has(normalized) ? resolved : 'auto';
    if (languageInput && languageInput.value.toLowerCase() !== (manualLanguage || 'auto')) {
      languageInput.value = manualLanguage;
    }
    applyHighlight();
  };

  const WAIT_DIRECTIVE_PATTERN = /^\s*Tpyr\.wait\(\s*([0-9]+(?:\.[0-9]+)?)?\s*(?:,?\s*(?:['\"])?(ms|s)(?:['\"])?\s*)?\)\s*;?(?:\s*\/\/.*)?$/i;
  const DEFAULT_WAIT_SECONDS = 1;

  const applyWaitDirectivesToPlayback = (code) => {
    if (!code) {
      return code;
    }

    const lines = code.split('\n');
    const processed = [];
    let pendingDelayMarkup = '';
    let didMutate = false;

    lines.forEach((line) => {
      const match = WAIT_DIRECTIVE_PATTERN.exec(line);
      if (match) {
        const rawValue = match[1];
        const unit = (match[2] || 's').toLowerCase();
        const parsed = rawValue === undefined || rawValue === null || rawValue === ''
          ? DEFAULT_WAIT_SECONDS
          : Number.parseFloat(rawValue);

        if (!Number.isFinite(parsed)) {
          processed.push(line);
          return;
        }

        const durationMs = unit === 'ms'
          ? Math.max(0, Math.round(parsed))
          : Math.max(0, Math.round(parsed * 1000));

        if (durationMs > 0) {
          pendingDelayMarkup += `^${durationMs}`;
          didMutate = true;
          return;
        }

        processed.push(line);
        return;
      }

      if (pendingDelayMarkup) {
        processed.push(`${pendingDelayMarkup}${line}`);
        pendingDelayMarkup = '';
      } else {
        processed.push(line);
      }
    });

    if (pendingDelayMarkup && processed.length) {
      processed[processed.length - 1] += pendingDelayMarkup;
      pendingDelayMarkup = '';
    }

    return didMutate ? processed.join('\n') : code;
  };

  const prepareContentForExport = (code) => {
    if (!code) {
      return {
        content: '',
        pauses: [],
      };
    }

    const lines = code.split('\n');
    const pauses = [];
    let exportContent = '';
    let currentLength = 0;

    const appendLine = (line) => {
      if (exportContent.length) {
        exportContent += '\n';
        currentLength += 1;
      }
      exportContent += line;
      currentLength += line.length;
    };

    lines.forEach((line) => {
      const match = WAIT_DIRECTIVE_PATTERN.exec(line);
      if (match) {
        const rawValue = match[1];
        const unit = (match[2] || 's').toLowerCase();
        const parsed = rawValue === undefined || rawValue === null || rawValue === ''
          ? DEFAULT_WAIT_SECONDS
          : Number.parseFloat(rawValue);

        if (!Number.isFinite(parsed)) {
          appendLine(line);
          return;
        }

        const durationMs = unit === 'ms'
          ? Math.max(0, Math.round(parsed))
          : Math.max(0, Math.round(parsed * 1000));

        if (durationMs > 0) {
          pauses.push({ index: currentLength, duration: durationMs });
        }
        return;
      }

      appendLine(line);
    });

    return {
      content: exportContent,
      pauses,
    };
  };

  let typedTrimPatchApplied = false;
  let typedTimingPatchApplied = false;

  const ensureTypedTimingPatch = () => {
    if (typedTimingPatchApplied) {
      return;
    }

    if (typeof Typed === 'undefined' || !Typed || !Typed.prototype) {
      return;
    }

    Typed.prototype.humanizer = function fixedHumanizer() {
      const speed = Number(this.typeSpeed);
      return Number.isFinite(speed) ? Math.max(1, Math.round(speed)) : 1;
    };

    typedTimingPatchApplied = true;
  };

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
      const normalizedStep = Number.isFinite(step) ? Math.max(1, Math.floor(step)) : 1;
      const effectiveStep = Math.min(1, normalizedStep);
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

    const language = resolveLanguage(code);
    const normalizedLanguage = typeof language === 'string' ? language.toLowerCase() : 'plaintext';
    const highlightLanguage = normalizedLanguage !== 'plaintext'
      ? (HLJS_LANGUAGE_OVERRIDES[normalizedLanguage] || normalizedLanguage)
      : 'plaintext';
    const isMarkup = highlightLanguage === 'xml' || highlightLanguage === 'html';
    const hasEmbeddedLanguages = isMarkup && /<\s*(script|style)\b/i.test(code);

    if (highlightLanguage === 'plaintext') {
      return escapeHtml(code);
    }

    if (hasEmbeddedLanguages) {
      return manualHighlightMarkup(code);
    }

    if (typeof hljs === 'undefined') {
      if (highlightLanguage === 'javascript' || highlightLanguage === 'typescript') {
        return manualHighlightJavascript(code);
      }
      if (isMarkup) {
        return manualHighlightMarkup(code);
      }
      return escapeHtml(code);
    }

    let highlighted = '';
    try {
      if (highlightLanguage && highlightLanguage !== 'plaintext' && hljs.getLanguage && hljs.getLanguage(highlightLanguage)) {
        highlighted = hljs.highlight(code, { language: highlightLanguage, ignoreIllegals: true }).value;
      }
    } catch (error) {
      console.warn('Highlighting failed, using manual fallback.', error);
    }

    if (!highlighted) {
      try {
        const preferred = Array.isArray(PREFERRED_LANGUAGES) ? PREFERRED_LANGUAGES : [];
        const uniqueList = [highlightLanguage, ...preferred.filter((lang) => lang !== highlightLanguage && lang !== 'auto')].filter(Boolean);
        const { value } = hljs.highlightAuto(code, uniqueList.length ? uniqueList : undefined);
        highlighted = value;
      } catch (autoError) {
        console.warn('Auto-highlighting fallback failed, using manual fallback.', autoError);
      }
    }

    if (isMarkup && (!highlighted || highlighted.indexOf('<span') === -1)) {
      return manualHighlightMarkup(code);
    }

    if (!highlighted || highlighted.indexOf('<span') === -1) {
      if (highlightLanguage === 'javascript' || highlightLanguage === 'typescript') {
        return manualHighlightJavascript(code);
      }
      if (isMarkup) {
        return manualHighlightMarkup(code);
      }
      return escapeHtml(code);
    }

    return highlighted;
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
    isPaused = false;

    lineNumberOffset = 0;
    destroyTyped();
    bufferTarget.textContent = '';
    applyHighlight();

    const playbackContent = applyWaitDirectivesToPlayback(content);
    startPlaybackTimer(playbackContent);

    ensureTypedTimingPatch();
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
      onComplete: () => {
        applyHighlight();
        completePlaybackTimer();
      },
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
    if (lineNumberToggle) {
      lineNumberToggle.disabled = disabled;
    }
    if (languageInput) {
      languageInput.disabled = disabled;
    }
    if (fastExportToggle) {
      fastExportToggle.disabled = disabled;
    }
    if (gifSpeedMultiplierInput) {
      gifSpeedMultiplierInput.disabled = disabled;
    }
    textarea.readOnly = disabled;
  };

  const renderGif = (gif, { onProgress } = {}) => new Promise((resolve, reject) => {
    gif.on('progress', (progress) => {
      if (typeof onProgress === 'function') {
        const safeProgress = Number.isFinite(progress) ? progress : 0;
        onProgress(Math.max(0, Math.min(1, safeProgress)));
      }
    });
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
      setExportProgress(0, 'Preparing');

      const { content: exportContent, pauses: waitPauses } = prepareContentForExport(content);
      const renderer = createCanvasRenderer();
      const fastMode = Boolean(fastExportToggle && fastExportToggle.checked);
      const baseTypedSpeed = Math.max(1, Number(speedSlider.value));
      const gifSpeedMultiplier = applyGifSpeedMultiplier(gifSpeedMultiplierInput ? gifSpeedMultiplierInput.value : 1);
      const typedSpeed = Math.max(1, Math.round(baseTypedSpeed / Math.max(gifSpeedMultiplier, MIN_GIF_SPEED_MULTIPLIER)));
      const maxFrameCap = Math.max(2, fastMode ? Math.floor(STAGE_THEME.maxFrames * 0.55) : STAGE_THEME.maxFrames);
      // Debugging info: expose chosen speeds so we can verify math in the wild.
      console.debug('GIF export timing:', {
        baseTypedSpeed,
        gifSpeedMultiplier,
        typedSpeed,
        maxFrameCap,
        fastMode,
      });
      const qualitySetting = fastMode ? 20 : 10;
      const frameDelays = [];

      const cumulativeTypingTimeline = [];
      let timelineElapsed = 0;
      let timelinePauseCursor = 0;
      for (let visibleChars = 1; visibleChars <= exportContent.length; visibleChars += 1) {
        timelineElapsed += typedSpeed;
        while (timelinePauseCursor < waitPauses.length && waitPauses[timelinePauseCursor].index <= visibleChars) {
          timelineElapsed += waitPauses[timelinePauseCursor].duration;
          timelinePauseCursor += 1;
        }
        cumulativeTypingTimeline.push(timelineElapsed);
      }

      const totalTypingMs = cumulativeTypingTimeline.length
        ? cumulativeTypingTimeline[cumulativeTypingTimeline.length - 1]
        : 0;

      const maxTypingFrames = Math.max(0, maxFrameCap - 1);
      const gifTickMs = 10;
      const adaptiveSampleMs = totalTypingMs > 0 && maxTypingFrames > 0
        ? Math.max(gifTickMs, Math.ceil(totalTypingMs / maxTypingFrames / gifTickMs) * gifTickMs)
        : gifTickMs;
      const estimatedTypingFrames = totalTypingMs > 0
        ? Math.max(1, Math.min(maxTypingFrames, Math.ceil(totalTypingMs / adaptiveSampleMs)))
        : 0;
      const estimatedFrames = Math.min(maxFrameCap, estimatedTypingFrames + 1);

      const charsForElapsed = (elapsedMs) => {
        if (!cumulativeTypingTimeline.length) {
          return 0;
        }
        let low = 0;
        let high = cumulativeTypingTimeline.length - 1;
        while (low < high) {
          const mid = Math.floor((low + high) / 2);
          if (cumulativeTypingTimeline[mid] >= elapsedMs) {
            high = mid;
          } else {
            low = mid + 1;
          }
        }
        return Math.max(1, low + 1);
      };

      let processedFrames = 0;
      let gif = null;
      const workerScript = await getWorkerScriptURL();
      let lastRenderedChars = 0;

      for (let frameIndex = 0; frameIndex < estimatedTypingFrames && processedFrames < maxTypingFrames; frameIndex += 1) {
        const frameStartMs = frameIndex * adaptiveSampleMs;
        const frameEndTargetMs = Math.min(totalTypingMs, frameStartMs + adaptiveSampleMs);
        const visibleChars = charsForElapsed(Math.max(1, frameEndTargetMs));
        const slice = exportContent.slice(0, visibleChars);
        const html = highlightCode(slice) || '';
        const isFinalChunk = visibleChars >= exportContent.length;
        const canvas = renderCanvasFrame(renderer, html, { showCursor: !isFinalChunk });
        lastRenderedChars = visibleChars;

        const totalDelay = Math.max(gifTickMs, Math.round(frameEndTargetMs - frameStartMs));
        frameDelays.push(totalDelay);

        if (!gif) {
          gif = new GIF({
            workerScript,
            workers: 4,
            quality: qualitySetting,
            width: canvas.width,
            height: canvas.height,
          });
        }

        // Add one GIF frame per visual state and quantize delay to GIF ticks
        // (centiseconds). This avoids duplicate hold-frames that can look choppy.
        try {
          const totalDelay = Math.max(gifTickMs, Math.round(frameEndTargetMs - frameStartMs));
          const gifDelayCs = Math.max(1, Math.round(totalDelay / 10));
          gif.addFrame(canvas, { delay: gifDelayCs, copy: true });
            // Debug: log first few frames to verify computed delays
            if (processedFrames < 6) {
              console.debug('export frame', processedFrames + 1, {
                visibleChars,
                totalDelay,
                gifDelayCs,
                adaptiveSampleMs,
              });
            }
        } catch (e) {
          // Fallback: add a single frame with typingDelay if splitting fails.
          try {
            const fallbackDelayCs = Math.max(1, Math.round(Math.max(gifTickMs, totalDelay) / 10));
            gif.addFrame(canvas, { delay: fallbackDelayCs, copy: true });
          } catch (err) {
            // Swallow - we don't want the exporter to crash for a single frame error.
          }
        }

        processedFrames += 1;

        if (estimatedFrames > 0 && processedFrames % 5 === 0) {
          const percent = Math.min(100, Math.round((processedFrames / estimatedFrames) * 100));
          setStatus(`Rendering ${label}… ${percent}% (${processedFrames}/${estimatedFrames})`);
        }

        if (estimatedFrames > 0) {
          const prepProgress = Math.min(70, Math.round((processedFrames / estimatedFrames) * 70));
          setExportProgress(prepProgress, 'Preparing');
        }

        if (processedFrames % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

      }

      if (processedFrames < maxFrameCap) {
        const finalHtml = highlightCode(exportContent) || '';
        const finalCanvas = renderCanvasFrame(renderer, finalHtml, { showCursor: false });
        const MIN_FINAL_DELAY = fastMode ? 500 : 800;
        const MAX_FINAL_DELAY = fastMode ? 2500 : 4000;
        const averageDelay = frameDelays.length
          ? frameDelays.reduce((sum, value) => sum + value, 0) / frameDelays.length
          : typedSpeed;
        const remainingPause = waitPauses
          .filter((pause) => pause.index > lastRenderedChars)
          .reduce((sum, pause) => sum + pause.duration, 0);
        const finalDelay = Math.max(
          MIN_FINAL_DELAY,
          Math.min(
            MAX_FINAL_DELAY,
            Math.max(
              typedSpeed * (fastMode ? 5 : 8),
              Math.round(averageDelay * (fastMode ? 1.4 : 2)) + remainingPause,
            ),
          ),
        );
        if (!gif) {
          gif = new GIF({
            workerScript,
            workers: 4,
            quality: qualitySetting,
            width: finalCanvas.width,
            height: finalCanvas.height,
          });
        }
        try {
          const totalFinal = Math.max(1, Math.round(finalDelay));
          const finalDelayCs = Math.max(1, Math.round(totalFinal / 10));
          gif.addFrame(finalCanvas, { delay: finalDelayCs, copy: true });
          processedFrames += 1;
          frameDelays.push(finalDelay);
        } catch (e) {
          try {
            const finalFallbackDelayCs = Math.max(1, Math.round(Math.max(1, finalDelay) / 10));
            gif.addFrame(finalCanvas, { delay: finalFallbackDelayCs, copy: true });
            processedFrames += 1;
            frameDelays.push(finalDelay);
          } catch (err) {
            // swallow
          }
        }
      }

      if (!gif) {
        setStatus('Nothing to export.');
        return;
      }

      setStatus(`Finalizing ${label}…`);
      const totalMs = frameDelays.reduce((s, v) => s + v, 0);
      const totalGifCs = Math.round(totalMs / 10);
      console.debug('export summary', { processedFrames, estimatedFrames, frameDelaysLength: frameDelays.length, totalMs, totalGifCs });
      setExportProgress(72, 'Encoding');

      const blob = await renderGif(gif, {
        onProgress: (progressRatio) => {
          const encodingProgress = 72 + Math.round(progressRatio * 28);
          setExportProgress(Math.min(100, encodingProgress), 'Encoding');
        },
      });
      const url = URL.createObjectURL(blob);

      setExportProgress(100, 'Done');

    frameDelays.length = 0;

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
      resetExportProgress();
    }
  };

  if (runButton) {
    runButton.addEventListener('click', () => {
      destroyTyped();
      lineNumberOffset = 0;
      bufferTarget.textContent = '';
      applyHighlight();
      setStatus('');
      startTyping();
    });
  }

  if (settingsButton) {
    settingsButton.addEventListener('click', () => {
      setSettingsPaneVisible(!settingsPaneVisible);
    });
  }

  clearButton.addEventListener('click', () => {
    textarea.value = '';
    destroyTyped();
    lineNumberOffset = 0;
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

  if (fontSelect) {
    fontSelect.addEventListener('change', (event) => {
      const nextKey = event.target.value;
      if (!nextKey || nextKey === activeFontKey) {
        return;
      }
      activeFontKey = nextKey;
      applyActiveFontFamily();
    });
  }

  const isCheckboxToggle = lineNumberToggle && lineNumberToggle.tagName === 'INPUT' && lineNumberToggle.type === 'checkbox';

  const readLineNumberToggleState = () => {
    if (!lineNumberToggle) {
      return showLineNumbers;
    }

    if (isCheckboxToggle) {
      return Boolean(lineNumberToggle.checked);
    }

    if (lineNumberToggle.hasAttribute('aria-pressed')) {
      return lineNumberToggle.getAttribute('aria-pressed') === 'true';
    }

    return lineNumberToggle.classList.contains('bg-primary');
  };

  const applyLineNumberState = (enabled, { rerender = true } = {}) => {
    showLineNumbers = Boolean(enabled);
    if (codeFrame) {
      codeFrame.classList.toggle('line-numbers-enabled', showLineNumbers);
    }

    if (lineNumberToggle && !isCheckboxToggle) {
      lineNumberToggle.setAttribute('aria-pressed', showLineNumbers ? 'true' : 'false');
      lineNumberToggle.classList.toggle('bg-primary', showLineNumbers);
      lineNumberToggle.classList.toggle('bg-slate-600', !showLineNumbers);
    }

    if (rerender) {
      applyHighlight();
    }
  };

  if (lineNumberToggle && codeFrame) {
    if (isCheckboxToggle) {
      lineNumberToggle.addEventListener('change', (event) => {
        applyLineNumberState(Boolean(event.target.checked));
      });
    } else {
      lineNumberToggle.addEventListener('click', () => {
        applyLineNumberState(!showLineNumbers);
      });
    }
  }

  if (languageInput) {
    languageInput.addEventListener('change', (event) => {
      setManualLanguage(event.target.value);
    });
    languageInput.addEventListener('blur', () => {
      setManualLanguage(languageInput.value);
    });
    languageInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        setManualLanguage(languageInput.value);
        languageInput.blur();
      }
    });
  }

  if (gifSpeedMultiplierInput) {
    gifSpeedMultiplierInput.addEventListener('change', (event) => {
      applyGifSpeedMultiplier(event.target.value);
    });
    gifSpeedMultiplierInput.addEventListener('blur', () => {
      applyGifSpeedMultiplier(gifSpeedMultiplierInput.value);
    });
    gifSpeedMultiplierInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        applyGifSpeedMultiplier(gifSpeedMultiplierInput.value);
        gifSpeedMultiplierInput.blur();
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

  if (lineNumberToggle && codeFrame) {
    applyLineNumberState(true, { rerender: false });
  } else if (codeFrame) {
    codeFrame.classList.toggle('line-numbers-enabled', showLineNumbers);
  }

  if (playbackTitle) {
    playbackTitle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        playbackTitle.blur();
      }
    });

    playbackTitle.addEventListener('blur', () => {
      playbackTitle.textContent = playbackTitle.textContent.replace(/[\r\n]+/g, ' ').trim() || 'code.js — bash';
    });
  }

  if (settingsPane) {
    const initialWidth = Math.round(settingsPane.getBoundingClientRect().width);
    if (initialWidth > 40) {
      settingsPaneLastWidth = initialWidth;
      settingsPaneVisible = true;
    }
    setSettingsPaneVisible(settingsPaneVisible);
  }

  if (languageInput) {
    setManualLanguage(languageInput.value);
  }

  if (gifSpeedMultiplierInput) {
    applyGifSpeedMultiplier(gifSpeedMultiplierInput.value);
  }

  setTimeDisplay(0, 0);

  textarea.value = demoSnippet;
  
  // Trigger initial highlighting update
  console.log('Calling updateHighlighting from initialization');
  setTimeout(() => {
    updateHighlighting();
  }, 200);
  
  updateSpeedLabel();
  if (fontSelect && fontSelect.value) {
    activeFontKey = fontSelect.value;
  }
  setActiveTheme(activeThemeKey);
  applyActiveFontFamily({ rerender: false });
  startTyping();

  if (lineNumberToggle && codeFrame) {
    applyLineNumberState(true, { rerender: true });
  }

  // Panel Resize Functionality
  setupPanelResize();
})();

function setupPanelResize() {
  const editorPane = document.getElementById('editor-pane');
  const playbackPane = document.getElementById('playback-pane');
  const settingsPane = document.getElementById('settings-pane');
  const resizeHandleEditor = document.getElementById('resize-handle-editor');
  const resizeHandleSettings = document.getElementById('resize-handle-settings');

  if (!editorPane || !playbackPane || !settingsPane || !resizeHandleEditor || !resizeHandleSettings) {
    return;
  }

  let isResizing = false;
  let currentHandle = null;
  let startX = 0;
  let startWidthLeft = 0;
  let startWidthRight = 0;

  function startResize(handle, e) {
    isResizing = true;
    currentHandle = handle;
    startX = e.clientX;
    
    if (handle === 'editor') {
      startWidthLeft = editorPane.offsetWidth;
      startWidthRight = playbackPane.offsetWidth;
    } else if (handle === 'settings') {
      startWidthLeft = playbackPane.offsetWidth;
      startWidthRight = settingsPane.offsetWidth;
    }
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    e.preventDefault();
  }

  function doResize(e) {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startX;
    
    if (currentHandle === 'editor') {
      const newWidthLeft = startWidthLeft + deltaX;
      const newWidthRight = startWidthRight - deltaX;
      
      if (newWidthLeft >= 300 && newWidthRight >= 400) {
        editorPane.style.width = `${newWidthLeft}px`;
        editorPane.style.flex = 'none';
        playbackPane.style.flex = '1';
      }
    } else if (currentHandle === 'settings') {
      const newWidthRight = startWidthRight - deltaX;
      
      if (newWidthRight >= 200 && newWidthRight <= 600) {
        settingsPane.style.width = `${newWidthRight}px`;
      }
    }
  }

  function stopResize() {
    isResizing = false;
    currentHandle = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  if (resizeHandleEditor) {
    resizeHandleEditor.addEventListener('mousedown', (e) => startResize('editor', e));
  }

  if (resizeHandleSettings) {
    resizeHandleSettings.addEventListener('mousedown', (e) => startResize('settings', e));
  }

  window.addEventListener('mousemove', doResize);
  window.addEventListener('mouseup', stopResize);
}
