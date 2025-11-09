(() => {
  const textarea = document.getElementById('code-input');
  const runButton = document.getElementById('run');
  const clearButton = document.getElementById('clear');
  const speedSlider = document.getElementById('speed');
  const speedValue = document.getElementById('speed-value');
  const typedTarget = document.getElementById('typed-target');

  const demoSnippet = `// Code Typer demo
const greet = (name) => {
  const message = \`Welcome back, \${name}\`;
  console.log(message);
};

greet('Creator');`;

  let typedInstance = null;

  const updateSpeedLabel = () => {
    speedValue.textContent = `${speedSlider.value} ms`;
  };

  const destroyTyped = () => {
    if (typedInstance) {
      typedInstance.destroy();
      typedInstance = null;
    }
  };

  const startTyping = () => {
    const raw = textarea.value.replace(/\r\n/g, '\n');
    const content = raw.trim() ? raw : '// Paste code and hit Play Typing.';

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

  runButton.addEventListener('click', startTyping);

  clearButton.addEventListener('click', () => {
    textarea.value = '';
    destroyTyped();
    typedTarget.textContent = '';
    textarea.focus();
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

  textarea.value = demoSnippet;
  updateSpeedLabel();
  startTyping();
})();
