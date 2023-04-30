// Import required modules
const { EntitySchema } = require('typeorm');

// Define the schema for the Admin entity
const Admin = new EntitySchema({
  name: 'Admin',
  tableName: 'admins',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true,
    },
    email: {
      type: String,
      nullable: false,
      unique: true,
    },
    password: {
      type: String,
      nullable: false,
    },
    password_reset_token: {
      type: String,
      nullable: false,
    },
    password_reset_token_expiration: {
      type: String,
      nullable: false,
    }
  }
});

module.exports = Admin;
