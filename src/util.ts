import acto from '@abcnews/alternating-case-to-object';
import { selectMounts, isMount, getMountValue } from '@abcnews/mount-utils';
import { PanelConfig, PanelDefinition } from './Panel';
import { ScrollytellerConfig } from './Scrollyteller';

export type ScrollytellerDefinition<T extends PanelConfig> = {
  mountNode: Element;
  panels: PanelDefinition<T>[];
};

declare global {
  interface Window {
    __scrollytellers: {
      [key: string]: any;
    };
  }
}

const SELECTOR_COMMON = 'scrollyteller';

/**
 * Finds and grabs any nodes between #scrollyteller and #endscrollyteller
 * @param name The hash name for a scrollyteller (optional if there is only one on the page)
 * @param className The className to apply to the mount node
 * @param markerName The hash name for markers
 */
export const loadScrollyteller = <T>(
  name?: string,
  className?: string,
  markerName: string = 'mark'
): ScrollytellerDefinition<T> => {
  window.__scrollytellers = window.__scrollytellers || {};

  const openingMountValuePrefix: string = `${SELECTOR_COMMON}${
    name ? `NAME${name}` : ''
  }`;

  name = name || 'scrollyteller';

  if (!window.__scrollytellers[name]) {
    const firstEl: Element | null = selectMounts(openingMountValuePrefix)[0];
    className && firstEl.classList.add(className);

    if (!isMount(firstEl)) {
      throw new Error('Attempting to mount to a non-mount node');
    }

    const config: ScrollytellerConfig & T = acto(
      getMountValue(firstEl, openingMountValuePrefix)
    );

    let el: Element | null = firstEl.nextElementSibling;
    let els: Element[] = [];
    let hasMoreContent: boolean = true;

    while (hasMoreContent && el) {
      if (isMount(el, `end${SELECTOR_COMMON}`, true)) {
        hasMoreContent = false;
      } else {
        els.push(el);
        el = el.nextElementSibling;
      }
    }

    window.__scrollytellers[name] = {
      mountNode: firstEl,
      panels: loadPanels<T>(els, config, markerName),
    };
  }

  return window.__scrollytellers[name];
};

/**
 * Parse a list of nodes loocking for anchors starting with a given name
 * @param nodes
 * @param initialMarker
 * @param name
 */
const loadPanels = <T>(
  nodes: Node[],
  initialMarker: ScrollytellerConfig &
    T & { hash?: string; piecemeal?: boolean },
  name: string
): PanelDefinition<T>[] => {
  let panels: PanelDefinition<T>[] = [];
  let nextConfig = initialMarker;
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
    if (isMount(node, name)) {
      // Found a new marker so we should commit the last one
      pushPanel();

      // If marker has no config then just use the previous config
      let configString: string = getMountValue(node, name);

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
};
