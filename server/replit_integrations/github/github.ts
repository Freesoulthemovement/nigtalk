import { ReplitConnectors } from "@replit/connectors-sdk";

/**
 * GitHub connector for NigTalk.
 *
 * Used for repository management and as the foundation for
 * CI/CD via GitHub Actions.
 *
 * IMPORTANT: Do not cache the connectors instance — tokens expire.
 * Always call getUncachableGithubClient() fresh per request.
 */

export function getUncachableGithubClient() {
  return new ReplitConnectors();
}

/** Get the authenticated user's repos */
export async function listUserRepos() {
  const connectors = getUncachableGithubClient();
  const response = await connectors.proxy("github", "/user/repos?per_page=50&sort=updated", {
    method: "GET",
  });
  return response.json();
}

/** Get a specific repo */
export async function getRepo(owner: string, repo: string) {
  const connectors = getUncachableGithubClient();
  const response = await connectors.proxy("github", `/repos/${owner}/${repo}`, {
    method: "GET",
  });
  return response.json();
}

/** List open issues for a repo */
export async function listIssues(owner: string, repo: string) {
  const connectors = getUncachableGithubClient();
  const response = await connectors.proxy("github", `/repos/${owner}/${repo}/issues?state=open`, {
    method: "GET",
  });
  return response.json();
}

/** List open pull requests */
export async function listPullRequests(owner: string, repo: string) {
  const connectors = getUncachableGithubClient();
  const response = await connectors.proxy("github", `/repos/${owner}/${repo}/pulls?state=open`, {
    method: "GET",
  });
  return response.json();
}
