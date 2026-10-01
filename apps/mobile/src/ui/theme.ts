// High-contrast palette and large touch targets for use in the field (sunlight, one hand).
export const colors = {
  background: '#FFFFFF',
  text: '#111111',
  textMuted: '#4A4A4A',
  primary: '#0B5FFF',
  onPrimary: '#FFFFFF',
  danger: '#C62828',
  border: '#BDBDBD',
} as const;

export const sizes = {
  touchTarget: 56,
  fontBody: 18,
  fontTitle: 28,
  gutter: 16,
} as const;
