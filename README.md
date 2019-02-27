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

```javascript
const React = require('react');
const Scrollyteller = require('@abcnews/scrollyteller');

// Some kind of dockable visualisation that goes with the scrolling text
const GraphicOfSomeKind = require('./GraphicOfSomeKind');

class Story extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      property: ''
    };
  }

  render() {
    // Content is loaded somehow into an array of { marker: {...}, nodes: [...DOMNodes] }
    const panels = ...?

    return (
      <Scrollyteller panels={panels} onMarker={config => this.setState(state => ({ property: config.thing }))}>
        <GraphicOfSomeKind property={this.state.property} />
      </Scrollyteller>
    );
  }
}

module.exports = Story;
```

The `Scrollyteller` can also takes a `panelClassName` prop which it will pass to each panel component for customising the look.

To completely customise how panels are rendered you can pass in `panelComponent`. This should be a React class component (not a stateless component) and must call `props.reference(<DOMNode>)` with a valid DOM node (usually the base ref of a given panel). This is needed for detecting marker scroll positions when navigating the scrollyteller.

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

```javascript
const Scrollyteller = require('@abcnews/scrollyteller');

const scrollyData = Scrollyteller.loadOdysseyScrollyteller(
  "",       // If set to eg. "one" use #scrollytellerNAMEone in CoreMedia
  "u-full", // Class to apply to mount point u-full makes it full width in Odyssey
  "mark"    // Name of marker in CoreMedia eg. for "point" use #point default: #mark
  );

// Then pass them to the Scrollyteller component
<Scrollyteller panels={scrollyData.panels} ... />

// You could also use React Portals to mount on the mount node
ReactDOM.createPortal(
  <Scrollyteller ... />,
  scrollyData.mountNode
)
```

## scrollTween

Pass a function to `scrollTween` and scrollyteller will call that function on scroll, passing the number of pixels above the fold and the panel config.

eg.

```javascript
const scrollTweener = (pixelsAbove, panel) => {
  if (panel.id !== 0) return; // Operate only in between the first panel
  if (pixelsAbove < 0) return; // Only when past the fold
  if (pixelsAbove > window.innerHeight) return; // Stop after scrolled past the screen

  let mapPitch = pitchScale(pixelsAbove); // example of use with Mapbox
  map.setPitch(mapPitch);
}

// ... and in the return

<Scrollyteller
  panels={scrollyData.panels}
  onMarker={markTrigger}
  className={`scrolly Block is-richtext ${styles.scrollyteller}`}
  panelClassName={"Block-content u-richtext " + styles.scrollyText}
  scrollTween={scrollTweener} // Add this prop and parse a function
>
```

## Authors

* Nathan Hoad ([hoad.nathan@abc.net.au](mailto:hoad.nathan@abc.net.au))
* Simon Elvery ([elvery.simon@abc.net.au](mailto:elvery.simon@abc.net.au))
* Joshua Byrd ([byrd.joshua@abc.net.au](mailto:byrd.joshua@abc.net.au))
