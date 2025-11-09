(() => {
  const textarea = document.getElementById('code-input');
  const runButton = document.getElementById('run');
  const clearButton = document.getElementById('clear');
  const exportButton = document.getElementById('export-gif');
  const speedSlider = document.getElementById('speed');
  const speedValue = document.getElementById('speed-value');
  const statusLabel = document.getElementById('export-status');
  const highlightTarget = document.getElementById('typed-target');
  const bufferTarget = document.getElementById('typed-buffer');

  const PLACEHOLDER = '// Paste code and hit Play Typing.';
  const MAX_EXPORT_LENGTH = 1200;
  const GIF_WORKER = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js';
  const PREFERRED_LANGUAGES = ['javascript', 'typescript', 'xml', 'html', 'json', 'css'];
  const STAGE_THEME = {
    width: 680,
    paddingX: 56,
    paddingY: 56,
    innerPadding: 34,
    topBarHeight: 24,
    frameRadius: 18,
    dotRadius: 6,
    dotSpacing: 18,
    dotOffset: 16,
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
    cursorColor: '#f46fd6',
    fontFamily: '"Hack", "Fira Code", "Source Code Pro", Consolas, monospace',
    fontSize: 14,
    lineHeight: 14 * 1.33,
    maxFrames: 140,
  };

  const highlightColorMap = {
    default: STAGE_THEME.textColor,
    'hljs-comment': STAGE_THEME.commentColor,
    'hljs-quote': STAGE_THEME.commentColor,
    'hljs-keyword': STAGE_THEME.keywordColor,
    'hljs-selector-tag': STAGE_THEME.keywordColor,
    'hljs-literal': STAGE_THEME.numberColor,
    'hljs-number': STAGE_THEME.numberColor,
    'hljs-variable': STAGE_THEME.numberColor,
    'hljs-params': STAGE_THEME.numberColor,
    'hljs-title': STAGE_THEME.textColor,
    'hljs-title.function_': STAGE_THEME.textColor,
    'hljs-title.class_': STAGE_THEME.textColor,
    'hljs-attr': STAGE_THEME.stringColor,
    'hljs-attribute': STAGE_THEME.stringColor,
    'hljs-string': STAGE_THEME.stringColor,
    'hljs-symbol': STAGE_THEME.propertyColor,
    'hljs-property': STAGE_THEME.propertyColor,
    'hljs-meta': STAGE_THEME.metaColor,
    'hljs-meta .hljs-keyword': STAGE_THEME.metaColor,
    'hljs-meta .hljs-string': STAGE_THEME.stringColor,
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
    const textLines = effectiveLines.map((fragments) => fragments.length ? fragments : [{ text: ' ', color: STAGE_THEME.textColor }]);

    const frameWidth = STAGE_THEME.width;
    const textStartX = STAGE_THEME.paddingX + STAGE_THEME.innerPadding;
    const textStartY = STAGE_THEME.paddingY + STAGE_THEME.topBarHeight + STAGE_THEME.innerPadding;
    const textAreaWidth = frameWidth - (STAGE_THEME.paddingX + STAGE_THEME.innerPadding) * 2;
    const totalTextHeight = textLines.length * STAGE_THEME.lineHeight;
    const frameHeight = STAGE_THEME.innerPadding * 2 + totalTextHeight;
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
    const dotsY = STAGE_THEME.paddingY + STAGE_THEME.topBarHeight / 2 + 2;
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

  let typedInstance = null;
  let isExporting = false;
  const observer = new MutationObserver(() => {
    applyHighlight();
  });

  const updateSpeedLabel = () => {
    speedValue.textContent = `${speedSlider.value} ms`;
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
      return 'xml';
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

  const highlightCode = (code) => {
    if (typeof hljs === 'undefined') {
      return escapeHtml(code);
    }

    if (!code.trim()) {
      return '';
    }

    try {
      const language = detectLanguage(code);
      if (language !== 'plaintext') {
        return hljs.highlight(code, { language }).value;
      }
      const { value } = hljs.highlightAuto(code, PREFERRED_LANGUAGES);
      return value;
    } catch (error) {
      console.warn('Highlighting failed, using escaped text.', error);
      return escapeHtml(code);
    }
  };

  const applyHighlight = () => {
    const text = bufferTarget ? bufferTarget.textContent : '';
    const highlighted = text ? highlightCode(text) : '';
    const needsCursor = typedInstance && !typedInstance.typingComplete;
    const cursorHtml = needsCursor ? '<span class="typed-cursor proxy">|</span>' : '';
    const fallback = text ? highlighted : '&nbsp;';
    highlightTarget.innerHTML = `${highlighted || fallback}${cursorHtml}`;
    if (highlightTarget.classList) {
      highlightTarget.classList.add('hljs');
    }
  };

  const startTyping = () => {
    const content = getNormalizedContent();
    setStatus('');

    destroyTyped();
    bufferTarget.textContent = '';
    applyHighlight();

    typedInstance = new Typed('#typed-buffer', {
      strings: [content],
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

    observer.disconnect();
    observer.observe(bufferTarget, {
      characterData: true,
      subtree: true,
      childList: true,
    });
  };

  const toggleControls = (disabled) => {
    [runButton, clearButton, exportButton].forEach((button) => {
      button.disabled = disabled;
    });
    speedSlider.disabled = disabled;
    textarea.readOnly = disabled;
  };

  const renderGif = (gif) => new Promise((resolve, reject) => {
    gif.on('finished', (blob) => resolve(blob));
    gif.on('abort', () => reject(new Error('GIF rendering aborted.')));
    gif.render();
  });

  const exportToGif = async (content) => {
    if (typeof GIF === 'undefined') {
      setStatus('GIF encoder failed to load. Refresh and try again.');
      return;
    }

    try {
      isExporting = true;
      toggleControls(true);
      setStatus('Rendering GIF…');

      const renderer = createCanvasRenderer();
      const frameDelay = Math.max(20, Number(speedSlider.value));
      const step = Math.max(1, Math.ceil(content.length / Math.max(1, STAGE_THEME.maxFrames - 1)));
      const estimatedFrames = Math.min(STAGE_THEME.maxFrames, Math.floor(content.length / step) + 1);

  let processedFrames = 0;
  let addedFinalFrame = false;
  let gif = null;

      for (let index = 0; index <= content.length; index += step) {
        const isLastStep = index + step >= content.length;
        const sliceIndex = isLastStep ? content.length : index;
        const slice = content.slice(0, sliceIndex);
        const html = highlightCode(slice) || '';
        const canvas = renderCanvasFrame(renderer, html, { showCursor: !isLastStep });
        const delay = isLastStep ? Math.max(1000, frameDelay * 8) : frameDelay;

        if (!gif) {
          gif = new GIF({
            workerScript: GIF_WORKER,
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
          setStatus(`Rendering GIF… ${percent}% (${processedFrames}/${estimatedFrames})`);
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
            workerScript: GIF_WORKER,
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

      setStatus('Finalizing GIF…');

      const blob = await renderGif(gif);
      const url = URL.createObjectURL(blob);

      const autoLink = document.createElement('a');
      autoLink.href = url;
      autoLink.download = 'code-typing.gif';
      document.body.appendChild(autoLink);
      autoLink.click();
      autoLink.remove();

      setStatus(
        `GIF ready! <a href="${url}" download="code-typing.gif">Click here if the download didn’t start.</a>`,
        { html: true },
      );

      setTimeout(() => {
        setStatus('');
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error(error);
      setStatus(`GIF export failed: ${error && error.message ? error.message : 'unknown error'}.`);
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

  speedSlider.addEventListener('input', () => {
    updateSpeedLabel();
    if (typedInstance) {
      startTyping();
    }
  });

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

  textarea.value = demoSnippet;
  updateSpeedLabel();
  startTyping();
})();
