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
import { cn, uglyTwitterHack } from './functions';
import styles from './index.module.scss';

export interface OnMarkerCallback<T> {
  (config: T, id: number): void;
}
export interface OnProgressCallback {
  (progress: number): void;
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
  onProgress?: OnProgressCallback;
  className?: string;
  panelClassName?: string;
  firstPanelClassName?: string;
  lastPanelClassName?: string;
  panelComponent?: React.FC<PanelProps> | React.ComponentClass<PanelProps>;
}

type Reference<T extends PanelConfig> = {
  panel: PanelDefinition<T>;
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
  config,
  onMarker,
  onProgress,
}: PropsWithChildren<ScrollytellerProps<T>>) => {
  const references = useRef<Reference<T>[]>([]);
  const base = useRef<HTMLDivElement>(null!);

  // Create and update onMarkerRef to make sure state inside
  // the onMarker callback is up to date.
  // This happens because useEffects attaching event listeners
  // is executed only once, meaning that state inside callbacks (onMarker)
  // will always have intial values.
  const onMarkerRef = useRef(onMarker);
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onMarkerRef.current = onMarker;
    onProgressRef.current = onProgress;
  }, [onMarker, onProgress]);

  let currentPanel: PanelDefinition<T> | null = null;
  const [backgroundAttachment, setBackgroundAttachment] = useState('before');

  // Track panel divs so we know which one is the current one
  function reference(panel: PanelDefinition<T>, element: HTMLElement) {
    references.current.push({ panel, element });
  }

  useEffect(() => {
    let fold: number;
    setFold();

    // Safari tries to do things before styling has kicked in
    // so lets wait for a split second before measuring.
    // Fires inital marker on page load, unless overridden
    setTimeout(onScroll, 100);

    // Make sure Twitter cards aren't too wide on mobile
    setTimeout(() => uglyTwitterHack(styles.base), 1000);

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };

    function onResize() {
      requestAnimationFrame(setFold);
    }

    function onScroll() {
      requestAnimationFrame(doWork);
    }

    function setFold() {
      fold =
        window.innerHeight * (config?.waypoint ? config.waypoint / 100 : 0.8);
    }

    function doWork() {
      if (references.current.length === 0) return;

      const baseRect = base.current.getBoundingClientRect();

      // Panel position in relation to fold
      const panelPositions = references.current
        .map(r => {
          const { top } = r.element.getBoundingClientRect();
          return { r, top, pxAboveFold: fold - top };
        })
        .map(({ top, r, pxAboveFold }, i, arr) => {
          const bottom = arr[i + 1]
            ? arr[i + 1].top
            : baseRect.top + baseRect.height;
          const height = bottom - top;
          return {
            r,
            pctAboveFold: pxAboveFold / height,
            pxAboveFold,
            height,
            top,
            bottom,
          };
        });

      // Find the current panel
      let current = panelPositions.find(
        d => d.pctAboveFold > 0 && d.pctAboveFold <= 1
      );

      // Before or after the whole thing
      if (!current) {
        current =
          panelPositions[0].pctAboveFold < 0
            ? panelPositions[0]
            : panelPositions[panelPositions.length - 1];
      }

      if (currentPanel !== current.r.panel) {
        currentPanel = current.r.panel;
        onMarkerRef.current &&
          onMarkerRef.current(currentPanel.config, currentPanel.id);
      }

      onProgressRef.current && onProgressRef.current(current.pctAboveFold);

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
    <div className={cn([styles.graphic, styles[backgroundAttachment]])}>
      {children}
    </div>
  );
  const last = panels.length - 1;

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
            index === last && lastPanelClassName,
            index === last && panelStyles.last,
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
