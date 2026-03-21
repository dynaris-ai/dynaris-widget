import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_CONSUMER_REPOS,
  DISPATCH_EVENT_TYPE,
  buildDispatchPayload,
  dispatchConsumerUpdate,
  getConsumerRepos,
  getGithubToken,
  loadPublishedPackage,
  main,
} from '../scripts/notify-consumers.js';

describe('getConsumerRepos', () => {
  it('returns the default consumer repos when env is unset', () => {
    expect(getConsumerRepos({})).toEqual(DEFAULT_CONSUMER_REPOS);
  });

  it('parses a comma-separated repo list', () => {
    expect(
      getConsumerRepos({
        DYNARIS_WIDGET_CONSUMER_REPOS:
          'dynaris-ai/website, dynaris-ai/web-development ',
      })
    ).toEqual(['dynaris-ai/website', 'dynaris-ai/web-development']);
  });
});

describe('getGithubToken', () => {
  it('prefers the dedicated dispatch token', () => {
    expect(
      getGithubToken({
        DYNARIS_CONSUMER_DISPATCH_TOKEN: 'dispatch-token',
        GITHUB_TOKEN: 'github-token',
      })
    ).toBe('dispatch-token');
  });

  it('returns null when no token is configured', () => {
    expect(getGithubToken({})).toBeNull();
  });
});

describe('loadPublishedPackage', () => {
  it('reads the published package name and version', async () => {
    const pkg = await loadPublishedPackage(
      vi.fn().mockResolvedValue(
        JSON.stringify({ name: '@dynaris/widget', version: '1.2.3' })
      )
    );

    expect(pkg).toEqual({
      name: '@dynaris/widget',
      version: '1.2.3',
    });
  });
});

describe('buildDispatchPayload', () => {
  it('builds the repository dispatch event payload', () => {
    expect(
      buildDispatchPayload({
        name: '@dynaris/widget',
        version: '1.2.3',
      })
    ).toEqual({
      event_type: DISPATCH_EVENT_TYPE,
      client_payload: {
        package_name: '@dynaris/widget',
        version: '1.2.3',
      },
    });
  });
});

describe('main', () => {
  it('skips dispatch when no GitHub token is set', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fetchImpl = vi.fn();
    const readFileImpl = vi.fn();

    await main({ env: {}, fetchImpl, readFileImpl });

    expect(fetchImpl).not.toHaveBeenCalled();
    expect(readFileImpl).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('No GitHub token'),
    );
    warn.mockRestore();
  });
});

describe('dispatchConsumerUpdate', () => {
  it('posts the repository dispatch event to GitHub', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      statusText: 'No Content',
      text: vi.fn().mockResolvedValue(''),
    });

    await dispatchConsumerUpdate({
      repo: 'dynaris-ai/website',
      token: 'dispatch-token',
      payload: buildDispatchPayload({
        name: '@dynaris/widget',
        version: '1.2.3',
      }),
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      'https://api.github.com/repos/dynaris-ai/website/dispatches',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer dispatch-token',
        }),
      })
    );
  });
});
