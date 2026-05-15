'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, Filter, ChevronDown, Check, AlertCircle, Hash, Users, Shield, Store, ShoppingCart, Clock, DollarSign } from 'lucide-react';
import {
    SegmentRule,
    SegmentField,
    SegmentOperator,
    SegmentRulesPayload,
    SegmentLogic,
    RulesJsonOutput,
    StoreOption,
    ConsentStatus,
    EstimateCountResponse,
} from '../types/campaign.types';
import { segmentService } from '../services/segmentService';

// ============================================================================
// CONFIGURATION — Driven by PRD field definitions
// ============================================================================

interface FieldConfig {
    value: SegmentField;
    label: string;
    type: 'number' | 'string' | 'select' | 'multi';
    icon: React.ReactNode;
    description: string;
}

const FIELDS: FieldConfig[] = [
    { value: 'last_order_days', label: 'Last Order (days)', type: 'number', icon: <Clock className="w-3.5 h-3.5" />, description: 'Days since last purchase' },
    { value: 'total_spend', label: 'Total Spend ($)', type: 'number', icon: <DollarSign className="w-3.5 h-3.5" />, description: 'Cumulative spend amount' },
    { value: 'orders_count', label: 'Orders Count', type: 'number', icon: <ShoppingCart className="w-3.5 h-3.5" />, description: 'Number of orders placed' },
    { value: 'store_id', label: 'Store', type: 'multi', icon: <Store className="w-3.5 h-3.5" />, description: 'Multi-tenant store filter' },
    { value: 'favorite_category', label: 'Favorite Category', type: 'string', icon: <Hash className="w-3.5 h-3.5" />, description: 'Top purchased category' },
    { value: 'opened_campaigns_count', label: 'Opened Campaigns', type: 'number', icon: <Clock className="w-3.5 h-3.5" />, description: 'Count of opened campaigns' },
    { value: 'clicked_campaigns_count', label: 'Clicked Campaigns', type: 'number', icon: <Clock className="w-3.5 h-3.5" />, description: 'Count of clicked campaigns' },
    { value: 'consent_status', label: 'Consent Status', type: 'select', icon: <Shield className="w-3.5 h-3.5" />, description: 'Compliance consent state' },
];

const OPERATORS_FOR_TYPE: Record<'number' | 'string' | 'select' | 'multi', { value: SegmentOperator; label: string }[]> = {
    number: [
        { value: '>', label: 'greater than' },
        { value: '<', label: 'less than' },
        { value: '=', label: 'equals' },
        { value: '!=', label: 'not equal' },
    ],
    string: [
        { value: '=', label: 'equals' },
        { value: '!=', label: 'not equal' },
        { value: 'contains', label: 'contains' },
    ],
    select: [
        { value: '=', label: 'is' },
        { value: '!=', label: 'is not' },
    ],
    multi: [
        { value: 'in', label: 'includes' },
        { value: 'not_in', label: 'excludes' },
    ],
};

const CONSENT_OPTIONS: { value: ConsentStatus; label: string; color: string }[] = [
    { value: 'eligible', label: 'Eligible', color: '#059669' },
    { value: 'unsubscribed', label: 'Unsubscribed', color: '#d97706' },
    { value: 'no_consent', label: 'No Consent', color: '#dc2626' },
];

// ============================================================================
// UTILS
// ============================================================================

function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}

function createEmptyRule(): SegmentRule {
    return { id: generateId(), field: 'last_order_days', operator: '>', value: '' };
}

function getFieldConfig(field: SegmentField): FieldConfig {
    const cfg = FIELDS.find((f) => f.value === field);
    return cfg!;
}

function getFieldLabel(field: SegmentField): string {
    return getFieldConfig(field).label;
}

function getOperatorLabel(field: SegmentField, operator: SegmentOperator): string {
    const cfg = getFieldConfig(field);
    const op = OPERATORS_FOR_TYPE[cfg.type].find((o) => o.value === operator);
    return op?.label || operator;
}

