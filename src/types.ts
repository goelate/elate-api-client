import type { components } from "./generated/schema";
import type { ElateRequestConfig } from "./request";

/** Options accepted by `new ElateClient(...)`. */
export type ElateClientOptions = ElateRequestConfig;

/** Pagination fields exposed by SDK methods before conversion to bracketed API params. */
export interface PaginationParams {
  /** Zero-based page number. */
  page: number;
  /** Number of records per page. The API currently allows up to 500. */
  limit: number;
}

/** Date range and pagination fields used by timeline-backed resources. */
export interface DateRangePaginationParams extends PaginationParams {
  /** Inclusive start date in `YYYY-MM-DD` format. */
  start: string;
  /** Inclusive end date in `YYYY-MM-DD` format. */
  end: string;
}

/** Sort fields exposed by resources that support API sorting. */
export interface SortParams {
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

/** Generated model and payload aliases exported as stable package types. */
export type Objective = components["schemas"]["Objective"];
export type ObjectiveCreateRequest =
  components["schemas"]["ObjectiveCreateRequest"];
export type ObjectiveUpdateRequest =
  components["schemas"]["ObjectiveUpdateRequest"];
export type ObjectiveResponse = components["schemas"]["ObjectiveResponse"];
export type ObjectiveCollectionResponse =
  components["schemas"]["ObjectiveCollectionResponse"];

export type Metric = components["schemas"]["Metric"];
export type MetricCreateRequest = components["schemas"]["MetricCreateRequest"];
export type MetricUpdateRequest = components["schemas"]["MetricUpdateRequest"];
export type MetricResponse = components["schemas"]["MetricResponse"];
export type MetricCollectionResponse =
  components["schemas"]["MetricCollectionResponse"];

export type Goal = components["schemas"]["Goal"];
export type GoalCreateRequest = components["schemas"]["GoalCreateRequest"];
export type GoalUpdateRequest = components["schemas"]["GoalUpdateRequest"];
export type GoalResponse = components["schemas"]["GoalResponse"];
export type GoalCollectionResponse =
  components["schemas"]["GoalCollectionResponse"];

export type Comment = components["schemas"]["Comment"];
export type CommentCreateRequest =
  components["schemas"]["CommentCreateRequest"];
export type CommentUpdateRequest =
  components["schemas"]["CommentUpdateRequest"];
export type CommentResponse = components["schemas"]["CommentResponse"];
export type CommentCollectionResponse =
  components["schemas"]["CommentCollectionResponse"];

export type Theme = components["schemas"]["Theme"];
export type ThemeCreateRequest = components["schemas"]["ThemeCreateRequest"];
export type ThemeUpdateRequest = components["schemas"]["ThemeUpdateRequest"];
export type ThemeResponse = components["schemas"]["ThemeResponse"];
export type ThemeCollectionResponse =
  components["schemas"]["ThemeCollectionResponse"];

export type Tactic = components["schemas"]["Tactic"];
export type TacticCreateRequest = components["schemas"]["TacticCreateRequest"];
export type TacticUpdateRequest = components["schemas"]["TacticUpdateRequest"];
export type TacticResponse = components["schemas"]["TacticResponse"];
export type TacticCollectionResponse =
  components["schemas"]["TacticCollectionResponse"];

export type Group = components["schemas"]["Group"];
export type GroupCreateRequest = components["schemas"]["GroupCreateRequest"];
export type GroupUpdateRequest = components["schemas"]["GroupUpdateRequest"];
export type GroupResponse = components["schemas"]["GroupResponse"];
export type GroupCollectionResponse =
  components["schemas"]["GroupCollectionResponse"];

export type SavedView = components["schemas"]["SavedView"];
export type SavedViewCreateRequest =
  components["schemas"]["SavedViewCreateRequest"];
export type SavedViewUpdateRequest =
  components["schemas"]["SavedViewUpdateRequest"];
export type SavedViewResponse = components["schemas"]["SavedViewResponse"];
export type SavedViewCollectionResponse =
  components["schemas"]["SavedViewCollectionResponse"];

export type User = components["schemas"]["User"];
export type UserCreateRequest = components["schemas"]["UserCreateRequest"];
export type UserUpdateRequest = components["schemas"]["UserUpdateRequest"];
export type UserResponse = components["schemas"]["UserResponse"];
export type UserCollectionResponse =
  components["schemas"]["UserCollectionResponse"];

export type EntityDeleteResponse =
  components["schemas"]["EntityDeleteResponse"];
export type PaginationMetadata = components["schemas"]["PaginationMetadata"];
export type ErrorUnauthorized = components["schemas"]["ErrorUnauthorized"];
export type ErrorMessage = components["schemas"]["ErrorMessage"];
export type ValidationErrors = components["schemas"]["ValidationErrors"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
