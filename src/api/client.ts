import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Base API client configuration
 * All API calls must include tenant_id and store_id
 */

export interface ApiConfig {
    baseUrl: string;
    tenantId: string;
    storeId: string;
}

export class ApiClient {
    protected axiosInstance: AxiosInstance;

    constructor(config: ApiConfig) {
        this.axiosInstance = axios.create({
            baseURL: config.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': config.tenantId,
                'X-Store-ID': config.storeId,
            },
        });
    }

    /**
     * Base request wrapper
     */
    protected async request<T>(
        config: AxiosRequestConfig
    ): Promise<T> {
        try {
            const response = await this.axiosInstance.request<T>(config);
            return response.data;
        } catch (error: any) {
            throw new Error(`API Error: ${error.message || 'Unknown Error'}`);
        }
    }

    protected async get<T>(endpoint: string): Promise<T> {
        return this.request<T>({ url: endpoint, method: 'GET' });
    }

    protected async post<T>(endpoint: string, data: unknown): Promise<T> {
        return this.request<T>({
            url: endpoint,
            method: 'POST',
            data: data,
        });
    }

    protected async put<T>(endpoint: string, data: unknown): Promise<T> {
        return this.request<T>({
            url: endpoint,
            method: 'PUT',
            data: data,
        });
    }

    protected async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>({ url: endpoint, method: 'DELETE' });
    }
}