function getValueLabel(rule: SegmentRule, stores: StoreOption[]): string {
    if (rule.field === 'consent_status') {
        const opt = CONSENT_OPTIONS.find((c) => c.value === rule.value);
        return opt?.label || String(rule.value);
    }
    if (rule.field === 'store_id' && Array.isArray(rule.value)) {
        if (rule.value.length === 0) return '(none selected)';
        const labels = rule.value.map((id) => {
            const store = stores.find((s) => s.id === id);
            return store?.name || id;
        });
        return labels.length <= 2 ? labels.join(', ') : `${labels.length} stores`;
    }
    if (rule.field === 'total_spend') return `$${rule.value}`;
    if (rule.field === 'last_order_days') return `${rule.value} days`;
    return String(rule.value) || '—';
}

/**
 * Build the backend-compatible rules_json output.
 * Strips internal `id` fields and maps to { field, operator, value }.
 */
export function buildRulesJson(name: string, payload: SegmentRulesPayload): RulesJsonOutput {
    const logic = payload?.logic || 'AND';
    const rules = payload?.rules || [];
    
    return {
        name,
        logic,
        conditions: rules.map((r) => ({
            field: r.field,
            operator: r.operator,
            value: r.value,
        })),
    };
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export function validateRules(rules: SegmentRule[]): ValidationResult {
    const errors: string[] = [];
    const safeRules = rules || [];

    if (safeRules.length === 0) {
        errors.push('At least 1 rule is required');
        return { valid: false, errors };
    }

    safeRules.forEach((r, idx) => {
        const label = `Rule #${idx + 1}`;
        const cfg = getFieldConfig(r.field);

        // Empty field check
        if (!r.field) {
            errors.push(`${label}: field is required`);
        }

        // Empty operator check
        if (!r.operator) {
            errors.push(`${label}: operator is required`);
        }

        // Value checks
        if (cfg.type === 'multi') {
            if (!Array.isArray(r.value) || r.value.length === 0) {
                errors.push(`${label}: select at least one store`);
            }
        } else if (cfg.type === 'select') {
            if (!String(r.value).trim()) {
                errors.push(`${label}: consent status is required`);
            }
        } else if (cfg.type === 'number') {
            const v = String(r.value).trim();
            if (!v) {
                errors.push(`${label}: value is required`);
            } else if (isNaN(Number(v))) {
                errors.push(`${label}: value must be a number`);
            } else if (Number(v) < 0) {
                errors.push(`${label}: value must be non-negative`);
            }
        } else {
            if (!String(r.value).trim()) {
                errors.push(`${label}: value is required`);
            }
        }

        // Invalid combination checks
        if (r.field === 'consent_status' && (r.operator === '>' || r.operator === '<')) {
            errors.push(`${label}: cannot use numeric operators with consent status`);
        }
        if (r.field === 'store_id' && !['in', 'not_in'].includes(r.operator)) {
            errors.push(`${label}: store field requires 'includes' or 'excludes' operator`);
        }
    });

    return { valid: errors.length === 0, errors };
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface SegmentRuleBuilderProps {
    value: SegmentRulesPayload;
    onChange: (payload: SegmentRulesPayload) => void;
    /** Segment name for the live summary panel */
    segmentName?: string;
    /** Show the live summary side panel (default: true) */
    showSummary?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SegmentRuleBuilder: React.FC<SegmentRuleBuilderProps> = ({
    value,
    onChange,
    segmentName = '',
    showSummary = true,
}) => {
    const logic = value?.logic || 'AND';
    const rules = value?.rules || [];
    const [stores, setStores] = useState<StoreOption[]>([]);
    const [estimate, setEstimate] = useState<EstimateCountResponse | null>(null);
    const [estimateLoading, setEstimateLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Load store context on mount ───────────────────────────────────
    useEffect(() => {
        segmentService.getStores().then(setStores).catch(() => {
            setStores([
                { id: 'store_001', name: 'Flagship San Francisco' },
                { id: 'store_002', name: 'New York Boutique' },
                { id: 'store_003', name: 'London Outlet' },
                { id: 'store_004', name: 'Tokyo Concept' },
                { id: 'store_005', name: 'Online Store' },
            ]);
        });
    }, []);

    // ── Estimate count (debounced) ────────────────────────────────────
    const fetchEstimate = useCallback(async (payload: SegmentRulesPayload) => {
        const validation = validateRules(payload.rules);
        if (!validation.valid) {
            setEstimate(null);
            return;
        }
        setEstimateLoading(true);
        try {
            const result = await segmentService.estimateCount(payload);
            setEstimate(result);
        } catch {
            setEstimate(null);
        } finally {
            setEstimateLoading(false);
        }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchEstimate(value);
        }, 400);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [value, fetchEstimate]);

    // ── Handlers ─────────────────────────────────────────────────────

    const updateRule = (id: string, patch: Partial<SegmentRule>) => {
        onChange({
            ...value,
            rules: rules.map((r) => {
                if (r.id !== id) return r;

                // If field changes, reset operator/value to defaults for that type
                if (patch.field && patch.field !== r.field) {
                    const newFieldCfg = getFieldConfig(patch.field);
                    const ops = OPERATORS_FOR_TYPE[newFieldCfg.type] || [];
                    const defaultOp = ops[0]?.value || '=';
                    const defaultValue = newFieldCfg.type === 'multi'
                        ? []
                        : (newFieldCfg.type === 'select' ? 'eligible' : '');
                    return { ...r, ...patch, operator: defaultOp, value: defaultValue };
                }

                return { ...r, ...patch };
            }),
        });
    };

    const addRule = () => {
        onChange({ ...value, rules: [...rules, createEmptyRule()] });
    };

    const removeRule = (id: string) => {
        if (rules.length <= 1) return;
        onChange({ ...value, rules: rules.filter((r) => r.id !== id) });
    };

    const setLogic = (newLogic: SegmentLogic) => {
        if (logic !== newLogic) onChange({ ...value, logic: newLogic });
    };

    // ── Validation ───────────────────────────────────────────────────

    const validation = useMemo(() => validateRules(rules), [rules]);

    // ── Render ───────────────────────────────────────────────────────

    return (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* ── LEFT: Rule Builder ──────────────────────────────────── */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={styles.headerIcon}>
                            <Filter className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 style={styles.headerTitle}>Segmentation Rules</h3>
                            <p style={styles.headerSubtitle}>
                                {rules.length} condition{rules.length !== 1 ? 's' : ''} configured
                            </p>
                        </div>
                    </div>
                    {!validation.valid && (
                        <div style={styles.validationBadge}>
                            <AlertCircle className="w-3 h-3" />
                            <span>{validation.errors.length} issue{validation.errors.length !== 1 ? 's' : ''}</span>
                        </div>
                    )}
                </div>

                {/* Logic Toggle */}
                <div style={styles.logicContainer}>
                    <div style={styles.logicPillGroup}>
                        <button
                            type="button"
                            onClick={() => setLogic('AND')}
                            style={{
                                ...styles.logicPill,
                                ...(logic === 'AND' ? styles.logicPillActiveAnd : styles.logicPillInactive),
                            }}
                        >
                            AND
                        </button>
                        <button
                            type="button"
                            onClick={() => setLogic('OR')}
                            style={{
                                ...styles.logicPill,
                                ...(logic === 'OR' ? styles.logicPillActiveOr : styles.logicPillInactive),
                            }}
                        >
                            OR
                        </button>
                    </div>
                    <span style={styles.logicLabel}>
                        {logic === 'AND' ? 'Match ALL conditions' : 'Match ANY condition'}
                    </span>
                </div>

                {/* Rules List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {rules.map((rule, idx) => {
                        const fieldCfg = getFieldConfig(rule.field);
                        const opOptions = OPERATORS_FOR_TYPE[fieldCfg.type];

                        return (
                            <div key={rule.id}>
                                {/* Logic connector badge */}
                                {idx > 0 && (
                                    <div style={styles.connectorRow}>
                                        <div style={styles.connectorLine} />
                                        <span style={{
                                            ...styles.connectorBadge,
                                            backgroundColor: logic === 'AND' ? '#4f46e5' : '#d97706',
                                        }}>
                                            {logic}
                                        </span>
                                        <div style={styles.connectorLine} />
                                    </div>
                                )}

                                <div style={{
                                    ...styles.ruleRow,
                                    borderColor: String(rule.value || '').trim() || (Array.isArray(rule.value) && rule.value.length > 0)
                                        ? '#e2e8f0'
                                        : '#fbbf24',
                                }}>
                                    {/* Rule # */}
                                    <div style={styles.ruleIndex}>
                                        <span style={styles.ruleIndexText}>{idx + 1}</span>
                                    </div>

                                    {/* Fields Row */}
                                    <div style={styles.fieldsGrid}>
                                        {/* Field */}
                                        <div style={styles.fieldCol}>
                                            <label style={styles.fieldLabel}>Field</label>
                                            <div style={{ position: 'relative' }}>
                                                <select
                                                    value={rule.field}
                                                    onChange={(e) => updateRule(rule.id, { field: e.target.value as SegmentField })}
                                                    style={styles.select}
                                                >
                                                    {FIELDS.map((f) => (
                                                        <option key={f.value} value={f.value}>{f.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Operator */}
                                        <div style={styles.operatorCol}>
                                            <label style={styles.fieldLabel}>Operator</label>
                                            <select
                                                value={rule.operator}
                                                onChange={(e) => updateRule(rule.id, { operator: e.target.value as SegmentOperator })}
                                                style={styles.select}
                                            >
                                                {opOptions.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Value */}
                                        <div style={styles.valueCol}>
                                            <label style={styles.fieldLabel}>Value</label>
                                            {fieldCfg.type === 'select' ? (
                                                <ConsentSelect
                                                    value={String(rule.value)}
                                                    onChange={(v) => updateRule(rule.id, { value: v })}
                                                />
                                            ) : fieldCfg.type === 'multi' ? (
                                                <StoreMultiSelect
                                                    stores={stores}
                                                    value={Array.isArray(rule.value) ? rule.value : []}
                                                    onChange={(v) => updateRule(rule.id, { value: v })}
                                                />
                                            ) : (
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type={fieldCfg.type === 'number' ? 'number' : 'text'}
                                                        value={String(rule.value)}
                                                        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                                                        placeholder={fieldCfg.type === 'number' ? '0' : 'Enter value...'}
                                                        min={fieldCfg.type === 'number' ? '0' : undefined}
                                                        style={styles.input}
                                                    />
                                                    {fieldCfg.type === 'number' && (
                                                        <Hash className="w-3 h-3" style={styles.inputIcon} />
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove */}
                                        <div style={styles.removeCol}>
                                            <label style={{ ...styles.fieldLabel, visibility: 'hidden' as const }}>×</label>
                                            <button
                                                type="button"
                                                onClick={() => removeRule(rule.id)}
                                                disabled={rules.length <= 1}
                                                style={{
                                                    ...styles.removeBtn,
                                                    opacity: rules.length <= 1 ? 0.2 : 1,
                                                    cursor: rules.length <= 1 ? 'not-allowed' : 'pointer',
                                                }}
                                                title="Remove rule"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Add Rule Button */}
                <button
                    type="button"
                    onClick={addRule}
                    style={styles.addRuleBtn}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#6366f1';
                        e.currentTarget.style.color = '#4338ca';
                        e.currentTarget.style.backgroundColor = '#eef2ff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#c7d2fe';
                        e.currentTarget.style.color = '#6366f1';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <Plus className="w-4 h-4" />
                    Add Rule
                </button>

                {/* Validation Errors */}
                {!validation.valid && (
                    <div style={styles.errorBlock}>
                        <AlertCircle className="w-4 h-4" style={{ color: '#b45309', flexShrink: 0, marginTop: '1px' }} />
                        <div>
                            <p style={styles.errorTitle}>Incomplete Configuration</p>
                            <ul style={styles.errorList}>
                                {validation.errors.map((err, i) => (
                                    <li key={i} style={styles.errorItem}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* ── RIGHT: Live Summary Panel ───────────────────────────── */}
            {showSummary && (
                <div style={styles.summaryPanel}>
                    {/* Estimated Count */}
                    <div style={styles.summaryCountBlock}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <Users className="w-4 h-4" style={{ color: '#818cf8' }} />
                            <span style={styles.summaryLabel}>
                                {segmentName ? `Summary · ${segmentName}` : 'Estimated Audience'}
                            </span>
                        </div>
                        {estimateLoading ? (
                            <div style={styles.estimateLoading}>
                                <div style={styles.spinner} />
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Calculating...</span>
                            </div>
                        ) : estimate ? (
                            <div>
                                <p style={styles.estimateNumber}>
                                    {estimate.estimated_count.toLocaleString()}
                                </p>
                                <p style={styles.estimateUnit}>contacts</p>
                                {estimate.breakdown && (
                                    <div style={styles.breakdownGrid}>
                                        <div style={styles.breakdownItem}>
                                            <span style={{ ...styles.breakdownDot, backgroundColor: '#059669' }} />
                                            <span style={styles.breakdownLabel}>Eligible</span>
                                            <span style={styles.breakdownValue}>
                                                {estimate.breakdown.eligible.toLocaleString()}
                                            </span>
                                        </div>
                                        <div style={styles.breakdownItem}>
                                            <span style={{ ...styles.breakdownDot, backgroundColor: '#d97706' }} />
                                            <span style={styles.breakdownLabel}>Unsubscribed</span>
                                            <span style={styles.breakdownValue}>
                                                {estimate.breakdown.unsubscribed.toLocaleString()}
                                            </span>
                                        </div>
                                        <div style={styles.breakdownItem}>
                                            <span style={{ ...styles.breakdownDot, backgroundColor: '#dc2626' }} />
                                            <span style={styles.breakdownLabel}>Suppressed</span>
                                            <span style={styles.breakdownValue}>
                                                {estimate.breakdown.suppressed.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p style={styles.estimateEmpty}>Complete rules to see estimate</p>
                        )}
                    </div>

                    {/* Rules Summary */}
                    <div style={styles.summarySectionDivider} />
                    <div>
                        <p style={styles.summaryLabel}>Rules Summary</p>
                        <div style={styles.summaryRulesList}>
                            {rules.length === 0 ? (
                                <p style={styles.estimateEmpty}>No rules defined</p>
                            ) : (
                                rules.map((rule, idx) => (
                                    <div key={rule.id} style={styles.summaryRuleItem}>
                                        {idx > 0 && (
                                            <span style={{
                                                ...styles.summaryLogicPill,
                                                backgroundColor: logic === 'AND' ? '#312e81' : '#78350f',
                                            }}>
                                                {logic}
                                            </span>
                                        )}
                                        <div style={styles.summaryRuleContent}>
                                            <span style={styles.summaryRuleFieldIcon}>
                                                {getFieldConfig(rule.field).icon}
                                            </span>
                                            <span style={styles.summaryRuleField}>{getFieldLabel(rule.field)}</span>
                                            <span style={styles.summaryRuleOp}>{getOperatorLabel(rule.field, rule.operator)}</span>
                                            <span style={styles.summaryRuleValue}>{getValueLabel(rule, stores)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Logic Mode */}
                    <div style={styles.summarySectionDivider} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={styles.summaryLabel}>Logic Mode</span>
                        <span style={{
                            ...styles.summaryLogicBadge,
                            backgroundColor: logic === 'AND' ? '#4f46e5' : '#d97706',
                        }}>
                            {logic === 'AND' ? 'Match All (AND)' : 'Match Any (OR)'}
                        </span>
                    </div>

                    {/* Validation Status */}
                    <div style={styles.summarySectionDivider} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={styles.summaryLabel}>Validation</span>
                        {validation.valid ? (
                            <span style={styles.validBadge}>
                                <Check className="w-3 h-3" /> Valid
                            </span>
                        ) : (
                            <span style={styles.invalidBadge}>
                                <AlertCircle className="w-3 h-3" /> {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// CONSENT STATUS SELECT — PRD-critical, clearly visible
// ============================================================================

const ConsentSelect: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
    const current = CONSENT_OPTIONS.find((c) => c.value === value);

    return (
        <div style={{ position: 'relative' }}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    ...styles.select,
                    color: current?.color || '#1e293b',
                    fontWeight: 700,
                }}
            >
                {CONSENT_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                ))}
            </select>
            <div style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: current?.color || '#94a3b8',
                pointerEvents: 'none' as const,
            }} />
        </div>
    );
};

// ============================================================================
// STORE MULTI-SELECT — Multi-tenant aware
// ============================================================================

const StoreMultiSelect: React.FC<{
    stores: StoreOption[];
    value: string[];
    onChange: (val: string[]) => void;
}> = ({ stores, value, onChange }) => {
    const [open, setOpen] = useState(false);

    const toggle = (id: string) => {
        if (value.includes(id)) onChange(value.filter((v) => v !== id));
        else onChange([...value, id]);
    };

    const selectedLabels = stores.filter((o) => value.includes(o.id)).map((o) => o.name);

    return (
        <div style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={styles.multiSelectTrigger}
            >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                    {value.length === 0
                        ? 'Select stores...'
                        : value.length === 1
                            ? selectedLabels[0]
                            : `${value.length} stores selected`}
                </span>
                <ChevronDown
                    className="w-3 h-3"
                    style={{
                        marginLeft: '4px',
                        transition: 'transform 0.15s',
                        transform: open ? 'rotate(180deg)' : 'none',
                        flexShrink: 0,
                    }}
                />
            </button>

            {open && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                        onClick={() => setOpen(false)}
                    />
                    <div style={styles.multiSelectDropdown}>
                        {stores.map((o) => (
                            <button
                                key={o.id}
                                type="button"
                                onClick={() => toggle(o.id)}
                                style={{
                                    ...styles.multiSelectOption,
                                    backgroundColor: value.includes(o.id) ? '#4f46e5' : 'transparent',
                                    color: value.includes(o.id) ? '#fff' : '#475569',
                                }}
                            >
                                <Store className="w-3 h-3" style={{ opacity: 0.6, flexShrink: 0 }} />
                                <span style={{ flex: 1 }}>{o.name}</span>
                                {value.includes(o.id) && <Check className="w-3 h-3" />}
                            </button>
                        ))}
                        {value.length > 0 && (
                            <button
                                type="button"
                                onClick={() => onChange([])}
                                style={styles.multiSelectClear}
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// ============================================================================
// STYLES — Inline for isolation, dense layout, no unnecessary animation
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
    // Header
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
    },
    headerIcon: {
        padding: '8px',
        backgroundColor: '#eef2ff',
        borderRadius: '10px',
        color: '#4f46e5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: '13px',
        fontWeight: 900,
        color: '#0f172a',
        letterSpacing: '0.03em',
        margin: 0,
        textTransform: 'uppercase' as const,
    },
    headerSubtitle: {
        fontSize: '10px',
        fontWeight: 600,
        color: '#94a3b8',
        margin: 0,
        marginTop: '1px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
    },
    validationBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '20px',
        fontSize: '10px',
        fontWeight: 800,
        color: '#b45309',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
    },

    // Logic toggle
    logicContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        padding: '6px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
    },
    logicPillGroup: {
        display: 'flex',
        backgroundColor: '#fff',
        padding: '3px',
        borderRadius: '10px',
        border: '1px solid #f1f5f9',
    },
    logicPill: {
        padding: '6px 16px',
        borderRadius: '8px',
        fontSize: '10px',
        fontWeight: 900,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s',
    },
    logicPillActiveAnd: {
        backgroundColor: '#4f46e5',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(79,70,229,0.25)',
    },
    logicPillActiveOr: {
        backgroundColor: '#d97706',
        color: '#fff',
        boxShadow: '0 2px 8px rgba(217,119,6,0.25)',
    },
    logicPillInactive: {
        backgroundColor: 'transparent',
        color: '#94a3b8',
    },
    logicLabel: {
        fontSize: '10px',
        fontWeight: 700,
        color: '#64748b',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
    },

    // Connector
    connectorRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 0',
        justifyContent: 'center',
    },
    connectorLine: {
        height: '1px',
        flex: 1,
        backgroundColor: '#e2e8f0',
    },
    connectorBadge: {
        fontSize: '9px',
        fontWeight: 900,
        color: '#fff',
        padding: '2px 10px',
        borderRadius: '10px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
    },

    // Rule row
    ruleRow: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '12px',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
    },
    ruleIndex: {
        width: '28px',
        height: '28px',
        borderRadius: '8px',
        backgroundColor: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: '20px',
    },
    ruleIndexText: {
        fontSize: '10px',
        fontWeight: 900,
        color: '#64748b',
    },
    fieldsGrid: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 130px 1fr 36px',
        gap: '8px',
        minWidth: 0,
    },
    fieldCol: { minWidth: 0 },
    operatorCol: { minWidth: 0 },
    valueCol: { minWidth: 0 },
    removeCol: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
    },
    fieldLabel: {
        display: 'block',
        fontSize: '9px',
        fontWeight: 800,
        color: '#94a3b8',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        marginBottom: '4px',
        paddingLeft: '2px',
    },
    select: {
        width: '100%',
        padding: '8px 10px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#1e293b',
        outline: 'none',
        cursor: 'pointer',
        appearance: 'none' as const,
        WebkitAppearance: 'none' as const,
    },
    input: {
        width: '100%',
        padding: '8px 10px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 700,
        color: '#1e293b',
        outline: 'none',
        boxSizing: 'border-box' as const,
    },
    inputIcon: {
        position: 'absolute' as const,
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#cbd5e1',
        pointerEvents: 'none' as const,
    },
    removeBtn: {
        padding: '8px',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#ef4444',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
    },

    // Add rule
    addRuleBtn: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '12px',
        border: '2px dashed #c7d2fe',
        borderRadius: '14px',
        fontSize: '11px',
        fontWeight: 800,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        color: '#6366f1',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s',
        marginTop: '8px',
    },

    // Error block
    errorBlock: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '12px',
        marginTop: '12px',
    },
    errorTitle: {
        fontSize: '11px',
        fontWeight: 800,
        color: '#92400e',
        margin: 0,
        marginBottom: '4px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.04em',
    },
    errorList: {
        margin: 0,
        paddingLeft: '14px',
        listStyleType: 'disc',
    },
    errorItem: {
        fontSize: '11px',
        color: '#a16207',
        fontWeight: 600,
        lineHeight: '1.5',
    },

    // Summary panel
    summaryPanel: {
        width: '280px',
        flexShrink: 0,
        backgroundColor: '#0f172a',
        borderRadius: '16px',
        padding: '20px',
        color: '#fff',
        position: 'sticky' as const,
        top: '24px',
    },
    summaryCountBlock: {
        marginBottom: '4px',
    },
    summaryLabel: {
        fontSize: '9px',
        fontWeight: 800,
        color: '#64748b',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.12em',
    },
    estimateLoading: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '8px',
    },
    spinner: {
        width: '14px',
        height: '14px',
        border: '2px solid #334155',
        borderTopColor: '#818cf8',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
    },
    estimateNumber: {
        fontSize: '28px',
        fontWeight: 900,
        color: '#fff',
        margin: 0,
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
    },
    estimateUnit: {
        fontSize: '11px',
        fontWeight: 700,
        color: '#818cf8',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
        margin: 0,
        marginTop: '2px',
    },
    estimateEmpty: {
        fontSize: '11px',
        color: '#475569',
        fontWeight: 500,
        margin: 0,
        marginTop: '4px',
        fontStyle: 'italic' as const,
    },
    breakdownGrid: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
        marginTop: '12px',
        padding: '10px',
        backgroundColor: '#1e293b',
        borderRadius: '10px',
    },
    breakdownItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '10px',
    },
    breakdownDot: {
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    breakdownLabel: {
        flex: 1,
        color: '#94a3b8',
        fontWeight: 600,
    },
    breakdownValue: {
        color: '#e2e8f0',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
    },
    summarySectionDivider: {
        height: '1px',
        backgroundColor: '#1e293b',
        margin: '14px 0',
    },
    summaryRulesList: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px',
        marginTop: '8px',
    },
    summaryRuleItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
    },
    summaryLogicPill: {
        alignSelf: 'center',
        fontSize: '8px',
        fontWeight: 900,
        color: '#fff',
        padding: '1px 8px',
        borderRadius: '6px',
        letterSpacing: '0.1em',
    },
    summaryRuleContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 8px',
        backgroundColor: '#1e293b',
        borderRadius: '8px',
        flexWrap: 'wrap' as const,
    },
    summaryRuleFieldIcon: {
        color: '#818cf8',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
    },
    summaryRuleField: {
        fontSize: '10px',
        fontWeight: 700,
        color: '#e2e8f0',
    },
    summaryRuleOp: {
        fontSize: '10px',
        fontWeight: 500,
        color: '#64748b',
    },
    summaryRuleValue: {
        fontSize: '10px',
        fontWeight: 800,
        color: '#a5b4fc',
    },
    summaryLogicBadge: {
        fontSize: '9px',
        fontWeight: 800,
        color: '#fff',
        padding: '3px 10px',
        borderRadius: '8px',
        letterSpacing: '0.06em',
    },
    validBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        fontWeight: 800,
        color: '#059669',
        backgroundColor: '#064e3b',
        padding: '3px 10px',
        borderRadius: '8px',
    },
    invalidBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '10px',
        fontWeight: 800,
        color: '#fbbf24',
        backgroundColor: '#78350f',
        padding: '3px 10px',
        borderRadius: '8px',
    },

    // MultiSelect
    multiSelectTrigger: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 10px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 600,
        color: '#1e293b',
        cursor: 'pointer',
        textAlign: 'left' as const,
    },
    multiSelectDropdown: {
        position: 'absolute' as const,
        top: '100%',
        left: 0,
        right: 0,
        marginTop: '4px',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
        zIndex: 50,
        padding: '4px',
        maxHeight: '220px',
        overflowY: 'auto' as const,
    },
    multiSelectOption: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 10px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.1s',
        textAlign: 'left' as const,
    },
    multiSelectClear: {
        width: '100%',
        padding: '6px',
        marginTop: '4px',
        borderTop: '1px solid #f1f5f9',
        fontSize: '10px',
        fontWeight: 800,
        color: '#ef4444',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        textAlign: 'center' as const,
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
    },
};

export default SegmentRuleBuilder;
