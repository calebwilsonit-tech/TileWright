import { app, ipcMain, shell } from 'electron';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';

export const UPDATE_REPO = 'calebwilsonit-tech/TileWrite';
export const DEFAULT_RELEASE_API = `https://api.github.com/repos/${UPDATE_REPO}/releases/latest`;
export const RELEASES_PAGE = `https://github.com/${UPDATE_REPO}/releases`;

export interface UpdateCheckResult {
  status: 'up-to-date' | 'available' | 'error';
  current: string;
  latest?: string;
  releaseUrl?: string;
  notes?: string;
  publishedAt?: string;
  assetName?: string;
  assetUrl?: string;
  size?: number;
  sha256?: string;
  message?: string;
}

export interface UpdateProgress {
  received: number;
  total: number;
  percent: number;
}

export interface GithubAsset {
  name: string;
  browser_download_url: string;
  size?: number;
  digest?: string | null;
}

export interface GithubRelease {
  tag_name?: string;
  html_url?: string;
  body?: string;
  published_at?: string;
  assets?: GithubAsset[];
}

/** Strip leading "v" and compare major.minor.patch numerically. Returns -1, 0, or 1. */
export function compareVersions(a: string, b: string): -1 | 0 | 1 {
  const parse = (v: string): [number, number, number] => {
    const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(v.trim());
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 0];
  };
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    if (pa[i]! < pb[i]!) return -1;
    if (pa[i]! > pb[i]!) return 1;
  }
  return 0;
}

/** Only allow GitHub release URLs (plus localhost when a test overrides TILEWRIGHT_UPDATE_URL). */
export function isAllowedUpdateUrl(raw: string, allowLocal = false): boolean {
  try {
    const u = new URL(raw);
    if (allowLocal && u.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]', '::1'].includes(u.hostname)) return true;
    if (u.protocol !== 'https:') return false;
    const h = u.hostname.toLowerCase();
    return h === 'github.com' || h === 'api.github.com' || h === 'githubusercontent.com' || h.endsWith('.githubusercontent.com');
  } catch {
    return false;
  }
}

/** Pick the right installer asset for the current OS. */
export function pickInstallerAsset(assets: GithubAsset[], platform: NodeJS.Platform = process.platform): GithubAsset | undefined {
  if (platform === 'win32') {
    return (
      assets.find((a) => /^Tilewright-.*-win\.exe$/i.test(a.name)) ??
      assets.find((a) => /\.exe$/i.test(a.name))
    );
  }
  if (platform === 'darwin') return assets.find((a) => /\.(dmg|zip)$/i.test(a.name));
  return assets.find((a) => /\.(AppImage|deb|tar\.gz)$/i.test(a.name));
}

/** Extract a 64-char hex sha256 from GitHub's asset `digest` field ("sha256:...") if present. */
export function extractSha256(digest?: string | null): string | undefined {
  if (!digest) return undefined;
  const m = /^(?:sha256:)?([a-f0-9]{64})$/i.exec(digest.trim());
  return m ? m[1]!.toLowerCase() : undefined;
}

/** Parse a GitHub release JSON response into our structured update result. */
export function parseRelease(current: string, rel: GithubRelease, platform: NodeJS.Platform = process.platform): UpdateCheckResult {
  const latest = (rel.tag_name ?? '').replace(/^v/i, '').trim();
  if (!latest) return { status: 'error', current, message: 'The latest release did not include a version number.' };
  const releaseUrl = rel.html_url || RELEASES_PAGE;
  const notes = (rel.body ?? '').trim();
  const publishedAt = rel.published_at ?? '';
  if (compareVersions(current, latest) >= 0) {
    return { status: 'up-to-date', current, latest, releaseUrl, notes, publishedAt };
  }
  const asset = pickInstallerAsset(rel.assets ?? [], platform);
  return {
    status: 'available',
    current,
    latest,
    releaseUrl,
    notes,
    publishedAt,
    assetName: asset?.name,
    assetUrl: asset?.browser_download_url,
    size: asset?.size,
    sha256: extractSha256(asset?.digest),
  };
}

/** Compute SHA-256 hex digest of a file on disk. */
export async function fileSha256(filePath: string): Promise<string> {
  const hash = crypto.createHash('sha256');
  const buf = await fs.readFile(filePath);
  hash.update(buf);
  return hash.digest('hex');
}

