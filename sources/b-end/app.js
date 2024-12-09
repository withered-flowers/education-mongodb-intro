import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";

import { responseTypeDefs } from "./schemas/response.js";
import { todoResolvers, todoTypeDefs } from "./schemas/todo.js";
import { userResolvers, userTypeDefs } from "./schemas/user.js";

import { connect, getDB } from "./config/mongo-connection.js";

const server = new ApolloServer({
	typeDefs: [responseTypeDefs, userTypeDefs, todoTypeDefs],
	resolvers: [userResolvers, todoResolvers],
});

// ? Connect to MongoDB
await connect();
const db = await getDB();

const { url } = await startStandaloneServer(server, {
	listen: 4000,
	// context in Apollo GraphQL always a(n) async function
	context: async ({ req, res }) => {
		// We can make the global logic inside here (middleware)
		console.log("this console will be triggered on every request");

		// Always return an object
		return {
			// We can make the global function definition inside here
			dummyFunction: () => {
				console.log("We can read headers here", req.headers);

				// Let's make it error
				throw new GraphQLError("This is an error", {
					// This is the extension for the error (to show in the response)
					extensions: {
						// https://www.apollographql.com/docs/apollo-server/data/errors#built-in-error-codes
						// https://www.apollographql.com/docs/apollo-server/data/errors#custom-errors
						code: "INTERNAL_SERVER_ERROR",
					},
				});
			},

			// Use db as the contextValue
			db,
		};
	},
});

console.log(`🚀 Server ready at ${url}`);
