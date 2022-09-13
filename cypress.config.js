const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://deckofcardsapi.com/api/deck/',
    setupNodeEvents(on, config) {
      on('task', {
        setDeckId: (val) => { return (deckId = val); },
        getDeckId: () => { return deckId; }
      })
    },
  },
});
