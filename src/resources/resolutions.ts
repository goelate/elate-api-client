import { PaginatedCrudResource, paginationQuery } from "./base";
import type {
  PaginationParams,
  ResolutionCollectionResponse,
  ResolutionCreateRequest,
  ResolutionResponse,
  ResolutionUpdateRequest,
} from "../types";
import type { ElateRequestExecutor } from "../request";

/** List parameters require exactly one parent resource. */
export type ListResolutionsParams = PaginationParams &
  (
    | { objectiveId: number; tacticId?: never }
    | { tacticId: number; objectiveId?: never }
  );

/** Resolutions API methods. */
export class ResolutionsResource extends PaginatedCrudResource<
  ResolutionCollectionResponse,
  ResolutionResponse,
  ResolutionCreateRequest,
  ResolutionUpdateRequest,
  ListResolutionsParams
> {
  constructor(request: ElateRequestExecutor) {
    super(request, "/api/v1/resolutions");
  }

  list(params: ListResolutionsParams): Promise<ResolutionCollectionResponse> {
    return this.request<ResolutionCollectionResponse>({
      method: "GET",
      path: this.path,
      query: {
        objective_id: params.objectiveId,
        tactic_id: params.tacticId,
        ...paginationQuery(params),
      },
    });
  }
}
