import React, { useEffect, useRef } from 'react';
import styles from './index.module.scss';

type ReferenceCallback = (el: HTMLElement) => void;

export type PanelConfig = {
  theme?: string;
  align?: string;
};

export type PanelDefinition<T extends PanelConfig> = {
  id: number;
  key?: string;
  className?: string;
  config: T;
  nodes: Node[];
};

export type PanelProps = {
  id?: number;
  className?: string;
  config?: PanelConfig;
  nodes?: Node[];
  reference?: ReferenceCallback;
};

const Panel: React.FC<PanelProps> = ({
  id,
  className = '',
  config = {},
  nodes = [],
  reference,
}) => {
  const base = useRef<HTMLDivElement>(null);

  // Manage nodes and let the Scrollyteller know about the base DIV
  useEffect(() => {
    nodes.forEach(node => {
      base.current && base.current.appendChild(node);
    });

    reference && base.current && reference(base.current);

    return () => {
      nodes.forEach(node => {
        base.current && base.current.removeChild(node);
      });
    };
  }, [base.current]);

  const mergedClassName = [
    className.replace(/\s+/, '') !== '' ? className : styles.base,
    typeof config.theme !== 'undefined' ? styles[config.theme] : null,
    typeof config.align !== 'undefined' ? styles[config.align] : null,
  ]
    .filter(c => c)
    .join(' ');

  return <div ref={base} id={String(id)} className={mergedClassName} />;
};

Panel.displayName = 'Panel';

export default Panel;
