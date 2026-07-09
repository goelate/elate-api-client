import { createDateRangeResource } from "./base";
import type {
  MetricCollectionResponse,
  MetricCreateRequest,
  MetricResponse,
  MetricUpdateRequest,
} from "../types";

/** Metrics endpoints. List requests require a date range and pagination. */
export const MetricsResource = createDateRangeResource<
  MetricCollectionResponse,
  MetricResponse,
  MetricCreateRequest,
  MetricUpdateRequest
>("/api/v1/metrics");

export type MetricsResource = InstanceType<typeof MetricsResource>;
