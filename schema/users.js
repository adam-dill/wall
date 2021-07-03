const fs = require('fs');
const {gql, AuthenticationError} = require('apollo-server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {sequelize, JWT_SECRET} = require('../mysqlconfig');
const initModels = require('../models/init-models');
const models = initModels(sequelize);

const {sendPasswordReset} = require('../mail');
const { getUser, verifyPasswordReset } = require('../authenticate');
const { packData:packImageData } = require('./images');
const { packData:packGroupData } = require('./groups');

const typeDef = gql`
    type User {
        id: ID!
        email: String!
        images: [Image]!
        groups: [ImageGroup]!
        api_key: String
        created: String!
    }

    type UserResponse {
        token: String
    }

    input UserInput {
        email: String!
        password: String!
    }

    input UpdateUserInput {
        password: String
        api_key: String
    }

    type Query {
        getCurrentUser: User
        getUser(id: ID!): User
        validateResetToken(token: String!): Boolean!
    }

    type Mutation {
        addUser(email: String!, password: String!): UserResponse!
        loginUser(email: String!, password: String!): UserResponse!
        refreshToken: UserResponse!
        forgotPassword(email: String!): String!
        updateUser(userUpdate: UpdateUserInput!, token: String): UserResponse!
    }
`

const resolvers = {
    Query: {
        getCurrentUser: async (root, args, req) => {
            const currentUser = await getUser(req);
            if (!currentUser) {
                return null;
                throw new AuthenticationError("Not authorized");
            }
            return await packData(currentUser, currentUser, req);
        },
        getUser: async (root, {id}, req) => {
            const currentUser = await getUser(req);
            
            if (!currentUser) {
                //throw new AuthenticationError("Not authorized");
            }
            const user = await models.users.findOne({where: {id}});
            if (!user) return null;

            return await packData(user, currentUser, req);
        },
        validateResetToken: async (root, {token}) => {
            const user = await verifyPasswordReset(token);
            return (user !== null);
        },
    },
    Mutation: {
        addUser: async (root, {email, password}) => {
            if (!email || email === '' || !password || password === '') {
                throw new Error('Invalid input to register user.');
            }
            const created = new Date();
            const user = await models.users.create({email, password: bcrypt.hashSync(password, 3), created});
            return sign(user);
        },
        loginUser: async(root, {email, password}) => {
            const user = await models.users.findOne({ where: { email } });
            if (!user) throw new Error('Unable to Login');
            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) throw new Error('Unable to Login');
            return sign(user);
        },
        refreshToken: async(root, args, req) => {
            const currentUser = await getUser(req);
            return sign(currentUser);
        },
        forgotPassword: async(root, {email}, req) => {
            if (!email || email === "") {
                throw new Error('Your email is needed to reset the password.');
            }
            const user = await models.users.findOne({ where: { email } });
            if (!user) throw new Error('User does not exist');
            const token = jwt.sign({user}, JWT_SECRET, {expiresIn: '1h'});
            
            const info = await sendPasswordReset(req, user.email, token);
            return info.response;
        },
        updateUser: async(root, {userUpdate, token}, req) => {
            const user = (token)
                ? await verifyPasswordReset(token)
                : await getUser(req);
            if (!user) throw new Error('Invalid token');
            if (userUpdate.password) {
                userUpdate.password = bcrypt.hashSync(userUpdate.password, 3);
            }
            Object.assign(user, userUpdate);
            user.save();
            return sign(user);
        }
    }
};

const sign = (user) => {
    return {token: jwt.sign({user}, JWT_SECRET, {expiresIn: '15m'})};
}

const packData = async(data, currentUser, req) => {
    // hide the api key unless it's the current user
    const limit = data.id !== currentUser.id;
    data.api_key = limit ? null : data.api_key;
    
    // TODO: I think these loops require a For-Of loop to be asynchronous
    data.images = await models.images.findAll({where: {user_id: data.id}});
    await data.images.forEach(async (image) => {
        await packImageData(image, currentUser, req);
    });

    data.groups = limit ? [] : await models.image_groups.findAll({where: {user_id: data.id}});
    await data.groups.forEach(async (group) => {
        await packGroupData(group, currentUser, req);
    });
    
    return data;
};

module.exports = {
    typeDef,
    resolvers
}