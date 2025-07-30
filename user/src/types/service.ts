export type Category = {
  id: number;
  name: string;
  numberOfServices: number;
  services: Service[];
};

export type Service = {
  id: number;
  name: string;
  price: number;
  units: string;
  isAvailable: boolean;
};
