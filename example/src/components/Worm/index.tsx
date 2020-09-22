import React from 'react';
import styles from './styles.scss';
import worm from './worm.svg';

const Worm: React.FC = () => {
  return <img className={styles.root} src={worm} />;
};

export default Worm;
