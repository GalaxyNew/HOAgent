import type * as ReactTypes from 'react';

/** React runtime supplied by the trusted Hermes Dashboard host. */
export const React = (
  window.__HERMES_PLUGIN_SDK__ as typeof window.__HERMES_PLUGIN_SDK__ & { React?: typeof ReactTypes }
)?.React as typeof ReactTypes;

export const { useState, useEffect, useCallback, createContext, useContext } = React;
