const express = require('express');
const path = require('path');
// Import the ApolloServer class
const { ApolloServer,  gql  } = require('@apollo/server');
// const { ApolloServer, gql } = require('apollo-server');
const { expressMiddleware } = require('@apollo/server/express4');
const { authMiddleware } = require('./utils/auth');

const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = express();

const startApolloServer = async () => {
  await server.start();
  
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  
  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});
}
console.log("__dirname:", __dirname);
console.log("Static files path:", path.join(__dirname, '../client/dist'));

db.once('open', () => {
  app.listen(PORT, () => {console.log(`🌍 API server running on port ${PORT}!`);
  console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
});
});


// Call the async function to start the server
startApolloServer();
