// Import User model and authentication utilities
const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

// Define resolvers for GraphQL queries and mutations
const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');

        return userData;
      }
  // Throw authentication error if user is not authenticated
      throw new AuthenticationError('Not logged in');
    },
  },

  Mutation: {
    // Resolver function to add a new user
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },

     // Resolver function to authenticate user login
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
 // If user is not found, throw authentication error
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

     // If password is incorrect, throw authentication error
     if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

       // Generate JWT token for authenticated user
      const token = signToken(user);
      return { token, user };
    },
    // Resolver function to save a book to user's savedBooks array
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: bookData } },
          { new: true }
        );

        return updatedUser;
      }
 // Throw authentication error if user is not authenticated
 throw new AuthenticationError('Login to perform this action');
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        return updatedUser;
      }
// Throw authentication error if user is not authenticated
throw new AuthenticationError('Login to perform this action');
    },
  },
};

module.exports = resolvers;
