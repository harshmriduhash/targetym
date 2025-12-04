import { WebVitals } from 'web-vitals';

export const performanceConfig = {
  reportWebVitals: (metric: WebVitals) => {
    if (metric.label === 'web-vital') {
      console.log({
        name: metric.name,
        value: Math.round(metric.value),
        id: metric.id,
        delta: metric.delta,
        entries: metric.entries,
      });
      
      // Optional: Send metrics to analytics service
      // analyticsService.sendMetrics(metric);
    }
  },

  // Performance budget thresholds
  performanceBudget: {
    lcp: 2500,      // Largest Contentful Paint (ms)
    fid: 100,       // First Input Delay (ms)
    cls: 0.1,       // Cumulative Layout Shift
    ttfb: 600,      // Time to First Byte (ms)
  },

  // Lazy loading configuration
  lazyLoadingConfig: {
    threshold: 0.5, // Viewport intersection threshold
    rootMargin: '50px 0px', // Preload slightly before entering viewport
  },
};

export default performanceConfig;
