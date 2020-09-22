import React, { useEffect } from 'react';
import styles from './styles.scss';

interface ErrorBoxProps {
  error: Error;
}

const ErrorBox: React.FC<ErrorBoxProps> = ({ error }) => {
  useEffect(() => console.log(error), []);

  return <pre className={styles.root}>{`${String(error)}\n\n${error.stack}`}</pre>;
};

export default ErrorBox;
