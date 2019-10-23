import * as React from 'react';
import { render } from '@testing-library/react';

import Panel from '.';

describe('Panel', () => {
  it('renders nodes', () => {
    const p = document.createElement('p');
    p.textContent = 'This is a paragraph';
    const nodes = [p];

    const { getByText } = render(<Panel nodes={nodes} />);

    expect(getByText('This is a paragraph')).not.toBeNull();
  });

  it('renders with some config', () => {
    const { container } = render(<Panel nodes={[]} config={{ theme: 'light', align: 'right' }} />);

    expect(container.firstElementChild.className).toContain('light');
    expect(container.firstElementChild.className).toContain('right');
  });
});
