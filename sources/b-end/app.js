if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");

const { responseTypeDefs } = require("./schemas/response");
const { userTypeDefs, userResolvers } = require("./schemas/user");
const { todoTypeDefs, todoResolvers } = require("./schemas/todo");

const { connect, getDB } = require("./config/mongo-connection");

const server = new ApolloServer({
	typeDefs: [responseTypeDefs, userTypeDefs, todoTypeDefs],
	resolvers: [userResolvers, todoResolvers],
});

// IIFE
(async () => {
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
})();
