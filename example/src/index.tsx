import React from 'react';
import { render } from 'react-dom';
import App from './components/App';

const PROJECT_NAME: string = 'example-aunty';
const root = document.querySelector(`[data-${PROJECT_NAME}-root]`);

function init() {
  render(<App projectName={PROJECT_NAME} />, root);
}

init();

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      init();
    } catch (err) {
      import('./components/ErrorBox').then(({ default: ErrorBox }) => {
        render(<ErrorBox error={err} />, root);
      });
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
