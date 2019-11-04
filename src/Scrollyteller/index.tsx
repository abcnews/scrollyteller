import * as React from 'react';
import * as assign from 'object-assign';

import Panel from '../Panel';
import * as panelStyles from '../Panel/index.scss';
import * as styles from './index.scss';

interface Props {
  children: any;
  panels: any[];
  config?: any;
  onMarker?: (config: any, id: string) => void;
  className?: string;
  panelClassName?: string;
  firstPanelClassName?: string;
  lastPanelClassName?: string;
  panelComponent?: any;
}

const references: any[] = [];

const cn = (candidates: any[]) => candidates.filter((x: any): string => x).join(' ');

export default (props: Props) => {
  props = assign(
    {},
    {
      panels: [],
      config: {}
    },
    props
  );

  const base = React.useRef(null);

  const [currentPanel, setCurrentPanel] = React.useState(null);
  const [backgroundAttachment, setBackgroundAttachment] = React.useState('before');

  // Track panel divs so we know which one is the current one
  function reference(panel: any, element: any) {
    references.push({ panel, element });
  }

  React.useEffect(() => {
    function onScroll() {
      const { config, onMarker } = props;

      if (references.length === 0) return;

      // Work out which panel is the current one
      const fold = window.innerHeight * (config.waypoint ? config.waypoint / 100 : 0.8);
      const referencesAboveTheFold = references.filter((r: any) => {
        if (!r.element) return false;
        const box = r.element.getBoundingClientRect();
        return box.height !== 0 && box.top < fold;
      });

      let closestReference = referencesAboveTheFold[referencesAboveTheFold.length - 1];
      if (!closestReference) closestReference = references[0];
      if (currentPanel !== closestReference.panel) {
        setCurrentPanel(closestReference.panel);
        onMarker(closestReference.panel.config, closestReference.panel.id);
      }

      // Work out if the background should be fixed or not
      if (base.current) {
        const bounds = base.current.getBoundingClientRect();

        let sticky;
        if (bounds.top > 0) {
          sticky = 'before';
        } else if (bounds.bottom < window.innerHeight) {
          sticky = 'after';
        } else {
          sticky = 'during';
        }

        setBackgroundAttachment(sticky);
      }
    }

    // Safari tries to do things before styling has kicked in
    // so lets wait for a split second before measuring
    setTimeout(() => onScroll(), 100);

    // Make sure Twitter cards aren't too wide on mobile
    setTimeout(() => {
      [].slice.call(document.querySelectorAll(`${styles.base} .twitter-tweet-rendered`)).forEach((card: any) => {
        card.style.setProperty('width', '100%');
      });
    }, 1000);

    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // RENDER

  const graphic = <div className={`${styles.graphic} ${styles[backgroundAttachment]}`}>{props.children}</div>;
  const numPanels = props.panels.length;

  return (
    <div ref={base} className={`${styles.base} ${props.className || ''}`}>
      {!props.config.graphicInFront && graphic}

      {props.panels.map((panel, index) => {
        return React.createElement(props.panelComponent || Panel, {
          className: cn([
            props.panelClassName,
            panel.className,
            index === 0 && props.firstPanelClassName,
            index === 0 && panelStyles.first,
            index === numPanels - 1 && props.lastPanelClassName,
            index === numPanels - 1 && panelStyles.last
          ]),
          key: typeof panel.key !== 'undefined' ? panel.key : panel.id,
          config: assign({}, props.config, panel.config || {}),
          nodes: panel.nodes,
          reference: (element: any) => reference(panel, element)
        });
      })}

      {props.config.graphicInFront && graphic}
    </div>
  );
};
