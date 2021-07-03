const jwt = require('jsonwebtoken');
const {sequelize, JWT_SECRET} = require('./mysqlconfig');
const initModels = require('./models/init-models');
const models = initModels(sequelize);

const decodedToken = (req, requireAuth = true) => {
    const header =  req.headers.authorization;

    if (header){
        const token = header.replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    }
    if (requireAuth) {
        throw new Error('Login in to access resource');
    } 
    return null
}
const getUser = async (req) => {
    try {
        const decoded = decodedToken(req).user;
        const {email, password} = decoded;
        const user = await models.users.findOne({where: {email, password}});
        return user;
    } catch (err) {
        console.error(err);
        return null;
    }
}
const verifyPasswordReset = async(token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET).user;
        const {email, password} = decoded;
        const user = await models.users.findOne({where: {email, password}});
        return user;
    } catch (err) {
        console.error(err);
        return null;
    }
}

module.exports = { 
    decodedToken,
    getUser,
    verifyPasswordReset
}