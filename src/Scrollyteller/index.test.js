const React = require('react');
const { shallow } = require('enzyme');
const Scrollyteller = require('.');
const Panel = require('..');

describe('Scrollyteller', () => {
  const panels = [
    {
      config: {
        right: true
      },
      nodes: []
    }
  ];

  it('renders', () => {
    const base = shallow(
      <Scrollyteller panels={panels}>
        <div id="graphic" />
      </Scrollyteller>
    );

    expect(base.childAt(0).contains(<div id="graphic" />)).toBeTruthy();
    expect(base.text()).toContain('<Panel />');
  });

  it('can render the background in front', () => {
    const base = shallow(
      <Scrollyteller panels={panels} config={{ graphicInFront: true }}>
        <div id="graphic" />
      </Scrollyteller>
    );

    expect(base.childAt(1).contains(<div id="graphic" />)).toBeTruthy();
    expect(base.text()).toContain('<Panel />');
  });
});
