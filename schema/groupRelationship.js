const {gql} = require('apollo-server');
const {sequelize} = require('../mysqlconfig');
const initModels = require('../models/init-models');
const models = initModels(sequelize);

const typeDef = gql`
    type ImageGroupRelationship {
        image_id: ID!
        group_id: ID!
    }
`

const resolvers = {};

module.exports = {
    typeDef,
    resolvers
}