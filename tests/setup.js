// Needed for testing React 16 and above
global.requestAnimationFrame = function(callback) {
  setTimeout(callback, 0);
};

// Set up Enzyme to use React 16
const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

Enzyme.configure({ adapter: new Adapter() });
