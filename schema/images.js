const fs = require('fs');
const jimp = require('jimp');
const {gql, AuthenticationError} = require('apollo-server');
const { sequelize } = require('../mysqlconfig');
const initModels = require('../models/init-models');
const models = initModels(sequelize);
const { v4: uuidv4 } = require('uuid');

const { getUser } = require('../authenticate');

const uploadDir = "uploads";
const imageSize = {
    "large": { width: 1200, height: jimp.AUTO },
    "medium": { width: 800, height: jimp.AUTO },
    "small": { width: 200, height: jimp.AUTO }
}

const typeDef = gql`
    scalar FileUpload
    
    type Image {
        id: ID
        user_id: Int
        filename: String
        title: String
        description: String
        created: String
        user: User
        groups: [ImageGroup]
        image_large: String
        image_medium: String
        image_small: String
    }

    input ImageInput {
        title: String
        description: String
        file: FileUpload
        groups: [Int]
    }

    extend type Query {
        getImage(id: ID!): Image
        getImages(offset: Int, limit: Int, groupId: ID, currentUserOnly:Boolean): [Image]!
    }

    extend type Mutation {
        addImage(image: ImageInput!): Image
        updateImage(id: ID!, image: ImageInput): Image
        removeImageFromGroup(imageId: ID!, groupId: ID!): [ImageGroup]!
        addImageToGroup(imageId: ID!, groupId: ID!): [ImageGroup]!
        deleteImage(id: ID!): Int!
    }
`

const resolvers = {
    Query: {
        getImage: async (root, { id }, req) => {
            const currentUser = await getUser(req);
            if (!currentUser) {
                //throw new AuthenticationError("Not authorized");
            }

            const image = await models.images.findOne({ where: { id } });
            return await packData(image, currentUser, req);
        },
        getImages: async(root, {offset, limit, groupId, currentUserOnly}, req) => {
            const currentUser = await getUser(req);
            if (!currentUser) {
                //throw new AuthenticationError("Not authorized");
            }
            let query = { 
                order: [['created', 'DESC']],
                offset,
                limit 
            };
            if (currentUser && currentUserOnly) {
                query.where = {user_id: currentUser.id}
            }
            const images = await models.images.findAll(query);
            for (let image of images) {
                await packData(image, currentUser, req);
            }
            // TODO: this doesn't work here. It needs to be in the query.
            const filtered = images.filter(image => {
                if (groupId === undefined) return true;
                return image.groups.some(group => {
                    return parseInt(group.id) === parseInt(groupId);
                });
            });
            
            return filtered;
        },
    },
    Mutation: {
        addImage: async (parent, {image:{title, description, file, groups}}, req) => {
            const currentUser = await getUser(req);
            if (!currentUser) {
                throw new AuthenticationError("Not authorized");
            }
            if (!file) throw new Error("Select a file for upload.");

            const user_id = currentUser.id;
            
            const { createReadStream, mimetype } = await file;
            const fileStream = createReadStream();
            const [fileType, fileExtension] = mimetype.split('/');
            if (fileType !== 'image') {
                throw new Error('The uploaded file was not an image');
            }

            const created = new Date();
            const uuid = uuidv4();
            const filename = `${uuid}.${fileExtension}`;
            const image = await models.images.create({user_id, filename, title, description, created});
            await groups.forEach(async (groupId) => {
                // ensure the group belongs to the user
                const group = await models.image_groups.findOne({where: {id: groupId, user_id}});
                if (group) {
                    await models.image_group_relationship.create({image_id: image.id, group_id: groupId});
                }
            });
            await saveImage(fileStream, filename);

            return await packData(image, currentUser, req);
        },
        updateImage: async (parent, {id, image:{title, description, file, groups}}, req) => {
            const found = await models.images.findOne({ where: { id } });
            if (!found) return null;
            
            const currentUser = await getUser(req);
            if (!currentUser || currentUser.id !== found.user_id) {
                throw new AuthenticationError("Not authorized to update image");
            }

            // image.file would require an update to the image files on the server
            if (file) {
                // Save the actual image to the harddrive
                const { createReadStream } = await file;
                const fileStream = createReadStream();
                const { filename } = found;
                await saveImage(fileStream, filename);
            }
            if (title) {found.title = title;}
            if (description) {found.description = description;}
            found.save();
            
            return found;
        },
        removeImageFromGroup: async(parent, {imageId, groupId}, req) => {
            const found = await models.images.findOne({ where: { id: imageId } });
            if (!found) return null;
            
            const currentUser = await getUser(req);
            if (!currentUser || currentUser.id !== found.user_id) {
                // allow uses to remove images uploaded from other uses to their own groups
                //throw new AuthenticationError("Not authorized to update image");
            }
            models.image_group_relationship.destroy({where: {image_id: imageId, group_id: groupId}});
            // TODO: a bit silly to get the groups this way
            await packData(found, currentUser, req);
            return found.groups;
        },
        addImageToGroup: async(parent, {imageId, groupId}, req) => {
            const found = await models.images.findOne({ where: { id: imageId } });
            if (!found) return null;
            
            const currentUser = await getUser(req);
            if (!currentUser || currentUser.id !== found.user_id) {
                // allow uses to add images uploaded from other uses to their own groups
                //throw new AuthenticationError("Not authorized to update image");
            }
            const relationship = await models.image_group_relationship.findOne({where: {image_id: imageId, group_id: groupId}});
            if (!relationship) {
                await models.image_group_relationship.create({image_id: imageId, group_id: groupId});
            }
            // TODO: a bit silly to get the groups this way
            await packData(found, currentUser, req);
            return found.groups;
        },
        deleteImage: async (parent, {id}, req) => {
            const found = await models.images.findOne({ where: { id } });
            if (!found) throw new Error('Image not found.');

            const currentUser = await getUser(req);
            if (!currentUser || currentUser.id !== found.user_id) {
                throw new AuthenticationError("Not authorized to delete this image.");
            }
            
            models.image_group_relationship.destroy({where: {image_id: id}});
            try {
                fs.unlinkSync(`./${uploadDir}/${found.filename}`);
            } catch (err) { /* fail silently */ }
            return await models.images.destroy({ where: { id }});
        },
    },
};

