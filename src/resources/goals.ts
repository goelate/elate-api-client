import { createDateRangeResource } from "./base";
import type {
  GoalCollectionResponse,
  GoalCreateRequest,
  GoalResponse,
  GoalUpdateRequest,
} from "../types";

/** Goals endpoints. List requests require a date range and pagination. */
export const GoalsResource = createDateRangeResource<
  GoalCollectionResponse,
  GoalResponse,
  GoalCreateRequest,
  GoalUpdateRequest
>("/api/v1/goals");

export type GoalsResource = InstanceType<typeof GoalsResource>;
