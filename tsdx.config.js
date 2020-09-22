const postcss = require('rollup-plugin-postcss');

module.exports = {
  rollup(config, options) {
    config.plugins.push(
      postcss({
        extract: false,
        modules: true,
        namedExports: true,
        use: ['sass'],
      })
    );
    return config;
  },
};
