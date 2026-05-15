import { Segment } from '../types/campaign.types';

/**
 * Production-grade mock segments for UI testing and functionality verification.
 * Strictly follows the PRD data model with correct field names.
 *
 * Fields: last_order_days | total_spend | orders_count | store_id | consent_status
 */
export const DEV_SEED_SEGMENTS: Segment[] = [
    {
        id: 'seg-001',
        name: 'High-Value Customers',
        rules_json: {
            logic: 'AND',
            rules: [
                { id: 'r1', field: 'total_spend', operator: '>', value: '500' },
                { id: 'r2', field: 'orders_count', operator: '>', value: '3' },
                { id: 'r3', field: 'consent_status', operator: '=', value: 'eligible' },
            ],
        },
        estimated_count: 1240,
        status: 'active',
        created_at: '2026-03-10T09:15:00Z',
        updated_at: '2026-04-12T14:30:00Z',
    },
    {
        id: 'seg-002',
        name: 'Inactive 90 Days',
        rules_json: {
            logic: 'AND',
            rules: [
                { id: 'r4', field: 'last_order_days', operator: '>', value: '90' },
                { id: 'r5', field: 'consent_status', operator: '=', value: 'eligible' },
            ],
        },
        estimated_count: 3580,
        status: 'active',
        created_at: '2026-02-20T11:00:00Z',
        updated_at: '2026-04-15T08:45:00Z',
    },
    {
        id: 'seg-003',
        name: 'Newsletter Subscribers',
        rules_json: {
            logic: 'AND',
            rules: [
                { id: 'r6', field: 'consent_status', operator: '=', value: 'eligible' },
            ],
        },
        estimated_count: 12750,
        status: 'active',
        created_at: '2026-01-05T16:20:00Z',
        updated_at: '2026-04-16T10:00:00Z',
    },
    {
        id: 'seg-004',
        name: 'Store A – Loyalty Tier',
        rules_json: {
            logic: 'AND',
            rules: [
                { id: 'r7', field: 'store_id', operator: 'in', value: ['store_001', 'store_002'] },
                { id: 'r8', field: 'total_spend', operator: '>', value: '200' },
                { id: 'r9', field: 'orders_count', operator: '>', value: '5' },
                { id: 'r10', field: 'consent_status', operator: '=', value: 'eligible' },
            ],
        },
        estimated_count: 480,
        status: 'active',
        created_at: '2026-03-25T13:00:00Z',
        updated_at: '2026-04-14T17:20:00Z',
    },
    {
        id: 'seg-005',
        name: 'Win-back Candidates',
        rules_json: {
            logic: 'OR',
            rules: [
                { id: 'r11', field: 'last_order_days', operator: '>', value: '180' },
                { id: 'r12', field: 'consent_status', operator: '=', value: 'unsubscribed' },
            ],
        },
        estimated_count: 890,
        status: 'inactive',
        created_at: '2026-04-01T09:30:00Z',
        updated_at: '2026-04-10T11:15:00Z',
    },
    {
        id: 'seg-006',
        name: 'New Customers (30 days)',
        rules_json: null,
        estimated_count: 215,
        status: 'inactive',
        created_at: '2026-04-15T07:00:00Z',
    },
];
