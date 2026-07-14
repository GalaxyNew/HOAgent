/// <reference types="vite/client" />

import type * as React from 'react';

declare global {
  interface Window {
    __HERMES_PLUGIN_SDK__?: {
      React?: typeof React;
      fetchJSON<T>(path: string): Promise<T>;
    };
    __HERMES_PLUGINS__?: {
      register(name: string, component: React.ComponentType): void;
    };
  }
}

export {};
