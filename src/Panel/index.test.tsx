import * as React from 'react';
import { render } from '@testing-library/react';
import Panel from '.';

describe('Panel', () => {
  it('renders nodes', () => {
    const p = document.createElement('p');
    p.textContent = 'This is a paragraph';
    const nodes = [p];

    const { getByText } = render(
      <Panel data={{}} reference={() => undefined} nodes={nodes} />
    );

    expect(getByText('This is a paragraph')).not.toBeNull();
  });

  it('renders with some config', () => {
    const { container } = render(
      <Panel nodes={[]} reference={() => undefined} data={{}} align="right" />
    );

    expect(
      container.firstElementChild && container.firstElementChild.className
    ).toContain('right');
  });
});
