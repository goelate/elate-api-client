import { PaginatedCrudResource, paginationQuery } from "./base";
import type {
  CommentCollectionResponse,
  CommentCreateRequest,
  CommentResponse,
  CommentUpdateRequest,
  PaginationParams,
  SortParams,
} from "../types";
import type { ElateRequestExecutor } from "../request";

/** Query parameters for listing comments on a specific API resource. */
export interface ListCommentsParams extends PaginationParams, SortParams {
  /** API resource type that owns the comments. */
  commentableType: "objective" | "metric" | "plan" | "tactic" | "insight_rule";
  /** ID of the resource identified by `commentableType`. */
  commentableId: number;
}

/** Comments endpoints. The list endpoint adds comment target filters to the shared CRUD behavior. */
export class CommentsResource extends PaginatedCrudResource<
  CommentCollectionResponse,
  CommentResponse,
  CommentCreateRequest,
  CommentUpdateRequest,
  ListCommentsParams
> {
  constructor(request: ElateRequestExecutor) {
    super(request, "/api/v1/comments");
  }

  list(params: ListCommentsParams): Promise<CommentCollectionResponse> {
    return this.request<CommentCollectionResponse>({
      method: "GET",
      path: this.path,
      query: {
        // Public camelCase fields map to the API's snake_case filter names.
        commentable_type: params.commentableType,
        commentable_id: params.commentableId,
        ...paginationQuery(params),
        "sort[field]": params.sortField,
        "sort[direction]": params.sortDirection,
      },
    });
  }
}
