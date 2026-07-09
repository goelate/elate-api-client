import { createDateRangeResource } from "./base";
import type {
  ObjectiveCollectionResponse,
  ObjectiveCreateRequest,
  ObjectiveResponse,
  ObjectiveUpdateRequest,
} from "../types";

/** Objectives endpoints. List requests require a date range and pagination. */
export const ObjectivesResource = createDateRangeResource<
  ObjectiveCollectionResponse,
  ObjectiveResponse,
  ObjectiveCreateRequest,
  ObjectiveUpdateRequest
>("/api/v1/objectives");

export type ObjectivesResource = InstanceType<typeof ObjectivesResource>;
