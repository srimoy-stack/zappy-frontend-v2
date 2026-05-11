/**
 * Adapter Factory — Selects active adapter based on env config
 *
 * Import this everywhere you need API access:
 *   import { api } from '@/shared/api/adapters';
 */

import { env } from '@/shared/config/env';
import type { ApiAdapter } from './adapter.interface';
import { mockAdapter } from './mock.adapter';
import { httpAdapter } from './http.adapter';

export const api: ApiAdapter = env.apiMode === 'live' ? httpAdapter : mockAdapter;

export type { ApiAdapter } from './adapter.interface';
