import { listPaginated } from "./base";
import type { ElateRequestExecutor } from "../request";
import type {
  OwnerCollectionResponse,
  OwnerCreateRequest,
  OwnerResponse,
  PaginationParams,
} from "../types";

export type OwnerResourceType = "objectives" | "metrics" | "tactics";

/** Ownership relationships for objectives, metrics, and tactics. */
export class OwnersResource {
  constructor(private readonly request: ElateRequestExecutor) {}

  list(
    resourceType: OwnerResourceType,
    recordId: number,
    params: PaginationParams,
  ): Promise<OwnerCollectionResponse> {
    return listPaginated<OwnerCollectionResponse>(
      this.request,
      this.path(resourceType, recordId),
      params,
    );
  }

  add(
    resourceType: OwnerResourceType,
    recordId: number,
    userId: number,
  ): Promise<OwnerResponse> {
    const body: OwnerCreateRequest = { owner: { user_id: userId } };
    return this.request({
      method: "POST",
      path: this.path(resourceType, recordId),
      body,
    });
  }

  remove(
    resourceType: OwnerResourceType,
    recordId: number,
    userId: number,
  ): Promise<void> {
    return this.request({
      method: "DELETE",
      path: `${this.path(resourceType, recordId)}/${userId}`,
    });
  }

  private path(resourceType: OwnerResourceType, recordId: number): string {
    return `/api/v1/${resourceType}/${recordId}/owners`;
  }
}
