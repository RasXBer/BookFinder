const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
// set token secret and expiration date, secret key used for JWT signing and verification
const secret = 'mysecretsshhhhh'; 
const expiration = '2h';

module.exports = {
  // Custom error for authentication failures
  AuthenticationError: new GraphQLError('Could not authenticate user.', {
    extensions: {
      code: 'UNAUTHENTICATED', 
    },
  }),

  // Middleware function to handle authentication
  authMiddleware: function ({ req }) {
    // Allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // Parse token from Authorization header if present
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim(); 
    }

    // If token is not provided, return the original request object
    if (!token) {
      return req;
    }

    try {
      // Verify and decode token using JWT library
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      // Attach decoded user data to the request object
      req.user = data;
    } catch {
      console.log('Invalid token'); 
    }

    return req;  
  },

  // Function to sign JWT token with user data
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };  
    // Sign token with payload using secret key and set expiration time
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};