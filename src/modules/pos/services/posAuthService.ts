import axios from 'axios';
import { env } from '@/shared/config/env';

export interface POSCashier {
    id: string;
    name: string;
    email?: string;
    role?: string;
    status?: string;
}

type CashierPayload = Record<string, unknown>;

const getString = (value: unknown) => typeof value === 'string' && value.trim() ? value : undefined;

const isCashierPayload = (value: unknown): value is CashierPayload =>
    !!value && typeof value === 'object' && !Array.isArray(value);

const normalizePayloadList = (value: unknown): CashierPayload[] =>
    Array.isArray(value) ? value.filter(isCashierPayload) : [];

const getCashierName = (cashier: CashierPayload) =>
    cashier.full_name ||
    cashier.fullName ||
    cashier.cashier_name ||
    cashier.cashierName ||
    cashier.name ||
    cashier.username ||
    cashier.email ||
    'Unnamed cashier';

const normalizeCashier = (cashier: CashierPayload): POSCashier => ({
    id: String(cashier.id ?? cashier.user_id ?? cashier.userId ?? cashier.cashier_id ?? cashier.cashierId ?? cashier.email ?? getCashierName(cashier)),
    name: String(getCashierName(cashier)),
    email: getString(cashier.email),
    role: getString(cashier.role),
    status: getString(cashier.status),
});

const extractCashierList = (payload: unknown): CashierPayload[] => {
    if (Array.isArray(payload)) return normalizePayloadList(payload);
    if (!payload || typeof payload !== 'object') return [];

    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.cashiers)) return normalizePayloadList(record.cashiers);
    if (Array.isArray(record.data)) return normalizePayloadList(record.data);
    if (Array.isArray(record.results)) return normalizePayloadList(record.results);
    return [];
};

export async function getStoreCashiers(storeId: string): Promise<POSCashier[]> {
    const url = `${env.apiBaseUrl}/pos/auth/stores/${storeId}/cashiers`;
    console.info('[POSAuthService] GET cashiers', url);

    const { data } = await axios.get(url);
    console.info('[POSAuthService] Cashiers response', data);
    return extractCashierList(data).map(normalizeCashier);
}
