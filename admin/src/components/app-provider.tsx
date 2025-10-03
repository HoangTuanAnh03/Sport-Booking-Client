"use client";
import userApiRequest from "@/apiRequests/users";
import {
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
  isAuth: boolean;
  name: string;
  setName: (name?: string | undefined) => void;
  avatarUrl: string | null;
  setImage: (image: string) => void;
  email: string | null;
  setEmail: (email: string | null) => void;
};

export const useAppStore = create<AppStoreType>((set) => ({
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
    const accessToken = getAccessTokenFormLocalStorage();
    if (count.current === 0 && accessToken) {
      const initializeApp = async () => {
        try {
          const res = await userApiRequest.sMyInfo();
          if (res.status === 200) {
            const { name, avatarUrl, email } = res.payload.data!;
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
