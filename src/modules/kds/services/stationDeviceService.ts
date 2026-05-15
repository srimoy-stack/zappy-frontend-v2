/**
 * stationDeviceService.ts
 *
 * Manages KDS station device pairing and session persistence.
 *
 * In production this service will call:
 *   POST /api/kds/station/pair   { pairingCode }
 *   → { station_id, station_token }
 *
 * For now it delegates to mockStationService and provides a unified
 * public API for station-mode lifecycle:
 *   - pairStation(code)     → pair device, persist token
 *   - unpairStation()       → clear pairing data
 *   - getStationToken()     → retrieve persisted token
 *   - getStationId()        → retrieve persisted station ID
 *   - isDevicePaired()      → boolean check
 *   - getStationPermissions → station-mode restricted permission set
 */

import {
    getStationToken as mockGetToken,
    getStationId as mockGetId,
    clearStationState,
    isDevicePaired as mockIsPaired,
    PairingResponse,
    saveStationState
} from './mockStationService';
import { kdsApiService } from './kdsApiService';
import { logKDSAction } from './kdsAuditLogger';


// ─────────────────────────────────────────────────────────────────────────────
//  Re-exports (unified API surface)
// ─────────────────────────────────────────────────────────────────────────────

export type { PairingResponse };

export function getStationToken(): string | null {
    return mockGetToken();
}

export function getStationId(): string | null {
    return mockGetId();
}

export function isDevicePaired(): boolean {
    return mockIsPaired();
}

// ─────────────────────────────────────────────────────────────────────────────
//  Station Pairing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pair this device with a KDS station using a pairing code.
 * Requirement 10.2: POST /api/kds/stations/pair
 */
export async function pairStation(pairingCode: string, deviceFingerprint?: string): Promise<PairingResponse> {
    const fingerprint = deviceFingerprint || `dev-${Math.random().toString(36).slice(2, 10)}`;

    try {
        const result = await kdsApiService.pairStation(pairingCode, fingerprint);
        // Map the API response to our internal state structure
        const stationResponse: PairingResponse = {
            station_id: "paired-station", // Ideally returned by API
            station_token: result.station_token
        };

        saveStationState(stationResponse.station_id, stationResponse.station_token);
        logKDSAction('station.paired', {
            station_id: stationResponse.station_id,
            fingerprint
        });
        console.info(`[StationDevice] Paired via API — token: ${result.station_token.slice(0, 12)}…`);
        return stationResponse;

    } catch (error) {
        console.warn('[StationDevice] API pairing failed, falling back to mock:', error);
        // Fallback or re-throw
        throw error;
    }
}

/**
 * Unpair this device — clears persisted station token and station ID.
 * Requirement 10.2: POST /api/kds/stations/unpair
 */
export async function unpairStation(): Promise<void> {
    const stationId = getStationId();
    if (stationId) {
        try {
            await kdsApiService.unpairStation(stationId);
            logKDSAction('station.unpaired', { station_id: stationId });
        } catch (error) {
            console.error('[StationDevice] API unpair failed:', error);
        }
    }

    clearStationState();
    console.info('[StationDevice] Station pairing cleared.');
}

// ─────────────────────────────────────────────────────────────────────────────
//  Station-mode Permission Set
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The permission set granted to a station-mode device.
 * Station devices can view orders and update stages, but sensitive actions
 * (delay, cancel, routing, sound management) require PIN verification.
 */
export const STATION_PERMISSIONS: readonly string[] = [
    'KDS.VIEW',
    'KDS.STAGE_UPDATE',
    'KDS.ACCEPT_ORDER',
    'KDS.PRINT',
    // Sensitive — these are granted but gated behind PIN via useKDSActionAuth:
    'KDS.DELAY_ORDER',
    'KDS.CANCEL_ORDER',
    'KDS.CUSTOMER_MESSAGE',
] as const;

/**
 * Returns the permission set for station-mode devices.
 */
export function getStationPermissions(): string[] {
    return [...STATION_PERMISSIONS];
}
