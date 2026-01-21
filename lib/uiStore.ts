// ==================================================
// UI 상태 관리 스토어
// ==================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  sitesCollapsed: boolean;
  toggleSidebar: () => void;
  toggleSites: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSitesCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sitesCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleSites: () => set((state) => ({ sitesCollapsed: !state.sitesCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSitesCollapsed: (collapsed) => set({ sitesCollapsed: collapsed }),
    }),
    {
      name: 'cubeos-ui-state',
    }
  )
);
