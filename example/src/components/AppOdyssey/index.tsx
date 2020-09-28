import React, { useState } from 'react';
import Scrollyteller, { ScrollytellerDefinition } from '../../../../.';
import Graphic from '../Graphic';

export type MarkerData = {
  index: number;
  number: number;
};

interface AppProps {
  scrollyTellerDefinition: ScrollytellerDefinition<MarkerData>;
}

//
const App: React.FC<AppProps> = ({
  scrollyTellerDefinition: { panels, config },
}) => {
  const [data, setData] = useState<MarkerData>(null!);
  const [progress, setProgress] = useState<number>(null!);
  const [counter, setCounter] = useState<number>(0);

  return (
    <Scrollyteller<MarkerData>
      waypoint={0.5}
      panels={panels}
      {...config}
      onMarker={(data) => {
        setData(data);
        setCounter(counter + 1);
      }}
      onProgress={({ pctAboveFold }) => setProgress(pctAboveFold)}
    >
      <Graphic panel={data?.number} progress={progress} counter={counter} />
    </Scrollyteller>
  );
};

export default App;
