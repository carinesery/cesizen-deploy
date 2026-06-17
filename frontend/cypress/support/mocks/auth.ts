export const mockLoginSuccess = () => {
  cy.intercept('POST', '/auth/login', {
    statusCode: 200,
    body: {
      accessToken: 'fake-token',
      user: {
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      }
    }
  }).as('login')
}

export const mockLoginFailure = () => {
  cy.intercept('POST', '/auth/login', {
    statusCode: 401,
    body: {
      message: 'Erreur de connexion'
    }
  }).as('loginFail')
}