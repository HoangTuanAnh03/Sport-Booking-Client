import http from "@/utils/api";
import {Field} from "@/types/field";

const fieldApiRequest = {
    sGetFieldByVenueId: (id: string) => http.get<IBackendRes<IModelPaginateResponse<Field[]>>>(`/fields/getByVenueId/${id}`)
}

export default fieldApiRequest;