// TODO: clean this up by removing the Promise.all call
const packData = async (data, currentUser, req) => {
    data.user = await models.users.findOne({ where: { id: data.user_id } });
    if (!currentUser || data.user.user_id !== currentUser.id) {
        // TODO: create a better system to prevent mistakes
        // remove private information.
        data.user.api_key=null;
    }
    data.groups = [];
    if (currentUser) {
        const relationships = await models.image_group_relationship.findAll({ where: { image_id: data.id } });
        const groups = await Promise.all(relationships.map(async (rel) => {
                const group = await models.image_groups.findOne({ where: { id: rel.group_id } });
                return group;
            }));
        data.groups = groups.filter(group => group.user_id === currentUser.id);
    }
    createImagePaths(data, req);
    return data;
};

const createImagePaths = (data, req) => {
    if (data.filename === undefined) throw new Error('createImagePaths argument requires a property "filename"');

    const host = `${req.protocol}://${req.get('host')}`;
    const imageSize = {
        "large": { width: 1200, height: jimp.AUTO },
        "medium": { width: 800, height: jimp.AUTO },
        "small": { width: 300, height: jimp.AUTO }
    }
    for (const key of Object.keys(imageSize)) {
        const path = `${host}/${uploadDir}/${key}/${data.filename}`;
        const gqlName = `image_${key}`;
        data[gqlName] = path;
    }
}

const saveImage = async (fileStream, filename) => {
    // TODO: image for the full should be created like the others.
    const fullPath = `./${uploadDir}`
    if (!fs.existsSync(`./${uploadDir}`)) {
        fs.mkdirSync(`./${uploadDir}`);
    }
    await fileStream.pipe(await fs.createWriteStream(`./${uploadDir}/${filename}`));
    await sleep(100);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    typeDef,
    resolvers,
    packData,
    createImagePaths
}