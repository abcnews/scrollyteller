import React, { useEffect, useRef } from 'react';
import styles from './index.module.scss';

type ReferenceCallback = (el: HTMLElement) => void;

export type PanelAlignment = 'left' | 'right';
export type PanelDefinition<T> = {
  align?: PanelAlignment;
  className?: string;
  data: T;
  nodes: Node[];
};

export type PanelProps<T> = PanelDefinition<T> & {
  reference: ReferenceCallback;
};

const Panel = <T,>({
  className = '',
  nodes = [],
  align,
  reference,
}: PanelProps<T>) => {
  const base = useRef<HTMLDivElement>(null);

  // Manage nodes and let the Scrollyteller know about the base DIV
  useEffect(() => {
    // There is no need to clean up the nodes being attached here. The
    // reson you might want to is to avoid a memory leak if they're left
    // lying around, but they're still referenced in the parent anyway and
    // will no longer be referenced here if this componnent ceases to exist.
    // TODO: If this component is re-rendered by react ...
    nodes.forEach(node => {
      base.current && base.current.appendChild(node);
    });

    base.current && reference(base.current);
  }, [nodes, reference]);

  const mergedClassName = [
    className.replace(/\s+/, '') !== '' ? className : styles.base,
    typeof align !== 'undefined' ? styles[align] : null,
  ]
    .filter(c => c)
    .join(' ');

  return <div ref={base} className={mergedClassName} />;
};

Panel.displayName = 'Panel';

export default Panel;
