// textMuted задан только у готовых палитр; для своей он вычисляется из text/bg.
// Цвета текста на кнопке и на акценте не храним — они считаются по контрасту.
export const PALETTES = {
  'night-shift': {
    name: 'Ночная смена', bg: '#15171c', text: '#ffffff', textMuted: '#a0a5b1', accent: '#237bff', surface: '#1e222a', border: '#2f3542', btnBg: '#237bff'
  },
  'tactical-warm': {
    name: 'Тактический тёплый', bg: '#0a0d12', text: '#e0e0e0', textMuted: '#8b92a0', accent: '#ffb300', surface: '#14181f', border: '#2a2e38', btnBg: '#ffb300'
  },
  'high-contrast': {
    name: 'Контрастный', bg: '#f5f5f5', text: '#15171c', textMuted: '#6b7280', accent: '#ff4081', surface: '#ffffff', border: '#d1d5db', btnBg: '#ff4081'
  },
  'custom': {
    name: 'Своя палитра', bg: '#15171c', text: '#ffffff', accent: '#237bff', surface: '#1e222a', border: '#2f3542', btnBg: '#237bff'
  }
};

export const FONTS = {
  'inter': { name: 'Inter', family: "'Inter', sans-serif" },
  'ubuntu': { name: 'Ubuntu', family: "'Ubuntu', sans-serif" },
  'unbounded': { name: 'Unbounded', family: "'Unbounded', sans-serif" },
  'tektur': { name: 'Tektur', family: "'Tektur', sans-serif" },
  'onest': { name: 'Onest', family: "'Onest', sans-serif" }
};

export const initialState = {
  name: 'Тихий Рынок',
  slogan: 'Цени форму. Выбирай осознанно.',
  audience: 'Коллекционеры и игроки 18–30, уставшие от визуального шума',
  goal: 'Находить скины с уникальным дизайном в спокойной обстановке',
  character: 'Точный, Сдержанный, Надёжный',
  paletteId: 'night-shift',
  fontId: 'inter',
  fontSize: 24,
  fontWeight: 400,
  layoutId: 'minimal',
  previewText: 'Редкий скин — это не только про редкость.',
  bgImageUrl: '',
  customColors: {
    bg: '#15171c', text: '#ffffff', accent: '#237bff', surface: '#1e222a', border: '#2f3542', btnBg: '#237bff'
  }
};
