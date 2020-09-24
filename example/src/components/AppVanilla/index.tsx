import React, { useState } from 'react';
import Worm from '../Worm';
import styles from './styles.scss';
import { loremIpsum } from 'lorem-ipsum';
import Scrollyteller from '../../../../dist';

interface AppProps {
  projectName: string;
}

type MarkerConfig = {
  number: number;
};

const App: React.FC<AppProps> = ({ projectName }) => {
  const [config, setConfig] = useState<MarkerConfig>(null!);
  const text = loremIpsum({ count: 7, units: 'paragraph' });
  const pars = text.split('\n').map((t, i) => <p key={i}>{t}</p>);
  const panels = text.split('\n').map((t, i) => {
    const p = document.createElement('p');
    p.textContent = t;
    return {
      id: i,
      config: { id: i, number: i + 1 },
      nodes: [p],
    };
  });
  return (
    <>
      {pars}
      <Scrollyteller<MarkerConfig>
        panels={panels}
        onMarker={(config) => setConfig(config)}
      >
        <div className={styles.root}>
          <Worm />
          <h1>{config && config.number}</h1>
        </div>
      </Scrollyteller>
      {pars}
    </>
  );
};

export default App;
