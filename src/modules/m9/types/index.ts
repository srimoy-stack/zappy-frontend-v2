/**
 * M9 Module Types
 */



export interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
    preset?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'custom';
}

export * from './employees';
