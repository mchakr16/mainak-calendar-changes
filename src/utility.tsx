
import { ViewType } from "./react-schedule";

/**
 * Filter resources based on dropdown selection and return related resources.
 */
const getResourcesBasedOnSelection = (resources, selectedId) => {
    // Find the selected object
    const selectedObj = resources.find(item => item.id === selectedId);
    if (!selectedObj) return [];

    let result: any[] = [];

    // If selected object has a parentId, add parent first
    if (selectedObj.parentId) {
        const parentObj = resources.find(item => item.id === selectedObj.parentId);
        if (parentObj) {
            result.push(parentObj);
        }
    }

    // Add the selected object
    result.push(selectedObj);

    // If selected object is a parent (no parentId), add all its children
    if (!selectedObj.parentId) {
        const children = resources.filter(item => item.parentId === selectedObj.id);
        result = result.concat(children);
    }

    return result;
}
/**
 * Transform resources data into a tree structure for Ant Design TreeSelect component.
 *
 * @function transformResourceDataTreeStructure
 * @description
 * This function creates a hierarchical tree structure from a flat list of resources.
 * It separates parent and child resources and organizes them into a format compatible
 * with Ant Design's TreeSelect component.
 *
 * @param {Array} resources - The list of all resources fetched from Mendix.
 * @returns {Array} treeData - The tree structure for TreeSelect dropdown.
 *
 * @notes
 * - Called from a React application.
 * - Adds an "ALL" option manually at the top of the tree.
 */


const transformResourceDataTreeStucture = (resources: any) => {
    // Separate parents and children
    const parents = resources.filter(item => !item.parentId);
    const children = resources.filter(item => item.parentId);

    // Build the tree structure
    const treeData = parents.map((parent) => {
        return {
            value: parent.id,
            title: parent.name,
            id: parent.id,
            key: parent.id,
            children: children
                .filter(child => child.parentId === parent.id)
                .map((child) => ({
                    value: child.id,
                    title: child.name,
                    id: child.id,
                    key: child.id
                }))
        };
    });
    // Pushing All Option Manually in List
    treeData.unshift({
        value: 'All',
        title: 'ALL',
        id: '1234',
        key: 'All'
    })
    return treeData;
}

const generateShiftSlots = (shiftCount, dayStartFrom) => {
    const slots: any = [];
    const totalHours = 24;
    const slotHours = totalHours / shiftCount;

    let currentStart = dayStartFrom;

    for (let i = 0; i < shiftCount; i++) {
        const startHour = currentStart % 24;
        const endHour = (startHour + slotHours) % 24;

        const to12 = (h: number) => {
            const mod = ((h % 24) + 24) % 24;
            const hour12 = mod % 12 === 0 ? 12 : mod % 12;
            const suffix = mod < 12 ? 'am' : 'pm';
            return `${hour12}${suffix}`;
        };

        const pad = (h) => (h < 10 ? `0${h}` : `${h}`);
        slots.push({
            start: `${pad(startHour)}:00`,
            end: `${pad(endHour)}:00`,
            label: `${to12(startHour)}-${to12(endHour)}`
        });
        currentStart = (currentStart + slotHours) % 24;
    }
    return slots;
}

const formatShiftSlots = (mxShift) => {
    if (!mxShift.length) return [];

    const formatTime = (date: Date) => date.toISOString().substring(11, 16);
    const sorted = [...mxShift].sort((a, b) => new Date(a.StartTime).getTime() - new Date(b.StartTime).getTime());
    const slots: any[] = [];

    const DAY_MINUTES = 24 * 60;

    const toMinutes = (date: Date) => date.getUTCHours() * 60 + date.getUTCMinutes();

    for (let i = 0; i < sorted.length; i++) {
        const shift = sorted[i];
        const start = new Date(shift.StartTime);
        const end = new Date(shift.EndTime);

        slots.push({ start: formatTime(start), end: formatTime(end), name: shift.Name, StartTime: start, EndTime: end });

        const nextShift = sorted[(i + 1) % sorted.length];
        const nextStart = new Date(nextShift.StartTime);

        let gapStartMin = toMinutes(end);
        let gapEndMin = toMinutes(nextStart);

        if (gapEndMin <= gapStartMin) gapEndMin += DAY_MINUTES;

        if (gapEndMin > gapStartMin) {
            const gapStart = new Date(end);
            const gapEnd = new Date(end);
            gapEnd.setUTCMinutes(gapEnd.getUTCMinutes() + (gapEndMin - gapStartMin));

            if (formatTime(gapStart) !== formatTime(gapEnd)) {
                slots.push({ start: formatTime(gapStart), end: formatTime(gapEnd), name: '' });
            }
        }
    }

    slots.sort((a, b) => {
        const [aH, aM] = a.start.split(':').map(Number);
        const [bH, bM] = b.start.split(':').map(Number);
        return aH * 60 + aM - (bH * 60 + bM);
    });

    return slots;
};

interface Resource {
    id: string;
    name: string;
    parentId?: string;
}

const getResourcesBasedOnMultiSelection = (resources: Resource[], inputIds: string[]): Resource[] => {
    // Explicitly type the map
    const resourceMap: Map<string, Resource> = new Map(resources.map(r => [r.id, r]));

    const addedIds: Set<string> = new Set();
    const result: Resource[] = [];

    for (const id of inputIds) {
        const item = resourceMap.get(id);
        if (!item) continue;

        // Add parent if exists and not already added
        if (item.parentId && !addedIds.has(item.parentId)) {
            const parent = resourceMap.get(item.parentId);
            if (parent) {
                result.push(parent);
                addedIds.add(item.parentId);
            }
        }

        // Add the item itself if not already added
        if (!addedIds.has(item.id)) {
            result.push(item);
            addedIds.add(item.id);
        }
    }

    return result;
}


const formatMendixValue = (obj: any) => {
    const result = { ...obj };
    for (const key in result) {
        const val = result[key];
        if (typeof val === "string") {
            result[key] = val.replace(/[^a-zA-Z\s]/g, "").trim();
        }
    }
    return result;
}

const setActiveView = (ref, value, viewTypes) => {
    const view = value.DefaultSchedulerView;
    const updated = { ...ref };

    for (const v of viewTypes) {
        (updated as any)[v] = v === view;
    }

    return updated;
}

const getExpandCollapseState = (view) => {
    switch (view) {
        case ViewType.Custom:
            return true;
        case ViewType.Week:
            return true;
        case ViewType.Month:
            return false;
        case ViewType.Quarter:
            return false;
        case ViewType.Year:
            return false;
        default:
            return false;
    }
}

export {
    getResourcesBasedOnSelection,
    transformResourceDataTreeStucture,
    generateShiftSlots,
    formatShiftSlots,
    formatMendixValue,
    setActiveView,
    getResourcesBasedOnMultiSelection,
    getExpandCollapseState
};