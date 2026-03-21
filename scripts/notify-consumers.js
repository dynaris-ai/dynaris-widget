import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const DEFAULT_CONSUMER_REPOS = [
  'dynaris-ai/website',
  'dynaris-ai/web-development',
];

export const DISPATCH_EVENT_TYPE = 'dynaris_widget_published';

const ROOT_DIR = fileURLToPath(new URL('..', import.meta.url));
const PACKAGE_JSON_PATH = resolve(ROOT_DIR, 'package.json');

export function getConsumerRepos(env = process.env) {
  const rawRepos = env.DYNARIS_WIDGET_CONSUMER_REPOS?.trim();
  if (!rawRepos) {
    return DEFAULT_CONSUMER_REPOS;
  }

  return rawRepos
    .split(',')
    .map((repo) => repo.trim())
    .filter(Boolean);
}

export function getGithubToken(env = process.env) {
  const token =
    env.DYNARIS_CONSUMER_DISPATCH_TOKEN ??
    env.GITHUB_TOKEN ??
    env.GH_TOKEN;

  if (!token?.trim()) {
    throw new Error(
      'Missing GitHub token. Set DYNARIS_CONSUMER_DISPATCH_TOKEN, GITHUB_TOKEN, or GH_TOKEN before publishing.'
    );
  }

  return token.trim();
}

export async function loadPublishedPackage(readFileImpl = readFile) {
  const packageJson = JSON.parse(
    await readFileImpl(PACKAGE_JSON_PATH, 'utf8')
  );

  if (!packageJson.name || !packageJson.version) {
    throw new Error('package.json must include name and version.');
  }

  return {
    name: packageJson.name,
    version: packageJson.version,
  };
}

export function buildDispatchPayload(pkg) {
  return {
    event_type: DISPATCH_EVENT_TYPE,
    client_payload: {
      package_name: pkg.name,
      version: pkg.version,
    },
  };
}

export async function dispatchConsumerUpdate({
  repo,
  token,
  payload,
  fetchImpl = fetch,
}) {
  const response = await fetchImpl(
    `https://api.github.com/repos/${repo}/dispatches`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'dynaris-widget-publish-bot',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify(payload),
    }
  );

  if (response.ok) {
    return;
  }

  const body = await response.text();
  throw new Error(
    `Failed to dispatch ${repo}: ${response.status} ${response.statusText} ${body}`
  );
}

export async function main({
  env = process.env,
  fetchImpl = fetch,
  readFileImpl = readFile,
} = {}) {
  if (env.npm_config_dry_run === 'true') {
    console.log('[notify-consumers] Skipping consumer dispatch during dry-run publish.');
    return;
  }

  const token = getGithubToken(env);
  const pkg = await loadPublishedPackage(readFileImpl);
  const payload = buildDispatchPayload(pkg);
  const consumerRepos = getConsumerRepos(env);

  await Promise.all(
    consumerRepos.map(async (repo) => {
      await dispatchConsumerUpdate({
        repo,
        token,
        payload,
        fetchImpl,
      });
      console.log(
        `[notify-consumers] Dispatched ${pkg.name}@${pkg.version} to ${repo}.`
      );
    })
  );
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main().catch((error) => {
    console.error(
      `[notify-consumers] ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  });
}
