export type ReportType =
    | 'DAILY_SALES'
    | 'SALES_BY_CHANNEL'
    | 'TOP_SELLING_ITEMS'
    | 'DISCOUNTS'
    | 'TAXES'
    | 'PREP_TIME'
    | 'CASH_VARIANCE';

export interface ReportConfig {
    id: ReportType;
    title: string;
    description: string;
    path: string;
}

export interface ReportFilterState {
    startDate: string | null;
    endDate: string | null;
    storeId?: string;
    channel?: string[];
    itemId?: string;
}

export interface ReportTableColumn {
    key: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    format?: (value: any) => string;
}
