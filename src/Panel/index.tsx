import * as React from 'react';
const { useEffect, useRef } = React;
import * as styles from './index.scss';

interface Props {
  id?: string;
  className?: string;
  config?: any;
  nodes?: Element[];
  reference?: (baseNode: Element) => void;
}

const Panel = (props: Props) => {
  props = {
    className: '',
    config: {},
    nodes: [],
    ...props
  };

  const base: React.MutableRefObject<HTMLDivElement> = useRef();

  // Manage nodes and let the Scrollyteller know about the base DIV
  useEffect(() => {
    if (props.nodes) {
      props.nodes.forEach((node) => {
        base.current.appendChild(node);
      });
    }

    props.reference && props.reference(base.current);

    return () => {
      if (props.nodes) {
        props.nodes.forEach((node) => {
          base.current.removeChild(node);
        });
      }
    };
  }, []);

  const className = [
    props.className.replace(/\s+/, '') !== '' ? props.className : styles.base,
    typeof props.config.theme !== 'undefined' ? styles[props.config.theme] : null,
    typeof props.config.align !== 'undefined' ? styles[props.config.align] : null
  ]
    .filter((c) => c)
    .join(' ');

  return <div ref={base} id={props.id} className={className} />;
};

Panel.displayName = 'Panel';

export default Panel;