export function registerUpdater(opts: { testMode: boolean }): void {
  let lastAvailable: UpdateCheckResult | null = null;
  let downloadedFile: string | null = null;
  let downloading = false;

  const customUrl = process.env.TILEWRIGHT_UPDATE_URL;
  const allowLocal = Boolean(customUrl);
  const apiUrl = customUrl || DEFAULT_RELEASE_API;

  ipcMain.handle('updater:check', async (): Promise<UpdateCheckResult> => {
    const current = app.getVersion();
    // Keep offline/e2e test runs deterministic unless a test explicitly sets TILEWRIGHT_UPDATE_URL.
    if (opts.testMode && !customUrl) {
      return { status: 'up-to-date', current, latest: current, releaseUrl: RELEASES_PAGE };
    }
    if (!isAllowedUpdateUrl(apiUrl, allowLocal)) {
      return { status: 'error', current, message: 'The update address is not allowed.' };
    }
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 15_000);
    try {
      const res = await fetch(apiUrl, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': `Tilewright/${current}` },
        signal: ctl.signal,
      });
      if (res.status === 404) {
        return { status: 'up-to-date', current, latest: current, releaseUrl: RELEASES_PAGE, notes: 'No published releases found yet.' };
      }
      if (!res.ok) {
        return { status: 'error', current, message: `GitHub answered with status ${res.status}.` };
      }
      const rel = (await res.json()) as GithubRelease;
      const result = parseRelease(current, rel);
      // If RELEASE.json was uploaded alongside the installer and no digest was on the asset, grab its sha256.
      if (result.status === 'available' && !result.sha256) {
        const meta = (rel.assets ?? []).find((a) => a.name === 'RELEASE.json');
        if (meta && isAllowedUpdateUrl(meta.browser_download_url, allowLocal)) {
          try {
            const mr = await fetch(meta.browser_download_url, { headers: { 'User-Agent': `Tilewright/${current}` }, signal: ctl.signal });
            if (mr.ok) {
              const j = (await mr.json()) as { sha256?: string };
              result.sha256 = extractSha256(j.sha256);
            }
          } catch {
            /* checksum metadata is optional */
          }
        }
      }
      lastAvailable = result.status === 'available' ? result : null;
      return result;
    } catch (e) {
      return {
        status: 'error',
        current,
        message: ctl.signal.aborted ? 'Checking for updates timed out.' : `Could not check for updates: ${(e as Error).message}`,
      };
    } finally {
      clearTimeout(timer);
    }
  });

  ipcMain.handle('updater:download', async (event): Promise<{ path: string; name: string }> => {
    if (downloading) throw new Error('An update is already downloading.');
    if (!lastAvailable || lastAvailable.status !== 'available' || !lastAvailable.assetUrl || !lastAvailable.assetName) {
      throw new Error('No downloadable update is ready. Check for updates first.');
    }
    if (!isAllowedUpdateUrl(lastAvailable.assetUrl, allowLocal)) {
      throw new Error('The installer download address is not allowed.');
    }
    const safeName = path.basename(lastAvailable.assetName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const dir = path.join(app.getPath('userData'), 'updates');
    await fs.mkdir(dir, { recursive: true });
    const target = path.join(dir, safeName);
    const part = `${target}.part`;

    downloading = true;
    try {
      const res = await fetch(lastAvailable.assetUrl, {
        headers: { 'User-Agent': `Tilewright/${app.getVersion()}` },
      });
      if (!res.ok || !res.body) throw new Error(`Download failed (status ${res.status}).`);
      const total = Number(res.headers.get('content-length') ?? lastAvailable.size ?? 0);
      const hash = crypto.createHash('sha256');
      const ws = fsSync.createWriteStream(part);
      let received = 0;
      let lastReport = 0;

      const reader = res.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!value) continue;
          hash.update(value);
          received += value.byteLength;
          if (!ws.write(value)) {
            await new Promise<void>((resolve) => ws.once('drain', resolve));
          }
          const now = Date.now();
          if (now - lastReport >= 120) {
            lastReport = now;
            const percent = total > 0 ? Math.min(100, Math.round((received / total) * 100)) : 0;
            event.sender.send('updater:progress', { received, total, percent } satisfies UpdateProgress);
          }
        }
      } finally {
        await new Promise<void>((resolve, reject) => {
          ws.on('finish', resolve);
          ws.on('error', reject);
          ws.end();
        });
      }

      if (lastAvailable.sha256) {
        const actual = hash.digest('hex');
        if (actual !== lastAvailable.sha256) {
          await fs.rm(part, { force: true });
          throw new Error('The downloaded installer did not match its checksum and was discarded.');
        }
      }
      await fs.rename(part, target);
      downloadedFile = target;
      event.sender.send('updater:progress', { received, total: total || received, percent: 100 } satisfies UpdateProgress);
      return { path: target, name: safeName };
    } catch (e) {
      await fs.rm(part, { force: true }).catch(() => undefined);
      throw e;
    } finally {
      downloading = false;
    }
  });

  ipcMain.handle('updater:install', async (): Promise<{ launched: boolean }> => {
    if (!downloadedFile || !fsSync.existsSync(downloadedFile)) {
      throw new Error('No downloaded installer is ready yet.');
    }
    const updatesRoot = path.resolve(app.getPath('userData'), 'updates');
    const resolved = path.resolve(downloadedFile);
    if (!resolved.startsWith(updatesRoot + path.sep)) {
      throw new Error('Refused to launch an installer outside the updates folder.');
    }
    if (process.platform === 'win32') {
      const child = spawn(resolved, [], { detached: true, stdio: 'ignore' });
      child.unref();
    } else {
      await shell.openPath(resolved);
    }
    setTimeout(() => app.quit(), 250);
    return { launched: true };
  });

  ipcMain.handle('updater:open-release', async (_e, url?: string): Promise<void> => {
    const target = url && isAllowedUpdateUrl(url, allowLocal) ? url : RELEASES_PAGE;
    await shell.openExternal(target);
  });
}
