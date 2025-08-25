"use client";
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
  isAuth: boolean;
};

export const useAppStore = create<AppStoreType>((set) => ({
  isAuth: false,
}));

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const count = useRef(0);

  useEffect(() => {
    if (count.current === 0) {
      const accessToken = getAccessTokenFormLocalStorage();
      // if (accessToken) {
      //   const role = decodeJWT(accessToken).scope;
      // }
      count.current++;
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
