export function isKDSModuleActive(enabledModules: string[] | any) {
    if (Array.isArray(enabledModules)) {
        return enabledModules.includes('kds');
    }
    return enabledModules?.module1A === true;
}

export function isMessagingModuleActive(enabledModules: string[] | any) {
    if (Array.isArray(enabledModules)) {
        return enabledModules.includes('messaging');
    }
    return enabledModules?.module4 === true;
}
