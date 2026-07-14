// Standalone bootstrap intentionally omitted.
// The Dashboard loads src/plugin.tsx, owns React rendering, and registers
// CharlieCockpitPage through window.HERMES_PLUGINS.
export { CharlieCockpitPage } from './plugin';
