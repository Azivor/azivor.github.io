// Progressive enhancement: the prompt remains selectable without JavaScript.
for (const button of document.querySelectorAll('[data-copy-prompt]')) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const prompt = document.getElementById(button.dataset.copyPrompt);
    const status = button.closest('.exercise-prompt').querySelector('.copy-status');
    if (!prompt || button.disabled) return;
    button.disabled = true;
    try {
      await navigator.clipboard.writeText(prompt.textContent.trim());
      status.textContent = 'Copied. Replace the audience and idea before using it.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(prompt);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Copy is unavailable here. The prompt is selected; copy it manually.';
    } finally {
      button.disabled = false;
    }
  });
}
