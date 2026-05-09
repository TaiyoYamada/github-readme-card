import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { _resetEnvForTest, getEnv } from '@/lib/env';

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
  _resetEnvForTest();
});

afterEach(() => {
  process.env = originalEnv;
  _resetEnvForTest();
});

describe('getEnv', () => {
  it('returns parsed env when both required vars are present', () => {
    process.env.GITHUB_USERNAME = 'octocat';
    process.env.GITHUB_TOKEN = 'ghp_x';
    const env = getEnv();
    expect(env.githubUsername).toBe('octocat');
    expect(env.githubToken).toBe('ghp_x');
  });

  it('throws when GITHUB_USERNAME is missing', () => {
    delete process.env.GITHUB_USERNAME;
    process.env.GITHUB_TOKEN = 'ghp_x';
    expect(() => getEnv()).toThrowError(/GITHUB_USERNAME/);
  });

  it('throws when GITHUB_TOKEN is missing', () => {
    process.env.GITHUB_USERNAME = 'octocat';
    delete process.env.GITHUB_TOKEN;
    expect(() => getEnv()).toThrowError(/GITHUB_TOKEN/);
  });

  it('treats an empty string as missing', () => {
    process.env.GITHUB_USERNAME = '';
    process.env.GITHUB_TOKEN = 'ghp_x';
    expect(() => getEnv()).toThrowError(/GITHUB_USERNAME/);
  });

  it.each([
    ['has-leading-dash', '-bad'],
    ['has-trailing-dash', 'bad-'],
    ['has-double-dash', 'bad--name'],
    ['has-illegal-char', 'bad name'],
    ['too-long', 'a'.repeat(40)],
  ])('rejects invalid login: %s', (_label, login) => {
    process.env.GITHUB_USERNAME = login;
    process.env.GITHUB_TOKEN = 'ghp_x';
    expect(() => getEnv()).toThrowError(/not a valid GitHub login/);
  });

  it.each([
    ['single char', 'a'],
    ['with hyphen', 'good-name'],
    ['mixed case + digits', 'OctoCat42'],
    ['exactly 39 chars', 'a'.repeat(39)],
  ])('accepts valid login: %s', (_label, login) => {
    process.env.GITHUB_USERNAME = login;
    process.env.GITHUB_TOKEN = 'ghp_x';
    expect(getEnv().githubUsername).toBe(login);
  });

  it('memoizes after the first successful read', () => {
    process.env.GITHUB_USERNAME = 'octocat';
    process.env.GITHUB_TOKEN = 'ghp_first';
    const first = getEnv();
    process.env.GITHUB_TOKEN = 'ghp_second';
    const second = getEnv();
    expect(second).toBe(first);
    expect(second.githubToken).toBe('ghp_first');
  });
});
