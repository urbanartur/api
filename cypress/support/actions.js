export function checkNewDeck(deck, numberOfCards, shuffled = false) {
    expect(deck.status).to.eq(200);
    assert.isObject(deck.body, 'Response is an Object');
    expect(deck.body.success).to.eq(true);
    expect(deck.body.remaining).to.eq(numberOfCards);
    expect(deck.body.shuffled).to.eq(shuffled);
}

export function saveDeckId(deck) {
    cy.wrap(deck.body.deck_id).as('deckID');
    cy.get('@deckID').then(deckID => {
        cy.task('setDeckId', deckID);
    })
}

export function shuffleDeck(numberOfCards) {
    cy.task('getDeckId').then(deckID => {
        cy.request(`${deckID}/shuffle/?deck_count=1`).as('shuffeledDeck');
        cy.get('@shuffeledDeck').then(deck => {
            checkNewDeck(deck, numberOfCards, true)
        })
    })
}

export function drawCards(numberOfCards, pileName = false) {
    cy.task('getDeckId').then(deckID => {
        cy.request(`${deckID}/draw/?count=${numberOfCards}`).as('drawcCards');
        cy.get('@drawcCards').then(response => {
            expect(response.status).to.eq(200);
            assert.isArray(response.body.cards, 'Cards are stored in Array');
            expect(response.body.cards.length).to.eq(numberOfCards);

            if (pileName) {
                response.body.cards.forEach((card) => {
                    cy.request(`${deckID}/pile/${pileName}/add/?cards=${card.code}`);
                })

                checkCardsInPile(deckID, pileName, numberOfCards);

            }
        })
    })
}

export function checkCardsInPile(deckID, pileName, numberOfCards, log = false) {
    cy.request(`${deckID}/pile/${pileName}/list`).as('fullPile');
    cy.get('@fullPile').then(response => {
        checkPile(response, pileName, numberOfCards)

        if (log) {
            cy.log(response.body.piles[`${pileName}`].cards)
        }
    })
}

function checkPile(response, pileName, numberOfCards, shuffleRequest = false) {
    expect(response.status).to.eq(200);
    if (shuffleRequest) {
        expect(response.body.success).to.eq(true);
        expect(response.body.piles[`${pileName}`].remaining).to.eq(numberOfCards);
    } else {
        expect(response.body.piles[`${pileName}`].cards.length).to.eq(numberOfCards);
    }
}

export function drawCardsFromPile(deckID, pileName, startingNumber, noOfCardsToDraw) {
    cy.request(`${deckID}/pile/${pileName}/draw/random/?count=${noOfCardsToDraw}`).as('drawedFromPile');
    cy.get('@drawedFromPile').then(response => {
        expect(response.status).to.eq(200);
        console.log(response);
        expect(response.body.cards.length).to.eq(noOfCardsToDraw);
        expect(response.body.piles[`${pileName}`].remaining).to.eq(startingNumber - noOfCardsToDraw);
    })
}

export function shufflePile(pileName, numberOfCards) {
    cy.task('getDeckId').then(deckID => {
        const pileList = `${deckID}/pile/${pileName}/list`;
        const pileShuffle = `${deckID}/pile/${pileName}/shuffle/`;

        cy.request(pileList).as('unshuffledPile');
        cy.get('@unshuffledPile').then(response => {
            checkPile(response, pileName, numberOfCards);
        })

        cy.request(pileShuffle).as('shuffelePile');
        cy.get('@shuffelePile').then(response => {
            checkPile(response, pileName, numberOfCards, true);
        })

        cy.request(pileList).as('shuffeledPile');
        cy.get('@shuffeledPile').then(shuffeledResponse => {
            cy.get('@unshuffledPile').then(response => {
                expect(shuffeledResponse).not.to.eq(response);
                expect(shuffeledResponse.body.piles[`${pileName}`].cards).not.to.eq(response.body.piles[`${pileName}`].cards);

                cy.log(shuffeledResponse.body.piles[`${pileName}`].cards);
                cy.log(response.body.piles[`${pileName}`].cards);
            })
        })
    })
}

