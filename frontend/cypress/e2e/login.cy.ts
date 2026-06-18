describe('Login', () => {
  it('connecte un administrateur', () => {
    cy.visit('/login');

    cy.get('input[type="email"]').type(
      Cypress.env('ADMIN_EMAIL')
    );

    cy.get('input[type="password"]').type(
      Cypress.env('ADMIN_PASSWORD'),
      { log: false }
    );

    cy.get('button[type="submit"]').click();

    cy.url().should('not.include', '/login');

    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      expect(token).to.exist;
    });
  });
});