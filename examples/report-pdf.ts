import { writeFile } from "node:fs/promises";
import { ElateClient } from "@goelate/elate-api-client";

const apiKey = process.env.ELATE_API_KEY;
if (!apiKey) {
  throw new Error("ELATE_API_KEY environment variable is required");
}

const elate = new ElateClient({
  baseUrl: "https://evoke.goelate.com",
  apiKey,
});

const pdf = await elate.reports.getPdf(123);
await writeFile("report.pdf", Buffer.from(pdf));
