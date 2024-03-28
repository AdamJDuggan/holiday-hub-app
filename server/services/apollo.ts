// Node modules
import fs from "fs";
import path from "path";
// Apollo graphql
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { loadFilesSync } from "@graphql-tools/load-files";
const { ApolloServer } = require("apollo-server-express");

// Function to recursively find all files with extension
function findGraphqlFiles(
  dir: string,
  extension: string,
  fileList: string[] = []
): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file: any) => {
    const filePath = path.join(dir, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isDirectory()) {
      fileList = findGraphqlFiles(filePath, extension, fileList);
    } else if (file.endsWith(extension)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const typeDefFiles = findGraphqlFiles(
  path.join(__dirname, "../collections"),
  "typeDef.ts"
);

const typeDefs = mergeTypeDefs(loadFilesSync(typeDefFiles));

const resolverFiles = findGraphqlFiles(
  path.join(__dirname, "../collections"),
  "resolvers.js"
);

const resolvers = mergeResolvers(loadFilesSync(resolverFiles));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});

export default server;
