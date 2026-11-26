import { FONTS } from './state.js';

// Inter подключён в index.html как шрифт по умолчанию, остальные грузим по требованию.
const loadedFonts = new Set(['inter']);

function ensureFont(fontId) {
  const font = FONTS[fontId];
  if (!font || loadedFonts.has(fontId)) return;
  loadedFonts.add(fontId);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font.name)}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

export function initTypography(els, state, render, persist) {
  els.fontSelect.innerHTML = '';
  for (const [id, f] of Object.entries(FONTS)) {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = f.name;
    els.fontSelect.appendChild(opt);
  }

  els.fontSelect.addEventListener('change', () => {
    state.fontId = els.fontSelect.value;
    render();
    persist();
  });

  els.fontSizeRange.addEventListener('input', () => {
    state.fontSize = Number(els.fontSizeRange.value);
    render();
    persist();
  });

  els.fontWeightSelect.addEventListener('change', () => {
    state.fontWeight = Number(els.fontWeightSelect.value);
    render();
    persist();
  });

  els.previewText.addEventListener('input', () => {
    state.previewText = els.previewText.value;
    render();
    persist();
  });
}

export function renderTypography(els, state) {
  const font = FONTS[state.fontId] || FONTS.inter;
  ensureFont(FONTS[state.fontId] ? state.fontId : 'inter');

  const root = document.documentElement.style;
  root.setProperty('--font-family', font.family);
  root.setProperty('--base-font-size', `${state.fontSize}px`);
  root.setProperty('--font-weight', String(state.fontWeight));

  els.fontSizeValue.textContent = `${state.fontSize}px`;
  els.typoPreview.textContent = state.previewText || 'Введите текст для пробы';

  return font;
}

export function syncTypographyInputs(els, state) {
  els.fontSelect.value = state.fontId;
  els.fontSizeRange.value = state.fontSize;
  els.fontWeightSelect.value = state.fontWeight;
  els.previewText.value = state.previewText || '';
}
