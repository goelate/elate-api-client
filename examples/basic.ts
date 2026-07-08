import { ElateClient } from "@goelate/api-client";

const apiKey = process.env.ELATE_API_KEY;
if (!apiKey) {
  throw new Error("ELATE_API_KEY environment variable is required");
}

const elate = new ElateClient({
  baseUrl: "https://evoke.goelate.com",
  apiKey,
});

const objectives = await elate.objectives.list({
  start: "2026-01-01",
  end: "2026-03-31",
  page: 0,
  limit: 25,
});

console.log(objectives.results);
