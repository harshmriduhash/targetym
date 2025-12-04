// Email templates for welcome, billing, and retention
export const emailTemplates = {
  welcome: {
    subject: 'Welcome to Targetym!',
    html: `
      <h1>Welcome to Targetym</h1>
      <p>Hi {{user_name}},</p>
      <p>You're all set! Here's how to get the most out of Targetym:</p>
      <ul>
        <li>Set your first goal</li>
        <li>Invite your team</li>
        <li>Explore recruitment features</li>
      </ul>
      <a href="{{dashboard_url}}">Go to Dashboard</a>
    `,
  },
  billingReminder: {
    subject: 'Your Targetym Pro trial ends in 7 days',
    html: `
      <h1>Your trial ends soon</h1>
      <p>Hi {{user_name}},</p>
      <p>Your Pro trial ends in 7 days. Upgrade now to keep all features.</p>
      <a href="{{pricing_url}}">Upgrade to Pro</a>
    `,
  },
  churnRecovery: {
    subject: 'We miss you! Here's 50% off',
    html: `
      <h1>Come back to Targetym</h1>
      <p>Hi {{user_name}},</p>
      <p>We noticed you haven't used Targetym in a while. We're offering 50% off your first month to come back.</p>
      <a href="{{coupon_url}}">Claim Your Discount</a>
    `,
  },
  featureAnnouncement: {
    subject: 'New: AI-Powered CV Scoring',
    html: `
      <h1>New Feature!</h1>
      <p>Hi {{user_name}},</p>
      <p>We've added AI-powered CV scoring to help you find top candidates 10x faster.</p>
      <a href="{{feature_link}}">Learn More</a>
    `,
  },
};

export function renderTemplate(template: string, variables: Record<string, any>): string {
  let rendered = template;
  Object.entries(variables).forEach(([key, value]) => {
    rendered = rendered.replace(`{{${key}}}`, String(value || ''));
  });
  return rendered;
}
