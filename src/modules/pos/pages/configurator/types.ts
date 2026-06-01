export type Portion = 'WHOLE' | 'LEFT' | 'RIGHT';
export type Level = 'NORMAL' | 'EXTRA' | 'DOUBLE';
export type CategoryView = 'PRE_SELECTED' | 'SIZE_CRUST' | 'SAUCE_CHEESE' | 'TOPPINGS' | 'DIPS_DRINKS' | 'MOST_ORDERED';
export type PortionMode = 'SINGLE' | 'DOUBLE' | 'TRIPLE';

export interface ToppingSelection {
    optionId: string;
    name: string;
    basePrice: number;
    portion: Portion;
    level: Level;
}

export interface AddOnSelection {
    optionId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface PizzaConfig {
    productId: string;
    selectedVariants: Record<string, string>;
    selectedToppings: Record<string, ToppingSelection>;
    selectedSauce: string;
    selectedCheese: string;
    removedIngredients: Set<string>;
    kitchenNotes: string;
    portionMode: PortionMode;
    selectedPortion: Portion;
}

export interface SidebarCategory {
    id: CategoryView;
    label: string;
    icon: string;
    activeCount: number;
}
