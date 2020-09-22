import React from 'react';
import renderer from 'react-test-renderer';

import Worm from '.';

describe('Worm', () => {
  test('It renders', () => {
    const component = renderer.create(<Worm />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
