import React from 'react';
import { render } from 'react-dom';
import App from './components/AppOdyssey';
import { loadScrollyteller } from '../../.';

const PROJECT_NAME: string = 'example-aunty';

let scrollyTellerDefinition;

function renderApp() {
  if (!scrollyTellerDefinition) {
    scrollyTellerDefinition = loadScrollyteller('', 'u-full');
  }

  render(
    <App scrollyTellerDefinition={scrollyTellerDefinition} />,
    scrollyTellerDefinition.mountNode
  );
}

init();

function init() {
  if (window.__ODYSSEY__) {
    renderApp();
  } else {
    window.addEventListener('odyssey:api', renderApp);
  }
}

init();

if (module.hot) {
  module.hot.accept('./components/AppOdyssey', () => {
    try {
      init();
    } catch (err) {
      import('./components/ErrorBox').then(({ default: ErrorBox }) => {
        render(<ErrorBox error={err} />, scrollyTellerDefinition.mountNode);
      });
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  console.debug(`[${PROJECT_NAME}] public path: ${__webpack_public_path__}`);
}
