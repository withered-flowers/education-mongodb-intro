const { ObjectId } = require("mongodb");
const { GraphQLError } = require("graphql");

// ?? Initial data users
const users = [
	{
		id: 1,
		name: "Leanne Graham",
		username: "Bret",
		password: "123456",
		email: "halo@mail.com",
		role: ["superadmin"],
	},
	{
		id: 2,
		name: "Ervin Howell",
		username: "Antonette",
		password: "123456",
		email: "admin@mail.com",
		role: ["admin-user", "viewer-todo"],
	},
	{
		id: 3,
		name: "Clementine Bauch",
		username: "Samantha",
		password: "123456",
		email: "other@mail.com",
		role: ["viewer-todo", "viewer-user"],
	},
];

// ?? Schema / Type Definition / "Model" User
const userTypeDefs = `#graphql
  # Write the schema for User here
  type User {
    id: ID!
    name: String!
    username: String!
    password: String!
    email: String!
		role: [String!]
  }

	# Type user from mongodb
	type UserMongoDb {
		_id: ID!
    id: Int!
    name: String!
    username: String!
    password: String!
    email: String!
		role: [String!]
  }

  # Remember for every type definition, we will need to write the "contract" function for the resolver
  # Usually we will use type "Query" for HTTP GET request
  type Query {
    # This will be the "contract" function for resolver "userByEmail"
    # This function have to input email and will return UserResponse
    userByEmail(email: String!): UserResponse 

    # This will be the "contract" function for resolver "userLogin"
    # This function have to input username and password and will return UserLoginResponse
    userLogin(username: String!, password: String!): UserLoginResponse
  }
  # And we will use type "Mutation" for HTTP POST, PUT, DELETE request

	type Mutation {
		userAddRole(userId: ID!, role: String!): UserMongoDbResponse
	}
`;
const userResolvers = {
	Query: {
		userByEmail: (_, args) => {
			const { email } = args;
			const user = users.find((user) => user.email === email);

			// If user found we will return UserResponse
			return {
				statusCode: 200,
				data: user,
			};
		},

		// Implementation of "contract" function for resolver "userLogin"
		userLogin: (_, args) => {
			const { username, password } = args;

			const user = users.find(
				(user) => user.username === username && user.password === password,
			);

			// If user not found
			// We will throw graphql error
			if (!user) {
				throw new GraphQLError("Invalid username or password", {
					extensions: {
						http: {
							status: 401,
						},
					},
				});
			}

			// If user found we will return UserLoginResponse
			return {
				statusCode: 200,
				data: {
					token: "this-is-a-token",
				},
			};
		},
	},

	Mutation: {
		userAddRole: async (_, args, contextValue) => {
			const { userId, role } = args;
			const { db } = contextValue;

			const user = await db
				.collection("Users")
				.findOne({ _id: new ObjectId(userId) });

			if (!user) {
				throw new GraphQLError("User not found", {
					extensions: {
						http: {
							status: 404,
						},
					},
				});
			}

			// ? The brute way, using concat and set all of it
			// const newRole = user.role.concat(role);

			// await db.collection("users").updateOne(
			// 	{ _id: ObjectId(userId) },
			// 	{
			// 		$set: {
			// 			role: newRole,
			// 		},
			// 	},
			// );

			// ? The softer way, push the array
			await db.collection("Users").updateOne(
				{ _id: new ObjectId(userId) },
				{
					$push: {
						role,
					},
				},
			);

			const userUpdated = await db
				.collection("Users")
				.findOne({ _id: new ObjectId(userId) });

			return {
				statusCode: 200,
				data: userUpdated,
			};
		},
	},
};

module.exports = {
	userTypeDefs,
	userResolvers,
};