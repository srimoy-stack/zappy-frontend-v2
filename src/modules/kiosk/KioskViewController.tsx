'use client';

import { useMemo, useCallback } from 'react';
import { useKioskStore, type KioskScreen } from '@/store/kioskStore';

// Screen Components
import { IdentityScreen } from './screens/IdentityScreen';
import { RestaurantScreen } from './screens/RestaurantScreen';
import { MenuScreen } from './screens/MenuScreen';
import { ProductScreen } from './screens/ProductScreen';
import { BuilderScreen } from './screens/BuilderScreen';
import { CartScreen } from './screens/CartScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { PaymentScreen } from './screens/PaymentScreen';
import { StartScreen } from './screens/StartScreen';
import { SuccessScreen } from './screens/SuccessScreen';

/**
 * KioskViewController - The single-page application screen controller.
 * Renders only the active screen based on kioskStore.currentScreen.
 * Zero page reloads. Instant transitions. Pure in-memory state.
 */
export default function KioskViewController() {
    const currentScreen = useKioskStore(s => s.currentScreen);
    const screenParams = useKioskStore(s => s.screenParams);

    const renderScreen = useCallback((screen: KioskScreen) => {
        switch (screen) {
            case 'start':
                return <StartScreen />;
            case 'identity':
                return <IdentityScreen />;
            case 'restaurant':
                return <RestaurantScreen />;
            case 'menu':
                return <MenuScreen />;
            case 'product':
                return <ProductScreen productId={screenParams.productId as string} editIndex={screenParams.editIndex as number | undefined} />;
            case 'builder':
                return <BuilderScreen />;
            case 'cart':
                return <CartScreen />;
            case 'review':
                return <ReviewScreen />;
            case 'payment':
                return <PaymentScreen />;
            case 'success':
                return <SuccessScreen />;
            default:
                return <StartScreen />;
        }
    }, [screenParams]);

    // Memoize the rendered screen to prevent unnecessary re-renders
    const renderedScreen = useMemo(() => renderScreen(currentScreen), [currentScreen, renderScreen]);

    return (
        <div className="kiosk-screen-container">
            {renderedScreen}
        </div>
    );
}
