/**
 * Animation & Transition Constants
 * Synchronized with CSS custom properties in globals.css
 */

export const ANIMATION_DURATION = {
  fast: 150,      // --animation-duration-fast
  normal: 200,    // --animation-duration-normal
  slow: 300,      // --animation-duration-slow
  slower: 500,    // --animation-duration-slower
} as const;

export const ANIMATION_EASING = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',    // --animation-easing-ease-in-out
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',        // --animation-easing-ease-out
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',         // --animation-easing-ease-in
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // --animation-easing-spring
} as const;

/**
 * CSS class names for standardized animations
 */
export const ANIMATION_CLASSES = {
  // Transitions
  transitionFast: 'transition-fast',
  transitionNormal: 'transition-normal',
  transitionSlow: 'transition-slow',
  transitionSpring: 'transition-spring',

  // Fade animations
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',

  // Slide animations
  slideInFromTop: 'animate-slide-in-from-top',
  slideInFromBottom: 'animate-slide-in-from-bottom',
  slideInFromLeft: 'animate-slide-in-from-left',
  slideInFromRight: 'animate-slide-in-from-right',

  // Scale animations
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',

  // Hover effects
  hoverScale: 'hover-scale',
  hoverScaleSm: 'hover-scale-sm',
  hoverScaleLg: 'hover-scale-lg',
} as const;

/**
 * Helper function to get animation style object for Framer Motion
 */
export const getTransitionConfig = (
  duration: keyof typeof ANIMATION_DURATION = 'normal',
  easing: keyof typeof ANIMATION_EASING = 'easeInOut'
) => ({
  duration: ANIMATION_DURATION[duration] / 1000, // Convert to seconds for Framer Motion
  ease: ANIMATION_EASING[easing],
});

/**
 * Common Framer Motion variants
 */
export const MOTION_VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideInFromTop: {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  },
  slideInFromBottom: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  },
  slideInFromLeft: {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  },
  slideInFromRight: {
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
} as const;
