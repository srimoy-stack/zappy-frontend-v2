export const kioskApi = {
    identifyCustomer: async (id: string) => {
        // Mocking API call
        await new Promise(resolve => setTimeout(resolve, 800));

        // Simulating customer found
        if (id === '1234567890' || id === 'test@example.com') {
            return {
                exists: true,
                customer: {
                    id,
                    name: 'John Doe',
                    points: 450,
                    pastOrders: [
                        {
                            id: 'O1',
                            items: [
                                { productId: 'p1', name: 'Signature Pepperoni', quantity: 1, price: 15, finalTotal: 15, type: 'pizza' }
                            ]
                        }
                    ]
                }
            };
        }

        return { exists: false };
    },

    verifyOtp: async (id: string, otp: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`Verifying OTP for ${id}`);
        return otp === '1234';
    },

    getMenu: async () => {
        // Mock menu data
        return [
            {
                id: 'cat1',
                name: 'Signature Pizzas',
                items: [
                    { id: 'p1', name: 'Pepperoni Feast', price: 14.99, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500', categoryId: 'cat1', inventory: 10 },
                    { id: 'p2', name: 'Veggie Supreme', price: 13.99, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', categoryId: 'cat1', inventory: 5 },
                    { id: 'p3', name: 'Meat Lovers', price: 16.99, image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=500', categoryId: 'cat1', inventory: 0 }, // Sold out
                ]
            },
            {
                id: 'cat2',
                name: 'Build Your Own',
                items: [
                    { id: 'byo', name: 'Custom Pizza', price: 10.99, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500', categoryId: 'cat2', inventory: 100 },
                ]
            },
            {
                id: 'cat3',
                name: 'Sides',
                items: [
                    { id: 's1', name: 'Garlic Knots', price: 5.99, image: 'https://images.unsplash.com/photo-1626242491136-1c4636f1c7d2?w=500', categoryId: 'cat3', inventory: 20 },
                ]
            }
        ];
    }
};
