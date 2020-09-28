# Scrollyteller

A scrollyteller component for React

## Usage

The scrollyteller takes a series of **panels** of content nodes and turns them into a series of elements which scroll over the `<Scrollyteller>` component's children.

The `panels` prop is in the format of:

    [
      {
        data: {
          info: 'Some kind of config that is given when this marker is active'
        },
        nodes: [<DOM elements for this panel>]
      },
      {
        data: {
          thing: 'This will be given when the second marker is hit'
        },
        nodes: [<DOM elements for this panel>]
      }
    ]

When a new box comes into view `onMarker` will be called with the `data` of the incoming panel.

```jsx
import * as React from 'react';
import Scrollyteller from '@abcnews/scrollyteller';

// Some kind of dockable visualisation that goes with the scrolling text
import GraphicOfSomeKind from './GraphicOfSomeKind';

export default () => {
  const [something, setSomething] = React.useState('');
  const [progressPct, setProgresPct] = React.useState('');

  // Content is loaded somehow into an array of { data: {...}, nodes: [...DOMNodes] }
  const panels = ...?

  return (
    <Scrollyteller
      panels={panels}
      onMarker={({thing}) => setSomething(data.thing)}
      onProgress={({pctAboveFold}) => setProgress(pctAboveFold)}>
      <GraphicOfSomeKind property={something} />
    </Scrollyteller>
  );
}
```

For a more complete example using Typescript see the [vanilla example app](example/src/components/AppVanilla/index.tsx).

### Customising

The `Scrollyteller` can take a `panelClassName` prop which it will pass to each panel component for customising the look.
It can also take `firstPanelClassName` and `lastPanelClassName` props which it will pass to the respective panel components, for customising their specific looks.

To completely customise how panels are rendered you can pass in `panelComponent`. The main requirement for this component is that it calls `props.reference` with a ref to its outermost wrapper.

```tsx
import * as React from 'react';

interface Props {
  nodes: HTMLElement[];
  reference: (el: HTMLElement) => void;
}

export default (({nodes, reference}): Props) => {
  const base = React.useRef(null);
  const innerBase = React.useRef(null);

  React.useEffect(() => {
    reference(base.current);
    nodes.forEach((node: HTMLElement) => {
      innerBase.current.appendChild(node);
    });
  }, [reference]);

  return (
    <div ref={base} style={{ zIndex: 1, height: '80vh', fontSize: '40px' }}>
      <strong>THIS IS A PANEL:</strong>
      <div ref={innerBase} />
    </div>
  );
};
```

And then specify `<Scrollyteller panelComponent={CustomPanel}>`.

### Usage with Odyssey

When developing [ABC News](https://www.abc.net.au) stories with [Odyssey](https://github.com/abcnews/odyssey) you can use the `loadScrollyteller` function to gather `panels` within a CoreMedia article.

See a more complete [usage example with Odyssey](example/src) in the example project.

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
import Scrollyteller, { loadScrollyteller } from '@abcnews/scrollyteller';

const scrollyData = loadScrollyteller(
  "",       // If set to eg. "one" use #scrollytellerNAMEone in CoreMedia
  "u-full", // Class to apply to mount point u-full makes it full width in Odyssey
  "mark"    // Name of marker in CoreMedia eg. for "point" use #point default: #mark
);

// Then pass them to the Scrollyteller component
ReactDOM.render(
  <Scrollyteller panels={scrollyData.panels} {...scrollyData.config} />,
  scrollyData.mountNode
);

// You could also use React Portals to mount on the mount node
ReactDOM.createPortal(
  <Scrollyteller ... />,
  scrollyData.mountNode
);
```

## Development

This project uses [tsdx](https://tsdx.io) for build/dev tooling and [np](https://github.com/sindresorhus/np) for release management.

The recommended workflow is to run TSDX in one terminal:

```bash
npm start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

Then run [the example](#example) inside another:

```bash
cd example
npm i
aunty serve
```

The example imports and live reloads whatever is in `/dist`, so if you are seeing an out of date component, make sure TSDX is running in watch mode as recommended above.

To do a one-off build, use `npm run build`.

To run tests, use `npm test` or `yarn test`.

### Example

Mostly to aid development and demonstrate usage, there is an example project in `/example`. It uses [aunty](https://github.com/abcnews/aunty) as the build tool to match the usual ABC News interactive development work flow.

### Jest

Jest tests are set up to run with `npm test` or `yarn test`.

### Bundle analysis

Calculates the real cost of your library using [size-limit](https://github.com/ai/size-limit) with `npm run size` and visulize it with `npm run analyse`.

### Releasing

To release a new version to NPM run `npm run release` and follow the prompts.

### Jest

Jest tests are set up to run with `npm test` or `yarn test`.

### Bundle analysis

Calculates the real cost of your library using [size-limit](https://github.com/ai/size-limit) with `npm run size` and visulize it with `npm run analyze`.

### Optimizations

Please see the main `tsdx` [optimizations docs](https://github.com/palmerhq/tsdx#optimizations). In particular, know that you can take advantage of development-only optimizations:

```js
// ./types/index.d.ts
declare var __DEV__: boolean;

// inside your code...
if (__DEV__) {
  console.log('foo');
}
```

## Authors

- Nathan Hoad ([nathan@nathanhoad.net](mailto:nathan@nathanhoad.net))
- Simon Elvery ([elvery.simon@abc.net.au](mailto:elvery.simon@abc.net.au))
- Joshua Byrd ([byrd.joshua@abc.net.au](mailto:byrd.joshua@abc.net.au))
- Colin Gourlay ([gourlay.colin@abc.net.au](mailto:gourlay.colin@abc.net.au))
