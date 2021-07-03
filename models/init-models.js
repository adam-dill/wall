var DataTypes = require("sequelize").DataTypes;
var _image_group_relationship = require("./image_group_relationship");
var _image_groups = require("./image_groups");
var _images = require("./images");
var _users = require("./users");

function initModels(sequelize) {
  var image_group_relationship = _image_group_relationship(sequelize, DataTypes);
  var image_groups = _image_groups(sequelize, DataTypes);
  var images = _images(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);


  return {
    image_group_relationship,
    image_groups,
    images,
    users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
