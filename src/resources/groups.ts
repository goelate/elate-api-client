import { createPaginatedResource } from "./base";
import type {
  GroupCollectionResponse,
  GroupCreateRequest,
  GroupResponse,
  GroupUpdateRequest,
} from "../types";

/** Groups endpoints. List requests require pagination only. */
export const GroupsResource = createPaginatedResource<
  GroupCollectionResponse,
  GroupResponse,
  GroupCreateRequest,
  GroupUpdateRequest
>("/api/v1/groups");

export type GroupsResource = InstanceType<typeof GroupsResource>;
