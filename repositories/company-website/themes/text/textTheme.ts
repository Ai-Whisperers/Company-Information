// ==========================================
// TEXT THEME CONFIGURATION
// ==========================================
// Uncomment ONE theme at a time to switch typography styles
// All themes include font families, sizes, weights, and spacing

// ==========================================
// PROFESSIONAL MODERN (DEFAULT - ACTIVE)
// ==========================================
export const textTheme = {
  name: "Professional Modern",
  
  // Font Families
  fonts: {
    heading: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    body: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
    accent: ['Inter', 'system-ui', 'sans-serif'] // For special elements
  },
  
  // Font Sizes (rem units)
  sizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem',  // 72px
    '8xl': '6rem',    // 96px
    '9xl': '8rem'     // 128px
  },
  
  // Font Weights
  weights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },
  
  // Line Heights
  lineHeights: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },
  
  // Component-specific styles
  components: {
    h1: {
      fontSize: '3.75rem', // 60px
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.025em'
    },
    h2: {
      fontSize: '3rem', // 48px
      fontWeight: '600',
      lineHeight: '1.25',
      letterSpacing: '-0.025em'
    },
    h3: {
      fontSize: '2.25rem', // 36px
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: 'normal'
    },
    h4: {
      fontSize: '1.875rem', // 30px
      fontWeight: '600',
      lineHeight: '1.375',
      letterSpacing: 'normal'
    },
    h5: {
      fontSize: '1.5rem', // 24px
      fontWeight: '500',
      lineHeight: '1.375',
      letterSpacing: 'normal'
    },
    h6: {
      fontSize: '1.25rem', // 20px
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: 'normal'
    },
    body: {
      fontSize: '1rem', // 16px
      fontWeight: '400',
      lineHeight: '1.625',
      letterSpacing: 'normal'
    },
    bodyLarge: {
      fontSize: '1.125rem', // 18px
      fontWeight: '400',
      lineHeight: '1.625',
      letterSpacing: 'normal'
    },
    bodySmall: {
      fontSize: '0.875rem', // 14px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: 'normal'
    },
    caption: {
      fontSize: '0.75rem', // 12px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: 'wide'
    },
    button: {
      fontSize: '1rem', // 16px
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: 'normal'
    },
    buttonLarge: {
      fontSize: '1.125rem', // 18px
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: 'normal'
    },
    buttonSmall: {
      fontSize: '0.875rem', // 14px
      fontWeight: '500',
      lineHeight: '1.5',
      letterSpacing: 'normal'
    }
  }
}

// ==========================================
// CREATIVE EXPRESSIVE (UNCOMMENT TO USE)
// ==========================================
// export const textTheme = {
//   name: "Creative Expressive",
  
//   // Font Families
//   fonts: {
//     heading: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
//     body: ['Open Sans', 'system-ui', '-apple-system', 'sans-serif'],
//     mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
//     accent: ['Playfair Display', 'Georgia', 'serif']
//   },
  
//   // Font Sizes (rem units)
//   sizes: {
//     xs: '0.75rem',
//     sm: '0.875rem',
//     base: '1rem',
//     lg: '1.125rem',
//     xl: '1.25rem',
//     '2xl': '1.5rem',
//     '3xl': '1.875rem',
//     '4xl': '2.25rem',
//     '5xl': '3rem',
//     '6xl': '3.75rem',
//     '7xl': '4.5rem',
//     '8xl': '6rem',
//     '9xl': '8rem'
//   },
  
//   // Font Weights
//   weights: {
//     thin: '100',
//     extralight: '200',
//     light: '300',
//     normal: '400',
//     medium: '500',
//     semibold: '600',
//     bold: '700',
//     extrabold: '800',
//     black: '900'
//   },
  
//   // Line Heights
//   lineHeights: {
//     none: '1',
//     tight: '1.2',
//     snug: '1.3',
//     normal: '1.5',
//     relaxed: '1.7',
//     loose: '2.2'
//   },
  
//   // Letter Spacing
//   letterSpacing: {
//     tighter: '-0.05em',
//     tight: '-0.025em',
//     normal: '0em',
//     wide: '0.05em',
//     wider: '0.1em',
//     widest: '0.15em'
//   },
  
