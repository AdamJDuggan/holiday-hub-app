import { ApolloServer } from "apollo-server-express";

/**
 * Graphql --------------------------
 */

const typeDefs = require("../collections/recipies/recipie.typeDef");
const resolvers = require("../collections/recipies/recipie.resolve");
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Enable introspection
});

export default server;
