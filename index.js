const express = require('express');
const models = require('./models/models');
const dotenv = require('dotenv');
dotenv.config();
const db = require('./db');
const typeDefs = require('./Schema');
const resolvers = require('./resolvers/index');
const { ApolloServer } = require('apollo-server-express');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');


// Run the server on a port specified in our .env file or port 4000
const port = process.env.PORT || 4000;
//connect to database
db.connectToDb();

const app = express();
app.use(helmet());
app.use(cors());

const getUser =(token)=>{
    if(token){
      try{
        return jwt.verify(token, process.env.JWT_SECRET_KEY);
      }
      catch (error) {
        throw new Error('Invalid Token');
      } 
  }
}


// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  context: async({req}) => {
    const token = req.headers.authorization;
    const user = await getUser(token);
    
    // Add the db models to the context
    return { models,user };
  }
});
// Apply the Apollo GraphQL middleware and set the path to /api
server.applyMiddleware({ app, path: '/api' });
app.listen({ port }, () =>
  console.log(
    `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
  )
);
