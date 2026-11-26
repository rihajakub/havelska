// Shared by the private dashboard and public guide so releases are easy to compare.
export const buildVersion = `v2026.11.26.3 · ${(process.env.VERCEL_GIT_COMMIT_SHA ?? "local").slice(0, 7)}`;
