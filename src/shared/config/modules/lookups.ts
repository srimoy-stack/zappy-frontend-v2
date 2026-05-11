/**
 * Module Lookups — Precomputed O(1) Access Maps
 *
 * All maps are built ONCE at module import time.
 * Zero recursive computation per render cycle.
 * Sidebar rendering, route resolution, and entitlement checks are all O(1).
 */

import type { RegistryNode } from './types';
import { MODULE_REGISTRY } from './registry';

// ─── Precomputed Maps ────────────────────────────────────────────────────────

/** O(1) node lookup by ID */
const NODE_MAP = new Map<string, RegistryNode>();

/** Parent ID → direct child IDs */
const CHILDREN_MAP = new Map<string, string[]>();

/** Node ID → all descendant IDs (recursive) */
const DESCENDANTS_MAP = new Map<string, string[]>();

/** Node ID → all ancestor IDs (root first) */
const ANCESTORS_MAP = new Map<string, string[]>();

/** Route path → RegistryNode (for route guards) */
const ROUTE_TO_NODE = new Map<string, RegistryNode>();

/** Root module nodes only */
const MODULE_NODES: RegistryNode[] = [];

/** Core module IDs that cannot be disabled */
const CORE_MODULE_IDS: string[] = [];

/** Protected paths that can never be disabled */
const PROTECTED_PATHS: string[] = [];

// ─── Build Phase (runs once at import) ───────────────────────────────────────

function buildLookups(): void {
    // Pass 1: Index all nodes
    for (const node of MODULE_REGISTRY) {
        NODE_MAP.set(node.id, node);

        if (node.level === 'module') {
            MODULE_NODES.push(node);
            if (node.isCore) CORE_MODULE_IDS.push(node.id);
        }

        if (node.isProtected) PROTECTED_PATHS.push(node.entitlementKey);

        if (node.route) {
            ROUTE_TO_NODE.set(node.route, node);
        }
    }

    // Pass 2: Build children map
    for (const node of MODULE_REGISTRY) {
        const parentId = node.parentId;
        if (parentId !== null) {
            const existing = CHILDREN_MAP.get(parentId) || [];
            existing.push(node.id);
            CHILDREN_MAP.set(parentId, existing);
        }
    }

    // Pass 3: Build descendants (BFS from each module root)
    for (const mod of MODULE_NODES) {
        const descendants: string[] = [];
        const queue = [mod.id];
        while (queue.length > 0) {
            const current = queue.shift()!;
            const children = CHILDREN_MAP.get(current) || [];
            for (const childId of children) {
                descendants.push(childId);
                queue.push(childId);
            }
        }
        DESCENDANTS_MAP.set(mod.id, descendants);

        // Also compute for submodules
        for (const descId of descendants) {
            const subDescendants: string[] = [];
            const subQueue = [descId];
            while (subQueue.length > 0) {
                const current = subQueue.shift()!;
                const children = CHILDREN_MAP.get(current) || [];
                for (const childId of children) {
                    subDescendants.push(childId);
                    subQueue.push(childId);
                }
            }
            if (subDescendants.length > 0) {
                DESCENDANTS_MAP.set(descId, subDescendants);
            }
        }
    }

    // Pass 4: Build ancestors
    for (const node of MODULE_REGISTRY) {
        const ancestors: string[] = [];
        let currentId = node.parentId;
        while (currentId) {
            ancestors.unshift(currentId);
            const parent = NODE_MAP.get(currentId);
            currentId = parent?.parentId || null;
        }
        if (ancestors.length > 0) {
            ANCESTORS_MAP.set(node.id, ancestors);
        }
    }
}

buildLookups();

// ─── Public Accessors ────────────────────────────────────────────────────────

/** Get a single node by ID — O(1) */
export const getNode = (id: string): RegistryNode | undefined => NODE_MAP.get(id);

/** Get direct child IDs of a node — O(1) */
export const getChildren = (id: string): string[] => CHILDREN_MAP.get(id) || [];

/** Get all descendant IDs of a node — O(1) */
export const getDescendants = (id: string): string[] => DESCENDANTS_MAP.get(id) || [];

/** Get all ancestor IDs of a node (root first) — O(1) */
export const getAncestors = (id: string): string[] => ANCESTORS_MAP.get(id) || [];

/** Find the registry node that owns a given route — O(1) */
export const findNodeByRoute = (route: string): RegistryNode | undefined => ROUTE_TO_NODE.get(route);

/** Get all root-level module nodes */
export const getModuleNodes = (): RegistryNode[] => MODULE_NODES;

/** Get core module IDs (always enabled) */
export const getCoreModuleIds = (): string[] => CORE_MODULE_IDS;

/** Get protected paths (can never be disabled) */
export const getProtectedPaths = (): string[] => PROTECTED_PATHS;

/** Check if a path is protected */
export const isProtectedPath = (path: string): boolean => PROTECTED_PATHS.includes(path);

/** Get sidebar-visible nodes filtered by route prefix */
export const getSidebarNodes = (routePrefix: string): RegistryNode[] => {
    return MODULE_REGISTRY.filter(
        (n) => n.showInSidebar && n.routePrefix === routePrefix
    ).sort((a, b) => a.sortOrder - b.sortOrder);
};

/** Get all nodes for a specific module */
export const getModuleTree = (moduleKey: string): RegistryNode[] => {
    return MODULE_REGISTRY.filter((n) => n.moduleKey === moduleKey);
};

/** Total node count (for diagnostics) */
export const getRegistrySize = (): number => MODULE_REGISTRY.length;
