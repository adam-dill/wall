const fs = require('fs');
const {gql, AuthenticationError} = require('apollo-server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize } = require('sequelize');
const {sequelize, JWT_SECRET} = require('../mysqlconfig');
const initModels = require('../models/init-models');
const models = initModels(sequelize);

const {sendPasswordReset} = require('../mail');
const { getUser, verifyPasswordReset } = require('../authenticate');
const { packData:packImageData } = require('./images');
const { packData:packGroupData } = require('./groups');

const typeDef = gql`
    
    type SearchResult {
        images: [Image]
    }

    extend type Query {
        search(offset: Int, limit: Int, term: String!): SearchResult!
    }
`

const resolvers = {
    Query: {
        search: async (root, {offset, limit, term}, req) => {
            const currentUser = await getUser(req);
            if (!currentUser) {
                //throw new AuthenticationError("Not authorized");
            }
            // search by image title
            let images = await models.images
                .findAll({
                    where: {
                        //user_id: currentUser.id,
                        [Sequelize.Op.or]: [
                            { title: {[Sequelize.Op.like]: `%${term}%`} },
                            { description: {[Sequelize.Op.like]: `%${term}%`} },
                        ]
                    },
                    offset,
                    limit,
                    order: [['created', 'DESC']]
                });

            for (const image of images) {
                await packImageData(image, currentUser, req);
            }
            return { images };
        },
    },
};

module.exports = {
    typeDef,
    resolvers
}