# Scrollyteller

A scrollyteller component for React

## Usage

The scrollyteller takes a series of **panels** of content nodes and turns them into piecemeal boxes.

The `panels` prop is in the format of:

    [
      {
        config: {
          info: 'Some kind of config that is given when this marker is active'
        },
        nodes: [
          ...DOM elements for this panel...
        ]
      },
      {
        config: {
          thing: 'This will be given when the second marker is hit'
        },
        nodes: [
          ...DOM elements for this panel...
        ]
      }
    ]

When a new box comes into view `onMarker` will be called with the `config` of the incoming panel.

Example:

```tsx
import * as React from 'react';
import Scrollyteller from '@abcnews/scrollyteller';

// Some kind of dockable visualisation that goes with the scrolling text
import GraphicOfSomeKind from './GraphicOfSomeKind';

export default () => {
  const [something, setSomething] = React.useState('');

  // Content is loaded somehow into an array of { marker: {...}, nodes: [...DOMNodes] }
  const panels = ...?

  return (
    <Scrollyteller panels={panels} onMarker={config => setSomething(config.thing)}>
      <GraphicOfSomeKind property={something} />
    </Scrollyteller>
  );
}

module.exports = Story;
```

## Customising

The `Scrollyteller` can also takes a `panelClassName` prop which it will pass to each panel component for customising the look.

To completely customise how panels are rendered you can pass in `panelComponent`. This should be a React class component (not a stateless component) and must call `props.reference(<DOMNode>)` with a valid DOM node (usually the base ref of a given panel). This is needed for detecting marker scroll positions when navigating the scrollyteller.

```tsx
import * as React from 'react';

interface Props {
  nodes: any[];
  reference: (base: HTMLElement) => void;
}

export default (props: Props) => {
  const base = React.useRef(null);
  const innerBase = React.useRef(null);

  React.useEffect(() => {
    props.reference(base.current);
    props.nodes.forEach((node: HTMLElement) => {
      innerBase.current.appendChild(node);
    });

    return () => {
      props.nodes.forEach((node: HTMLElement) => {
        innerBase.current.removeChild(node);
      });
    };
  }, []);

  return (
    <div ref={base} style={{ zIndex: 1, height: '80vh', fontSize: '40px' }}>
      <strong>THIS IS A PANEL:</strong>
      <div ref={innerBase} />
    </div>
  );
};
```

And then specify `<Scrollyteller panelComponent={CustomPanel}>`.

## Usage with Odyssey

When developing [ABC News](https://www.abc.net.au) stories with [Odyssey](https://github.com/abcnews/odyssey) you can use the `loadOdysseyScrollyteller` function to gather `panels` within a CoreMedia article.

CoreMedia text:

```
#scrollytellerVARIABLEvalue
This is the opening paragraph panel
#markVARIABLEvalue
This is a second panel
#markVARval
This is another paragraph
#endscrollyteller
```

JS Code:

```tsx
import Scrollyteller, { loadOdysseyScrollyteller } from '@abcnews/scrollyteller';

const scrollyData = loadOdysseyScrollyteller(
  "",       // If set to eg. "one" use #scrollytellerNAMEone in CoreMedia
  "u-full", // Class to apply to mount point u-full makes it full width in Odyssey
  "mark"    // Name of marker in CoreMedia eg. for "point" use #point default: #mark
);

// Then pass them to the Scrollyteller component
ReactDOM.render(
  <Scrollyteller panels={scrollyData.panels} ... />,
  scrollyData.mountNode
);

// You could also use React Portals to mount on the mount node
ReactDOM.createPortal(
  <Scrollyteller ... />,
  scrollyData.mountNode
);
```

## Authors

- Nathan Hoad ([hoad.nathan@abc.net.au](mailto:hoad.nathan@abc.net.au))
- Simon Elvery ([elvery.simon@abc.net.au](mailto:elvery.simon@abc.net.au))
- Joshua Byrd ([byrd.joshua@abc.net.au](mailto:byrd.joshua@abc.net.au))
