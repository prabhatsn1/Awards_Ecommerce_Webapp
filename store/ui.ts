"use client";

import { create } from "zustand";

interface UIStore {
  isCartOpen: boolean;
  isMobileNavOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isCartOpen: false,
  isMobileNavOpen: false,

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
}));
