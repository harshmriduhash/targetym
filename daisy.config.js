/** @type {import('daisyui').Config} */
module.exports = {
  // Daisy UI Configuration for Coexistence with shadcn/ui

  // Themes - using custom theme based on existing variables
  themes: [
    {
      light: {
        "primary": "oklch(63% 0.237 25.331)",
        "secondary": "oklch(76% 0.233 130.85)",
        "accent": "oklch(0% 0 0)",
        "neutral": "oklch(50% 0.134 242.749)",
        "base-100": "oklch(97% 0.013 236.62)",
        "base-200": "oklch(95% 0.026 236.824)",
        "base-300": "oklch(90% 0.058 230.902)",
        "base-content": "oklch(39% 0.09 240.876)",
        "info": "oklch(58% 0.158 241.966)",
        "success": "oklch(64% 0.2 131.684)",
        "warning": "oklch(68% 0.162 75.834)",
        "error": "oklch(58% 0.253 17.585)",
      },
      dark: {
        "primary": "oklch(82% 0.111 230.318)",
        "secondary": "oklch(78% 0.115 274.713)",
        "accent": "oklch(84% 0.143 164.978)",
        "neutral": "oklch(21% 0.006 56.043)",
        "base-100": "oklch(14% 0.004 49.25)",
        "base-200": "oklch(21% 0.006 56.043)",
        "base-300": "oklch(26% 0.007 34.298)",
        "base-content": "oklch(97% 0.001 106.424)",
        "info": "oklch(62% 0.214 259.815)",
        "success": "oklch(76% 0.233 130.85)",
        "warning": "oklch(70% 0.213 47.604)",
        "error": "oklch(65% 0.241 354.308)",
      },
    },
  ],

  // Disable dark mode automatic switching (handled by next-themes)
  darkTheme: "dark",

  // Prefix for Daisy UI classes to avoid conflicts with shadcn/ui
  // You can use: className="daisy-btn" instead of "btn"
  prefix: "daisy-",

  // Enable logs for debugging
  logs: true,

  // Styled components to enable
  // Set to false to reduce bundle size if not using certain components
  styled: true,

  // Base styles for Daisy UI components
  base: true,

  // Utility classes
  utils: true,

  // RTL support
  rtl: false,
};
