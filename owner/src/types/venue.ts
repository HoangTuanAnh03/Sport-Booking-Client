export interface Service {
  id: number;
  name: string;
  price: number;
  units: string;
  isAvailable: boolean;
  categoryId: number; // Make it required since we're ensuring it's always provided
}

export interface Category {
  id: number;
  name: string;
  numberOfServices: number;
  services: Service[];
}

export interface VenueImage {
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  id: number;
  url: string;
  type: "DEFAULT" | "THUMBNAIL" | "AVATAR";
}

export interface VenueDetail {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  status:
    | "PENDING"
    | "REJECTED"
    | "ENABLE"
    | "UNABLE"
    | "LOCK"
    | "UNPAID"
    | "DELETED";
  bankName: string;
  bankNumber: string;
  bankHolderName: string;
  categories: Category[];
  images: VenueImage[];
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
  status:
    | "PENDING"
    | "REJECTED"
    | "ENABLE"
    | "UNABLE"
    | "LOCK"
    | "UNPAID"
    | "DELETED";
}

export interface Venue {
  id: number;
  name: string;
}

export interface VenueResponse {
  code: number;
  data: Venue[];
}

export interface VenueDetailResponse {
  code: number;
  data: VenueDetail;
}

export interface UpdateVenueResponse {
  code: number;
  data: VenueDetail;
}

export interface UpdateVenueStatusResponse {
  code: number;
  data?: any;
}
