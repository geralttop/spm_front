"use client";

import { create } from "zustand";

interface ProfileStickyTitleState {
  title: string | null;
  isIdentityVisible: boolean;
  setTitle: (title: string | null) => void;
  setIdentityVisible: (visible: boolean) => void;
  reset: () => void;
}

export const useProfileStickyTitleStore = create<ProfileStickyTitleState>((set) => ({
  title: null,
  isIdentityVisible: true,
  setTitle: (title) => set({ title }),
  setIdentityVisible: (visible) => set({ isIdentityVisible: visible }),
  reset: () => set({ title: null, isIdentityVisible: true }),
}));
