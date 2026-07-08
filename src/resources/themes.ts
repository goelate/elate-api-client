import { createPaginatedResource } from "./base";
import type {
  ThemeCollectionResponse,
  ThemeCreateRequest,
  ThemeResponse,
  ThemeUpdateRequest,
} from "../types";

/** Themes endpoints. List requests require pagination only. */
export const ThemesResource = createPaginatedResource<
  ThemeCollectionResponse,
  ThemeResponse,
  ThemeCreateRequest,
  ThemeUpdateRequest
>("/api/v1/themes");

export type ThemesResource = InstanceType<typeof ThemesResource>;
