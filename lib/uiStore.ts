// ==================================================
// UI 상태 관리 스토어
// ==================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  sitesCollapsed: boolean;
  favoriteFarms: string[];
  favoriteSites: string[];
  siteOrder: Record<string, Record<string, string[]>>; // farmId -> stype -> siteIds
  toggleSidebar: () => void;
  toggleSites: () => void;
  toggleFavoriteFarm: (farm: string) => void;
  toggleFavoriteSite: (siteId: string) => void;
  setSiteOrder: (farmId: string, stype: string, siteIds: string[]) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSitesCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sitesCollapsed: false,
      favoriteFarms: [],
      favoriteSites: [],
      siteOrder: {},
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleSites: () => set((state) => ({ sitesCollapsed: !state.sitesCollapsed })),
      toggleFavoriteFarm: (farm) =>
        set((state) => ({
          favoriteFarms: state.favoriteFarms.includes(farm)
            ? state.favoriteFarms.filter((f) => f !== farm)
            : [...state.favoriteFarms, farm],
        })),
      toggleFavoriteSite: (siteId) =>
        set((state) => ({
          favoriteSites: state.favoriteSites.includes(siteId)
            ? state.favoriteSites.filter((s) => s !== siteId)
            : [...state.favoriteSites, siteId],
        })),
      setSiteOrder: (farmId, stype, siteIds) =>
        set((state) => ({
          siteOrder: {
            ...state.siteOrder,
            [farmId]: {
              ...state.siteOrder[farmId],
              [stype]: siteIds,
            },
          },
        })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSitesCollapsed: (collapsed) => set({ sitesCollapsed: collapsed }),
    }),
    {
      name: 'cubeos-ui-state',
    }
  )
);
