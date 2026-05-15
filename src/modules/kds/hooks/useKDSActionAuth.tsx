'use client';

import { useState, useCallback, ReactNode } from 'react';
import { useKDSAccessStore } from '../store/kdsAccessStore';
import { getActionToken } from '../services/pinAuthService';
import { PinAuthModal } from '../components/security/PinAuthModal';

export interface UseKDSActionAuthReturn {
    /**
     * Executes an action with PIN authentication if the action is sensitive.
     * @param actionLabel The label used in the PIN modal (e.g. "Void Order").
     * @param callback The function to execute after authentication.
     */
    requireAuth: (actionLabel: string, callback: () => void) => void;
    AuthModalElement: ReactNode;
}

export const useKDSActionAuth = (): UseKDSActionAuthReturn => {
    // Only enforce PIN if in station mode (shared device)
    const isStationMode = useKDSAccessStore(state => state.isStationMode);

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        label: string;
        onSuccess: (() => void) | null;
    }>({
        isOpen: false,
        label: '',
        onSuccess: null
    });

    const requireAuth = useCallback((actionLabel: string, callback: () => void) => {
        // 1. If not station mode, execute immediately
        if (!isStationMode) {
            callback();
            return;
        }

        // 2. Check for valid, non-expired action token
        const token = getActionToken();
        if (token) {
            callback();
            return;
        }

        // 3. Otherwise, show PIN modal and queue the action
        setModalState({
            isOpen: true,
            label: actionLabel,
            onSuccess: callback
        });
    }, [isStationMode]);

    const handleClose = () => {
        setModalState(prev => ({ ...prev, isOpen: false, onSuccess: null }));
    };

    const handleSuccess = () => {
        const callback = modalState.onSuccess;
        setModalState({ isOpen: false, label: '', onSuccess: null });
        if (callback) callback();
    };

    const AuthModalElement: ReactNode = (
        <PinAuthModal
            isOpen={modalState.isOpen}
            onClose={handleClose}
            onSuccess={handleSuccess}
            actionLabel={modalState.label}
        />
    );

    return {
        requireAuth,
        AuthModalElement
    };
};
