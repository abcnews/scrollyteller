import * as React from 'react';
const { useEffect, useRef } = React;
import styles from './index.module.scss';

interface Props {
  id?: string;
  className?: string;
  config?: any;
  nodes?: Element[];
  reference?: (baseNode: Element) => void;
}

const Panel = ({
  id,
  className = '',
  config = {},
  nodes = [],
  reference,
}: Props) => {
  const base = useRef<HTMLDivElement>(null);

  // Manage nodes and let the Scrollyteller know about the base DIV
  useEffect(() => {
    if (nodes) {
      nodes.forEach(node => {
        base.current && base.current.appendChild(node);
      });
    }

    reference && base.current && reference(base.current);

    return () => {
      if (nodes) {
        nodes.forEach(node => {
          base.current && base.current.removeChild(node);
        });
      }
    };
  }, []);

  const mergedClassName = [
    className.replace(/\s+/, '') !== '' ? className : styles.base,
    typeof config.theme !== 'undefined' ? styles[config.theme] : null,
    typeof config.align !== 'undefined' ? styles[config.align] : null,
  ]
    .filter(c => c)
    .join(' ');

  return <div ref={base} id={id} className={mergedClassName} />;
};

Panel.displayName = 'Panel';

export default Panel;
