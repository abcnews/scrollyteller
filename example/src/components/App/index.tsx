import React, { useState } from 'react';
import Worm from '../Worm';
import styles from './styles.scss';
import { loremIpsum } from 'lorem-ipsum';
import Scrollyteller from '../../../../.';

interface AppProps {
  projectName: string;
}

type MarkerConfig = {
  number: number;
};

const App: React.FC<AppProps> = ({ projectName }) => {
  const [config, setConfig] = useState<MarkerConfig | null>(null);
  const text = loremIpsum({ count: 7, units: 'paragraph' });
  const pars = text.split('\n').map((t, i) => <p key={i}>{t}</p>);
  const panels = text.split('\n').map((t, i) => {
    const p = document.createElement('p');
    p.textContent = t;
    return {
      config: { number: i + 1 },
      nodes: [p],
    };
  });
  return (
    <>
      {pars}
      <Scrollyteller panels={panels} onMarker={setConfig}>
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
