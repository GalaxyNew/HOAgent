import './index.css';
import { CharlieCockpitPage } from './CharlieCockpitPage';

declare global {
  interface Window {
    HERMES_PLUGINS?: {
      register(name: string, component: typeof CharlieCockpitPage): void;
    };
  }
}

if (typeof window !== 'undefined' && window.HERMES_PLUGINS) {
  window.HERMES_PLUGINS.register('charlie-cockpit', CharlieCockpitPage);
}

export { CharlieCockpitPage };
