/**
 * Settings Types (M9 – Marketing / Customer Engagement)
 *
 * Types for the configurable email compliance settings system.
 */

// ── Settings Keys ──────────────────────────────────────────────────────
export type SettingKey =
    | 'sender_name'
    | 'sender_email'
    | 'reply_to'
    | 'business_address'
    | 'contact_email'
    | 'contact_phone'
    | 'brand_name'
    | 'store_name'
    | 'unsubscribe_base_url'
    | 'force_unsubscribe_footer'
    | 'force_identification_footer'
    | 'block_unknown_consent'
    | 'complaint_threshold'
    | 'bounce_threshold';

// ── Settings Map ───────────────────────────────────────────────────────
export type EmailSettings = Record<string, string>;

// ── Setting Groups (for UI rendering) ──────────────────────────────────
export interface SettingGroup {
    id: string;
    title: string;
    description: string;
    icon: string;
    fields: SettingField[];
}

export interface SettingField {
    key: SettingKey;
    label: string;
    description: string;
    type: 'text' | 'email' | 'tel' | 'toggle' | 'number';
    required?: boolean;
    placeholder?: string;
}

// ── Pre-defined field groups for the Settings UI ───────────────────────
export const SETTING_GROUPS: SettingGroup[] = [
    {
        id: 'sender',
        title: 'Sender Identity',
        description: 'Configure how your emails appear to recipients',
        icon: '📧',
        fields: [
            { key: 'sender_name', label: 'Sender Name', description: 'Display name in the "From" field', type: 'text', required: true, placeholder: 'Your Brand' },
            { key: 'sender_email', label: 'Sender Email', description: 'Email address used for sending', type: 'email', required: true, placeholder: 'noreply@yourdomain.com' },
            { key: 'reply_to', label: 'Reply-To Address', description: 'Where replies will be directed', type: 'email', placeholder: 'support@yourdomain.com' },
        ],
    },
    {
        id: 'business',
        title: 'Business Information',
        description: 'Required by CASL/CAN-SPAM for every marketing email',
        icon: '🏢',
        fields: [
            { key: 'business_address', label: 'Business Address', description: 'Physical mailing address (required by law)', type: 'text', required: true, placeholder: '123 Main St, City, Country' },
            { key: 'contact_email', label: 'Contact Email', description: 'Public contact email shown in footer', type: 'email', required: true, placeholder: 'support@yourdomain.com' },
            { key: 'contact_phone', label: 'Contact Phone', description: 'Public phone number shown in footer', type: 'tel', placeholder: '+1-555-0100' },
            { key: 'brand_name', label: 'Brand Name', description: 'Brand name shown in email footer', type: 'text', required: true, placeholder: 'Your Brand' },
            { key: 'store_name', label: 'Store Name', description: 'Store name referenced in opt-in confirmation', type: 'text', placeholder: 'Your Store' },
            { key: 'unsubscribe_base_url', label: 'Unsubscribe Base URL', description: 'Custom domain for unsubscribe links (optional, defaults to APP_URL)', type: 'text', placeholder: 'https://yourdomain.com' },
        ],
    },
    {
        id: 'compliance',
        title: 'Compliance Rules',
        description: 'Automatic enforcement policies for email sending',
        icon: '🛡️',
        fields: [
            { key: 'force_unsubscribe_footer', label: 'Force Unsubscribe Footer', description: 'Auto-inject unsubscribe link in every email', type: 'toggle' },
            { key: 'force_identification_footer', label: 'Force Identification Footer', description: 'Auto-inject business address in every email', type: 'toggle' },
            { key: 'block_unknown_consent', label: 'Block Unknown Consent', description: 'Block sending to contacts without explicit consent', type: 'toggle' },
        ],
    },
    {
        id: 'thresholds',
        title: 'Safety Thresholds',
        description: 'Auto-pause sending when rates exceed these limits',
        icon: '⚠️',
        fields: [
            { key: 'complaint_threshold', label: 'Complaint Rate Threshold (%)', description: 'Pause sending if complaint rate exceeds this', type: 'number', placeholder: '0.1' },
            { key: 'bounce_threshold', label: 'Bounce Rate Threshold (%)', description: 'Pause sending if bounce rate exceeds this', type: 'number', placeholder: '5.0' },
        ],
    },
];
