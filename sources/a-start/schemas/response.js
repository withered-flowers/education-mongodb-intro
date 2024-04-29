const responseTypeDefs = `#graphql
  # Write the schema for Response here
  interface Response {
    # status will be flagged as required
    statusCode: String!

    # message is optional
    message: String

    # error is optional
    error: String
  }

  # We will create a new type definition for UserLoginData
  # This type definition will be used for UserLoginResponse
  type UserLoginData {
    token: String
  }

  # We will "extend" the Response interface to create a new type definition
  # Using keyword "implements"
  type UserResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: User
  }

  # We will create a new type definition for UserResponse
  type UserLoginResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: UserLoginData
  }

  type TodoResponse implements Response {
    statusCode: String!
    message: String
    error: String
    data: [Todo]
  }

  type TodoMutationResponse implements Response {
    statusCode: String!
    message: String
    error: String
  }

  # For this type definition, we will not make any resolver
  # Because this type definition is only used for response
`;

module.exports = {
	responseTypeDefs,
};
