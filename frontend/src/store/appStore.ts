import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, Workspace } from '../types';

interface AppState {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  theme: Theme;
  workspaces: Workspace[];
  currentWorkspaceId: string;
  searchOpen: boolean;
  createTaskModalOpen: boolean;
  mobileDrawerOpen: 'left' | 'right' | null;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebar: (open: boolean) => void;
  setRightSidebar: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setCurrentWorkspace: (id: string) => void;
  addWorkspace: (name: string) => void;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setCreateTaskModalOpen: (open: boolean) => void;
  openCreateTaskModal: () => void;
  setMobileDrawer: (drawer: 'left' | 'right' | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      leftSidebarOpen: true,
      rightSidebarOpen: true,
      theme: 'dark',
      workspaces: [
        { id: 'personal', name: 'Personal', icon: '✦' },
        { id: 'work', name: 'Work', icon: '◆' },
      ],
      currentWorkspaceId: 'personal',
      searchOpen: false,
      createTaskModalOpen: false,
      mobileDrawerOpen: null,
      toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),
      toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),
      setLeftSidebar: (open) => set({ leftSidebarOpen: open }),
      setRightSidebar: (open) => set({ rightSidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),
      addWorkspace: (name) =>
        set((s) => ({
          workspaces: [...s.workspaces, { id: name.toLowerCase().replace(/\s+/g, '-'), name }],
        })),
      setSearchOpen: (open) => set({ searchOpen: open }),
      toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
      setCreateTaskModalOpen: (open) => set({ createTaskModalOpen: open }),
      openCreateTaskModal: () => set({ createTaskModalOpen: true }),
      setMobileDrawer: (drawer) => set({ mobileDrawerOpen: drawer }),
    }),

    {
      name: 'novanote-app',
      partialize: (s) => ({
        leftSidebarOpen: s.leftSidebarOpen,
        rightSidebarOpen: s.rightSidebarOpen,
        theme: s.theme,
        workspaces: s.workspaces,
        currentWorkspaceId: s.currentWorkspaceId,
      }),
    },
  ),
);
