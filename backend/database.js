const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// Use DATABASE_URL if available (Railway), otherwise use individual env vars (local dev)
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl:
          process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production'
            ? {
                require: true,
                rejectUnauthorized: false, // Required for Supabase/Railway external connections
              }
            : false,
      },
    })
  : new Sequelize(
      process.env.DB_NAME || 'gymnexus',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASS || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        logging: false,
      }
    );

console.log(
  process.env.DATABASE_URL
    ? `Using DATABASE_URL (${process.env.DATABASE_URL.includes('supabase') ? 'Supabase' : 'Remote'} PostgreSQL)`
    : 'Using individual DB env vars (local development)'
);

// --- MODELS ---

// Gym - Parent entity for multi-tenancy
const Gym = sequelize.define('Gym', {
  name: { type: DataTypes.STRING, allowNull: false },
  subdomain: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g., "powerhouse"
  logo: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' }, // active, suspended, trial
  plan: { type: DataTypes.STRING, defaultValue: 'starter' }, // starter, pro, enterprise
  maxMembers: { type: DataTypes.INTEGER, defaultValue: 100 },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  trialEndsAt: { type: DataTypes.DATE },
  secondaryColor: { type: DataTypes.STRING, defaultValue: '#1a1a1a' },
  features: {
    type: DataTypes.JSON,
    defaultValue: ['dashboard', 'members', 'trainers', 'schedule', 'settings'],
  }, // Array of enabled feature keys
});

// Admin - Gym administrators (separate from members)
const Admin = sequelize.define(
  'Admin',
  {
    gymId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, defaultValue: 'admin' }, // admin, super_admin
    status: { type: DataTypes.STRING, defaultValue: 'active' },
  },
  {
    hooks: {
      beforeCreate: async admin => {
        if (admin.password) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      },
      beforeUpdate: async admin => {
        if (admin.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          admin.password = await bcrypt.hash(admin.password, salt);
        }
      },
    },
  }
);

Admin.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// User - Global user accounts (can have memberships at multiple gyms)
const User = sequelize.define(
  'User',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    avatar: { type: DataTypes.TEXT }, // Deprecated - use memberPhoto instead
    memberPhoto: { type: DataTypes.TEXT }, // Member photo - used for both admin verification and client profile
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    hooks: {
      beforeCreate: async user => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async user => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

User.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Member - Membership record linking User to Gym (renamed from Member to Membership conceptually)
const Member = sequelize.define(
  'Member',
  {
    gymId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false }, // Links to User
    status: { type: DataTypes.STRING, defaultValue: 'Active' },
    suspended: { type: DataTypes.BOOLEAN, defaultValue: false },
    joinDate: { type: DataTypes.STRING },
    endDate: { type: DataTypes.STRING },
    duration: { type: DataTypes.STRING },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['gymId', 'userId'], // A user can only have one membership per gym
      },
    ],
  }
);

const Trainer = sequelize.define('Trainer', {
  gymId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  specialty: { type: DataTypes.STRING },
  skills: { type: DataTypes.TEXT }, // JSON array of skills for filtering
  rating: { type: DataTypes.FLOAT },
  singleSessionPrice: { type: DataTypes.INTEGER },
  packagePrice: { type: DataTypes.INTEGER },
  packageCount: { type: DataTypes.INTEGER, defaultValue: 10 },
  image: { type: DataTypes.TEXT },
});

const Class = sequelize.define('Class', {
  gymId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  trainer: { type: DataTypes.STRING },
  time: { type: DataTypes.STRING },
  duration: { type: DataTypes.STRING },
  capacity: { type: DataTypes.INTEGER },
  booked: { type: DataTypes.INTEGER, defaultValue: 0 },
  color: { type: DataTypes.STRING },
  day: { type: DataTypes.STRING }, // e.g., 'Mon', 'Tue' or 'Monday'
});

const Equipment = sequelize.define('Equipment', {
  gymId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  lastService: { type: DataTypes.STRING },
  nextService: { type: DataTypes.STRING },
});

const Booking = sequelize.define('Booking', {
  gymId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING },
  itemId: { type: DataTypes.STRING },
  memberId: { type: DataTypes.INTEGER },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

const CheckIn = sequelize.define('CheckIn', {
  gymId: { type: DataTypes.INTEGER, allowNull: false },
  memberId: { type: DataTypes.INTEGER, allowNull: false },
  memberName: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, allowNull: false },
  reason: { type: DataTypes.STRING },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  checkOutTime: { type: DataTypes.DATE },
});

const Specialty = sequelize.define('Specialty', {
  gymId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
});

// --- RELATIONSHIPS ---
Gym.hasMany(Admin, { foreignKey: 'gymId', onDelete: 'CASCADE' });
Gym.hasMany(Member, { foreignKey: 'gymId', onDelete: 'CASCADE' });
Gym.hasMany(Trainer, { foreignKey: 'gymId', onDelete: 'CASCADE' });
Gym.hasMany(Class, { foreignKey: 'gymId', onDelete: 'CASCADE' });
Gym.hasMany(Equipment, { foreignKey: 'gymId', onDelete: 'CASCADE' });
Gym.hasMany(Booking, { foreignKey: 'gymId', onDelete: 'CASCADE' });
Gym.hasMany(CheckIn, { foreignKey: 'gymId', onDelete: 'CASCADE' });
Gym.hasMany(Specialty, { foreignKey: 'gymId', onDelete: 'CASCADE' });

Admin.belongsTo(Gym, { foreignKey: 'gymId' });
Member.belongsTo(Gym, { foreignKey: 'gymId' });
Trainer.belongsTo(Gym, { foreignKey: 'gymId' });
Class.belongsTo(Gym, { foreignKey: 'gymId' });
Equipment.belongsTo(Gym, { foreignKey: 'gymId' });
Booking.belongsTo(Gym, { foreignKey: 'gymId' });
CheckIn.belongsTo(Gym, { foreignKey: 'gymId' });
Specialty.belongsTo(Gym, { foreignKey: 'gymId' });

// User-Member relationships (many-to-many through Member)
User.hasMany(Member, { foreignKey: 'userId', onDelete: 'CASCADE' });
Member.belongsTo(User, { foreignKey: 'userId' });

// --- SEEDING ---

const seedDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Create tables if not exist, alter if changed
    console.log('Database synced. Ready for real data.');
  } catch (error) {
    console.error('Database sync failed:', error);
  }
};

module.exports = {
  sequelize,
  Gym,
  Admin,
  User,
  Member,
  Trainer,
  Class,
  Equipment,
  Booking,
  CheckIn,
  Specialty,
  seedDatabase,
};
