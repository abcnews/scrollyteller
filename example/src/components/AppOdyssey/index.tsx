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
  return (
    <Scrollyteller<MarkerConfig>
      panels={scrollyTellerDefinition.panels}
      onMarker={(config) => setConfig(config)}
    >
      <div className={styles.root}>
        <Worm />
        <h1>{config && config.number}</h1>
      </div>
    </Scrollyteller>
  );
};

export default App;
