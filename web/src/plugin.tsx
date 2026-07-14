import './index.css';
import { CharlieCockpitPage } from './CharlieCockpitPage';

declare global {
  interface Window {
    __HERMES_PLUGINS__?: {
      register(name: string, component: typeof CharlieCockpitPage): void;
    };
  }
}

if (typeof window !== 'undefined' && window.__HERMES_PLUGINS__) {
  window.__HERMES_PLUGINS__.register('charlie-cockpit', CharlieCockpitPage);
}

export { CharlieCockpitPage };
