import { React } from './host-react';

// Vite/Vitest's development JSX transform uses jsxDEV. Keep it on the same
// host-provided React runtime as the production JSX helpers.
export const Fragment = React.Fragment;
export const jsxDEV = React.createElement;
