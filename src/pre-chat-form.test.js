/** @vitest-environment happy-dom */
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  normalizePreChatConfig,
  shouldSkipPreChatFromStorage,
  markPreChatCompleteInStorage,
  mountPreChatForm,
} from './pre-chat-form.js';

describe('pre-chat-form', () => {
  describe('normalizePreChatConfig', () => {
    it('returns disabled defaults when empty', () => {
      const c = normalizePreChatConfig(undefined);
      expect(c.enabled).toBe(false);
      expect(c.title).toBe('Before we start');
      expect(c.submitLabel).toBe('Continue');
      expect(c.skipStorageKey).toBe(null);
      expect(c.labels.firstName).toBe('First name');
      expect(c.defaultValues.email).toBe('');
    });

    it('respects enabled and custom title', () => {
      const c = normalizePreChatConfig({
        enabled: true,
        title: 'Hello',
        submitLabel: 'Go',
        skipStorageKey: 'acme',
        labels: { email: 'Work email' },
      });
      expect(c.enabled).toBe(true);
      expect(c.title).toBe('Hello');
      expect(c.submitLabel).toBe('Go');
      expect(c.skipStorageKey).toBe('acme');
      expect(c.labels.email).toBe('Work email');
      expect(c.labels.firstName).toBe('First name');
    });

    it('supports per-field required overrides', () => {
      const c = normalizePreChatConfig({
        enabled: true,
        requiredFields: { phoneNumber: false },
      });
      expect(c.requiredFields.firstName).toBe(true);
      expect(c.requiredFields.phoneNumber).toBe(false);
      expect(c.requiredFields.email).toBe(true);
    });

    it('merges snake_case labels and default_values', () => {
      const c = normalizePreChatConfig({
        enabled: true,
        labels: { first_name: 'Given name', phone_number: 'Mobile' },
        default_values: { first_name: 'Jane', email: 'j@example.com' },
      });
      expect(c.labels.firstName).toBe('Given name');
      expect(c.labels.phoneNumber).toBe('Mobile');
      expect(c.defaultValues.firstName).toBe('Jane');
      expect(c.defaultValues.email).toBe('j@example.com');
    });

    it('merges query string into defaultValues when prefill is enabled', () => {
      const prev = window.location.href;
      window.history.replaceState({}, '', '/?first_name=Alex&last_name=Lee&email=a%40b.co');
      try {
        const c = normalizePreChatConfig({ enabled: true });
        expect(c.defaultValues.firstName).toBe('Alex');
        expect(c.defaultValues.lastName).toBe('Lee');
        expect(c.defaultValues.email).toBe('a@b.co');
      } finally {
        window.history.replaceState({}, '', prev);
      }
    });

    it('skips query prefill when prefillFromQuery is false', () => {
      const prev = window.location.href;
      window.history.replaceState({}, '', '/?first_name=Alex');
      try {
        const c = normalizePreChatConfig({
          enabled: true,
          prefillFromQuery: false,
        });
        expect(c.defaultValues.firstName).toBe('');
      } finally {
        window.history.replaceState({}, '', prev);
      }
    });

    it('prefers explicit defaultValues over query params', () => {
      const prev = window.location.href;
      window.history.replaceState({}, '', '/?first_name=FromUrl');
      try {
        const c = normalizePreChatConfig({
          enabled: true,
          defaultValues: { firstName: 'FromConfig' },
        });
        expect(c.defaultValues.firstName).toBe('FromConfig');
      } finally {
        window.history.replaceState({}, '', prev);
      }
    });

    it('accepts direct pre-chat field values on the root config object', () => {
      const c = normalizePreChatConfig({
        enabled: true,
        first_name: 'Pat',
        last_name: 'Lee',
        phone_number: '3055551212',
        email: 'pat@example.com',
        description: 'Need pricing help',
      });
      expect(c.defaultValues.firstName).toBe('Pat');
      expect(c.defaultValues.lastName).toBe('Lee');
      expect(c.defaultValues.phoneNumber).toBe('3055551212');
      expect(c.defaultValues.email).toBe('pat@example.com');
      expect(c.defaultValues.description).toBe('Need pricing help');
    });
  });

  describe('localStorage skip', () => {
    beforeEach(() => {
      const mem = {};
      vi.stubGlobal('localStorage', {
        getItem: (k) => (Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null),
        setItem: (k, v) => {
          mem[k] = String(v);
        },
        removeItem: (k) => {
          delete mem[k];
        },
        clear: () => {
          Object.keys(mem).forEach((k) => {
            delete mem[k];
          });
        },
      });
    });

    it('shouldSkipPreChatFromStorage returns false when unset', () => {
      expect(shouldSkipPreChatFromStorage('k')).toBe(false);
    });

    it('mark then skip returns true', () => {
      markPreChatCompleteInStorage('k');
      expect(shouldSkipPreChatFromStorage('k')).toBe(true);
    });
  });

  describe('mountPreChatForm', () => {
    afterEach(() => {
      document.body.replaceChildren();
    });

    it('prefills all inputs from defaultValues', () => {
      const panel = document.createElement('div');
      document.body.appendChild(panel);
      const cfg = normalizePreChatConfig({
        enabled: true,
        defaultValues: {
          firstName: 'Pat',
          lastName: 'Lee',
          phoneNumber: '3055551212',
          email: 'p@ex.com',
          description: 'Hi',
        },
      });
      mountPreChatForm(panel, cfg, {
        onSubmit: async () => {},
        onSuccess: () => {},
        onError: () => {},
      });
      expect(panel.querySelector('#dynaris-prechat-firstName')?.value).toBe('Pat');
      expect(panel.querySelector('#dynaris-prechat-lastName')?.value).toBe('Lee');
      expect(panel.querySelector('#dynaris-prechat-phoneNumber')?.value).toBe('3055551212');
      expect(panel.querySelector('#dynaris-prechat-email')?.value).toBe('p@ex.com');
      expect(panel.querySelector('#dynaris-prechat-description')?.value).toBe('Hi');
    });

    it('coerces numeric defaultValues to string in inputs', () => {
      const panel = document.createElement('div');
      document.body.appendChild(panel);
      const cfg = normalizePreChatConfig({
        enabled: true,
        defaultValues: { phoneNumber: 3055551212 },
      });
      mountPreChatForm(panel, cfg, {
        onSubmit: async () => {},
        onSuccess: () => {},
        onError: () => {},
      });
      expect(panel.querySelector('#dynaris-prechat-phoneNumber')?.value).toBe('3055551212');
    });

    it('allows optional phoneNumber to submit empty', async () => {
      const panel = document.createElement('div');
      document.body.appendChild(panel);
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const cfg = normalizePreChatConfig({
        enabled: true,
        requiredFields: { phoneNumber: false },
        defaultValues: {
          firstName: 'Pat',
          lastName: 'Lee',
          email: 'p@ex.com',
          description: 'Hi',
        },
      });
      mountPreChatForm(panel, cfg, {
        onSubmit,
        onSuccess,
        onError,
      });
      panel.querySelector('#dynaris-prechat-phoneNumber').value = '';
      const form = panel.querySelector('.dynaris-widget-prechat-form');
      form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await Promise.resolve();
      await Promise.resolve();
      expect(onSubmit).toHaveBeenCalledWith({
        first_name: 'Pat',
        last_name: 'Lee',
        phone_number: undefined,
        email: 'p@ex.com',
        description: 'Hi',
      });
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });
  });
});
