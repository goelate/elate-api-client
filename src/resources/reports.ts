import type { ElateRequestExecutor } from "../request";

/** Report export endpoints. */
export class ReportsResource {
  constructor(private readonly request: ElateRequestExecutor) {}

  getPdf(id: number): Promise<ArrayBuffer> {
    return this.request<ArrayBuffer>({
      method: "GET",
      path: `/api/v1/reports/${id}/pdf`,
      // Reports return binary PDF content rather than JSON.
      responseType: "arrayBuffer",
    });
  }
}
