import React, {
  createElement,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import Panel, { PanelProps, PanelDefinition } from '../Panel';

import panelStyles from '../Panel/index.module.scss';
import { cn, uglyTwitterHack } from './functions';
import styles from './index.module.scss';

export interface OnMarkerCallback<T> {
  (data: T): void;
}

type ProgressMeasurements = {
  pxAboveFold: number;
  pctAboveFold: number;
  panelBottom: number;
  panelHeight: number;
  height: number;
  width: number;
  x: number;
  y: number;
  bottom: number;
  left: number;
  right: number;
  top: number;
};

export interface OnProgressCallback {
  (measurements: ProgressMeasurements): void;
}

export type ScrollytellerTheme = 'light';

interface ScrollytellerProps<T> {
  children: ReactNode;
  panels: PanelDefinition<T>[];
  onMarker?: OnMarkerCallback<T>;
  onProgress?: OnProgressCallback;
  className?: string;
  panelClassName?: string;
  firstPanelClassName?: string;
  lastPanelClassName?: string;
  waypoint?: number;
  theme?: ScrollytellerTheme;
  graphicInFront?: boolean;
  panelComponent?:
    | React.FunctionComponent<PanelProps<T>>
    | React.ComponentClass<PanelProps<T>>;
}

type Reference<T> = {
  data: T;
  element: HTMLElement;
};

const Scrollyteller = <T,>({
  children,
  panels,
  className,
  panelComponent,
  panelClassName,
  firstPanelClassName,
  lastPanelClassName,
  waypoint = 0.8,
  theme,
  graphicInFront = false,
  onMarker,
  onProgress,
}: PropsWithChildren<ScrollytellerProps<T>>) => {
  // We need a reference to the DOM elements of every panel ...
  const panelElementReferences = useRef<Reference<T>[]>([]);
  // ... and the scrollyteller component itself so we can measure where they are on scroll.
  const componentRef = useRef<HTMLDivElement>(null!);

  // Create and update references to the onMarker and onProgress callback functions.
  // This is an optimisation to avoid having to remove and re-attach scroll and resize
  // listeners on every render. Managing them separately here means they don't have to
  // be in the dependencies array for the useEffect block that manages scroll listening.
  const onMarkerRef = useRef(onMarker);
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onMarkerRef.current = onMarker;
    onProgressRef.current = onProgress;
  }, [onMarker, onProgress]);

  // Track panel divs so we know which one is the current one
  // This is warpped in useRef so the Panel components always get the same one function
  // and it doesn't thrash the useEffect inside Panel
  const reference = useCallback(
    (data: T, element: HTMLElement, unregister: boolean = false) => {
      const other = panelElementReferences.current.filter(
        ({ element: e }) => e !== element
      );
      panelElementReferences.current = unregister
        ? other
        : other.concat({ data, element });
    },
    []
  );

  // Just a small piece of local state
  const [backgroundAttachment, setBackgroundAttachment] = useState('before');

  // Make sure Twitter cards aren't too wide on mobile
  useEffect(() => {
    setTimeout(() => uglyTwitterHack(styles.base), 1000);
  }, []);

  useEffect(() => {
    let currentPanelEl: HTMLElement;
    let waypointPx: number = window.innerHeight * waypoint;

    // Safari tries to do things before styling has kicked in
    // so lets wait for a split second before measuring.
    // Fires inital marker on page load, unless overridden
    setTimeout(onScroll, 100);

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };

    function onResize() {
      const height = window.innerHeight;
      waypointPx = height * waypoint;
      componentRef.current.style.setProperty('--vh', `${height / 100}px`);
    }

    function onScroll() {
      if (panelElementReferences.current.length === 0) return;

      const baseRect = componentRef.current.getBoundingClientRect();

      // Overall progress
      const overall = {
        pxAboveFold: waypointPx - baseRect.top,
        pctAboveFold: (waypointPx - baseRect.top) / baseRect.height,
      };

      // Panel position in relation to fold
      // This is done in two passes because the boundingClientRect is needed for all
      // panels before the px/pct progress can be accurately measured.
      const panelPositions = panelElementReferences.current
        .map(({ data, element }) => {
          const {
            top,
            right,
            bottom,
            left,
            width,
            height,
            x,
            y,
          } = element.getBoundingClientRect();

          return {
            element,
            data,
            measurements: {
              top,
              right,
              bottom,
              left,
              width,
              height,
              x,
              y,
            },
          };
        })
        .map(({ data, element, measurements }, i, arr) => {
          const nextPanel = arr[i + 1];
          const panelBottom = nextPanel
            ? nextPanel.measurements.top
            : baseRect.top + baseRect.height;
          const panelHeight = panelBottom - measurements.top;
          const pxAboveFold = waypointPx - measurements.top;
          const pctAboveFold = pxAboveFold / panelHeight;
          return {
            element,
            data,
            measurements: {
              ...measurements,
              pxAboveFold,
              pctAboveFold,
              panelBottom,
              panelHeight,
              overall,
            },
          };
        });

      // Find the current panel
      let current = panelPositions.find(
        ({ measurements }) =>
          measurements.pctAboveFold > 0 && measurements.pctAboveFold <= 1
      );

      // Before or after the whole thing
      if (!current) {
        current =
          panelPositions[0].measurements.pctAboveFold < 0
            ? panelPositions[0]
            : panelPositions[panelPositions.length - 1];
      }

      if (currentPanelEl !== current.element) {
        currentPanelEl = current.element;
        onMarkerRef.current && onMarkerRef.current(current.data);
      }

      onProgressRef.current && onProgressRef.current(current.measurements);

      // Work out if the background should be fixed or not
      let sticky;
      if (baseRect.top > 0) {
        sticky = 'before';
      } else if (baseRect.bottom < window.innerHeight) {
        sticky = 'after';
      } else {
        sticky = 'during';
      }
      setBackgroundAttachment(sticky);
    }
  }, [waypoint]);

  // RENDER
  const graphic = (
    <div className={cn([styles.graphic, styles[backgroundAttachment]])}>
      {children}
    </div>
  );

  // Memoize the rendered panels
  const renderedPanels = useMemo(() => {
    const last = panels.length - 1;
    return (
      <>
        {panels.map((panel, index) => {
          const data = {
            ...panel.data,
          };
          return createElement(panelComponent || Panel, {
            className: cn([
              panelClassName,
              panelStyles.base,
              panel.className,
              index === 0 && firstPanelClassName,
              index === 0 && panelStyles.first,
              index === last && lastPanelClassName,
              index === last && panelStyles.last,
              theme === 'light' && panelStyles.light,
            ]),
            key: index,
            align: panel.align,
            data,
            nodes: panel.nodes,
            reference: (element: HTMLElement, unregister: boolean = false) =>
              reference(data, element, unregister),
          });
        })}
      </>
    );
  }, [
    theme,
    panels,
    firstPanelClassName,
    lastPanelClassName,
    panelClassName,
    panelComponent,
    reference,
  ]);

  return (
    <div ref={componentRef} className={`${styles.base} ${className || ''}`}>
      {!graphicInFront && graphic}
      {renderedPanels}
      {graphicInFront && graphic}
    </div>
  );
};

export default Scrollyteller;
