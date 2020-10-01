import React, { useState } from 'react';
import Graphic from '../Graphic';
import { loremIpsum } from 'lorem-ipsum';
import Scrollyteller, { PanelDefinition } from '../../../../dist';

type MarkerData = {
  index: number;
  number: number;
};

interface AppProps {}

// Generate some example panels for use in the <Scrollyteller> component.
const text = loremIpsum({ count: 7, units: 'paragraph' });
const pars = text.split('\n').map((t, i) => <p key={i}>{t}</p>);
const panels: PanelDefinition<MarkerData>[] = text.split('\n').map((t, i) => {
  const p = document.createElement('p');
  p.textContent = t;
  return {
    data: { index: i, number: i + 1 },
    nodes: [p],
  };
});

const App: React.FC<AppProps> = ({}) => {
  const [data, setData] = useState<MarkerData>(null!);
  const [progress, setProgress] = useState<number>(null!);
  const [counter, setCounter] = useState<number>(0);

  return (
    <>
      {pars}
      <Scrollyteller<MarkerData>
        panels={panels}
        onMarker={(data) => {
          setData(data);
          setCounter(counter + 1);
        }}
        onProgress={({ pctAboveFold }) => setProgress(pctAboveFold)}
      >
        <Graphic panel={data?.number} progress={progress} counter={counter} />
      </Scrollyteller>
      {pars}
    </>
  );
};

export default App;
