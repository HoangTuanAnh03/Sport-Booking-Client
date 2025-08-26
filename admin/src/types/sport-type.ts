export interface SportType {
  id: number;
  name: string;
  description?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSportTypeRequest {
  name: string;
  description?: string;
  venuePrice: number;
}

export interface UpdateSportTypeRequest {
  name: string;
  description?: string;
  venuePrice: number;
}

export interface SportTypeResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// Response for paginated list (following users API pattern)
export interface SportTypeListResponse {
  code: number;
  data: SportTypeResponse[];
}

// Response for single sport type
export interface SportTypeSingleResponse {
  code: number;
  data: SportTypeResponse;
}

// If the API returns paginated data like users, we might need this structure:
export interface SportTypePaginatedResponse {
  content: SportTypeResponse[];
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}
