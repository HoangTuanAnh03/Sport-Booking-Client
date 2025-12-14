import http from "@/utils/api";
import { AccountResType } from "@/schemaValidations/account.schema";
import envConfig from "@/config";

const accountApiRequest = {
  meClient: () =>
    http.get<IBackendRes<AccountResType>>("/users/my-info", {
      baseUrl: envConfig.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:8080",
    }),
};

export default accountApiRequest;
