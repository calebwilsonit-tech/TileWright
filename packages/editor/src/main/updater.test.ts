import { describe, expect, it } from 'vitest';
import { compareVersions, extractSha256, isAllowedUpdateUrl, parseRelease, parseTagFromRedirect, pickInstallerAsset } from './updater';

describe('updater helpers', () => {
  it('compares semantic versions with or without a leading v', () => {
    expect(compareVersions('0.2.0', '0.2.0')).toBe(0);
    expect(compareVersions('v0.2.0', '0.2.0')).toBe(0);
    expect(compareVersions('0.2.0', '0.2.1')).toBe(-1);
    expect(compareVersions('0.2.0', '0.10.0')).toBe(-1);
    expect(compareVersions('1.0.0', '0.9.9')).toBe(1);
  });

  it('allows only GitHub HTTPS URLs (and localhost only when allowLocal is set)', () => {
    expect(isAllowedUpdateUrl('https://api.github.com/repos/calebwilsonit-tech/TileWrite/releases/latest')).toBe(true);
    expect(isAllowedUpdateUrl('https://github.com/calebwilsonit-tech/TileWrite/releases/download/v0.2.1/Tilewright-0.2.1-win.exe')).toBe(true);
    expect(isAllowedUpdateUrl('https://objects.githubusercontent.com/abc/installer.exe')).toBe(true);
    expect(isAllowedUpdateUrl('http://github.com/foo')).toBe(false);
    expect(isAllowedUpdateUrl('https://evil.example.com/Tilewright.exe')).toBe(false);
    expect(isAllowedUpdateUrl('http://127.0.0.1:4321/release', false)).toBe(false);
    expect(isAllowedUpdateUrl('http://127.0.0.1:4321/release', true)).toBe(true);
  });

  it('picks the Windows installer asset over the zip', () => {
    const assets = [
      { name: 'RELEASE.json', browser_download_url: 'https://github.com/a/RELEASE.json', size: 200 },
      { name: 'Tilewright-0.2.1-win.zip', browser_download_url: 'https://github.com/a/win.zip', size: 1000 },
      { name: 'Tilewright-0.2.1-win.exe', browser_download_url: 'https://github.com/a/win.exe', size: 2000 },
    ];
    expect(pickInstallerAsset(assets, 'win32')?.name).toBe('Tilewright-0.2.1-win.exe');
  });

  it('extracts valid sha256 digests', () => {
    const hex = 'a'.repeat(64);
    expect(extractSha256(`sha256:${hex}`)).toBe(hex);
    expect(extractSha256(hex.toUpperCase())).toBe(hex);
    expect(extractSha256('not-a-hash')).toBeUndefined();
    expect(extractSha256(null)).toBeUndefined();
  });

  it('extracts release tags from GitHub /releases/latest redirects', () => {
    expect(parseTagFromRedirect('https://github.com/calebwilsonit-tech/TileWright/releases/tag/v0.4.0')).toBe('v0.4.0');
    expect(parseTagFromRedirect('https://github.com/calebwilsonit-tech/TileWright/releases')).toBeNull();
  });

  it('parses an available release and an up-to-date release', () => {
    const hex = 'b'.repeat(64);
    const rel = {
      tag_name: 'v0.3.0',
      html_url: 'https://github.com/calebwilsonit-tech/TileWrite/releases/tag/v0.3.0',
      body: '- Added in-app updater',
      published_at: '2026-11-27T00:00:00Z',
      assets: [
        { name: 'Tilewright-0.3.0-win.exe', browser_download_url: 'https://github.com/x/Tilewright-0.3.0-win.exe', size: 50_000_000, digest: `sha256:${hex}` },
      ],
    };
    const avail = parseRelease('0.2.0', rel, 'win32');
    expect(avail.status).toBe('available');
    expect(avail.latest).toBe('0.3.0');
    expect(avail.assetName).toBe('Tilewright-0.3.0-win.exe');
    expect(avail.sha256).toBe(hex);

    const same = parseRelease('0.3.0', rel, 'win32');
    expect(same.status).toBe('up-to-date');
    expect(same.assetUrl).toBeUndefined();
  });
});
