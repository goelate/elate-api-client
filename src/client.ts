import { CommentsResource } from "./resources/comments";
import { GoalsResource } from "./resources/goals";
import { GroupsResource } from "./resources/groups";
import { MetricsResource } from "./resources/metrics";
import { ObjectivesResource } from "./resources/objectives";
import { ReportsResource } from "./resources/reports";
import { SavedViewsResource } from "./resources/saved-views";
import { TacticsResource } from "./resources/tactics";
import { ThemesResource } from "./resources/themes";
import { UsersResource } from "./resources/users";
import { ElateRequestClient } from "./request";
import type { ElateClientOptions } from "./types";

/**
 * Public entry point for calling the Elate API.
 *
 * Instantiate this class once with an API key, then use the resource groups to
 * call endpoints with typed request and response payloads.
 */
export class ElateClient {
  /** Objectives API methods. */
  readonly objectives: ObjectivesResource;
  /** Metrics API methods. */
  readonly metrics: MetricsResource;
  /** Goals API methods. */
  readonly goals: GoalsResource;
  /** Comments API methods. */
  readonly comments: CommentsResource;
  /** Themes API methods. */
  readonly themes: ThemesResource;
  /** Tactics API methods. */
  readonly tactics: TacticsResource;
  /** Groups API methods. */
  readonly groups: GroupsResource;
  /** Saved views API methods. */
  readonly savedViews: SavedViewsResource;
  /** Users API methods. */
  readonly users: UsersResource;
  /** Report export API methods. */
  readonly reports: ReportsResource;

  private readonly requestClient: ElateRequestClient;

  /**
   * Create a new ElateClient instance with the given configuration.
   *
   * @param options - Configuration options for the client
   * @param options.baseUrl - The HTTPS base URL of the Elate API
   * @param options.apiKey - The API key for authentication (required)
   * @param options.timeoutMs - Request timeout in milliseconds (default: 30000)
   * @param options.maxRetries - Maximum number of GET retry attempts (default: 2)
   * @param options.retryDelayMs - Base delay between retries in milliseconds (default: 100)
   */
  constructor(options: ElateClientOptions) {
    this.requestClient = new ElateRequestClient(options);
    // Bind once so resources can stay small and dependency-free.
    const request = this.requestClient.request.bind(this.requestClient);

    this.objectives = new ObjectivesResource(request);
    this.metrics = new MetricsResource(request);
    this.goals = new GoalsResource(request);
    this.comments = new CommentsResource(request);
    this.themes = new ThemesResource(request);
    this.tactics = new TacticsResource(request);
    this.groups = new GroupsResource(request);
    this.savedViews = new SavedViewsResource(request);
    this.users = new UsersResource(request);
    this.reports = new ReportsResource(request);
  }
}
