/// <reference types="vite/client" />

import type * as React from 'react';

declare global {
  interface Window {
    __HERMES_PLUGIN_SDK__?: {
      React?: typeof React;
      fetchJSON<T>(path: string): Promise<T>;
    };
    HERMES_PLUGINS?: {
      register(name: string, component: React.ComponentType): void;
    };
  }
}

export {};