//   // Component-specific styles
//   components: {
//     h1: {
//       fontSize: '4.5rem', // 72px
//       fontWeight: '800',
//       lineHeight: '1.1',
//       letterSpacing: '-0.05em'
//     },
//     h2: {
//       fontSize: '3.75rem', // 60px
//       fontWeight: '700',
//       lineHeight: '1.15',
//       letterSpacing: '-0.025em'
//     },
//     h3: {
//       fontSize: '3rem', // 48px
//       fontWeight: '700',
//       lineHeight: '1.2',
//       letterSpacing: 'normal'
//     },
//     h4: {
//       fontSize: '2.25rem', // 36px
//       fontWeight: '600',
//       lineHeight: '1.3',
//       letterSpacing: 'normal'
//     },
//     h5: {
//       fontSize: '1.875rem', // 30px
//       fontWeight: '600',
//       lineHeight: '1.3',
//       letterSpacing: 'normal'
//     },
//     h6: {
//       fontSize: '1.5rem', // 24px
//       fontWeight: '600',
//       lineHeight: '1.4',
//       letterSpacing: 'normal'
//     },
//     body: {
//       fontSize: '1.125rem', // 18px
//       fontWeight: '400',
//       lineHeight: '1.7',
//       letterSpacing: 'normal'
//     },
//     bodyLarge: {
//       fontSize: '1.25rem', // 20px
//       fontWeight: '400',
//       lineHeight: '1.7',
//       letterSpacing: 'normal'
//     },
//     bodySmall: {
//       fontSize: '1rem', // 16px
//       fontWeight: '400',
//       lineHeight: '1.6',
//       letterSpacing: 'normal'
//     },
//     caption: {
//       fontSize: '0.875rem', // 14px
//       fontWeight: '400',
//       lineHeight: '1.5',
//       letterSpacing: 'wide'
//     },
//     button: {
//       fontSize: '1rem', // 16px
//       fontWeight: '600',
//       lineHeight: '1.5',
//       letterSpacing: 'wide'
//     },
//     buttonLarge: {
//       fontSize: '1.125rem', // 18px
//       fontWeight: '600',
//       lineHeight: '1.5',
//       letterSpacing: 'wide'
//     },
//     buttonSmall: {
//       fontSize: '0.875rem', // 14px
//       fontWeight: '600',
//       lineHeight: '1.5',
//       letterSpacing: 'wide'
//     }
//   }
// }

// ==========================================
// EDITORIAL CLASSIC (UNCOMMENT TO USE)
// ==========================================
// export const textTheme = {
//   name: "Editorial Classic",
  
//   // Font Families
//   fonts: {
//     heading: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
//     body: ['Lora', 'Georgia', 'Times New Roman', 'serif'],
//     mono: ['JetBrains Mono', 'Courier New', 'monospace'],
//     accent: ['Montserrat', 'system-ui', 'sans-serif']
//   },
  
//   // Font Sizes (rem units)
//   sizes: {
//     xs: '0.75rem',
//     sm: '0.875rem',
//     base: '1rem',
//     lg: '1.125rem',
//     xl: '1.25rem',
//     '2xl': '1.5rem',
//     '3xl': '1.875rem',
//     '4xl': '2.25rem',
//     '5xl': '3rem',
//     '6xl': '3.75rem',
//     '7xl': '4.5rem',
//     '8xl': '6rem',
//     '9xl': '8rem'
//   },
  
//   // Font Weights
//   weights: {
//     thin: '100',
//     extralight: '200',
//     light: '300',
//     normal: '400',
//     medium: '500',
//     semibold: '600',
//     bold: '700',
//     extrabold: '800',
//     black: '900'
//   },
  
//   // Line Heights
//   lineHeights: {
//     none: '1',
//     tight: '1.3',
//     snug: '1.4',
//     normal: '1.6',
//     relaxed: '1.8',
//     loose: '2.2'
//   },
  
//   // Letter Spacing
//   letterSpacing: {
//     tighter: '-0.025em',
//     tight: '-0.0125em',
//     normal: '0em',
//     wide: '0.025em',
//     wider: '0.05em',
//     widest: '0.1em'
//   },
  
