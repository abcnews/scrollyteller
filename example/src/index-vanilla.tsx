import React from 'react';
import { render } from 'react-dom';
import App from './components/AppVanilla';

const PROJECT_NAME: string = 'example-aunty';
const root = document.querySelector(`[data-${PROJECT_NAME}-vanilla]`);

function init() {
  root && render(<App />, root);
}

init();

if (module.hot) {
  module.hot.accept('./components/AppVanilla', () => {
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
  root &&
    console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
