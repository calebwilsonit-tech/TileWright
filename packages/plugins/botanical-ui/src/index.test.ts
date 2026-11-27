import { describe, expect, it } from 'vitest';
import { botanicalBackdropWidget, botanicalCornersWidget, botanicalFlourishWidget, botanicalKeysWidget, botanicalUiPlugin } from './index';

describe('botanical-ui plugin', () => {
  it('registers all four botanical UI widgets', () => {
    const registered: string[] = [];
    botanicalUiPlugin.install({
      widget(w: { id: string }) {
        registered.push(w.id);
      },
    } as never);
    expect(registered).toEqual(['botanical-backdrop', 'botanical-flourish', 'botanical-corners', 'botanical-keys']);
  });

  it('scopes all custom CSS to games that mount a botanical widget', () => {
    expect(botanicalBackdropWidget.css).toContain('.tw-screens:has(.tw-botanical-scope)');
    expect(botanicalFlourishWidget.css).toContain('.tw-botanical-flourish');
    expect(botanicalCornersWidget.css).toContain('.tw-botanical-corners');
    expect(botanicalKeysWidget.css).toContain('.tw-botanical-keys');
  });
});
