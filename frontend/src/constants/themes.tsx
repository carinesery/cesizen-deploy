// Couleurs simples et directement utilisables
export const COLORS = {
  primary: '#06909A',         // Violet principal
  secondary: '#CCF0E8',       // Violet secondaire
  accent: '#8F86F7',          // Cyan/Teal
  text: '#364153',            // Texte sombre
  textLight: '#666666',       // Texte léger
  borderDiscret: '#DBEAFE', 
  aqua: '#CCF0E8',
  softViolet: '#F3E8FF',  // Violet clair linear gradient
  softAqua: '#F1FDFB',  // Bleu-vert linear gradient // était searchInput
  border: '#EEEEEE',          // Bordures
  background: '#FFFFFF', 
  backgroundVisible: '#E3E3FA',
  backgroundDelete: '#FBB9CC',
  backgroundExtraVisible: '#E50075',  // Fond
  desactivate: '#f1b950',
  activate:'#3498db',
  delete: '#FF1F57',
  success: '#43C0C3',         // Succès
  error: '#FF6B6B',           // Erreur
  warning: '#FED95D',         // Attention
  neutral: {
    white: '#FFFFFF',
    black: '#364153',
    gray: '#6A7282',
    darkGray: '#666666',
    borderGray: '#EEEEEE',
  },
  status: {
    success: '#41C0C3',
    error: '#FF6B6B',
    warning: '#FED95D',
    info: '#E2E7FF',
  },
};

// Palettes complètes si besoin de couleurs alternatives
export const PALETTES = {
  primary: {
    darkTeal: '#06909A',
    slateGray: '#6A7282',
    teal: '#06090A',
    purple: '#BE51FF',
    lightBlue: '#BE51FF',
    cyan: '#43C0C3',
  },
  pastel: {
    lightTeal: '#CCF0E8',
    lightCyan: '#CCFCE8',
    lightPink: '#F3E8FF',
    white: '#FFFFFF',
    lightGray: '#FFFFFF',
    lightCyan2: '#E1FFDB',
  },
  secondary: {
    pink: '#FCB1FC',
    purple: '#C29FE9',
    coral: '#FFB75',
    lightBlue: '#89C9EF',
    green: '#B8E083',
    yellow: '#FED95D',
  },
};

export const FONTS = {
  justSansRegular: 'JustSans-Regular',
  justSansBold: 'JustSans-ExBold',
};

/**
 * Typographie - fontWeight doit être un nombre ou 'bold'/'normal'
 */
export const TYPOGRAPHY = {
  titleApp: {
    fontSize: 32,
    fontFamily: 'Just Sans',
    fontWeight: '800' as any,
    color: COLORS.primary,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Nunito Sans',
    fontWeight: 'bold' as const,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Nunito Sans',
    fontWeight: 600 as any,
  },
  body: {
    fontSize: 16,
    fontFamily: 'Nunito Sans',
    fontWeight: 'normal' as const,
  },
  small: {
    fontSize: 14,
    fontFamily: 'Nunito Sans',
    fontWeight: 'normal' as const,
  },
  caption: {
    fontSize: 12,
    fontFamily: 'Nunito Sans',
    fontWeight: 'normal' as const,
  },
};

/**
 * Espacement
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Dimensions
 */
export const DIMENSIONS = {
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
  iconSize: {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },
};
