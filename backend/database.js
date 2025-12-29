const { Sequelize, DataTypes } = require('sequelize');

// Use DATABASE_URL if available (Railway), otherwise use individual env vars (local dev)
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: false, // Railway uses internal networking, no SSL needed
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
    ? 'Using DATABASE_URL (Railway PostgreSQL)'
    : 'Using individual DB env vars (local development)'
);

// --- MODELS ---

const Member = sequelize.define('Member', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  plan: { type: DataTypes.STRING, defaultValue: 'Standard' },
  status: { type: DataTypes.STRING, defaultValue: 'Active' },
  joinDate: { type: DataTypes.STRING }, // Keeping as string for simplicity with mock data
});

const Trainer = sequelize.define('Trainer', {
  name: { type: DataTypes.STRING, allowNull: false },
  specialty: { type: DataTypes.STRING },
  rating: { type: DataTypes.FLOAT },
  singleSessionPrice: { type: DataTypes.INTEGER }, // Price for 1 session
  packagePrice: { type: DataTypes.INTEGER }, // Price for package (e.g. 10 sessions)
  packageCount: { type: DataTypes.INTEGER, defaultValue: 10 }, // Sessions in package
  image: { type: DataTypes.STRING },
});

const Class = sequelize.define('Class', {
  title: { type: DataTypes.STRING, allowNull: false },
  trainer: { type: DataTypes.STRING }, // Storing name for simplicity, or could relation
  time: { type: DataTypes.STRING },
  duration: { type: DataTypes.STRING },
  capacity: { type: DataTypes.INTEGER },
  booked: { type: DataTypes.INTEGER, defaultValue: 0 },
  color: { type: DataTypes.STRING },
});

const Equipment = sequelize.define('Equipment', {
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  lastService: { type: DataTypes.STRING },
  nextService: { type: DataTypes.STRING },
});

const Booking = sequelize.define('Booking', {
  type: { type: DataTypes.STRING }, // 'class' or 'trainer'
  itemId: { type: DataTypes.STRING }, // ID of class or trainer
  memberId: { type: DataTypes.INTEGER },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

// --- SEEDING ---

const seedDatabase = async () => {
  try {
    await sequelize.sync(); // Create tables if not exist
    console.log('Database synced. Ready for real data.');
  } catch (error) {
    console.error('Database sync failed:', error);
  }
};

module.exports = {
  sequelize,
  Member,
  Trainer,
  Class,
  Equipment,
  Booking,
  seedDatabase,
};
