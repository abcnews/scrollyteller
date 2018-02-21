const alternatingCaseToObject = require('@abcnews/alternating-case-to-object');

/**
 * Finds and grabs any nodes between #scrollyteller and #endscrollyteller
 * @param {string?} name The hash name for a scrollyteller (optional if there is only one on the page)
 * @param {string?} className The className to apply to the mount node
 * @param {string?} markerName The hash name for markers
 * @returns {object}
 */
function loadScrollyteller(name, className, markerName) {
  markerName = markerName || 'mark';
  window.__scrollytellers = window.__scrollytellers || {};

  // Maybe there is only one on the page so we don't need to name them?
  const selector = name ? `scrollytellerNAME${name}` : 'scrollyteller';

  if (!window.__scrollytellers[name]) {
    // Grab any nodes between #scrollytellerNAME<name>
    const firstNode = document.querySelector(`[name^=${selector}]`);

    let node = firstNode.nextSibling;
    let nodes = [];
    let hasMoreContent = true;
    while (hasMoreContent && node) {
      if (node.tagName && (node.getAttribute('name') || '').indexOf(`endscrollyteller`) > -1) {
        hasMoreContent = false;
      } else {
        nodes.push(node);
        node = node.nextSibling;
      }
    }

    const initialMarker = alternatingCaseToObject(firstNode.getAttribute('name').slice(selector.length));
    window.__scrollytellers[name] = {
      mountNode: createMountNode(name, className),
      panels: loadPanels(nodes, initialMarker, markerName)
    };
  }

  return window.__scrollytellers[name];
}

/**
 * Parse a list of nodes loocking for anchors starting with a given name
 * @param {array<DOMNode>} nodes
 * @param {object} initialMarker
 * @param {string} name
 */
function loadPanels(nodes, initialMarker, name) {
  let panels = [];
  let nextConfig = initialMarker;
  let nextNodes = [];

  let idx = 0;

  // Commit the current nodes to a marker
  function pushPanel() {
    if (nextNodes.length === 0) return;

    panels.push({
      idx: idx++,
      config: nextConfig,
      nodes: nextNodes
    });
    nextNodes = [];
  }

  // Check the section nodes for panels and marker content
  nodes.forEach((node, index) => {
    if (node.tagName === 'A' && node.getAttribute('name') && node.getAttribute('name').indexOf(name) === 0) {
      // Found a new marker so we should commit the last one
      pushPanel();

      // If marker has no config then just use the previous config
      let configString = node.getAttribute('name').replace(new RegExp(`^${name}`), '');
      if (configString) {
        nextConfig = alternatingCaseToObject(configString);
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
 * @param {string} name
 * @param {string} className
 */
function createMountNode(name, className) {
  const selector = name ? `scrollytellerNAME${name}` : 'scrollyteller';
  const mountParent = document.querySelector(`[name^=${selector}]`);
  const mountNode = document.createElement('div');
  mountNode.className = className || '';
  mountParent.parentNode.insertBefore(mountNode, mountParent);

  return mountNode;
}

module.exports = { loadScrollyteller, createMountNode };
