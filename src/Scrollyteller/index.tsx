import React, {
  createElement,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import Panel, { PanelProps, PanelConfig, PanelDefinition } from '../Panel';
import panelStyles from '../Panel/index.module.scss';
import styles from './index.module.scss';

export interface OnMarkerCallback<T> {
  (config: T, id: number): void;
}

export type ScrollytellerConfig = {
  theme?: string;
  waypoint?: number;
  graphicInFront?: boolean;
};

interface ScrollytellerProps<T extends PanelConfig> {
  children: ReactNode;
  panels: PanelDefinition<T>[];
  config?: ScrollytellerConfig & T;
  onMarker?: OnMarkerCallback<T>;
  className?: string;
  panelClassName?: string;
  firstPanelClassName?: string;
  lastPanelClassName?: string;
  panelComponent?: React.FC<PanelProps> | React.ComponentClass<PanelProps>;
  dontFireInitialMarker?: boolean;
}

type Reference<T extends PanelConfig> = {
  panel: PanelDefinition<T>;
  element: HTMLElement;
};

const cn = (candidates: (undefined | null | false | string)[]) =>
  candidates
    .filter((x: undefined | null | false | string): boolean => !!x)
    .join(' ');

const Scrollyteller = <T,>({
  children,
  panels,
  className,
  panelComponent,
  panelClassName,
  firstPanelClassName,
  lastPanelClassName,
  config,
  onMarker,
  dontFireInitialMarker,
}: PropsWithChildren<ScrollytellerProps<T>>) => {
  const references = useRef<Reference<T>[]>([]);
  const base = useRef<HTMLDivElement>(null);

  // Create and update onMarkerRef to make sure state inside
  // the onMarker callback is up to date.
  // This happens because useEffects attaching event listeners
  // is executed only once, meaning that state inside callbacks (onMarker)
  // will always have intial values.
  const onMarkerRef = useRef(onMarker);
  useEffect(() => {
    onMarkerRef.current = onMarker;
  });

  let currentPanel: PanelDefinition<T> | null = null;
  const [backgroundAttachment, setBackgroundAttachment] = useState('before');

  // Track panel divs so we know which one is the current one
  function reference(panel: PanelDefinition<T>, element: HTMLElement) {
    references.current.push({ panel, element });
  }

  useEffect(() => {
    // Safari tries to do things before styling has kicked in
    // so lets wait for a split second before measuring.
    // Fires inital marker on page load, unless overridden
    setTimeout(() => onScroll(null, dontFireInitialMarker), 100);

    // Make sure Twitter cards aren't too wide on mobile
    setTimeout(() => {
      [].slice
        .call(
          document.querySelectorAll(`${styles.base} .twitter-tweet-rendered`)
        )
        .forEach((card: HTMLElement) => {
          card.style.setProperty('width', '100%');
        });
    }, 1000);

    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };

    function onScroll(_event: Event | null, dontFireInitialMarker?: boolean) {
      if (references.current.length === 0) return;

      // Work out which panel is the current one
      const fold =
        window.innerHeight * (config?.waypoint ? config.waypoint / 100 : 0.8);
      const referencesAboveTheFold = references.current.filter(
        (r: Reference<T>) => {
          if (!r.element) return false;
          const box = r.element.getBoundingClientRect();
          return box.height !== 0 && box.top < fold;
        }
      );

      let closestReference =
        referencesAboveTheFold[referencesAboveTheFold.length - 1];
      if (!closestReference) closestReference = references.current[0];

      if (currentPanel !== closestReference.panel) {
        currentPanel = closestReference.panel;
        if (!dontFireInitialMarker) {
          onMarkerRef.current &&
            onMarkerRef.current(
              closestReference.panel.config,
              closestReference.panel.id
            );
        }
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
  }, []);

  // RENDER
  const graphic = (
    <div className={`${styles.graphic} ${styles[backgroundAttachment]}`}>
      {children}
    </div>
  );
  const numPanels = panels.length;

  return (
    <div ref={base} className={`${styles.base} ${className || ''}`}>
      {!config?.graphicInFront && graphic}

      {panels.map((panel, index) => {
        return createElement(panelComponent || Panel, {
          className: cn([
            panelClassName,
            panelStyles.base,
            panel.className,
            index === 0 && firstPanelClassName,
            index === 0 && panelStyles.first,
            index === numPanels - 1 && lastPanelClassName,
            index === numPanels - 1 && panelStyles.last,
          ]),
          key:
            typeof panel.key !== 'undefined'
              ? panel.key
              : panel.id
              ? panel.id
              : index,
          config: {
            ...config,
            ...(panel.config || {}),
          },
          nodes: panel.nodes,
          reference: element => reference(panel, element),
        });
      })}

      {config?.graphicInFront && graphic}
    </div>
  );
};

export default Scrollyteller;
