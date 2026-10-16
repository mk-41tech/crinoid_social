/**
 * Crinoid Social — Configurable Pricing Configuration
 * Visual specification matching reference screenshots.
 * Note: Demo sample pricing — values are configurable and non-commercial.
 */

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  price: string;
  period: string;
  billingDetail: string;
  description?: string;
  ctaText: string;
  highlighted?: boolean;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'Free',
    period: 'forever',
    billingDetail: 'Connect up to 3 channels',
    ctaText: "Let's go →",
    highlighted: false,
    features: [
      '10 scheduled posts per channel – refill anytime',
      '100 Ideas',
      '1 user account',
      'AI Assistant',
      'Insights',
      'API access (1 API key, 3,000 requests/month)',
      'Community Inbox',
      'World-class customer support'
    ]
  },
  {
    id: 'essentials',
    name: 'Essentials',
    badge: 'Recommended',
    price: '$5',
    period: '/month',
    billingDetail: '1 channel · $60 billed yearly (save 2 months)',
    ctaText: 'Start 14-day free trial →',
    highlighted: true,
    features: [
      'Unlimited scheduled posts per channel',
      'Unlimited Ideas',
      '1 user account',
      'AI Assistant',
      'Advanced analytics',
      'API access (3 API keys, 7,500 requests/month)',
      'Community Inbox',
      'Hashtag manager',
      'First comment scheduling',
      'World-class customer support'
    ]
  },
  {
    id: 'team',
    name: 'Team',
    price: '$10',
    period: '/month',
    billingDetail: '1 channel · $120 billed yearly (save 2 months)',
    ctaText: 'Start 14-day free trial →',
    highlighted: false,
    features: [
      'Unlimited scheduled posts per channel',
      'Unlimited Ideas',
      'Unlimited team members',
      'AI Assistant',
      'Advanced analytics',
      'API access (5 API keys, 15,000 requests/month)',
      'Community Inbox',
      'Hashtag manager',
      'First comment scheduling',
      'Access levels & permissions',
      'Content approval workflows',
      'World-class customer support'
    ]
  }
];
