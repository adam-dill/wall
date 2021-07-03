const {makeExecutableSchema} = require('apollo-server');
const {merge} = require('lodash');
const {typeDef: typeUsers, resolvers: resolveUsers} = require('./users');
const {typeDef: typeImages, resolvers: resolveImages} = require('./images');
const {typeDef: typeGroups, resolvers: resolveGroups} = require('./groups');
const {typeDef: typeGroupRelationship, resolvers: resolveGroupRelationship} = require('./groupRelationship');
const {typeDef: typeSearch, resolvers: resolveSearch} = require('./search');

const schema = makeExecutableSchema({
    typeDefs: [ typeUsers, typeImages, typeGroups, typeGroupRelationship, typeSearch ],
    resolvers: merge(resolveUsers, resolveImages, resolveGroups, resolveGroupRelationship, resolveSearch),
});

module.exports = schema;