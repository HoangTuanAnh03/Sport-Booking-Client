import http from "@/utils/api";

export interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
}

export interface BankListResponse {
  code: string;
  desc: string;
  data: Bank[];
}

const bankApiRequest = {
  getBanks: () =>
    http.get<BankListResponse>("/v2/banks", {
      baseUrl: "https://api.vietqr.io",
    }),
};

export default bankApiRequest;