//   // Component-specific styles
//   components: {
//     h1: {
//       fontSize: '3.75rem', // 60px
//       fontWeight: '700',
//       lineHeight: '1.15',
//       letterSpacing: '-0.025em'
//     },
//     h2: {
//       fontSize: '3rem', // 48px
//       fontWeight: '600',
//       lineHeight: '1.2',
//       letterSpacing: '-0.0125em'
//     },
//     h3: {
//       fontSize: '2.25rem', // 36px
//       fontWeight: '600',
//       lineHeight: '1.3',
//       letterSpacing: 'normal'
//     },
//     h4: {
//       fontSize: '1.875rem', // 30px
//       fontWeight: '600',
//       lineHeight: '1.4',
//       letterSpacing: 'normal'
//     },
//     h5: {
//       fontSize: '1.5rem', // 24px
//       fontWeight: '500',
//       lineHeight: '1.4',
//       letterSpacing: 'normal'
//     },
//     h6: {
//       fontSize: '1.25rem', // 20px
//       fontWeight: '500',
//       lineHeight: '1.5',
//       letterSpacing: 'normal'
//     },
//     body: {
//       fontSize: '1.125rem', // 18px
//       fontWeight: '400',
//       lineHeight: '1.8',
//       letterSpacing: 'normal'
//     },
//     bodyLarge: {
//       fontSize: '1.25rem', // 20px
//       fontWeight: '400',
//       lineHeight: '1.8',
//       letterSpacing: 'normal'
//     },
//     bodySmall: {
//       fontSize: '1rem', // 16px
//       fontWeight: '400',
//       lineHeight: '1.7',
//       letterSpacing: 'normal'
//     },
//     caption: {
//       fontSize: '0.875rem', // 14px
//       fontWeight: '400',
//       lineHeight: '1.6',
//       letterSpacing: 'wide'
//     },
//     button: {
//       fontSize: '1rem', // 16px
//       fontWeight: '500',
//       lineHeight: '1.5',
//       letterSpacing: 'wide'
//     },
//     buttonLarge: {
//       fontSize: '1.125rem', // 18px
//       fontWeight: '500',
//       lineHeight: '1.5',
//       letterSpacing: 'wide'
//     },
//     buttonSmall: {
//       fontSize: '0.875rem', // 14px
//       fontWeight: '500',
//       lineHeight: '1.5',
//       letterSpacing: 'wide'
//     }
//   }
// }

// ==========================================
// TECH MINIMALIST (UNCOMMENT TO USE)
// ==========================================
// export const textTheme = {
//   name: "Tech Minimalist",
  
//   // Font Families
//   fonts: {
//     heading: ['JetBrains Mono', 'Fira Code', 'Monaco', 'monospace'],
//     body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
//     mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
//     accent: ['Space Grotesk', 'system-ui', 'sans-serif']
//   },
  
//   // Font Sizes (rem units)
//   sizes: {
//     xs: '0.75rem',
//     sm: '0.875rem',
//     base: '1rem',
//     lg: '1.125rem',
//     xl: '1.25rem',
//     '2xl': '1.5rem',
//     '3xl': '1.875rem',
//     '4xl': '2.25rem',
//     '5xl': '3rem',
//     '6xl': '3.75rem',
//     '7xl': '4.5rem',
//     '8xl': '6rem',
//     '9xl': '8rem'
//   },
  
//   // Font Weights
//   weights: {
//     thin: '100',
//     extralight: '200',
//     light: '300',
//     normal: '400',
//     medium: '500',
//     semibold: '600',
//     bold: '700',
//     extrabold: '800',
//     black: '900'
//   },
  
//   // Line Heights
//   lineHeights: {
//     none: '1',
//     tight: '1.25',
//     snug: '1.35',
//     normal: '1.5',
//     relaxed: '1.6',
//     loose: '1.8'
//   },
  
//   // Letter Spacing
//   letterSpacing: {
//     tighter: '-0.05em',
//     tight: '-0.025em',
//     normal: '0em',
//     wide: '0.05em',
//     wider: '0.1em',
//     widest: '0.2em'
//   },
  
