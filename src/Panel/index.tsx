import * as React from 'react';
import * as assign from 'object-assign';

import * as styles from './index.scss';

interface Props {
  id?: string;
  className?: string;
  config?: any;
  nodes?: any[];
  reference?: (baseNode: HTMLElement) => void;
}

export default (props: Props) => {
  props = assign(
    {},
    {
      className: '',
      config: {},
      nodes: []
    },
    props
  );

  const base: React.MutableRefObject<HTMLDivElement> = React.useRef(null);

  // Manage nodes and let the Scrollyteller know about the base DIV
  React.useEffect(() => {
    if (base.current && props.nodes) {
      props.nodes.forEach((node: HTMLElement) => {
        base.current.appendChild(node);
      });
    }

    props.reference && props.reference(base.current);

    return () => {
      if (base.current && props.nodes) {
        props.nodes.forEach((node: HTMLElement) => {
          base.current.removeChild(node);
        });
      }
    };
  }, []);

  const className = [
    props.className !== '' ? props.className : styles.base,
    props.config.light ? styles.light : null,
    typeof props.config.align !== 'undefined' ? styles[props.config.align] : null
  ]
    .filter(c => c)
    .join(' ');

  return <div ref={base} id={props.id} className={className} />;
};
