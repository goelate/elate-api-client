import type {
  DateRangePaginationParams,
  EntityDeleteResponse,
  PaginationParams,
} from "../types";
import type { ElateRequestExecutor, QueryParams } from "../request";

/** Shared non-list CRUD methods for resources backed by a single collection path. */
class CrudResourceBase<TResponse, TCreateRequest, TUpdateRequest> {
  constructor(
    protected readonly request: ElateRequestExecutor,
    protected readonly path: string,
  ) {}

  create(body: TCreateRequest): Promise<TResponse> {
    return this.request<TResponse>({ method: "POST", path: this.path, body });
  }

  get(id: number): Promise<TResponse> {
    return this.request<TResponse>({
      method: "GET",
      path: `${this.path}/${id}`,
    });
  }

  update(id: number, body: TUpdateRequest): Promise<TResponse> {
    return this.request<TResponse>({
      method: "PATCH",
      path: `${this.path}/${id}`,
      body,
    });
  }

  delete(id: number): Promise<EntityDeleteResponse> {
    return this.request<EntityDeleteResponse>({
      method: "DELETE",
      path: `${this.path}/${id}`,
    });
  }
}

/** Shared CRUD helper for resources whose list endpoint requires a date range. */
export class DateRangeCrudResource<
  TCollection,
  TResponse,
  TCreateRequest,
  TUpdateRequest,
  TListParams extends Partial<DateRangePaginationParams> =
    DateRangePaginationParams,
> extends CrudResourceBase<TResponse, TCreateRequest, TUpdateRequest> {
  list(params: TListParams): Promise<TCollection> {
    return this.request<TCollection>({
      method: "GET",
      path: this.path,
      query: dateRangePaginationQuery(params as DateRangePaginationParams),
    });
  }
}

/** Creates a path-bound date range resource while preserving the standard constructor shape. */
export function createDateRangeResource<
  TCollection,
  TResponse,
  TCreateRequest,
  TUpdateRequest,
>(
  path: string,
): new (
  request: ElateRequestExecutor,
) => DateRangeCrudResource<
  TCollection,
  TResponse,
  TCreateRequest,
  TUpdateRequest
> {
  return class extends DateRangeCrudResource<
    TCollection,
    TResponse,
    TCreateRequest,
    TUpdateRequest
  > {
    constructor(request: ElateRequestExecutor) {
      super(request, path);
    }
  };
}

/** Shared CRUD helper for resources whose list endpoint only requires pagination. */
export class PaginatedCrudResource<
  TCollection,
  TResponse,
  TCreateRequest,
  TUpdateRequest,
  TListParams extends Partial<PaginationParams> = PaginationParams,
> extends CrudResourceBase<TResponse, TCreateRequest, TUpdateRequest> {
  list(params: TListParams): Promise<TCollection> {
    return this.request<TCollection>({
      method: "GET",
      path: this.path,
      query: paginationQuery(params),
    });
  }
}

/** Creates a path-bound paginated resource while preserving the standard constructor shape. */
export function createPaginatedResource<
  TCollection,
  TResponse,
  TCreateRequest,
  TUpdateRequest,
>(
  path: string,
): new (
  request: ElateRequestExecutor,
) => PaginatedCrudResource<
  TCollection,
  TResponse,
  TCreateRequest,
  TUpdateRequest
> {
  return class extends PaginatedCrudResource<
    TCollection,
    TResponse,
    TCreateRequest,
    TUpdateRequest
  > {
    constructor(request: ElateRequestExecutor) {
      super(request, path);
    }
  };
}

/** Converts SDK pagination fields to the bracketed query names expected by the API. */
export function paginationQuery(
  params: Partial<PaginationParams>,
): QueryParams {
  return {
    "page[page]": params.page,
    "page[limit]": params.limit,
  };
}

/** Adds required date range filters to a paginated API query. */
export function dateRangePaginationQuery(
  params: DateRangePaginationParams,
): QueryParams {
  return {
    start: params.start,
    end: params.end,
    ...paginationQuery(params),
  };
}
