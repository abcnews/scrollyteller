import React from 'react';
import { render } from 'react-dom';
import App, { MarkerData } from './components/AppOdyssey';
import { loadScrollyteller, ScrollytellerDefinition } from '../../.';

const PROJECT_NAME: string = 'example-aunty';

let scrollyTellerDefinition: ScrollytellerDefinition<MarkerData>;

function renderApp() {
  if (!scrollyTellerDefinition) {
    scrollyTellerDefinition = loadScrollyteller('', 'u-full');
  }

  // This is totally optional, but demonstrates how you'd add an index parameter to the data
  // for each panel.
  scrollyTellerDefinition.panels = scrollyTellerDefinition.panels.map(
    (d, index) => ({ ...d, data: { ...d.data, index } })
  );

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
      renderApp();
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
