import { createDateRangeResource } from "./base";
import type {
  TacticCollectionResponse,
  TacticCreateRequest,
  TacticResponse,
  TacticUpdateRequest,
} from "../types";

/** Tactics endpoints. List requests require a date range and pagination. */
export const TacticsResource = createDateRangeResource<
  TacticCollectionResponse,
  TacticResponse,
  TacticCreateRequest,
  TacticUpdateRequest
>("/api/v1/tactics");

export type TacticsResource = InstanceType<typeof TacticsResource>;
