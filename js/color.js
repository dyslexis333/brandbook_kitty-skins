import { PALETTES } from './state.js';

export function initColor(els, state, render, persist) {
  els.paletteList.innerHTML = '';
  for (const [id, p] of Object.entries(PALETTES)) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'palette-card';
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', 'false');
    card.dataset.paletteId = id;

    const displayPalette = id === 'custom' ? state.customColors : p;

    // Собираем карточку через DOM, а не innerHTML: цвета приходят из состояния,
    // и доверять ему на уровне разметки нельзя, даже если сейчас оно валидируется.
    const swatches = document.createElement('div');
    swatches.className = 'palette-swatches';
    for (const color of [displayPalette.bg, displayPalette.text, displayPalette.accent]) {
      const swatch = document.createElement('span');
      swatch.className = 'swatch';
      swatch.style.background = color;
      swatches.appendChild(swatch);
    }

    const title = document.createElement('strong');
    title.textContent = p.name;

    card.append(swatches, title);
    card.addEventListener('click', () => {
      state.paletteId = id;
      render();
      persist();
    });
    els.paletteList.appendChild(card);
  }

  // Клавиатурная навигация по радиогруппе: стрелки, Home, End.
  const cards = [...els.paletteList.children];
  els.paletteList.addEventListener('keydown', (event) => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key) || cards.length === 0) return;

    const focused = cards.indexOf(document.activeElement);
    const selected = cards.findIndex((card) => card.dataset.paletteId === state.paletteId);
    const from = focused >= 0 ? focused : Math.max(selected, 0);

    let next = from;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = cards.length - 1;
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (from + 1) % cards.length;
    else next = (from - 1 + cards.length) % cards.length;

    event.preventDefault();
    cards[next].focus();
    cards[next].click(); // выбор следует за фокусом, как в нативном radio
  });

  ['bg', 'text', 'accent', 'surface', 'border', 'btnBg'].forEach(key => {
    const colorInput = document.getElementById(`color-${key}`);
    const hexInput = document.getElementById(`hex-${key}`);
    if (!colorInput || !hexInput) return;

    const updateColor = (val, source) => {
      if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
        let hex = val.toLowerCase();
        if (hex.length === 4) {
          hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        
        state.customColors[key] = hex;
        
        if (source === 'color') hexInput.value = hex.toUpperCase();
        if (source === 'hex') colorInput.value = hex;
        
        state.paletteId = 'custom';
        render();
        persist();
      }
    };

    colorInput.addEventListener('input', (e) => updateColor(e.target.value, 'color'));
    hexInput.addEventListener('input', (e) => {
      let val = e.target.value;
      if (val && !val.startsWith('#')) val = '#' + val;
      updateColor(val, 'hex');
    });
  });
}

export function renderColor(els, state) {
  const isCustom = state.paletteId === 'custom';
  const basePalette = PALETTES[state.paletteId] || PALETTES['night-shift'];
  const palette = isCustom ? { ...basePalette, ...state.customColors } : basePalette;

  const wasHidden = els.customPanel.hidden;
  if (els.customPanel) els.customPanel.hidden = !isCustom;
  if (wasHidden && isCustom) {
    // Панель только что открылась — уводим фокус в первый контрол.
    const firstInput = els.customPanel.querySelector('input');
    if (firstInput) firstInput.focus();
  }

  // Цвет текста считаем от того фона, на котором он реально лежит.
  const btnTextColor = bestTextColor(palette.btnBg);
  const accentTextColor = bestTextColor(palette.accent);
  // Для своей палитры приглушённый цвет выводим из основного, чтобы он всегда читался.
  const mutedColor = isCustom ? mutedFor(palette.text, palette.bg) : palette.textMuted;

  const root = document.documentElement.style;
  root.setProperty('--bg', palette.bg);
  root.setProperty('--text', palette.text);
  root.setProperty('--text-muted', mutedColor);
  root.setProperty('--accent', palette.accent);
  root.setProperty('--surface', palette.surface);
  root.setProperty('--border', palette.border);
  root.setProperty('--btn-bg', palette.btnBg);
  root.setProperty('--btn-text', btnTextColor);
  root.setProperty('--accent-text', accentTextColor);

  // Цвет ошибки подстраиваем под фон: на светлой теме нужен тёмный красный.
  const bgLuminance = relativeLuminance(hexToRgb(palette.bg) || DARK);
  root.setProperty('--danger', bgLuminance > 0.5 ? '#a3001f' : '#ff8090');

  renderContrastPanel(els, [
    { label: 'Текст на фоне', fg: palette.text, bg: palette.bg },
    { label: 'Приглушённый текст', fg: mutedColor, bg: palette.bg },
    { label: 'Текст на карточке', fg: palette.text, bg: palette.surface },
    { label: 'Текст на кнопке', fg: btnTextColor, bg: palette.btnBg },
    { label: 'Заголовок на акценте', fg: accentTextColor, bg: palette.accent, large: true }
  ]);

  const cards = [...document.querySelectorAll('.palette-card')];
  let hasActive = false;
  cards.forEach((card) => {
    const active = card.dataset.paletteId === state.paletteId;
    if (active) hasActive = true;
    card.setAttribute('aria-checked', String(active));
    card.tabIndex = active ? 0 : -1;

    if (card.dataset.paletteId === 'custom') {
      const swatches = card.querySelectorAll('.swatch');
      if (swatches.length >= 3) {
        swatches[0].style.background = state.customColors.bg;
        swatches[1].style.background = state.customColors.text;
        swatches[2].style.background = state.customColors.accent;
      }
      if (isCustom) {
        card.style.backgroundColor = state.customColors.surface;
        card.style.color = state.customColors.text;
        card.style.borderColor = state.customColors.accent;
      } else {
        card.style.backgroundColor = '';
        card.style.color = '';
        card.style.borderColor = '';
      }
    }
  });
  // Если выбранной палитры не нашлось, группа не должна остаться без tab-стопа.
  if (!hasActive && cards.length) cards[0].tabIndex = 0;

  return { ...palette, textMuted: mutedColor };
}

