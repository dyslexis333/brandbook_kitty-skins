// Дизайн-токены брендбука в переносимом виде: то, что можно отдать разработчику.

export function buildTokens(state, palette, font) {
  return {
    name: state.name || '',
    slogan: state.slogan || '',
    brief: {
      audience: state.audience || '',
      goal: state.goal || '',
      character: state.character || ''
    },
    colors: {
      bg: palette.bg,
      text: palette.text,
      textMuted: palette.textMuted,
      accent: palette.accent,
      surface: palette.surface,
      border: palette.border,
      button: palette.btnBg
    },
    typography: {
      fontId: state.fontId,
      family: font.family,
      name: font.name,
      baseSizePx: state.fontSize,
      weight: state.fontWeight
    },
    layout: state.layoutId,
    exportedAt: new Date().toISOString()
  };
}

export function downloadTokens(tokens) {
  const slug = String(tokens.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'brandbook';

  const blob = new Blob([JSON.stringify(tokens, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug}-tokens.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
