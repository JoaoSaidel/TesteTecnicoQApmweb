const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportHeight: 720,
  viewporWidth: 1280,
  e2e: {
    setupNodeEvents(on, config) {},
  },
})
