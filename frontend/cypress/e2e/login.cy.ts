describe('Login', () => {
  it('should login successfully', () => {
    cy.visit('/login')

    cy.get('input[type="email"]').type(Cypress.env('ADMIN_EMAIL'))
    cy.get('input[type="password"]').type(Cypress.env('ADMIN_PASSWORD'))

    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/admin')
  })

  it('should fail login with wrong credentials', () => {
    cy.visit('/login')

    cy.get('input[type="email"]').type('wrong@test.com')
    cy.get('input[type="password"]').type('wrong')

    cy.get('button[type="submit"]').click()

    cy.contains('Erreur de connexion').should('be.visible')
  })
})