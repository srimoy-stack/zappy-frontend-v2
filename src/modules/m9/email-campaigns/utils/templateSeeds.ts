import { EmailTemplate } from '../types/campaign.types';

/**
 * Development/demo seed data for email templates.
 * Covers all major template types so every dropdown and preview works.
 */
export const DEV_SEED_TEMPLATES: EmailTemplate[] = [
    {
        id: 'temp-001',
        name: 'Seasonal Promo – Spring 2026',
        subject: '🌸 Spring Collection is Here!',
        type: 'seasonal',
        htmlBody: `
<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
  <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:48px 32px;text-align:center;">
    <h1 style="color:#fff;font-size:28px;margin:0;">🌸 Spring Collection</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:16px;margin-top:8px;">Fresh styles have arrived</p>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#1e293b;font-size:20px;">Hello {{name}},</h2>
    <p style="color:#475569;line-height:1.6;">Our new Spring collection is now available. Be the first to discover the latest trends.</p>
    <a href="{{cta_url}}" style="display:inline-block;margin-top:16px;padding:14px 32px;background:#667eea;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Shop Now →</a>
  </div>
  <div style="padding:16px 32px;background:#f8fafc;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;">©2026 Zyappy. <a href="{{unsubscribe_url}}" style="color:#94a3b8;">Unsubscribe</a></p>
  </div>
</div>`,
        plainTextBody: 'Hello {{name}}, Our Spring Collection is here. Shop now: {{cta_url}}',
        createdAt: '2026-03-01T10:00:00Z',
        updatedAt: '2026-03-10T14:00:00Z',
    },
    {
        id: 'temp-002',
        name: 'Weekly Newsletter Template',
        subject: 'Weekly Digest: What\'s New',
        type: 'announcement',
        htmlBody: `
<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
  <div style="background:#1e293b;padding:32px;text-align:center;">
    <h1 style="color:#fff;font-size:24px;margin:0;">📰 Weekly Digest</h1>
    <p style="color:rgba(255,255,255,0.7);font-size:14px;margin-top:4px;">Issue #{{issue_number}}</p>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#1e293b;font-size:18px;">Hi {{name}},</h2>
    <p style="color:#475569;line-height:1.6;">Here's a roundup of what happened this week at Zyappy.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
    <h3 style="color:#334155;font-size:16px;">🔥 Top Stories</h3>
    <p style="color:#64748b;line-height:1.6;">{{story_1}}</p>
    <p style="color:#64748b;line-height:1.6;">{{story_2}}</p>
  </div>
  <div style="padding:16px 32px;background:#f8fafc;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;">©2026 Zyappy Editorial. <a href="{{unsubscribe_url}}" style="color:#94a3b8;">Unsubscribe</a></p>
  </div>
</div>`,
        plainTextBody: 'Hi {{name}}, Here\'s your weekly digest. {{story_1}} {{story_2}}',
        createdAt: '2026-01-15T08:00:00Z',
        updatedAt: '2026-04-15T10:00:00Z',
    },
    {
        id: 'temp-003',
        name: 'Abandoned Cart Recovery',
        subject: 'You left something behind 🛒',
        type: 'win-back',
        htmlBody: `
<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
  <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:40px 32px;text-align:center;">
    <h1 style="color:#fff;font-size:26px;margin:0;">🛒 Forgot Something?</h1>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#1e293b;font-size:18px;">Hey {{name}},</h2>
    <p style="color:#475569;line-height:1.6;">Your cart is waiting! Complete your purchase before items sell out.</p>
    <div style="background:#fef3c7;padding:16px;border-radius:8px;margin:20px 0;">
      <p style="color:#92400e;font-weight:bold;margin:0;">⏳ Items reserved for 24 hours</p>
    </div>
    <a href="{{cart_url}}" style="display:inline-block;margin-top:12px;padding:14px 32px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Complete Purchase →</a>
  </div>
  <div style="padding:16px 32px;background:#f8fafc;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;">©2026 Zyappy. <a href="{{unsubscribe_url}}" style="color:#94a3b8;">Unsubscribe</a></p>
  </div>
</div>`,
        plainTextBody: 'Hey {{name}}, your cart is waiting! Complete your purchase: {{cart_url}}',
        createdAt: '2026-02-10T12:00:00Z',
        updatedAt: '2026-04-01T09:00:00Z',
    },
    {
        id: 'temp-004',
        name: 'Flash Sale Blast',
        subject: '⚡ 24-Hour Flash Sale!',
        type: 'promotional',
        htmlBody: `
<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
  <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:48px 32px;text-align:center;">
    <h1 style="color:#fff;font-size:30px;margin:0;">⚡ FLASH SALE</h1>
    <p style="color:rgba(255,255,255,0.9);font-size:22px;margin-top:8px;font-weight:bold;">Up to {{discount}}% OFF</p>
    <p style="color:rgba(255,255,255,0.7);font-size:14px;margin-top:4px;">24 hours only!</p>
  </div>
  <div style="padding:32px;text-align:center;">
    <p style="color:#475569;line-height:1.6;font-size:16px;">Don't miss out on our biggest sale of the season.</p>
    <a href="{{sale_url}}" style="display:inline-block;margin-top:20px;padding:16px 40px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;">Shop the Sale →</a>
  </div>
  <div style="padding:16px 32px;background:#f8fafc;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;">©2026 Zyappy. <a href="{{unsubscribe_url}}" style="color:#94a3b8;">Unsubscribe</a></p>
  </div>
</div>`,
        plainTextBody: 'FLASH SALE – Up to {{discount}}% off, 24 hours only! Shop: {{sale_url}}',
        createdAt: '2026-04-05T06:00:00Z',
        updatedAt: '2026-04-16T11:00:00Z',
    },
    {
        id: 'temp-005',
        name: 'VIP Exclusive Offer',
        subject: 'Exclusive for You, {{name}}',
        type: 'vip-offer',
        htmlBody: `
<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
  <div style="padding:48px 32px;text-align:center;background:linear-gradient(135deg,#1e293b,#0f172a);">
    <p style="color:#fbbf24;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin:0;">Exclusive Membership</p>
    <h1 style="color:#fff;font-size:28px;margin:12px 0 0;">VIP Early Access</h1>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#e2e8f0;font-size:18px;">Dear {{name}},</h2>
    <p style="color:#94a3b8;line-height:1.6;">As a valued VIP member, you get first access to our newest collections and exclusive members-only pricing.</p>
    <a href="{{vip_url}}" style="display:inline-block;margin-top:20px;padding:14px 32px;background:#fbbf24;color:#1e293b;text-decoration:none;border-radius:8px;font-weight:bold;">Access VIP Store →</a>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #334155;text-align:center;">
    <p style="color:#64748b;font-size:12px;">©2026 Zyappy VIP. <a href="{{unsubscribe_url}}" style="color:#64748b;">Unsubscribe</a></p>
  </div>
</div>`,
        plainTextBody: 'Dear {{name}}, As a VIP member, you get exclusive early access. Shop: {{vip_url}}',
        createdAt: '2026-03-15T09:00:00Z',
        updatedAt: '2026-04-12T16:00:00Z',
    },
    {
        id: 'temp-006',
        name: 'Review Request',
        subject: 'How was your purchase, {{name}}?',
        type: 'review-request',
        htmlBody: `
<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
  <div style="background:#f0fdf4;padding:32px;text-align:center;">
    <h1 style="color:#166534;font-size:24px;margin:0;">⭐ We'd Love Your Feedback</h1>
  </div>
  <div style="padding:32px;">
    <p style="color:#475569;line-height:1.6;">Hi {{name}}, we hope you're enjoying your recent purchase. Your feedback helps us improve!</p>
    <a href="{{review_url}}" style="display:inline-block;margin-top:16px;padding:14px 32px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Leave a Review →</a>
  </div>
  <div style="padding:16px 32px;background:#f8fafc;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;">©2026 Zyappy. <a href="{{unsubscribe_url}}" style="color:#94a3b8;">Unsubscribe</a></p>
  </div>
</div>`,
        plainTextBody: 'Hi {{name}}, How was your purchase? Leave a review: {{review_url}}',
        createdAt: '2026-03-20T10:00:00Z',
        updatedAt: '2026-04-10T08:00:00Z',
    },
];
