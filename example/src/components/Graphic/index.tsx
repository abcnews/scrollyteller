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
      <div className={styles.tl}></div>
      <div className={styles.tr}></div>
      <div className={styles.br}></div>
      <div className={styles.bl}></div>
      <div className={styles.t}></div>
      <div className={styles.r}></div>
      <div className={styles.b}></div>
      <div className={styles.l}></div>
    </div>
  );
};

export default Graphic;
