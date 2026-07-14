/// <reference types="vite/client" />

interface Window {
  __HERMES_PLUGIN_SDK__?: {
    fetchJSON<T>(path: string): Promise<T>;
  };
}
