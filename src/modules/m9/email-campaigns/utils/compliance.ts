/**
 * Zyappy Email Marketing Compliance Utility
 * Enforces legal requirements (CAN-SPAM, GDPR) for email templates.
 */

export const MANDATORY_TAGS = ['{{unsubscribe_url}}', '{{business_address}}', '{{contact_email}}'] as const;

export const AVAILABLE_VARIABLES = [
    { key: '{{customer_name}}', label: 'Recipient Name' },
    { key: '{{store_name}}', label: 'Store Name' },
    { key: '{{brand_name}}', label: 'Brand Identity' },
    { key: '{{unsubscribe_url}}', label: 'Unsubscribe Link', required: true },
    { key: '{{business_address}}', label: 'Physical Address', required: true },
    { key: '{{contact_email}}', label: 'Support Email', required: true },
    { key: '{{contact_phone}}', label: 'Support Phone' },
];

export const COMPLIANCE_FOOTER = `
<div id="zyappy-compliance-footer" style="margin-top:40px;padding-top:24px;border-top:1px solid #e2e8f0;font-family:sans-serif;font-size:12px;color:#64748b;text-align:center;line-height:1.6;">
  <p>You received this email because you opted in at <strong>{{store_name}}</strong>.</p>
  <p>
    <a href="{{unsubscribe_url}}" style="color:#6366f1;text-decoration:underline;">Unsubscribe</a> 
    &nbsp;&bull;&nbsp; {{business_address}}
  </p>
  <p>Contact Us: {{contact_email}} &nbsp;&bull;&nbsp; {{contact_phone}}</p>
  <p style="margin-top:12px;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Powered by Zyappy Industries</p>
</div>`;

/**
 * Validates mandatory compliance tags in HTML
 */
export function validateCompliance(html: string): { valid: boolean; missing: string[] } {
    const missing = MANDATORY_TAGS.filter(tag => !html.includes(tag));
    return {
        valid: missing.length === 0,
        missing
    };
}

/**
 * Ensures HTML contains mandatory footer if missing
 */
export function getCompliantHtml(html: string): string {
    const { valid } = validateCompliance(html);
    if (valid) return html;
    
    // Auto-inject our standard footer
    return html + COMPLIANCE_FOOTER;
}

/**
 * Checks for unknown variables in the content
 */
export function getUnknownVariables(html: string): string[] {
    const variableRegex = /{{[a-zA-Z0-9_-]+}}/g;
    const found = html.match(variableRegex) || [];
    const known = AVAILABLE_VARIABLES.map(v => v.key);
    return Array.from(new Set(found)).filter(v => !known.includes(v));
}
