const React = require('react');
const Renderer = require('react-test-renderer');
const Panel = require('.');

describe('Panel', () => {
  it('renders', () => {
    const tree = Renderer.create(<Panel />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders with some config', () => {
    const tree = Renderer.create(<Panel config={{ light: true, right: true }} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
