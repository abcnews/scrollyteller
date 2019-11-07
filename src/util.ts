import * as a2o from '@abcnews/alternating-case-to-object';

/**
 * Finds and grabs any nodes between #scrollyteller and #endscrollyteller
 * @param name The hash name for a scrollyteller (optional if there is only one on the page)
 * @param className The className to apply to the mount node
 * @param markerName The hash name for markers
 */
export function loadScrollyteller(name: string, className: string, markerName: string): any {
  markerName = markerName || 'mark';
  (window as any).__scrollytellers = (window as any).__scrollytellers || {};

  // Maybe there is only one on the page so we don't need to name them?
  const selector = name ? `scrollytellerNAME${name}` : 'scrollyteller';

  if (!(window as any).__scrollytellers[name]) {
    // Grab any nodes between #scrollytellerNAME<name>
    const firstNode = document.querySelector(`[name^=${selector}]`);
    const config = a2o(firstNode.getAttribute('name').slice(selector.length));

    let node: any = firstNode.nextSibling;
    let nodes = [];
    let hasMoreContent = true;

    while (hasMoreContent && node) {
      if (!node.tagName) {
        node = node.nextSibling;
        continue;
      }
      if ((node.getAttribute('name') || '').indexOf(`endscrollyteller`) > -1) {
        hasMoreContent = false;
      } else {
        if (config.captions === 'none') {
          // Not sure why this was in here but putting it behind an optional flag
          [].slice.apply(node.querySelectorAll('.inline-caption')).forEach((child: any) => {
            child.parentNode.removeChild(child);
          });
        }
        nodes.push(node);
        node = node.nextSibling;
      }
    }

    (window as any).__scrollytellers[name] = {
      mountNode: createMountNode(name, className),
      panels: loadPanels(nodes, config, markerName)
    };
  }

  return (window as any).__scrollytellers[name];
}

/**
 * Parse a list of nodes loocking for anchors starting with a given name
 * @param nodes
 * @param initialMarker
 * @param name
 */
function loadPanels(nodes: any[], initialMarker: any, name: string) {
  let panels: any[] = [];
  let nextConfig = initialMarker;
  let nextNodes: any[] = [];

  let id = 0;

  // Commit the current nodes to a marker
  function pushPanel() {
    if (nextNodes.length === 0) return;

    panels.push({
      id: id++,
      config: nextConfig,
      nodes: nextNodes
    });
    nextNodes = [];
  }

  // Check the section nodes for panels and marker content
  nodes.forEach((node, index) => {
    if (
      node.tagName === 'A' &&
      node.getAttribute('name') &&
      node.getAttribute('name').indexOf(name) === 0
    ) {
      // Found a new marker so we should commit the last one
      pushPanel();

      // If marker has no config then just use the previous config
      let configString = node.getAttribute('name').replace(new RegExp(`^${name}`), '');
      if (configString) {
        nextConfig = a2o(configString);
        nextConfig.hash = configString;
      } else {
        // Empty marks should stop the piecemeal flow
        nextConfig.piecemeal = false;
      }
    } else if (!node.mountable) {
      // Any other nodes just get grouped for the next marker
      nextNodes.push(node);
      node.parentNode.removeChild(node);
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
export function createMountNode(name: string, className: string) {
  const selector = name ? `scrollytellerNAME${name}` : 'scrollyteller';
  const mountParent = document.querySelector(`[name^=${selector}]`);
  const mountNode = document.createElement('div');
  mountNode.className = className || '';
  mountParent.parentNode.insertBefore(mountNode, mountParent);

  return mountNode;
}
