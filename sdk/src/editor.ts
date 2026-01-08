/**
 * Editor shims for MicroPress plugins
 *
 * These re-export shared dependencies from the host application's globals.
 * This allows plugins to import from '@micropress/plugin-sdk/editor' and
 * use the same instances of libraries that the host app uses.
 */

declare global {
  interface Window {
    __MICROPRESS_PLUGINS__: {
      '@tiptap/core': typeof import('@tiptap/core');
      react: typeof import('react');
    };
    __MICROPRESS_PLUGIN_COMPONENTS__: Record<string, React.ComponentType<any>>;
  }
}

function getGlobal<T>(name: string): T {
  if (typeof window === 'undefined') {
    throw new Error(`${name} is only available in browser environment`);
  }

  const globals = window.__MICROPRESS_PLUGINS__;
  if (!globals) {
    throw new Error(
      'MicroPress plugin globals not found. ' +
      'Make sure the plugin is loaded in a MicroPress admin environment.'
    );
  }

  const module = globals[name as keyof typeof globals];
  if (!module) {
    throw new Error(`${name} not found in MicroPress plugin globals`);
  }

  return module as T;
}

// Lazy-loaded TipTap core to avoid errors when imported in non-browser environments
let _tiptapCore: typeof import('@tiptap/core') | null = null;

function getTiptapCore() {
  if (!_tiptapCore) {
    _tiptapCore = getGlobal<typeof import('@tiptap/core')>('@tiptap/core');
  }
  return _tiptapCore;
}

// Re-export commonly used TipTap exports
export const Node = new Proxy({} as typeof import('@tiptap/core').Node, {
  get(_, prop) {
    return (getTiptapCore().Node as any)[prop];
  },
});

export const Extension = new Proxy({} as typeof import('@tiptap/core').Extension, {
  get(_, prop) {
    return (getTiptapCore().Extension as any)[prop];
  },
});

export const Mark = new Proxy({} as typeof import('@tiptap/core').Mark, {
  get(_, prop) {
    return (getTiptapCore().Mark as any)[prop];
  },
});

export const mergeAttributes = (...args: Parameters<typeof import('@tiptap/core').mergeAttributes>) => {
  return getTiptapCore().mergeAttributes(...args);
};

// Export the full module for advanced usage
export const tiptapCore = {
  get current() {
    return getTiptapCore();
  },
};

// React support for plugin components
let _react: typeof import('react') | null = null;

function getReact() {
  if (!_react) {
    _react = getGlobal<typeof import('react')>('react');
  }
  return _react;
}

export const React = new Proxy({} as typeof import('react'), {
  get(_, prop) {
    return (getReact() as any)[prop];
  },
});

/**
 * Register a React component for use in the plugin system
 * @param name - Unique component name (e.g., 'archive:ImagePicker')
 * @param component - React component
 */
export function registerComponent(name: string, component: React.ComponentType<any>): void {
  if (typeof window === 'undefined') {
    throw new Error('registerComponent is only available in browser environment');
  }

  if (!window.__MICROPRESS_PLUGIN_COMPONENTS__) {
    window.__MICROPRESS_PLUGIN_COMPONENTS__ = {};
  }

  if (window.__MICROPRESS_PLUGIN_COMPONENTS__[name]) {
    console.warn(`Component ${name} is already registered. Overwriting.`);
  }

  window.__MICROPRESS_PLUGIN_COMPONENTS__[name] = component;
}
