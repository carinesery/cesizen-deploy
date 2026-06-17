// cypress/e2e/login.cy.ts

describe('Login', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  it('should login successfully', () => {
    cy.intercept('POST', '**/auth/login', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          accessToken: 'fake-token',
          user: {
            id: 1,
            email: 'admin@test.com'
          }
        }
      })
    }).as('login')

    cy.visit('/login')

    cy.get('input[type="email"]').type('admin@test.com')
    cy.get('input[type="password"]').type('Admin@123')

    cy.get('button[type="submit"]').click()

    cy.wait('@login')

    // laisse React router respirer
    cy.location('pathname', { timeout: 10000 }).should('eq', '/admin')
  })

  it('should fail login', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: {
        message: 'Erreur de connexion'
      }
    }).as('loginFail')

    cy.visit('/login')

    cy.get('input[type="email"]').type('wrong@test.com')
    cy.get('input[type="password"]').type('wrong')

    cy.get('button[type="submit"]').click()

    cy.wait('@loginFail')

    cy.contains('Erreur de connexion').should('be.visible')
  })
})