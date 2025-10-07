"use client";
import userApiRequest from "@/apiRequests/users";
import {
  decodeJWT,
  getAccessTokenFormLocalStorage,
  removeTokenFormLocalStorage,
} from "@/lib/utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { useEffect, useRef } from "react";
import { create } from "zustand";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

type AppStoreType = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isAuth: boolean;
  name: string;
  setName: (name?: string | undefined) => void;
  avatarUrl: string | null;
  setImage: (image: string) => void;
  email: string | null;
  setEmail: (email: string | null) => void;
};

export const useAppStore = create<AppStoreType>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  isAuth: false,
  name: "",
  setName: (name?: string | undefined) => {
    set({ name: name, isAuth: Boolean(name) });
    if (!name) {
      removeTokenFormLocalStorage();
    }
  },
  avatarUrl: null,
  setImage: (image) => set({ avatarUrl: image }),
  email: null,
  setEmail: (email: string | null) => set({ email: email }),
}));

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const count = useRef(0);

  useEffect(() => {
    // get sidebar_state from cookie and set to zustand
    const sidebar_state = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sidebar_state="))
      ?.split("=")[1];
    if (sidebar_state) {
      useAppStore.setState({ sidebarOpen: sidebar_state === "true" });
    }
    const accessToken = getAccessTokenFormLocalStorage();
    if (count.current === 0 && accessToken) {
      const initializeApp = async () => {
        try {
          const res = await userApiRequest.sMyInfo();

          if (res.status === 200) {
            const { name, avatarUrl, email } = res.payload?.data!;
            useAppStore.setState({ name, avatarUrl, email });
          } else {
            removeTokenFormLocalStorage();
            window.location.href = `/logout?accessToken=${accessToken}`;
          }
        } catch (error) {
          removeTokenFormLocalStorage();
          window.location.href = `/logout?accessToken=${accessToken}`;
        }

        count.current++;
      };

      initializeApp();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
