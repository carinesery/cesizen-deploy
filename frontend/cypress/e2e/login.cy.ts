import { mockLoginSuccess, mockLoginFailure } from '../support/mocks/auth'

describe('Login', () => {

  it('should login successfully', () => {
    mockLoginSuccess()

    cy.visit('/login')

    cy.get('input[type="email"]').type('admin@test.com')
    cy.get('input[type="password"]').type('Admin@123')

    cy.get('button[type="submit"]').click()

    cy.wait('@login')

    cy.url().should('include', '/admin')
  })

  it('should fail login', () => {
    mockLoginFailure()

    cy.visit('/login')

    cy.get('input[type="email"]').type('wrong@test.com')
    cy.get('input[type="password"]').type('wrong')

    cy.get('button[type="submit"]').click()

    cy.wait('@loginFail')

    cy.contains('Erreur de connexion').should('be.visible')
  })
})