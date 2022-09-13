const { shufflePile } = require("../support/actions");
const { checkNewDeck, saveDeckId, drawCardsToPile, drawCards, checkCardsInPile, shuffleDeck, drawCardsFromPile } = require("/cypress/support/actions");

const fullDeck = 52;
const fiveCards = 5;
const threeCards = 3;
const twoCards = 2;
const pileList = ['pile1', 'pile2'];

describe('Deck of Cards', () => {
  before('should create new deck', () => {
    cy.request('new/').as('newDeck');
    cy.get('@newDeck').then(deck => {
      checkNewDeck(deck, fullDeck);
      saveDeckId(deck);
    })
  })

  it('should shuffle deck', () => {
    shuffleDeck(fullDeck);
  })

  it('should draw 3 cards', () => {
    drawCards(threeCards);
  })

  it('should create 2 piles with 5 cards each', () => {
    pileList.forEach((pileName) => {
      drawCards(fiveCards, pileName);
    })
  })

  it('should list 2 piles', () => {
    cy.task('getDeckId').then(deckID => {
      checkCardsInPile(deckID, 'pile1', fiveCards, true);
      checkCardsInPile(deckID, 'pile2', fiveCards, true);
    })
  })

  it('should shuffle pile1 ', () => {
    shufflePile('pile1', fiveCards);
  })

  it('should draw 2 cards form pile1', () => {
    cy.task('getDeckId').then(deckID => {
      drawCardsFromPile(deckID, 'pile1', fiveCards, twoCards)
    })
  })

  it('should draw 3 cards form pile2', () => {
    cy.task('getDeckId').then(deckID => {
      drawCardsFromPile(deckID, 'pile2', fiveCards, threeCards)
    })
  })
})
