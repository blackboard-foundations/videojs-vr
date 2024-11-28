const generate = require('videojs-generate-rollup-config');

// see https://github.com/videojs/videojs-generate-rollup-config
// for options

// Don't bundle three.js with the plugin
const config = generate({
  externals(defaults) {
    return {
      browser: defaults.browser.concat([
        'three',
        'THREE'
      ]),
      module: defaults.module.concat([
        'three',
        'THREE'
      ]),
      test: defaults.test.concat([
        'three',
        'THREE'
      ])
    };
  }
});

config.builds.module.plugins = config.builds.module.plugins || [];
config.builds.module.plugins.push({
  name: 'exclude-threejs',
  resolveId(source) {
    if (source === 'three' || source === 'THREE') {
      return { id: source, external: true };
    }
    return null;
  }
});
// Add additional builds/customization here!

// export the builds to rollup
export default Object.values(config.builds);
