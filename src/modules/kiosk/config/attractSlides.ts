export type AttractSlide = {
    id: string;
    type: "image" | "video";
    mediaUrl: string;
    title: string;
    subtitle?: string;
    priceHighlight?: string;
    badge?: string;
};

export const ATTRACT_SLIDES: AttractSlide[] = [
    {
        id: "pepperoni-pizza",
        type: "image",
        mediaUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=1920&fit=crop",
        title: "The Ultimate Pepperoni",
        subtitle: "Triple pepperoni, double cheese, signature tomato sauce",
        priceHighlight: "$15.99",
        badge: "Bestseller",
    },
    {
        id: "family-combo",
        type: "image",
        mediaUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1200&h=1920&fit=crop",
        title: "Family Pack Feast",
        subtitle: "2 Large Pizzas, 10 Wings, 2L Drink + Dipping Sauces",
        priceHighlight: "$34.99",
        badge: "Best Value",
    },
    {
        id: "bogo-offer",
        type: "image",
        mediaUrl: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=1200&h=1920&fit=crop",
        title: "BOGO MONDAYS",
        subtitle: "Buy any large pizza and get the second one FREE",
        priceHighlight: "FREE",
        badge: "Limited Time",
    },
    {
        id: "game-night-wings",
        type: "image",
        mediaUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=1200&h=1920&fit=crop",
        title: "Game Night Wings",
        subtitle: "24 Jumbo Wings in 3 different sauces",
        priceHighlight: "$19.99",
        badge: "Spicy",
    },
    {
        id: "dessert-combo",
        type: "image",
        mediaUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&h=1920&fit=crop",
        title: "Sweet Finish",
        subtitle: "Choco Lava Cake + 2L Cola Combo",
        priceHighlight: "$8.99",
        badge: "Sweet Deal",
    }
];
