export interface CreateServiceRequest {
  name: string;
  price: number;
  units: string;
  isAvailable: boolean;
  categoryId: number;
}

export interface UpdateServiceRequest {
  name: string;
  price: number;
  units: string;
  isAvailable: boolean;
  categoryId: number;
}

export interface ServiceResponse {
  id: number;
  name: string;
  price: number;
  units: string;
  isAvailable: boolean;
  categoryId: number;
}
