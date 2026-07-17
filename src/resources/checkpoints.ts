import { DateRangeCrudResource, dateRangePaginationQuery } from "./base";
import type {
  CheckpointCollectionResponse,
  CheckpointCreateRequest,
  CheckpointResponse,
  CheckpointUpdateRequest,
  DateRangePaginationParams,
  SortParams,
} from "../types";
import type { ElateRequestExecutor } from "../request";

/** Query parameters for listing checkpoints on a specific API resource. */
export interface ListCheckpointsParams
  extends DateRangePaginationParams, SortParams {
  /** Filter checkpoints by a tactic */
  tacticId?: number;
  /** Filter checkpoints by an objective */
  objectiveId?: number;
}

/** Checkpoints endpoints. The list endpoint adds checkpoint target filters to the shared CRUD behavior. */
export class CheckpointsResource extends DateRangeCrudResource<
  CheckpointCollectionResponse,
  CheckpointResponse,
  CheckpointCreateRequest,
  CheckpointUpdateRequest,
  ListCheckpointsParams
> {
  constructor(request: ElateRequestExecutor) {
    super(request, "/api/v1/checkpoints");
  }

  list(params: ListCheckpointsParams): Promise<CheckpointCollectionResponse> {
    return this.request<CheckpointCollectionResponse>({
      method: "GET",
      path: this.path,
      query: {
        // Public camelCase fields map to the API's snake_case filter names.
        tactic_id: params.tacticId,
        objective_id: params.objectiveId,
        ...dateRangePaginationQuery(params),
        "sort[field]": params.sortField,
        "sort[direction]": params.sortDirection,
      },
    });
  }
}
