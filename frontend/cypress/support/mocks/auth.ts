export const mockLoginSuccess = () => {
  cy.intercept('POST', '**/login', {
    statusCode: 200,
    body: {
      token: 'fake-jwt-token',
      user: {
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      }
    }
  }).as('login')
}

export const mockLoginFailure = () => {
  cy.intercept('POST', '**/login', {
    statusCode: 401,
    body: {
      message: 'Erreur de connexion'
    }
  }).as('loginFail')
}