const SELECTORS = ['app-trip-summary-segment'];

function parseDate(rawDate) {
  if (!rawDate) return { year: null, month: null, day: null };
  const parsed = new Date(rawDate);
  if (isNaN(parsed)) return { year: null, month: null, day: null };
  return {
    year: parsed.getFullYear(),
    month: String(parsed.getMonth() + 1).padStart(2, '0'),
    day: String(parsed.getDate()).padStart(2, '0')
  };
}

function extractTrainNumber(segment) {
  const rawText = segment.querySelector('.trip-head')?.textContent || '';
  const match = rawText.match(/#(\d+)/);
  return match ? match[1] : null;
}

function showErrorTooltip(button, message) {
  // Remove old tooltip if any
  const existing = button.parentElement.querySelector('.via-error-tooltip');
  if (existing) existing.remove();

  const tooltip = document.createElement('div');
  tooltip.className = 'via-error-tooltip';
  tooltip.textContent = message;
  tooltip.style = `
    margin-top: 6px;
    padding: 6px 10px;
    background-color: #ff4d4f;
    color: white;
    font-size: 12px;
    border-radius: 4px;
    position: relative;
    width: fit-content;
    max-width: 300px;
  `;

  button.insertAdjacentElement('afterend', tooltip);
}

function injectButton(segment) {
  if (segment.querySelector('.via-custom-btn')) return;

  const button = document.createElement('button');
  button.className = 'via-custom-btn';
  button.textContent = 'View on TransitDocs';
  button.style = `
    margin-top: 10px;
    padding: 6px 0;
    background-color: #0072ce;
    width: 100%;
    color: white;
    border: none;
    cursor: pointer;
    font-weight: bold;
  `;

  button.onclick = () => {
    const rawDate = segment.querySelector('.trip-summary p.date')?.textContent?.trim().replace('|', '').trim();
    const { year, month, day } = parseDate(rawDate);
    const trainNumber = extractTrainNumber(segment);

    if (!year || !month || !day || !trainNumber) {
      showErrorTooltip(button, `Error: Missing data (year=${year}, month=${month}, day=${day}, train=${trainNumber})`);
      return;
    }

    const url = `https://asm.transitdocs.com/train/${year}/${month}/${day}/V/${trainNumber}`;
    window.open(url, '_blank');
  };

  const target = segment.querySelector('.trip-summary') || segment;
  target.appendChild(button);
}

// Observe dynamic content
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;
      SELECTORS.forEach(selector => {
        node.querySelectorAll?.(selector).forEach(injectButton);
        if (node.matches?.(selector)) injectButton(node);
      });
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial run
document.querySelectorAll(SELECTORS.join(',')).forEach(injectButton);
