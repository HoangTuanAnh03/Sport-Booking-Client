export interface LocalTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface Images {
  thumbnail?: string;
  avatar?: string;
}

export type VenueStatus =
  | "PENDING"
  | "ENABLE"
  | "UNABLE"
  | "LOCK"
  | "UNPAID"
  | "DELETED"
  | "REJECTED";

export interface VenueResponse {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  openTime?: LocalTime;
  closeTime?: LocalTime;
  status: VenueStatus;
  rating?: number;
  totalReviews?: number;
  distance?: number;
  images?: Images;
}

export interface VenueAdminResponse {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  status: VenueStatus;
  avatar?: string;
  isPaid: boolean;
}

export interface CreateVenueRequest {
  name: string;
  address: string;
  phoneNumber: string;
  bankName: string;
  bankNumber: string;
  bankHolderName: string;
}

export interface UpdateVenueRequest {
  name: string;
  address: string;
  phoneNumber: string;
  bankName: string;
  bankNumber: string;
  bankHolderName: string;
}

export interface UpdateVenueStatusRequest {
  id: number;
  status: VenueStatus;
}

// Response for single venue operations
export interface VenueSingleResponse {
  code: number;
  data: VenueResponse;
}

// Response for paginated venue list (admin search)
export interface VenueAdminPaginatedResponse {
  content: VenueAdminResponse[];
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

// For general venue listing (non-admin)
export interface VenueListResponse {
  code: number;
  data: VenueResponse[];
}

// Query parameters for venue admin search
export interface VenueAdminSearchParams {
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
  search?: string;
  types?: number[];
  isPaid?: boolean;
  status?: VenueStatus;
}
