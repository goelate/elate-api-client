import { PaginatedCrudResource, paginationQuery } from "./base";
import type {
  PaginationParams,
  SavedViewCollectionResponse,
  SavedViewCreateRequest,
  SavedViewResponse,
  SavedViewUpdateRequest,
} from "../types";
import type { ElateRequestExecutor } from "../request";

/** Query parameters for listing saved views. */
export interface ListSavedViewsParams extends Partial<PaginationParams> {
  sortField?: string;
  sortDirection?: "asc" | "desc";
  /** Filter by saved view resource type, for example `objectives` or `metrics`. */
  resource?: string;
  /** Filter by public/private visibility. */
  isPublic?: boolean;
  /** Case-insensitive partial name filter. */
  name?: string;
}

/** Optional expansions for fetching one saved view. */
export interface GetSavedViewParams {
  include?: "resource" | readonly "resource"[];
}

/** Saved view endpoints with custom filters and optional include expansion. */
export class SavedViewsResource extends PaginatedCrudResource<
  SavedViewCollectionResponse,
  SavedViewResponse,
  SavedViewCreateRequest,
  SavedViewUpdateRequest,
  ListSavedViewsParams
> {
  constructor(request: ElateRequestExecutor) {
    super(request, "/api/v1/saved_views");
  }

  list(
    params: ListSavedViewsParams = {},
  ): Promise<SavedViewCollectionResponse> {
    return this.request<SavedViewCollectionResponse>({
      method: "GET",
      path: this.path,
      query: {
        ...paginationQuery(params),
        // The API uses bracketed names for sort and filter parameters.
        "sort[field]": params.sortField,
        "sort[direction]": params.sortDirection,
        "filter[resource]": params.resource,
        "filter[is_public]": params.isPublic,
        "filter[name]": params.name,
      },
    });
  }

  get(id: number, params: GetSavedViewParams = {}): Promise<SavedViewResponse> {
    return this.request<SavedViewResponse>({
      method: "GET",
      path: `${this.path}/${id}`,
      // The request client serializes arrays as repeated `include[]` params.
      query: { "include[]": params.include },
    });
  }
}
