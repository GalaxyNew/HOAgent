/// <reference types="vite/client" />

interface Window {
  __HERMES_PLUGIN_SDK__?: {
    readonly request?: unknown;
  };
}
