/**
 * mockStationService.ts
 * 
 * Simulates the KDS station pairing and authentication flow.
 * In production, this would involve authenticating a physical device
 * using a pairing code and receiving a persistent station token.
 */

const STATION_TOKEN_KEY = 'zyappy_kds_station_token';
const STATION_ID_KEY = 'zyappy_kds_station_id';

export interface PairingResponse {
    station_id: string;
    station_token: string;
}

/**
 * Pairs a device with a KDS station using a mock pairing code.
 * Stores the resulting token and station ID in localStorage.
 */
export async function pairStation(pairingCode: string): Promise<PairingResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For mock purposes, any code that isn't empty is valid
    if (!pairingCode.trim()) {
        throw new Error('Invalid pairing code');
    }

    const mockResponse: PairingResponse = {
        station_id: 'kitchen-main',
        station_token: 'mock-station-token-' + Math.random().toString(36).substring(7)
    };

    // Store in localStorage for persistence across reloads
    if (typeof window !== 'undefined') {
        localStorage.setItem(STATION_TOKEN_KEY, mockResponse.station_token);
        localStorage.setItem(STATION_ID_KEY, mockResponse.station_id);
    }

    return mockResponse;
}

/**
 * Retrieves the stored station token if it exists.
 */
export function getStationToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STATION_TOKEN_KEY);
}

/**
 * Retrieves the stored station ID if it exists.
 */
export function getStationId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STATION_ID_KEY);
}

/**
 * Persists station state to localStorage.
 */
export function saveStationState(stationId: string, token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STATION_TOKEN_KEY, token);
        localStorage.setItem(STATION_ID_KEY, stationId);
    }
}

/**
 * Clears the station pairing state from the device.
 */
export function clearStationState(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STATION_TOKEN_KEY);
        localStorage.removeItem(STATION_ID_KEY);
    }
}

/**
 * Checks if the device is currently in Station Mode (device-locked).
 */
export function isDevicePaired(): boolean {
    return !!getStationToken();
}
