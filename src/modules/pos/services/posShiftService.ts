import apiClient from '@/shared/api/apiClient';

export interface OpenPOSShiftPayload {
    store_id: string;
    businessDate: string;
    systemHandshakeTime: string;
    initialFloatCash: string;
    personnelNotes: string;
}

export async function openPOSShift(payload: OpenPOSShiftPayload) {
    const { data } = await apiClient.post('/pos/shifts/', payload);
    return data;
}
