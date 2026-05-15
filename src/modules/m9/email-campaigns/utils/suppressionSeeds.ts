import { SuppressionEntry, ConsentEntry } from '../types/suppression.types';

/**
 * Development seed data for suppression list and consent view.
 * Covers all reason/consent permutations for robust UI testing.
 */

export const DEV_SEED_SUPPRESSIONS: SuppressionEntry[] = [
    {
        id: 'sup-001',
        email: 'john.doe@example.com',
        reason: 'unsubscribed',
        source: 'Email preference center',
        date_added: '2026-04-15T10:30:00Z',
    },
    {
        id: 'sup-002',
        email: 'jane.smith@example.com',
        reason: 'bounced',
        source: 'Campaign: Spring Sale 2026',
        date_added: '2026-04-12T14:20:00Z',
    },
    {
        id: 'sup-003',
        email: 'alex.wright@example.com',
        reason: 'complained',
        source: 'ISP feedback loop',
        date_added: '2026-04-10T09:15:00Z',
    },
    {
        id: 'sup-004',
        email: 'emily.r@example.com',
        reason: 'unsubscribed',
        source: 'One-click unsubscribe header',
        date_added: '2026-04-08T17:45:00Z',
    },
    {
        id: 'sup-005',
        email: 'marcus.j@example.com',
        reason: 'bounced',
        source: 'Campaign: Welcome Flow',
        date_added: '2026-03-28T11:00:00Z',
    },
    {
        id: 'sup-006',
        email: 'sophia.lee@example.com',
        reason: 'complained',
        source: 'ISP feedback loop',
        date_added: '2026-03-22T08:30:00Z',
    },
    {
        id: 'sup-007',
        email: 'david.kim@example.com',
        reason: 'unsubscribed',
        source: 'Manual admin action',
        date_added: '2026-03-15T16:10:00Z',
    },
    {
        id: 'sup-008',
        email: 'olivia.parker@example.com',
        reason: 'bounced',
        source: 'Campaign: Product Launch',
        date_added: '2026-03-10T13:50:00Z',
    },
    {
        id: 'sup-009',
        email: 'lucas.muller@example.com',
        reason: 'unsubscribed',
        source: 'Email preference center',
        date_added: '2026-02-28T10:00:00Z',
    },
    {
        id: 'sup-010',
        email: 'priya.sharma@example.com',
        reason: 'complained',
        source: 'Spam button report',
        date_added: '2026-02-20T15:30:00Z',
    },
    {
        id: 'sup-011',
        email: 'noah.torres@example.com',
        reason: 'bounced',
        source: 'Campaign: Holiday Flash',
        date_added: '2026-02-14T07:45:00Z',
    },
    {
        id: 'sup-012',
        email: 'isabella.rossi@example.com',
        reason: 'unsubscribed',
        source: 'One-click unsubscribe header',
        date_added: '2026-01-30T12:00:00Z',
    },
];

export const DEV_SEED_CONSENT: ConsentEntry[] = [
    {
        id: 'con-001',
        email: 'sarah.mitchell@example.com',
        name: 'Sarah Mitchell',
        consent_status: 'eligible',
        updated_at: '2026-04-10T14:30:00Z',
    },
    {
        id: 'con-002',
        email: 'james.chen@example.com',
        name: 'James Chen',
        consent_status: 'eligible',
        updated_at: '2026-03-28T09:15:00Z',
    },
    {
        id: 'con-003',
        email: 'emily.r@example.com',
        name: 'Emily Rodriguez',
        consent_status: 'unsubscribed',
        updated_at: '2026-02-01T08:00:00Z',
    },
    {
        id: 'con-004',
        email: 'marcus.j@example.com',
        name: 'Marcus Johnson',
        consent_status: 'eligible',
        updated_at: '2026-04-15T11:30:00Z',
    },
    {
        id: 'con-005',
        email: 'aiko.tanaka@example.com',
        name: 'Aiko Tanaka',
        consent_status: 'eligible',
        updated_at: '2026-04-12T07:45:00Z',
    },
    {
        id: 'con-006',
        email: 'olivia.parker@example.com',
        name: 'Olivia Parker',
        consent_status: 'no_consent',
        updated_at: '2026-04-16T20:00:00Z',
    },
    {
        id: 'con-007',
        email: 'david.kim@example.com',
        name: 'David Kim',
        consent_status: 'unsubscribed',
        updated_at: '2026-03-01T09:30:00Z',
    },
    {
        id: 'con-008',
        email: 'priya.sharma@example.com',
        name: 'Priya Sharma',
        consent_status: 'eligible',
        updated_at: '2026-04-17T12:00:00Z',
    },
    {
        id: 'con-009',
        email: 'lucas.muller@example.com',
        name: 'Lucas Müller',
        consent_status: 'no_consent',
        updated_at: '2025-11-25T09:00:00Z',
    },
    {
        id: 'con-010',
        email: 'isabella.rossi@example.com',
        name: 'Isabella Rossi',
        consent_status: 'eligible',
        updated_at: '2026-03-05T08:30:00Z',
    },
    {
        id: 'con-011',
        email: 'alex.wright@example.com',
        name: 'Alexander Wright',
        consent_status: 'unsubscribed',
        updated_at: '2026-04-01T18:00:00Z',
    },
    {
        id: 'con-012',
        email: 'sofia.h@example.com',
        name: 'Sofia Hernandez',
        consent_status: 'eligible',
        updated_at: '2026-04-14T13:00:00Z',
    },
    {
        id: 'con-013',
        email: 'noah.torres@example.com',
        name: 'Noah Torres',
        consent_status: 'no_consent',
        updated_at: '2026-02-10T10:00:00Z',
    },
    {
        id: 'con-014',
        email: 'sophia.lee@example.com',
        name: 'Sophia Lee',
        consent_status: 'unsubscribed',
        updated_at: '2026-03-22T08:30:00Z',
    },
];