//   // Component-specific styles
//   components: {
//     h1: {
//       fontSize: '3rem', // 48px
//       fontWeight: '700',
//       lineHeight: '1.25',
//       letterSpacing: '-0.025em'
//     },
//     h2: {
//       fontSize: '2.25rem', // 36px
//       fontWeight: '600',
//       lineHeight: '1.25',
//       letterSpacing: 'normal'
//     },
//     h3: {
//       fontSize: '1.875rem', // 30px
//       fontWeight: '600',
//       lineHeight: '1.35',
//       letterSpacing: 'normal'
//     },
//     h4: {
//       fontSize: '1.5rem', // 24px
//       fontWeight: '500',
//       lineHeight: '1.35',
//       letterSpacing: 'normal'
//     },
//     h5: {
//       fontSize: '1.25rem', // 20px
//       fontWeight: '500',
//       lineHeight: '1.5',
//       letterSpacing: 'normal'
//     },
//     h6: {
//       fontSize: '1.125rem', // 18px
//       fontWeight: '500',
//       lineHeight: '1.5',
//       letterSpacing: 'normal'
//     },
//     body: {
//       fontSize: '1rem', // 16px
//       fontWeight: '400',
//       lineHeight: '1.6',
//       letterSpacing: 'normal'
//     },
//     bodyLarge: {
//       fontSize: '1.125rem', // 18px
//       fontWeight: '400',
//       lineHeight: '1.6',
//       letterSpacing: 'normal'
//     },
//     bodySmall: {
//       fontSize: '0.875rem', // 14px
//       fontWeight: '400',
//       lineHeight: '1.5',
//       letterSpacing: 'normal'
//     },
//     caption: {
//       fontSize: '0.75rem', // 12px
//       fontWeight: '400',
//       lineHeight: '1.5',
//       letterSpacing: 'wider'
//     },
//     button: {
//       fontSize: '0.875rem', // 14px
//       fontWeight: '500',
//       lineHeight: '1.5',
//       letterSpacing: 'wider'
//     },
//     buttonLarge: {
//       fontSize: '1rem', // 16px
//       fontWeight: '500',
//       lineHeight: '1.5',
//       letterSpacing: 'wider'
//     },
//     buttonSmall: {
//       fontSize: '0.75rem', // 12px
//       fontWeight: '500',
//       lineHeight: '1.5',
//       letterSpacing: 'wider'
//     }
//   }
// }

// ==========================================
// FRIENDLY ROUNDED (UNCOMMENT TO USE)
// ==========================================
// export const textTheme = {
//   name: "Friendly Rounded",
  
//   // Font Families
//   fonts: {
//     heading: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
//     body: ['Nunito Sans', 'system-ui', '-apple-system', 'sans-serif'],
//     mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
//     accent: ['Nunito', 'system-ui', 'sans-serif']
//   },
  
//   // Font Sizes (rem units)
//   sizes: {
//     xs: '0.75rem',
//     sm: '0.875rem',
//     base: '1rem',
//     lg: '1.125rem',
//     xl: '1.25rem',
//     '2xl': '1.5rem',
//     '3xl': '1.875rem',
//     '4xl': '2.25rem',
//     '5xl': '3rem',
//     '6xl': '3.75rem',
//     '7xl': '4.5rem',
//     '8xl': '6rem',
//     '9xl': '8rem'
//   },
  
//   // Font Weights
//   weights: {
//     thin: '100',
//     extralight: '200',
//     light: '300',
//     normal: '400',
//     medium: '500',
//     semibold: '600',
//     bold: '700',
//     extrabold: '800',
//     black: '900'
//   },
  
//   // Line Heights
//   lineHeights: {
//     none: '1',
//     tight: '1.3',
//     snug: '1.4',
//     normal: '1.6',
//     relaxed: '1.75',
//     loose: '2'
//   },
  
//   // Letter Spacing
//   letterSpacing: {
//     tighter: '-0.025em',
//     tight: '-0.0125em',
//     normal: '0em',
//     wide: '0.025em',
//     wider: '0.05em',
//     widest: '0.1em'
//   },
  
//   // Component-specific styles
//   components: {
//     h1: {
//       fontSize: '3.75rem', // 60px
//       fontWeight: '800',
//       lineHeight: '1.2',
//       letterSpacing: '-0.025em'
//     },
//     h2: {
//       fontSize: '3rem', // 48px
//       fontWeight: '700',
//       lineHeight: '1.3',
//       letterSpacing: '-0.0125em'
//     },
//     h3: {
//       fontSize: '2.25rem', // 36px
//       fontWeight: '700',
//       lineHeight: '1.3',
//       letterSpacing: 'normal'
//     },
//     h4: {
//       fontSize: '1.875rem', // 30px
//       fontWeight: '600',
//       lineHeight: '1.4',
//       letterSpacing: 'normal'
//     },
//     h5: {
//       fontSize: '1.5rem', // 24px
//       fontWeight: '600',
//       lineHeight: '1.4',
//       letterSpacing: 'normal'
//     },
//     h6: {
//       fontSize: '1.25rem', // 20px
//       fontWeight: '600',
//       lineHeight: '1.5',
//       letterSpacing: 'normal'
//     },
//     body: {
//       fontSize: '1rem', // 16px
//       fontWeight: '400',
//       lineHeight: '1.75',
//       letterSpacing: 'normal'
//     },
//     bodyLarge: {
//       fontSize: '1.125rem', // 18px
//       fontWeight: '400',
//       lineHeight: '1.75',
//       letterSpacing: 'normal'
//     },
//     bodySmall: {
//       fontSize: '0.875rem', // 14px
//       fontWeight: '400',
//       lineHeight: '1.6',
//       letterSpacing: 'normal'
//     },
//     caption: {
//       fontSize: '0.75rem', // 12px
//       fontWeight: '400',
//       lineHeight: '1.5',
//       letterSpacing: 'wide'
//     },
//     button: {
//       fontSize: '1rem', // 16px
//       fontWeight: '600',
//       lineHeight: '1.5',
//       letterSpacing: 'normal'
//     },
//     buttonLarge: {
//       fontSize: '1.125rem', // 18px
//       fontWeight: '600',
//       lineHeight: '1.5',
//       letterSpacing: 'normal'
//     },
//     buttonSmall: {
//       fontSize: '0.875rem', // 14px
//       fontWeight: '600',
//       lineHeight: '1.5',
//       letterSpacing: 'normal'
//     }
//   }
// }

