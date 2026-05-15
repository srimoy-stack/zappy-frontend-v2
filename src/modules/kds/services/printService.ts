/**
 * printService.ts
 *
 * Hardware print integration service for KDS.
 *
 * Architecture:
 *   - `printerReady` flag simulates hardware SDK readiness check.
 *   - `setPrinterReady(bool)` is called by the hardware SDK layer once the
 *     driver/connection is confirmed (e.g. ESC/POS over USB, Star Micronics SDK,
 *     Epson ePOS, etc.). Until then all print calls return a user-friendly error.
 *   - `printOrder(orderId)` is the single public entry point for all KDS callers.
 *   - Returns a typed `PrintResult` so callers can inspect success/failure
 *     without catching exceptions.
 *
 * Production wiring:
 *   1. Import and call `setPrinterReady(true)` after your hardware SDK connects.
 *   2. Replace the body of `_executePrint()` with your actual SDK call.
 *      e.g. `await StarPrinterSDK.print(buildReceiptData(order));`
 */

import { KDSOrder, KDSStation } from '../types/kds';
import { emitEvent } from './kdsEventDispatcher';
import { getItemStation } from '../utils/routingUtils';


// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

export type PrintStatus = 'SUCCESS' | 'ERROR_PRINTER_NOT_READY' | 'ERROR_ORDER_NOT_FOUND' | 'ERROR_HARDWARE';

export interface PrintResult {
    status: PrintStatus;
    orderId: string;
    orderNumber: string;
    message: string;
    /** ISO timestamp of the attempt */
    attemptedAt: string;
    /** For STATION_ONLY printing, shows which items were actually printed */
    printedItems?: string[];
}

export interface PrintOptions {
    station_print_mode: 'PRINT_BY_STATION' | 'PRINT_FULL_ORDER';
    selectedStationId: string | 'ALL';
    enable_station_routing: boolean;
    kds_stations: KDSStation[];
    item_station_map: Record<string, string>;
    allow_item_station_override: boolean;
}


// ─────────────────────────────────────────────────────────────────────────────
//  Internal State
// ─────────────────────────────────────────────────────────────────────────────

let _printerReady = false;

// Callback registered by the UI layer to display a toast/error banner
let _errorCallback: ((message: string) => void) | null = null;

// ─────────────────────────────────────────────────────────────────────────────
//  Configuration API (called by hardware SDK layer / providers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Called by the hardware SDK once the printer connection is confirmed.
 * Also called with `false` if the printer disconnects or errors.
 */
export function setPrinterReady(ready: boolean): void {
    _printerReady = ready;
    console.info(
        `[PrintService] Printer status updated → ${ready ? '✅ READY' : '❌ NOT READY'}`
    );
}

/**
 * Returns the current hardware readiness flag.
 * UI components can use this to conditionally disable/style the Print button.
 */
export function isPrinterReady(): boolean {
    return _printerReady;
}

/**
 * Register a UI callback to be invoked when a print error occurs.
 * The KDS layout should call this once on mount:
 *   `printService.onPrintError((msg) => showToast(msg, 'error'));`
 */
export function onPrintError(callback: (message: string) => void): void {
    _errorCallback = callback;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Print Execution (placeholder for real hardware SDK)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Placeholder hardware SDK call.
 * Replace this implementation when integrating a real receipt printer.
 *
 * @example Star Micronics SDK (future):
 *   const port = await StarDeviceDiscoveryManager.discoverDevices();
 *   await port.open();
 *   await port.getPrinterStatus();
 *   const commands = buildESCPOSReceipt(order);
 *   await port.print(commands);
 */
async function _executePrint(order: KDSOrder, options?: PrintOptions): Promise<string[]> {
    // Determine which items to print based on station routing
    let itemsToPrint = order.items;

    if (options?.station_print_mode === 'PRINT_BY_STATION' && options.selectedStationId !== 'ALL' && options.enable_station_routing) {
        itemsToPrint = order.items.filter(item => {
            const itemStationId = getItemStation(item, {
                enable_station_routing: options.enable_station_routing,
                selectedStationId: options.selectedStationId,
                kds_stations: options.kds_stations,
                allow_item_station_override: options.allow_item_station_override,
                item_station_map: options.item_station_map,
                master_screen_view_mode: 'STATION_ONLY' // In PRINT_BY_STATION we only want this station's items
            });
            return itemStationId === options.selectedStationId;
        });
    }


    // ⚠️  PLACEHOLDER — Hardware SDK not integrated
    // Simulates a ~300ms print spool delay
    await new Promise(r => setTimeout(r, 300));

    console.log('[PrintService] 🖨 Sending to printer (placeholder):', {
        orderNumber: order.orderNumber,
        items: itemsToPrint.map(i => i.name),
        fulfillment: order.fulfillment_type,
        source: order.order_source,
        stage: order.stage,
        printedAt: new Date().toISOString(),
        mode: options?.station_print_mode || 'DEFAULT'
    });

    return itemsToPrint.map(i => i.name);

    // TODO: Replace with actual SDK call:
    // await HardwareSDK.print(buildReceiptPayload(order, itemsToPrint));
}

// ─────────────────────────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main entry point for printing an order from the KDS.
 *
 * @param orderId  - The internal KDS order ID
 * @param getOrder - Resolver function to fetch the order (avoids importing the store here)
 *
 * @returns `PrintResult` describing outcome — never throws.
 */
export async function printOrder(
    orderId: string,
    getOrder: (id: string) => KDSOrder | undefined,
    options?: PrintOptions
): Promise<PrintResult> {
    const now = new Date().toISOString();

    // ── 1. Resolve order ──────────────────────────────────────────────────────
    const order = getOrder(orderId);
    if (!order) {
        const result: PrintResult = {
            status: 'ERROR_ORDER_NOT_FOUND',
            orderId,
            orderNumber: '??',
            message: `Order ${orderId} not found in KDS store.`,
            attemptedAt: now
        };
        console.error('[PrintService]', result.message);
        _errorCallback?.(result.message);
        return result;
    }

    // ── 2. Hardware readiness check ───────────────────────────────────────────
    if (!_printerReady) {
        const result: PrintResult = {
            status: 'ERROR_PRINTER_NOT_READY',
            orderId,
            orderNumber: order.orderNumber,
            message: 'Printer not ready. Check connection and retry.',
            attemptedAt: now
        };
        console.warn('[PrintService]', result.message);
        _errorCallback?.(result.message);

        emitEvent('printer.not_ready', { orderId, orderNumber: order.orderNumber }, {
            idempotencyKey: `print-fail-${orderId}-${now}`
        });

        return result;
    }

    // ── 3. Execute print ──────────────────────────────────────────────────────
    try {
        const printedItems = await _executePrint(order, options);

        const result: PrintResult = {
            status: 'SUCCESS',
            orderId,
            orderNumber: order.orderNumber,
            message: `Receipt printed for order #${order.orderNumber}.`,
            attemptedAt: now,
            printedItems
        };

        emitEvent('printer.receipt_printed', {
            orderId,
            orderNumber: order.orderNumber,
            stage: order.stage,
            fulfillmentType: order.fulfillment_type
        }, {
            idempotencyKey: `print-ok-${orderId}-${now}`
        });

        console.log('[PrintService] ✅', result.message);
        return result;

    } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Unknown hardware error';
        const result: PrintResult = {
            status: 'ERROR_HARDWARE',
            orderId,
            orderNumber: order.orderNumber,
            message: `Print failed: ${errMsg}`,
            attemptedAt: now
        };
        console.error('[PrintService] ❌', result.message, err);
        _errorCallback?.(result.message);
        return result;
    }
}
