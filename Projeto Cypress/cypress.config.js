const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: '5h2d7u',
  viewportHeight: 720,
  viewporWidth: 1280,
  e2e: {
    setupNodeEvents(on, config) {},
  },
})
