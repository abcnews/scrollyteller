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
const Scrollyteller = require('scrollyteller');

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

## Authors

* Nathan Hoad ([hoad.nathan@abc.net.au](mailto:hoad.nathan@abc.net.au))
* Simon Elvery ([elvery.simon@abc.net.au](mailto:elvery.simon@abc.net.au))
