// Simple analytics tracker helper to log user events
export interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  organization_id?: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

// In-memory queue (in production, use Segment, Mixpanel, or PostHog)
const analyticsQueue: AnalyticsEvent[] = [];

export async function trackEvent(event: AnalyticsEvent) {
  try {
    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };
    analyticsQueue.push(enrichedEvent);
    
    // Batch send every 10 events or on interval (placeholder)
    if (analyticsQueue.length >= 10) {
      await flushAnalytics();
    }
  } catch (err) {
    console.error('Analytics tracking error', err);
  }
}

export async function flushAnalytics() {
  try {
    if (analyticsQueue.length === 0) return;
    
    // TODO: Send to analytics provider (Segment, PostHog, etc.)
    console.log(`Flushing ${analyticsQueue.length} analytics events`);
    analyticsQueue.length = 0; // Clear queue
  } catch (err) {
    console.error('Analytics flush error', err);
  }
}

// Common events for MVP
export async function trackSignup(userId: string, organizationId: string) {
  await trackEvent({ event_name: 'signup', user_id: userId, organization_id: organizationId });
}

export async function trackOnboardingStart(organizationId: string) {
  await trackEvent({ event_name: 'onboarding_start', organization_id: organizationId });
}

export async function trackOnboardingComplete(organizationId: string) {
  await trackEvent({ event_name: 'onboarding_complete', organization_id: organizationId });
}

export async function trackCheckoutStart(organizationId: string, tier: string) {
  await trackEvent({ event_name: 'checkout_start', organization_id: organizationId, properties: { tier } });
}

export async function trackCheckoutComplete(organizationId: string, tier: string, amount: number) {
  await trackEvent({ event_name: 'checkout_complete', organization_id: organizationId, properties: { tier, amount } });
}

export async function trackFeatureUsage(organizationId: string, feature: string) {
  await trackEvent({ event_name: 'feature_usage', organization_id: organizationId, properties: { feature } });
}
