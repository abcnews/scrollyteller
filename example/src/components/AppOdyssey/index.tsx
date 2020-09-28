import React, { useState } from 'react';
import Worm from '../Worm';
import styles from './styles.scss';
import Scrollyteller, { ScrollytellerDefinition } from '../../../../.';

type MarkerConfig = {
  theme?: string;
  number: number;
};

interface AppProps {
  scrollyTellerDefinition: ScrollytellerDefinition<MarkerConfig>;
}

const App: React.FC<AppProps> = ({ scrollyTellerDefinition }) => {
  const [config, setConfig] = useState<MarkerConfig>(null!);
  const [progress, setProgress] = useState<number>(null!);

  return (
    <Scrollyteller<MarkerConfig>
      panels={scrollyTellerDefinition.panels}
      onMarker={(config, id) => setConfig(config)}
      onProgress={(progress) => setProgress(progress)}
    >
      <div className={styles.root}>
        <Worm />
        <h1>
          Mark number {config && config.number} <br />
          at {(progress * 100).toFixed(2)}% progress
        </h1>
      </div>
    </Scrollyteller>
  );
};

export default App;