// Export component-specific font styles for easy reference
export const fontStyles = {
  // Headings
  h1: `font-family: ${textTheme.fonts.heading.join(', ')}; font-size: ${textTheme.components.h1.fontSize}; font-weight: ${textTheme.components.h1.fontWeight}; line-height: ${textTheme.components.h1.lineHeight}; letter-spacing: ${textTheme.components.h1.letterSpacing};`,
  h2: `font-family: ${textTheme.fonts.heading.join(', ')}; font-size: ${textTheme.components.h2.fontSize}; font-weight: ${textTheme.components.h2.fontWeight}; line-height: ${textTheme.components.h2.lineHeight}; letter-spacing: ${textTheme.components.h2.letterSpacing};`,
  h3: `font-family: ${textTheme.fonts.heading.join(', ')}; font-size: ${textTheme.components.h3.fontSize}; font-weight: ${textTheme.components.h3.fontWeight}; line-height: ${textTheme.components.h3.lineHeight}; letter-spacing: ${textTheme.components.h3.letterSpacing};`,
  h4: `font-family: ${textTheme.fonts.heading.join(', ')}; font-size: ${textTheme.components.h4.fontSize}; font-weight: ${textTheme.components.h4.fontWeight}; line-height: ${textTheme.components.h4.lineHeight}; letter-spacing: ${textTheme.components.h4.letterSpacing};`,
  h5: `font-family: ${textTheme.fonts.heading.join(', ')}; font-size: ${textTheme.components.h5.fontSize}; font-weight: ${textTheme.components.h5.fontWeight}; line-height: ${textTheme.components.h5.lineHeight}; letter-spacing: ${textTheme.components.h5.letterSpacing};`,
  h6: `font-family: ${textTheme.fonts.heading.join(', ')}; font-size: ${textTheme.components.h6.fontSize}; font-weight: ${textTheme.components.h6.fontWeight}; line-height: ${textTheme.components.h6.lineHeight}; letter-spacing: ${textTheme.components.h6.letterSpacing};`,
  
  // Body text
  body: `font-family: ${textTheme.fonts.body.join(', ')}; font-size: ${textTheme.components.body.fontSize}; font-weight: ${textTheme.components.body.fontWeight}; line-height: ${textTheme.components.body.lineHeight}; letter-spacing: ${textTheme.components.body.letterSpacing};`,
  bodyLarge: `font-family: ${textTheme.fonts.body.join(', ')}; font-size: ${textTheme.components.bodyLarge.fontSize}; font-weight: ${textTheme.components.bodyLarge.fontWeight}; line-height: ${textTheme.components.bodyLarge.lineHeight}; letter-spacing: ${textTheme.components.bodyLarge.letterSpacing};`,
  bodySmall: `font-family: ${textTheme.fonts.body.join(', ')}; font-size: ${textTheme.components.bodySmall.fontSize}; font-weight: ${textTheme.components.bodySmall.fontWeight}; line-height: ${textTheme.components.bodySmall.lineHeight}; letter-spacing: ${textTheme.components.bodySmall.letterSpacing};`,
  
  // Special elements
  caption: `font-family: ${textTheme.fonts.body.join(', ')}; font-size: ${textTheme.components.caption.fontSize}; font-weight: ${textTheme.components.caption.fontWeight}; line-height: ${textTheme.components.caption.lineHeight}; letter-spacing: ${textTheme.components.caption.letterSpacing};`,
  button: `font-family: ${textTheme.fonts.body.join(', ')}; font-size: ${textTheme.components.button.fontSize}; font-weight: ${textTheme.components.button.fontWeight}; line-height: ${textTheme.components.button.lineHeight}; letter-spacing: ${textTheme.components.button.letterSpacing};`,
  mono: `font-family: ${textTheme.fonts.mono.join(', ')};`
}