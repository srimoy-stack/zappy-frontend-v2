/**
 * kdsApiService.ts
 * 
 * Handles all REST API communication for the KDS module.
 * Includes bootstrapping, station pairing, and configuration management.
 */

import { KDSBootstrapResponse, KDSStation } from '../types/kds';
import { getStationToken } from './stationDeviceService';

const API_BASE = '/api/kds';

class KDSApiService {
    private getHeaders() {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        const token = getStationToken();
        if (token) {
            headers['X-KDS-Station-Token'] = token;
        }
        return headers;
    }

    /**
     * Requirement 10.1: Bootstrap / Config
     * Fetches the initial state for the KDS station.
     */
    async bootstrap(stationId?: string): Promise<KDSBootstrapResponse> {
        const url = stationId ? `${API_BASE}/bootstrap?station_id=${stationId}` : `${API_BASE}/bootstrap`;
        const response = await fetch(url, { headers: this.getHeaders() });
        if (!response.ok) throw new Error('Failed to bootstrap KDS');
        return response.json();
    }

    /**
     * Requirement 10.2: Station Pairing
     * Pairs a physical device with a KDS station using a code.
     */
    async pairStation(pairingCode: string, deviceFingerprint: string): Promise<{ station_token: string }> {
        const response = await fetch(`${API_BASE}/stations/pair`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ pairing_code: pairingCode, device_fingerprint: deviceFingerprint }),
        });
        if (!response.ok) throw new Error('Failed to pair station');
        return response.json();
    }

    /**
     * Unpairs a station. Requires KDS.STATION_CONFIG permission.
     */
    async unpairStation(stationId: string): Promise<void> {
        const response = await fetch(`${API_BASE}/stations/unpair`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ station_id: stationId }),
        });
        if (!response.ok) throw new Error('Failed to unpair station');
    }

    /**
     * Updates station configuration (Routing, Sounds, etc.)
     */
    async updateStationConfig(stationId: string, config: Partial<KDSStation>): Promise<void> {
        const response = await fetch(`${API_BASE}/stations/${stationId}/config`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(config),
        });
        if (!response.ok) throw new Error('Failed to update station config');
    }
}

export const kdsApiService = new KDSApiService();
