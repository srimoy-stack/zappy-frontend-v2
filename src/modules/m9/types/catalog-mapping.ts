export type MappingStatus = 'MAPPED' | 'UNMAPPED';
export type SyncStatus = 'PUBLISHED' | 'PENDING' | 'FAILED';
export type ExternalGroupType = 'PLACEMENT_TOPPING' | 'CHOICE_ONE' | 'QUANTITY_ONLY';

export interface CatalogItemMapping {
    id: string;
    zyappyItemId: string;
    zyappyItemName: string;
    externalItemId: string;
    externalItemName: string;
    status: SyncStatus;
    lastPublishedAt: string | null;
    mappingStatus: MappingStatus;
    suggestedMapping?: string; // ID of suggested external item
    confidenceScore?: number; // 0 to 1
}

export interface CatalogVariantMapping {
    id: string;
    zyappyVariantId: string;
    zyappyVariantName: string; // e.g. "Small"
    externalVariantId: string;
    externalVariantName: string;
    mappingStatus: MappingStatus;
    parentItemId: string; // Zyappy Item ID
}

export interface CatalogModifierGroupMapping {
    id: string;
    zyappyGroupId: string;
    zyappyGroupName: string;
    externalGroupId: string;
    externalGroupName: string;
    groupType: ExternalGroupType;
    mappingStatus: MappingStatus;
}

export interface CatalogModifierOptionMapping {
    id: string;
    zyappyOptionId: string;
    zyappyOptionName: string;
    externalOptionId: string;
    externalOptionName: string;
    mappingStatus: MappingStatus;
    parentGroupId: string; // Zyappy Group ID
}
