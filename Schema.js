const { gql } = require('apollo-server-express');
// Construct a schema, using GraphQL's schema language
//qgl object of type query with field of hello which return scalar type of string
module.exports = gql`
  scalar DateTime
  type Note {
    id: ID!
    content: String!
    author: User!
    createdAt: DateTime!
    updatedAt: DateTime!
    favoriteCount: Int!
    favoritedBy: [User!]
  }
  type Query {
    notes: [Note!]!
    note(id: ID!): Note!
    user(username: String!): User
    users: [User!]!
    me: User!
    noteFeed(cursor: String): NoteFeed
  }
  type Mutation {
    newNote(content: String!): Note!
    deleteNote(id:String!) :Boolean!
    updateNote(id:String!,content:String!):Note!

    signUp(username: String!, email: String!, password: String!): String!
    signIn(username: String, email: String, password: String!): String!
    toggleFavorite(id: ID!): Note!
  }
  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    notes: [Note!]!
    favorites: [Note!]!
  }

  type NoteFeed{
   notes: [Note]!
   cursor: String!
   hasNextPage: Boolean!
  }
`;
