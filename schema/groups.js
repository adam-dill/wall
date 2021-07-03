const {gql, AuthenticationError} = require('apollo-server');
const {sequelize} = require('../mysqlconfig');
const initModels = require('../models/init-models');
const models = initModels(sequelize);

const { getUser } = require('../authenticate');
const { packData:packImageData } = require('./images');

const typeDef = gql`
    type ImageGroup {
        id: ID
        user_id: ID!
        label: String!
        description: String
        images: [Image]
    }

    input GroupInput {
        label: String
        description: String
    }

    extend type Query {
        getGroup(id: ID!): ImageGroup
    }

    extend type Mutation {
        addGroup(group: GroupInput!): ImageGroup
        updateGroup(id: ID!, group: GroupInput!): ImageGroup
        deleteGroup(id: ID!): Int!
        addGroupImage(groupId: ID!, imageId: ID!): Int
        removeGroupImage(groupId: ID!, imageId: ID!): Int
    }
`

const resolvers = {
    Query: {
        getGroup: async (root, {id}, req) => {
            const currentUser = await getUser(req);
            if (!currentUser) {
                throw new AuthenticationError("Not authorized");
            }
            const group = await models.image_groups.findOne({where: {id: id, user_id: currentUser.id}});
            
            return await packData(group, currentUser, req);
        },
    },
    Mutation: {
        addGroup: async (parent, {group: {label, description}}, req) => {
            if (!label) throw new Error(`A group name is required.`);;

            const currentUser = await getUser(req);
            if (!currentUser) {
                throw new AuthenticationError("Not authorized");
            }
            const user_id = currentUser.id;
            const found = await models.image_groups.findOne({ where: { user_id, label } });
            if (found) {
                throw new Error(`A group named ${label} already exists.`);
            }

            return await models.image_groups.create({user_id, label, description});
        },
        updateGroup: async (parent, {id, group:{label, description}}, req) => {
            const found = await models.image_groups.findOne({ where: { id } });
            if (!found) {
                // TODO: return a better error
                return null;
            }
            const currentUser = await getUser(req);
            if (!currentUser || currentUser.id !== parseInt(found.user_id)) {
                throw new AuthenticationError("Not authorized");
            }
            const user_id = currentUser.id;

            if (label) {
                const labeled = await models.image_groups.findOne({ where: { user_id, label } });
                if (labeled && found.id !== labeled.id) {
                    throw new Error(`A group named ${label} already exists.`);
                }

                found.label = label;
            }
            if (description) {found.description = description;}
            found.save();

            return found;
        },
        deleteGroup: async (parent, {id}, req) => {
            const currentUser = await getUser(req);
            const found = await models.image_groups.findOne({ where: { id } });
            if (!found) return 0;
            if (!currentUser || currentUser.id !== found.user_id) {
                throw new AuthenticationError("Not authorized");
            }

            await models.image_group_relationship.destroy({where: {group_id: id}});
            return await models.image_groups.destroy({where: {id}});
        },
        addGroupImage: async (parent, {groupId, imageId}, req) => {
            const currentUser = await getUser(req);
            const foundGroup = await models.image_groups.findOne({ where: { id: groupId, user_id: currentUser.id } });
            if (!currentUser || !foundGroup) {
                throw new AuthenticationError("Not authorized");
            }
            const foundImage = await models.images.findOne({ where: {id: imageId} });
            if (!foundImage) {
                // TODO: produce a better error: there is no image
                return null;
            }
            const foundRelationship = await models.image_group_relationship.findOne({ where: {image_id: foundImage.id, group_id: foundGroup.id} });
            if (foundRelationship) {
                // TODO: produce a better error: image exists in group already
                return null;
            }

            await models.image_group_relationship.create({image_id: parseInt(foundImage.id), group_id: parseInt(foundGroup.id)});
            // TODO: get a better return value from this method
            return 1;
        },
        removeGroupImage: async (parent, {groupId, imageId}, req) => {
            const currentUser = await getUser(req);
            const foundGroup = await models.image_groups.findOne({ where: { id: groupId, user_id: currentUser.id } });
            if (!currentUser) {
                throw new AuthenticationError("Not authorized");
            }
            const foundImage = await models.images.findOne({ where: {id: imageId} });
            if (!foundImage) {
                // TODO: produce a better error: there is no image
                return null;
            }
            const foundRelationship = await models.image_group_relationship.findOne({ where: {image_id: foundImage.id, group_id: foundGroup.id} });
            if (!foundRelationship) {
                // TODO: produce a better error: image doesn't exist in group
                return null;
            }

            // TODO: get a better return value from this method
            return await models.image_group_relationship.destroy({ where: {id: foundRelationship.id}});
        },
    }
};

const packData = async (group, currentUser, req) => {
    console.log("WORKING")
    const relationships = await models.image_group_relationship.findAll({where: {group_id: group.id}});
    group.images = await Promise.all(relationships.map(async (rel) => {
        const image = await models.images.findOne({where: {id: rel.image_id}});
        return packImageData(image, currentUser, req);
    }));
    return group;
}

module.exports = {
    typeDef,
    resolvers,
    packData
}