const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportHeight: 1200,
  viewporWidth: 1600,
  e2e: {
    setupNodeEvents(on, config) {},
  },
})
