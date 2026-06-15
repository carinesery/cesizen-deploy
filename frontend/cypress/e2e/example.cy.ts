// frontend/cypress/e2e/example.cy.ts

describe('Frontend works', () => {
  it('should load homepage', () => {
    cy.visit('/');
    cy.contains('h1').should('exist');
  });
});