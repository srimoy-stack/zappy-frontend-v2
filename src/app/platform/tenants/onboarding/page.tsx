'use client';

/**
 * Brand Onboarding Page — wired to the modular onboarding system.
 *
 * Replaced the 1400-line monolith with the decomposed module.
 */

import { OnboardingPage } from '@/modules/onboarding/pages/OnboardingPage';

export default function BrandOnboardingRoute() {
    return <OnboardingPage />;
}
