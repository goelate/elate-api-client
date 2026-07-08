import { createPaginatedResource } from "./base";
import type {
  UserCollectionResponse,
  UserCreateRequest,
  UserResponse,
  UserUpdateRequest,
} from "../types";

/** Users endpoints. List requests require pagination only. */
export const UsersResource = createPaginatedResource<
  UserCollectionResponse,
  UserResponse,
  UserCreateRequest,
  UserUpdateRequest
>("/api/v1/users");

export type UsersResource = InstanceType<typeof UsersResource>;
