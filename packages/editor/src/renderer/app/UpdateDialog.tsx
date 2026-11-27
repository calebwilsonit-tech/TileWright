import { useCallback, useEffect, useState } from 'react';
import { api } from '../project/api';

export interface UpdateState {
  status: 'idle' | 'checking' | 'up-to-date' | 'available' | 'downloading' | 'ready' | 'error';
  current: string;
  latest?: string;
  releaseUrl?: string;
  notes?: string;
  publishedAt?: string;
  assetName?: string;
  assetUrl?: string;
  size?: number;
  received?: number;
  total?: number;
  percent?: number;
  message?: string;
}

const listeners = new Set<(s: UpdateState) => void>();
let shared: UpdateState = { status: 'idle', current: '' };
let checkedOnce = false;

function publish(next: UpdateState): void {
  shared = next;
  for (const fn of listeners) fn(next);
}

function formatBytes(n: number): string {
  if (!n || n <= 0) return '0 MB';
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export async function checkForUpdates(): Promise<void> {
  const updater = api().updater;
  if (!updater) {
    publish({ status: 'error', current: shared.current, message: 'Updates are only available in the desktop app.' });
    return;
  }
  checkedOnce = true;
  publish({ ...shared, status: 'checking', message: undefined });
  try {
    const r = await updater.check();
    publish({
      status: r.status,
      current: r.current,
      latest: r.latest,
      releaseUrl: r.releaseUrl,
      notes: r.notes,
      publishedAt: r.publishedAt,
      assetName: r.assetName,
      assetUrl: r.assetUrl,
      size: r.size,
      message: r.message,
    });
  } catch (e) {
    publish({ status: 'error', current: shared.current, message: (e as Error).message });
  }
}

/** Shared update status across the toolbar, welcome screen and dialog; runs one quiet check at startup. */
export function useUpdateStatus(): UpdateState {
  const [state, setState] = useState<UpdateState>(shared);
  useEffect(() => {
    listeners.add(setState);
    setState(shared);
    if (!checkedOnce && api().updater) {
      checkedOnce = true;
      void api()
        .info()
        .then((info) => {
          if (!info.testMode) void checkForUpdates();
        })
        .catch(() => undefined);
    }
    return () => {
      listeners.delete(setState);
    };
  }, []);
  return state;
}

/** Open the updater dialog from anywhere (toolbar version badge, welcome screen, command palette). */
export function openUpdateDialog(): void {
  document.dispatchEvent(new CustomEvent('tw:updates'));
}

export function UpdateDialog() {
  const [open, setOpen] = useState(false);
  const state = useUpdateStatus();
  const [buildInfo, setBuildInfo] = useState<{ version: string; commit?: string; release?: boolean; builtAt?: string } | null>(null);

  useEffect(() => {
    const show = (): void => {
      setOpen(true);
      void api().info().then(setBuildInfo).catch(() => undefined);
      if (shared.status === 'idle' || shared.status === 'error') void checkForUpdates();
    };
    document.addEventListener('tw:updates', show);
    return () => document.removeEventListener('tw:updates', show);
  }, []);

  useEffect(() => {
    const updater = api().updater;
    if (!updater) return;
    return updater.onProgress((p) => {
      publish({ ...shared, status: 'downloading', received: p.received, total: p.total, percent: p.percent });
    });
  }, []);

  const download = useCallback(async () => {
    const updater = api().updater;
    if (!updater) return;
    publish({ ...shared, status: 'downloading', received: 0, total: shared.size ?? 0, percent: 0, message: undefined });
    try {
      await updater.download();
      publish({ ...shared, status: 'ready', percent: 100 });
    } catch (e) {
      publish({ ...shared, status: 'error', message: (e as Error).message });
    }
  }, []);

  const install = useCallback(async () => {
    const updater = api().updater;
    if (!updater) return;
    try {
      await updater.install();
    } catch (e) {
      publish({ ...shared, status: 'error', message: (e as Error).message });
    }
  }, []);

  const openRelease = useCallback(() => {
    void api().updater?.openRelease(state.releaseUrl);
  }, [state.releaseUrl]);

  if (!open) return null;
  const current = buildInfo?.version || state.current || '—';
  const busy = state.status === 'checking' || state.status === 'downloading';

  return (
    <div className="modal-backdrop" onMouseDown={() => !busy && setOpen(false)}>
      <div className="dialog update-dialog" role="dialog" aria-label="Tilewright updates" data-testid="update-dialog" onMouseDown={(e) => e.stopPropagation()}>
        <h2>Tilewright updates</h2>
        <p className="hint">
          Installed: <strong>v{current}</strong>
          {buildInfo?.commit ? ` (${buildInfo.commit}${buildInfo.release ? ', release' : ', development build'})` : ''}
        </p>

        {state.status === 'checking' && <p>Checking GitHub for a newer release…</p>}

        {state.status === 'up-to-date' && (
          <p data-testid="update-status">
            You are up to date (v{state.latest ?? current}).
          </p>
        )}

        {state.status === 'available' && (
          <div data-testid="update-status">
            <p>
              <strong>Tilewright v{state.latest}</strong> is available
              {state.size ? ` (${formatBytes(state.size)})` : ''}.
            </p>
            {state.notes && <pre className="update-notes">{state.notes}</pre>}
          </div>
        )}

        {state.status === 'downloading' && (
          <div className="update-progress" data-testid="update-progress">
            <p>
              Downloading {state.assetName ?? 'installer'}… {state.percent ?? 0}%
              {state.total ? ` (${formatBytes(state.received ?? 0)} / ${formatBytes(state.total)})` : ''}
            </p>
            <div className="update-bar">
              <div className="update-bar-fill" style={{ width: `${state.percent ?? 0}%` }} />
            </div>
          </div>
        )}

        {state.status === 'ready' && (
          <div data-testid="update-status">
            <p>
              <strong>Tilewright v{state.latest}</strong> is downloaded and ready to install.
            </p>
            <p className="hint">Save any open project first. Tilewright will close and launch the installer.</p>
          </div>
        )}

        {state.status === 'error' && (
          <p className="update-error" data-testid="update-error">
            {state.message ?? 'Could not check for updates.'}
          </p>
        )}

        <div className="row end">
          <button onClick={() => void checkForUpdates()} disabled={busy} data-testid="btn-update-check">
            Check again
          </button>
          {state.releaseUrl && (
            <button onClick={openRelease} data-testid="btn-update-release">
              Release page
            </button>
          )}
          {state.status === 'available' && state.assetUrl && (
            <button className="primary" onClick={() => void download()} data-testid="btn-update-download">
              Download update
            </button>
          )}
          {state.status === 'ready' && (
            <button className="primary" onClick={() => void install()} data-testid="btn-update-install">
              Install and restart
            </button>
          )}
          <button onClick={() => setOpen(false)} disabled={busy} data-testid="btn-update-close">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
