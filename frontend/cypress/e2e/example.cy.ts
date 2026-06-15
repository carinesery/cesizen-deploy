// frontend/cypress/e2e/example.cy.ts
describe('Frontend works', () => {
  it('should load the app', () => {
    cy.visit('/');
    cy.get('body').should('exist');  // ← Juste vérifie que page charge
  });
});