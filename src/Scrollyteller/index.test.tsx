import * as React from 'react';
import { render } from '@testing-library/react';

import Scrollyteller from '.';

describe('Scrollyteller', () => {
  const p = document.createElement('p');
  p.textContent = 'This is a paragraph';
  const panels: any[] = [
    {
      id: 1,
      config: {
        right: true
      },
      nodes: [p]
    }
  ];

  it('renders', () => {
    const { container } = render(
      <Scrollyteller panels={panels}>
        <div id="graphic" />
      </Scrollyteller>
    );

    const graphic = container.querySelector('.graphic');
    expect(graphic).not.toBeNull();
    expect(graphic.classList).toContain('before');

    const panelNode = container.querySelector('p');
    expect(panelNode).not.toBeNull();
    expect(panelNode.textContent).toBe(p.textContent);
  });

  it('can render the background in front', () => {
    const { container } = render(
      <Scrollyteller panels={panels} config={{ graphicInFront: true }}>
        <div id="graphic" />
      </Scrollyteller>
    );

    const graphic = container.querySelector('.graphic');
    expect(container.firstElementChild.childNodes.item(1)).toBe(graphic);
  });

  it('can add first/last className to the first/last panel', () => {
    const { container } = render(
      <Scrollyteller panels={panels}>
        <div id="graphic" />
      </Scrollyteller>
    );

    const panel = container.querySelector('p').parentElement;
    expect(panel.className.indexOf('first')).toBeGreaterThan(-1);
    expect(panel.className.indexOf('last')).toBeGreaterThan(-1);
  });
});
