import { toast } from "@/hooks/use-toast";
import { EntityError } from "@/utils/api";
import { type ClassValue, clsx } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";
import authApiRequest from "@/apiRequests/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: "server",
        message: item.message,
      });
    });
  } else {
    toast({
      title: "Lỗi",
      description: error?.payload?.message ?? "Lỗi không xác định",
      variant: "destructive",
      duration: duration ?? 5000,
    });
  }
};
/**
 * Xóa đi ký tự `/` đầu tiên của path
 */
export const normalizePath = (path: string) => {
  return path.startsWith("/") ? path.slice(1) : path;
};

export const convertToDate = (time: string) => {
  const formattedInput = time.slice(0, 23);
  const date = new Date(formattedInput);

  return date;
};

const isClient = typeof window !== "undefined";

export const getAccessTokenFormLocalStorage = () => {
  return isClient ? localStorage.getItem("accessToken") : "";
};

export const getRefreshTokenFormLocalStorage = () => {
  return isClient ? localStorage.getItem("refreshToken") : "";
};

export const setAccessTokenFormLocalStorage = (accessToken: string) => {
  isClient && localStorage.setItem("accessToken", accessToken);
};

export const setRefreshTokenFormLocalStorage = (refreshToken: string) => {
  isClient && localStorage.setItem("refreshToken", refreshToken);
};

export const setVenueSearchedFormLocalStorage = (venueId: number) => {
  if (isClient) {
    const storedIds = JSON.parse(
      localStorage.getItem("venueIdSearched") || "[]"
    );

    if (!storedIds.includes(venueId)) {
      storedIds.push(venueId);
      localStorage.setItem("venueIdSearched", JSON.stringify(storedIds));
    }
  }
};

export const removeVenueSearchedFromLocalStorage = (venueId: number) => {
  if (isClient) {
    const storedIds = JSON.parse(
      localStorage.getItem("venueIdSearched") || "[]"
    );

    const updatedIds = storedIds.filter((id: number) => id !== venueId);
    if (updatedIds.length === 0) {
      localStorage.removeItem("venueIdSearched");
    } else {
      localStorage.setItem("venueIdSearched", JSON.stringify(updatedIds));
    }
  }
};

export const getVenueSearchedFormLocalStorage = () => {
  return (
    isClient && JSON.parse(localStorage.getItem("venueIdSearched") || "[]")
  );
};

export const removeTokenFormLocalStorage = () => {
  if (isClient) {
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
  }
};

export const formatTimeToHHMM = (time: string) => {
  if (!time) return "";
  return time.slice(0, 5); // Takes only HH:mm part
};

export const getLocation = () => {
  if (isClient) {
    const stored = localStorage.getItem("user_location");
    return stored
      ? JSON.parse(stored)
      : { lat: 21.003424077000034, lng: 105.84267282400003 };
  } else {
    return { lat: 21.003424077000034, lng: 105.84267282400003 };
  }
};

type PayloadJWT = {
  uid: string;
  sub: string;
  scope: string;
  iss: string;
  exp: number;
  iat: number;
  jti: string;
};

export const decodeJWT = (token: string) => {
  return jwt.decode(token) as PayloadJWT;
};

export const checkAndRefreshToken = async (param?: {
  onError?: () => void;
  onSuccess?: () => void;
}) => {
  const accessToken = getAccessTokenFormLocalStorage();
  const refreshToken = getRefreshTokenFormLocalStorage();
  if (!accessToken || !refreshToken) return;

  const decodedAccessToken = decodeJWT(accessToken);
  const decodedRefreshToken = decodeJWT(refreshToken);

  const now = Math.round(new Date().getTime() / 1000);

  // trường hợp  refreshToken hết hạn thì không sử lý
  if (decodedRefreshToken.exp <= now) {
    removeTokenFormLocalStorage();
    return param?.onError && param.onError();
  }

  // thời gian còn lại của accessToken: decodeAccessToken.exp - now
  // thời gian hết hạn của accessToken: decodedAccessToken.exp - decodedAccessToken.iat
  // Ví dụ thời gian sống của accessToken là 10s thì check còn < 2.5s thì gọi refreshToken
  if (
    decodedAccessToken.exp - now <
    (decodedAccessToken.exp - decodedAccessToken.iat) / 3
  ) {
    try {
      const { payload } = await authApiRequest.refreshToken();
      // const { , } = payload!;
      setAccessTokenFormLocalStorage(payload.data?.token!);
      setRefreshTokenFormLocalStorage(payload.data?.refresh_token!);
      param?.onSuccess && param.onSuccess();
    } catch (error) {
      param?.onError && param.onError();
    }
  }
};
