export function initLayouts(els, state, render, persist) {
  // Печатные копии собираем только в момент печати.
  window.addEventListener('beforeprint', () => renderPrintModels(els));

  document.querySelectorAll('input[name="layout"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        state.layoutId = radio.value;
        render();
        persist();
      }
    });
  });

  if (els.bgImageInput) {
    // Сохраняем стейт при вводе (чтобы не потерять данные)
    els.bgImageInput.addEventListener('input', () => {
      state.bgImageUrl = els.bgImageInput.value;
      persist();
    });
    // А рендерим (применяем) картинку только когда пользователь закончил ввод
    els.bgImageInput.addEventListener('change', () => {
      render();
    });
  }

  els.btnPrint.addEventListener('click', () => window.print());
}

export function renderLayouts(els, state, palette, font) {
  const imageUrl = getSafeImageUrl(state.bgImageUrl);
  const hasBg = imageUrl !== '';
  const isBold = state.layoutId === 'bold';

  // Если выбран "Акцент", тонируем фоновую картинку в акцентный цвет.
  // Иначе используем стандартное затемнение (черный на 60%).
  const overlayColor = isBold ? `${palette.accent}cc` : 'rgba(0,0,0,0.6)';
  
  const bgStyle = hasBg
    ? `linear-gradient(${overlayColor}, ${overlayColor}), url("${imageUrl}")`
    : '';

  els.poster.style.backgroundImage = bgStyle;
  els.poster.className = `poster ${isBold ? 'layout-bold' : ''} ${hasBg ? 'has-bg-image' : ''}`;
  
  els.socialCard.style.backgroundImage = bgStyle;
  els.socialCard.className = `social-card ${isBold ? 'layout-bold' : ''} ${hasBg ? 'has-bg-image' : ''}`;

  els.poster.querySelector('.poster-name').textContent = state.name || 'Название';
  els.poster.querySelector('.poster-slogan').textContent = state.slogan || 'Слоган';
  els.poster.querySelector('.poster-character').textContent = state.character || 'Характер';

  els.socialCard.querySelector('.card-name').textContent = state.name || 'Название';
  els.socialCard.querySelector('.card-slogan').textContent = state.slogan || 'Слоган';
  els.socialCard.querySelector('.card-character').textContent = state.character || 'Характер';

  els.summaryName.textContent = state.name || '—';
  els.summarySlogan.textContent = state.slogan || '—';
  els.summaryAudience.textContent = state.audience || '—';
  els.summaryGoal.textContent = state.goal || '—';
  els.summaryCharacter.textContent = state.character || '—';
  els.summaryPalette.textContent = palette.name || 'Своя палитра';
  els.summaryFont.textContent = `${font.name}, ${state.fontSize}px, вес ${state.fontWeight}`;

  renderPaletteChips(els, palette);

  // Клонируем макеты один раз для запасного варианта; к моменту печати
  // они пересобираются заново по beforeprint, а не на каждый символ.
  if (!els.printModels.childElementCount) renderPrintModels(els);
}

export function syncLayoutsInputs(els, state) {
  document.querySelectorAll('input[name="layout"]').forEach((r) => {
    r.checked = r.value === state.layoutId;
  });
  if (els.bgImageInput) {
    els.bgImageInput.value = state.bgImageUrl || '';
  }
}

// Пропускаем только абсолютные http(s)-ссылки и экранируем для CSS-строки.
function getSafeImageUrl(raw) {
  const value = (raw || '').trim();
  if (!value) return '';

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return '';
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';

  return parsed.href.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

const PALETTE_ORDER = ['bg', 'text', 'accent', 'surface', 'border', 'btnBg'];
const PALETTE_LABELS = {
  bg: 'Фон',
  text: 'Текст',
  accent: 'Акцент',
  surface: 'Карточка',
  border: 'Рамка',
  btnBg: 'Кнопка'
};

// Цвета палитры с HEX-кодами — в печатном брендбуке без них нечего передать разработчику.
function renderPaletteChips(els, palette) {
  if (!els.paletteChips) return;
  els.paletteChips.textContent = '';

  for (const key of PALETTE_ORDER) {
    const value = palette[key];
    if (typeof value !== 'string' || !value) continue;

    const chip = document.createElement('div');
    chip.className = 'palette-chip';

    const swatch = document.createElement('div');
    swatch.className = 'palette-chip-swatch';
    swatch.style.backgroundColor = value;

    const label = document.createElement('div');
    label.className = 'palette-chip-label';

    const name = document.createElement('span');
    name.className = 'palette-chip-name';
    name.textContent = PALETTE_LABELS[key];

    const hex = document.createElement('span');
    hex.className = 'palette-chip-hex';
    hex.textContent = value.toUpperCase();

    label.append(name, hex);
    chip.append(swatch, label);
    els.paletteChips.append(chip);
  }
}

function renderPrintModels(els) {
  els.printModels.innerHTML = '';
  const posterClone = els.poster.cloneNode(true);
  const cardClone = els.socialCard.cloneNode(true);
  posterClone.removeAttribute('id');
  cardClone.removeAttribute('id');
  els.printModels.append(posterClone, cardClone);
}
