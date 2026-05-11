'use client';

/**
 * ModuleContext — Dynamic module entitlement management.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ModuleContextValue {
    enabledModules: string[];
    isModuleEnabled: (moduleId: string) => boolean;
    setEnabledModules: (modules: string[]) => void;
}

const ModuleContext = createContext<ModuleContextValue>({
    enabledModules: [],
    isModuleEnabled: () => false,
    setEnabledModules: () => {},
});

export function ModuleProvider({ children }: { children: ReactNode }) {
    const [enabledModules, setEnabledModulesState] = useState<string[]>([]);

    const isModuleEnabled = useCallback(
        (moduleId: string) => enabledModules.includes(moduleId),
        [enabledModules]
    );

    const setEnabledModules = useCallback((modules: string[]) => {
        setEnabledModulesState(modules);
    }, []);

    return (
        <ModuleContext.Provider value={{ enabledModules, isModuleEnabled, setEnabledModules }}>
            {children}
        </ModuleContext.Provider>
    );
}

export function useModules() {
    return useContext(ModuleContext);
}

export { ModuleContext };