export function syncColorInputs(state) {
  ['bg', 'text', 'accent', 'surface', 'border', 'btnBg'].forEach(key => {
    const colorEl = document.getElementById(`color-${key}`);
    const hexEl = document.getElementById(`hex-${key}`);
    if (colorEl && hexEl) {
      colorEl.value = state.customColors[key];
      hexEl.value = state.customColors[key].toUpperCase();
    }
  });
}

const LIGHT = { r: 255, g: 255, b: 255 };
const DARK = { r: 0x15, g: 0x17, b: 0x1c };

// Показываем, какие пары «текст / фон» проходят WCAG, а какие нет.
function renderContrastPanel(els, pairs) {
  const list = els.contrastList;
  if (!list) return;
  list.textContent = '';

  for (const { label, fg, bg, large = false } of pairs) {
    const fgRgb = hexToRgb(fg);
    const bgRgb = hexToRgb(bg);
    if (!fgRgb || !bgRgb) continue;

    const ratio = contrastRatio(fgRgb, bgRgb);
    const required = large ? 3 : 4.5;
    const passes = ratio >= required;

    const row = document.createElement('li');
    row.className = 'contrast-row';

    const sample = document.createElement('span');
    sample.className = 'pair-sample';
    sample.setAttribute('aria-hidden', 'true');
    sample.style.backgroundColor = bg;
    sample.style.color = fg;
    sample.textContent = 'Aa';

    const name = document.createElement('span');
    name.className = 'pair-label';
    name.textContent = label;

    const value = document.createElement('span');
    value.className = 'pair-ratio';
    value.textContent = `${ratio.toFixed(2)}:1`;

    const badge = document.createElement('span');
    badge.className = 'pair-badge';
    if (!passes) {
      badge.classList.add('is-fail');
      badge.textContent = 'не проходит';
    } else if (ratio >= 7) {
      badge.textContent = 'AAA';
    } else if (large && ratio < 4.5) {
      badge.textContent = 'AA (крупный)';
    } else {
      badge.textContent = 'AA';
    }

    row.append(sample, name, value, badge);
    list.append(row);
  }
}

function hexToRgb(hex) {
  let value = String(hex || '').trim().replace('#', '');
  if (value.length === 3) value = value.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function channelLuminance(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }) {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// Белый текст остаётся брендовым видом, но если он совсем не читается
// (контраст < 3:1) — переключаемся на тёмный.
function bestTextColor(bgHex) {
  const bg = hexToRgb(bgHex) || DARK;
  return contrastRatio(bg, LIGHT) >= 3 ? '#ffffff' : '#15171c';
}

function mixHex(textHex, bgHex, weight) {
  const a = hexToRgb(textHex);
  const b = hexToRgb(bgHex);
  if (!a || !b) return textHex;
  const channel = (x, y) => Math.round(x * weight + y * (1 - weight));
  return '#' + [channel(a.r, b.r), channel(a.g, b.g), channel(a.b, b.b)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');
}

// Подбираем долю основного цвета, при которой приглушённый текст даёт контраст >= 4.5:1.
function mutedFor(textHex, bgHex) {
  const bg = hexToRgb(bgHex);
  if (!bg || !hexToRgb(textHex)) return textHex || '#a0a5b1';
  for (let weight = 0.5; weight < 1; weight += 0.1) {
    const candidate = mixHex(textHex, bgHex, weight);
    const rgb = hexToRgb(candidate);
    if (rgb && contrastRatio(rgb, bg) >= 4.5) return candidate;
  }
  return textHex;
}
