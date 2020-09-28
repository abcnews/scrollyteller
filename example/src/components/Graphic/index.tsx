import React from 'react';
import styles from './styles.scss';
import Worm from '../Worm';

interface GraphicProps {
  panel: number;
  progress: number;
  counter: number;
}

const Graphic: React.FC<GraphicProps> = ({ panel, progress, counter }) => {
  return (
    <div className={styles.root}>
      <Worm />
      <h1>
        Mark number {panel} <br />
        at {(progress * 100).toFixed(2)}% progress
      </h1>
      <p>
        The <code>onMarker</code> callback has been called {counter} times.
      </p>
    </div>
  );
};

export default Graphic;
