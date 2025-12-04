'use client';

import { memo } from 'react';
import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ANIMATION_CLASSES } from '@/lib/constants/animations';

type AnimationType =
  | 'fade-in'
  | 'fade-out'
  | 'slide-in-from-top'
  | 'slide-in-from-bottom'
  | 'slide-in-from-left'
  | 'slide-in-from-right'
  | 'scale-in'
  | 'scale-out'
  | 'none';

interface AnimatedContainerProps {
  children: ReactNode;
  animation?: AnimationType;
  className?: string;
  delay?: number;
  as?: ElementType;
}

/**
 * Wrapper component for standardized animations
 * Uses CSS animations defined in globals.css
 *
 * @example
 * <AnimatedContainer animation="slide-in-from-top" delay={100}>
 *   <Card>Content here</Card>
 * </AnimatedContainer>
 */
function AnimatedContainer({
  children,
  animation = 'none',
  className,
  delay = 0,
  as: Component = 'div',
}: AnimatedContainerProps) {
  const animationClassMap: Record<AnimationType, string | null> = {
    'fade-in': ANIMATION_CLASSES.fadeIn,
    'fade-out': ANIMATION_CLASSES.fadeOut,
    'slide-in-from-top': ANIMATION_CLASSES.slideInFromTop,
    'slide-in-from-bottom': ANIMATION_CLASSES.slideInFromBottom,
    'slide-in-from-left': ANIMATION_CLASSES.slideInFromLeft,
    'slide-in-from-right': ANIMATION_CLASSES.slideInFromRight,
    'scale-in': ANIMATION_CLASSES.scaleIn,
    'scale-out': ANIMATION_CLASSES.scaleOut,
    'none': null,
  };

  const animationClass = animationClassMap[animation];

  return (
    <Component
      className={cn(animationClass, className)}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}

export default memo(AnimatedContainer);
