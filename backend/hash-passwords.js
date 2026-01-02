const { sequelize, Admin, User } = require('./database');
const bcrypt = require('bcryptjs');

const hashPasswords = async () => {
  try {
    console.log('Connecting to database...');
    // Ensure connection
    await sequelize.authenticate();
    console.log('Database connected.');

    // 1. Migrate Admins
    console.log('Fetching admins...');
    const admins = await Admin.findAll();
    console.log(`Found ${admins.length} admins.`);

    for (const admin of admins) {
      if (!admin.password.startsWith('$2a$') && !admin.password.startsWith('$2b$')) {
        console.log(`Hashing password for admin: ${admin.email}`);
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(admin.password, salt);
        await admin.save({ hooks: false }); // Disable hooks to prevent double hashing if my logic was different, but here I manually hashed so I save raw.
        // Wait, if I save with hooks=true, the hook currently checks admin.changed('password').
        // If I update password property, changed is true. The hook hashes it.
        // So if I manually hash here, and then save with hooks enabled, it might double hash depending on implementation.
        // My hook implementation:
        // if (admin.changed('password')) { admin.password = await bcrypt.hash(admin.password, salt); }
        // So if I set admin.password = hashedValue, verify checks if it changed. Yes it did. Then it hashes the hashed value.
        // So I MUST use { hooks: false } or rely on the hook to do the hashing.

        // Approach A: Let the hook do it.
        // admin.password = originalPlainPassword; // It's already loaded as such.
        // admin.changed('password', true); // Force change? No, simple assignment works if value is different.
        // But value IS different if I set it to a new value. If I keep it same, it's not changed.

        // Approach B: Manually hash and save with hooks: false.
        // This is safer for a migration script.
      } else {
        console.log(`Password already hashed for admin: ${admin.email}`);
      }
    }

    // 2. Migrate Users
    console.log('Fetching users...');
    const users = await User.findAll();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
      if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        console.log(`Hashing password for user: ${user.email}`);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save({ hooks: false });
      } else {
        console.log(`Password already hashed for user: ${user.email}`);
      }
    }

    console.log('Password migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

hashPasswords();
