import acto from '@abcnews/alternating-case-to-object';
import {
  exactMountSelector,
  getTrailingMountValue,
  isMount,
  isPrefixedMount,
  prefixedMountSelector,
} from '@abcnews/mount-utils';
import { ACTOConfig, Panel, Scrollyteller } from './types';

declare global {
  interface Window {
    __scrollytellers: {
      [key: string]: Scrollyteller;
    };
  }
}

const SELECTOR_COMMON = 'scrollyteller';
const CLOSING_MOUNT_SELECTOR = exactMountSelector(`end${SELECTOR_COMMON}`);

/**
 * Finds and grabs any nodes between #scrollyteller and #endscrollyteller
 * @param name The hash name for a scrollyteller (optional if there is only one on the page)
 * @param className The className to apply to the mount node
 * @param markerName The hash name for markers
 */
export function loadScrollyteller(
  name?: string,
  className?: string,
  markerName?: string
): Scrollyteller {
  markerName = markerName || 'mark';
  window.__scrollytellers = window.__scrollytellers || {};

  const openingMountValuePrefix: string = `${SELECTOR_COMMON}${
    name ? `NAME${name}` : ''
  }`;
  const openingMountSelector: string = prefixedMountSelector(
    openingMountValuePrefix
  );

  name = name || 'scrollyteller';

  if (!window.__scrollytellers[name]) {
    const firstEl: Element | null = document.querySelector(
      openingMountSelector
    );

    if (!isMount(firstEl) || firstEl === null) {
      throw new Error('Attempting to mount to a non-mount node');
    }

    const config: ACTOConfig = acto(
      getTrailingMountValue(firstEl, openingMountValuePrefix)
    );

    let el: Element | null = firstEl.nextElementSibling;
    let els: Element[] = [];
    let hasMoreContent: boolean = true;

    while (hasMoreContent && el) {
      if (isMount(el) && el.matches(CLOSING_MOUNT_SELECTOR)) {
        hasMoreContent = false;
      } else {
        els.push(el);
        el = el.nextElementSibling;
      }
    }

    window.__scrollytellers[name] = {
      mountNode: createMountNode(name, className),
      panels: loadPanels(els, config, markerName),
    };
  }

  return window.__scrollytellers[name];
}

/**
 * Parse a list of nodes loocking for anchors starting with a given name
 * @param nodes
 * @param initialMarker
 * @param name
 */
function loadPanels(
  nodes: Node[],
  initialMarker: ACTOConfig,
  name: string
): Panel[] {
  let panels: Panel[] = [];
  let nextConfig: ACTOConfig = initialMarker;
  let nextNodes: Node[] = [];
  let id: number = 0;

  // Commit the current nodes to a marker
  function pushPanel() {
    if (nextNodes.length === 0) return;

    panels.push({
      id: id++,
      config: nextConfig,
      nodes: nextNodes,
    });
    nextNodes = [];
  }

  // Check the section nodes for panels and marker content
  nodes.forEach((node: Node, index: number) => {
    if (isPrefixedMount(node, name)) {
      // Found a new marker so we should commit the last one
      pushPanel();

      // If marker has no config then just use the previous config
      let configString: string = getTrailingMountValue(node, name);

      if (configString) {
        nextConfig = acto(configString);
        nextConfig.hash = configString;
      } else {
        // Empty marks should stop the piecemeal flow
        nextConfig.piecemeal = false;
      }
    } else {
      // Any other nodes just get grouped for the next marker
      nextNodes.push(node);
      node.parentNode && node.parentNode.removeChild(node);
    }

    // Any trailing nodes just get added as a last marker
    if (index === nodes.length - 1) {
      pushPanel();
    }

    // If piecemeal is on/true then each node has its own box
    if (nextConfig.piecemeal) {
      pushPanel();
    }
  });

  return panels;
}

/**
 * Create a node to mount a scrollyteller on
 * @param name
 * @param className
 */
export function createMountNode(name?: string, className?: string): Element {
  const openingMountValuePrefix: string = `${SELECTOR_COMMON}${
    name ? `NAME${name}` : ''
  }`;
  const openingMountSelector: string = prefixedMountSelector(
    openingMountValuePrefix
  );
  const mountSibling: Element | null = document.querySelector(
    openingMountSelector
  );

  if (mountSibling === null) {
    throw new Error('Mount node needs a sibling element');
  }

  const mountParent: Element | null = mountSibling.parentElement;

  if (mountParent === null) {
    throw new Error('Mount node needs a parent element');
  }

  const mountNode: Element = document.createElement('div');

  mountNode.className = className || '';
  mountParent.insertBefore(mountNode, mountSibling);

  return mountNode;
}
