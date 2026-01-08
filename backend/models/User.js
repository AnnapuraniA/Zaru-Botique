import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'
import bcrypt from 'bcryptjs'

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  mobile: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      len: [10, 10],
      isNumeric: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [8, Infinity]
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  addresses: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  paymentMethods: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  wishlist: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
      }
    }
  }
})

// Instance method to compare password
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Instance method to remove password from JSON
User.prototype.toJSON = function() {
  const values = { ...this.get() }
  delete values.password
  return values
}

export default User
