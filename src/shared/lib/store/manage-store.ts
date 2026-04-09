"use client";
import { create } from "zustand";
import type { Point, Category, Container } from "@/shared/api";
interface ManageState {
    activeTab: 'points' | 'categories' | 'containers';
    setActiveTab: (tab: 'points' | 'categories' | 'containers') => void;
    points: Point[];
    pointsLoading: boolean;
    draggedPoint: Point | null;
    setPoints: (points: Point[]) => void;
    setPointsLoading: (loading: boolean) => void;
    setDraggedPoint: (point: Point | null) => void;
    categories: Category[];
    categoriesLoading: boolean;
    expandedCategories: Set<number>;
    editingCategory: Category | null;
    showCategoryForm: boolean;
    setCategories: (categories: Category[]) => void;
    setCategoriesLoading: (loading: boolean) => void;
    toggleCategoryExpand: (id: number) => void;
    setEditingCategory: (category: Category | null) => void;
    setShowCategoryForm: (show: boolean) => void;
    containers: Container[];
    containersLoading: boolean;
    expandedContainers: Set<string>;
    editingContainer: Container | null;
    showContainerForm: boolean;
    setContainers: (containers: Container[]) => void;
    setContainersLoading: (loading: boolean) => void;
    toggleContainerExpand: (id: string) => void;
    setEditingContainer: (container: Container | null) => void;
    setShowContainerForm: (show: boolean) => void;
    reset: () => void;
}
const initialState = {
    activeTab: 'points' as const,
    points: [],
    pointsLoading: false,
    draggedPoint: null,
    categories: [],
    categoriesLoading: false,
    expandedCategories: new Set<number>(),
    editingCategory: null,
    showCategoryForm: false,
    containers: [],
    containersLoading: false,
    expandedContainers: new Set<string>(),
    editingContainer: null,
    showContainerForm: false,
};
export const useManageStore = create<ManageState>((set, get) => ({
    ...initialState,
    setActiveTab: (tab) => set({ activeTab: tab }),
    setPoints: (points) => set({ points }),
    setPointsLoading: (loading) => set({ pointsLoading: loading }),
    setDraggedPoint: (point) => set({ draggedPoint: point }),
    setCategories: (categories) => set({ categories }),
    setCategoriesLoading: (loading) => set({ categoriesLoading: loading }),
    toggleCategoryExpand: (id) => {
        const { expandedCategories } = get();
        const newSet = new Set(expandedCategories);
        if (newSet.has(id)) {
            newSet.delete(id);
        }
        else {
            newSet.add(id);
        }
        set({ expandedCategories: newSet });
    },
    setEditingCategory: (category) => set({ editingCategory: category }),
    setShowCategoryForm: (show) => set({ showCategoryForm: show }),
    setContainers: (containers) => set({ containers }),
    setContainersLoading: (loading) => set({ containersLoading: loading }),
    toggleContainerExpand: (id) => {
        const { expandedContainers } = get();
        const newSet = new Set(expandedContainers);
        if (newSet.has(id)) {
            newSet.delete(id);
        }
        else {
            newSet.add(id);
        }
        set({ expandedContainers: newSet });
    },
    setEditingContainer: (container) => set({ editingContainer: container }),
    setShowContainerForm: (show) => set({ showContainerForm: show }),
    reset: () => set(initialState),
}));
