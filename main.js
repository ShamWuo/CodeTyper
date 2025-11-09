(() => {
  const textarea = document.getElementById('code-input');
  const runButton = document.getElementById('run');
  const clearButton = document.getElementById('clear');
  const exportButton = document.getElementById('export-gif');
  const speedSlider = document.getElementById('speed');
  const speedValue = document.getElementById('speed-value');
  const statusLabel = document.getElementById('export-status');
  const typedTarget = document.getElementById('typed-target');
  const codeStage = document.getElementById('code-stage');

  const PLACEHOLDER = '// Paste code and hit Play Typing.';
  const MAX_EXPORT_LENGTH = 1200;
  const GIF_WORKER = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js';

  const demoSnippet = `// Code Typer demo
const greet = (name) => {
  const message = \`Welcome back, \${name}\`;
  console.log(message);
};

greet('Creator');`;

  let typedInstance = null;
  let isExporting = false;

  const updateSpeedLabel = () => {
    speedValue.textContent = `${speedSlider.value} ms`;
  };

  const setStatus = (message = '') => {
    statusLabel.textContent = message;
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
  };

  const startTyping = () => {
    const content = getNormalizedContent();
    setStatus('');

    destroyTyped();
    typedTarget.textContent = '';

    typedInstance = new Typed('#typed-target', {
      strings: [content],
      typeSpeed: Number(speedSlider.value),
      backSpeed: 0,
      startDelay: 250,
      loop: false,
      smartBackspace: false,
      showCursor: true,
      cursorChar: '|',
      contentType: 'null',
    });
  };

  const toggleControls = (disabled) => {
    [runButton, clearButton, exportButton].forEach((button) => {
      button.disabled = disabled;
    });
    speedSlider.disabled = disabled;
    textarea.readOnly = disabled;
  };

  const waitForFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

  const createCaptureStage = (width) => {
    const capture = document.createElement('div');
    capture.className = 'code-stage capture-stage';
    capture.style.width = `${width}px`;

    const windowTop = codeStage.querySelector('.window-top');
    if (windowTop) {
      capture.appendChild(windowTop.cloneNode(true));
    }

    const frame = document.createElement('div');
    frame.className = 'code-frame';

    const pre = document.createElement('pre');
    pre.className = 'code-display';

    const code = document.createElement('code');
    code.className = 'code-content';
    pre.appendChild(code);
    frame.appendChild(pre);
    capture.appendChild(frame);

    document.body.appendChild(capture);

    return { capture, code };
  };

  const removeCaptureStage = (capture) => {
    if (capture && capture.parentNode) {
      capture.parentNode.removeChild(capture);
    }
  };

  const renderGif = (gif) => new Promise((resolve, reject) => {
    gif.on('finished', (blob) => resolve(blob));
    gif.on('abort', () => reject(new Error('GIF rendering aborted.')));
    gif.render();
  });

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportToGif = async (content) => {
    if (typeof html2canvas === 'undefined' || typeof GIF === 'undefined') {
      setStatus('Export helpers failed to load. Refresh and try again.');
      return;
    }

    let captureRef = null;

    try {
      isExporting = true;
      toggleControls(true);
      setStatus('Rendering GIF…');

      const stageRect = codeStage.getBoundingClientRect();
      const stageWidth = Math.max(1, Math.round(stageRect.width));

      const { capture, code } = createCaptureStage(stageWidth);
      captureRef = capture;

      await waitForFrame();
      code.textContent = content;
      await waitForFrame();

      const captureWidth = Math.max(1, Math.round(capture.offsetWidth));
      const captureHeight = Math.max(1, Math.round(capture.offsetHeight));
      capture.style.height = `${captureHeight}px`;
      code.textContent = '';

      const captureScale = 2;
      const frameDelay = Math.max(20, Number(speedSlider.value));
      const captureOptions = {
        backgroundColor: null,
        scale: captureScale,
        width: captureWidth,
        height: captureHeight,
      };

      const gif = new GIF({
        workerScript: GIF_WORKER,
        workers: 2,
        quality: 12,
        width: captureWidth * captureScale,
        height: captureHeight * captureScale,
        background: '#abb8c3',
      });

      let lastCanvas = null;
      const totalFrames = content.length + 1;

      for (let i = 0; i <= content.length; i += 1) {
        const slice = content.slice(0, i);
        const display = i === content.length ? slice : `${slice}|`;
        code.textContent = display;
        await waitForFrame();

        const canvas = await html2canvas(capture, captureOptions);
        gif.addFrame(canvas, { delay: frameDelay, copy: true });
        lastCanvas = canvas;

        if (totalFrames > 0 && i % 20 === 0) {
          const percent = Math.min(100, Math.round((i / totalFrames) * 100));
          setStatus(`Rendering GIF… ${percent}%`);
        }
      }

      if (lastCanvas) {
        gif.addFrame(lastCanvas, { delay: Math.max(1000, frameDelay * 6), copy: true });
      }

      setStatus('Finalizing GIF…');
      removeCaptureStage(capture);
      captureRef = null;

      const blob = await renderGif(gif);
      downloadBlob(blob, 'code-typing.gif');
      setStatus('GIF ready! Download should begin shortly.');
      setTimeout(() => setStatus(''), 4000);
    } catch (error) {
      console.error(error);
      setStatus('Sorry, something went wrong while exporting the GIF.');
    } finally {
      if (captureRef) {
        removeCaptureStage(captureRef);
      }
      toggleControls(false);
      textarea.readOnly = false;
      isExporting = false;
    }
  };

  runButton.addEventListener('click', startTyping);

  clearButton.addEventListener('click', () => {
    textarea.value = '';
    destroyTyped();
    typedTarget.textContent = '';
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
