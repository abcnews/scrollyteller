import acto from '@abcnews/alternating-case-to-object';
import { selectMounts, isMount, getMountValue } from '@abcnews/mount-utils';
import { PanelDefinition, PanelAlignment } from './Panel';
import { ScrollytellerTheme } from './Scrollyteller';

const piecemeal = Symbol('piecemeal');

type PanelMeta = {
  [piecemeal]?: boolean;
  align?: PanelAlignment;
};

export type ScrollytellerConfig = {
  theme?: ScrollytellerTheme;
  waypoint?: number;
  graphicinfront?: boolean;
};

export type ScrollytellerDefinition<T extends unknown> = {
  mountNode: Element;
  panels: PanelDefinition<T>[];
  config: ScrollytellerConfig;
};

declare global {
  interface Window {
    __scrollytellers: {
      [key: string]: any;
    };
  }
}

const SELECTOR_COMMON = 'scrollyteller';

function excludeScrollytellerConfig<T>(config: ScrollytellerConfig & T): T {
  const _config = {
    ...config,
  };

  delete _config.theme;
  delete _config.waypoint;
  delete _config.graphicinfront;

  return _config as T;
}

function excludePanelMeta<T>(config: T & PanelMeta): T {
  const _config = {
    ...config,
  };

  delete _config[piecemeal];
  delete _config.align;

  return _config as T;
}

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

    const config = acto(
      getMountValue(firstEl, openingMountValuePrefix)
    ) as ScrollytellerConfig & T;

    const els: Element[] = [];
    let el: Element | null = firstEl.nextElementSibling;
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
      config: {
        waypoint: config.waypoint ? config.waypoint / 100 : undefined,
        theme: config.theme,
        graphicInFront: config.graphicinfront,
      },
      panels: loadPanels<T>(
        els,
        excludeScrollytellerConfig<T>(config),
        markerName
      ),
    };
  }

  return window.__scrollytellers[name];
};

/**
 * Parse a list of nodes looking for anchors starting with a given name
 * @param nodes
 * @param initialMarker
 * @param name
 */
const loadPanels = <T>(
  nodes: Node[],
  initialConfig: T,
  name: string
): PanelDefinition<T>[] => {
  const panels: PanelDefinition<T>[] = [];
  let nextConfigAndMeta: PanelMeta & T = initialConfig;
  let nextNodes: Node[] = [];

  // Commit the current nodes to a marker
  function pushPanel() {
    if (nextNodes.length === 0) return;

    panels.push({
      align: nextConfigAndMeta.align,
      data: excludePanelMeta<T>(nextConfigAndMeta),
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
      const configString: string = getMountValue(node, name);

      if (configString) {
        nextConfigAndMeta = (acto(configString) as unknown) as T;
      } else {
        // Empty marks should stop the piecemeal flow
        nextConfigAndMeta[piecemeal] = false;
      }
    } else {
      // Any other nodes just get grouped for the next marker
      nextNodes.push(node);
    }

    // Any trailing nodes just get added as a last marker
    if (index === nodes.length - 1) {
      pushPanel();
    }

    // If piecemeal is on/true then each node has its own box
    if (nextConfigAndMeta[piecemeal]) {
      pushPanel();
    }

    // Remove the node from the document to keep things tidy
    node.parentNode && node.parentNode.removeChild(node);
  });

  return panels;
};
