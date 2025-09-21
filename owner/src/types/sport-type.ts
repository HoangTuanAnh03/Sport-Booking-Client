export interface SportType {
  id: number;
  name: string;
  description?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface SportTypeResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}
