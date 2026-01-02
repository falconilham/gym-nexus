const { sequelize, Gym, User, Member, Admin } = require('./database');

async function migrate() {
  console.log('🔄 Starting migration to multi-tenant schema...\n');

  try {
    // Step 1: Create Gym table first
    console.log('1️⃣  Creating Gym table...');
    await Gym.sync({ force: false });
    console.log('✅ Gym table ready\n');

    // Step 2: Create User table
    console.log('2️⃣  Creating User table...');
    await User.sync({ force: false });
    console.log('✅ User table ready\n');

    // Step 3: Create Admin table
    console.log('3️⃣  Creating Admin table...');
    await Admin.sync({ force: false });
    console.log('✅ Admin table ready\n');

    // Step 4: Check if we have existing Members
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count FROM "Members"
    `);
    const existingMemberCount = parseInt(results[0].count);

    if (existingMemberCount > 0) {
      console.log(`⚠️  Found ${existingMemberCount} existing members. Migrating...\n`);

      // Create a default gym
      console.log('4️⃣  Creating default gym...');
      const [defaultGym] = await Gym.findOrCreate({
        where: { subdomain: 'default' },
        defaults: {
          name: 'Default Gym',
          subdomain: 'default',
          status: 'active',
          plan: 'pro',
          maxMembers: 1000,
        },
      });
      console.log(`✅ Default gym created (ID: ${defaultGym.id})\n`);

      // Check if gymId column exists
      const [columns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Members' AND column_name = 'gymId'
      `);

      if (columns.length === 0) {
        // Add gymId column as nullable first
        console.log('5️⃣  Adding gymId column (nullable)...');
        await sequelize.query(`
          ALTER TABLE "Members" ADD COLUMN "gymId" INTEGER
        `);
        console.log('✅ Column added\n');
      }

      // Check if userId column exists
      const [userIdColumns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Members' AND column_name = 'userId'
      `);

      if (userIdColumns.length === 0) {
        // Add userId column as nullable first
        console.log('6️⃣  Adding userId column (nullable)...');
        await sequelize.query(`
          ALTER TABLE "Members" ADD COLUMN "userId" INTEGER
        `);
        console.log('✅ Column added\n');
      }

      // Get all existing members
      console.log('7️⃣  Migrating existing members...');
      const [members] = await sequelize.query(`
        SELECT * FROM "Members" WHERE "gymId" IS NULL OR "userId" IS NULL
      `);

      for (const member of members) {
        // Create User from Member
        const [user] = await User.findOrCreate({
          where: { email: member.email },
          defaults: {
            name: member.name,
            email: member.email,
            password: member.password,
          },
        });

        // Update Member with gymId and userId
        await sequelize.query(`
          UPDATE "Members" 
          SET "gymId" = ${defaultGym.id}, "userId" = ${user.id}
          WHERE id = ${member.id}
        `);
      }
      console.log(`✅ Migrated ${members.length} members\n`);

      // Now make columns NOT NULL and add foreign keys
      console.log('8️⃣  Adding constraints...');

      // Drop old columns if they exist
      try {
        await sequelize.query(`ALTER TABLE "Members" DROP COLUMN IF EXISTS "name"`);
        await sequelize.query(`ALTER TABLE "Members" DROP COLUMN IF EXISTS "email"`);
        await sequelize.query(`ALTER TABLE "Members" DROP COLUMN IF EXISTS "password"`);
      } catch (e) {
        // Columns might not exist
      }

      // Make gymId NOT NULL
      await sequelize.query(`
        ALTER TABLE "Members" ALTER COLUMN "gymId" SET NOT NULL
      `);

      // Make userId NOT NULL
      await sequelize.query(`
        ALTER TABLE "Members" ALTER COLUMN "userId" SET NOT NULL
      `);

      // Add foreign key constraints
      try {
        await sequelize.query(`
          ALTER TABLE "Members" 
          ADD CONSTRAINT "Members_gymId_fkey" 
          FOREIGN KEY ("gymId") REFERENCES "Gyms"(id) 
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
      } catch (e) {
        console.log('   (gymId foreign key already exists)');
      }

      try {
        await sequelize.query(`
          ALTER TABLE "Members" 
          ADD CONSTRAINT "Members_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "Users"(id) 
          ON DELETE CASCADE ON UPDATE CASCADE
        `);
      } catch (e) {
        console.log('   (userId foreign key already exists)');
      }

      // Add unique constraint
      try {
        await sequelize.query(`
          CREATE UNIQUE INDEX "Members_gymId_userId_unique" 
          ON "Members"("gymId", "userId")
        `);
      } catch (e) {
        console.log('   (unique index already exists)');
      }

      console.log('✅ Constraints added\n');
    } else {
      console.log('4️⃣  No existing members, syncing fresh schema...');
      await Member.sync({ alter: true });
      console.log('✅ Member table ready\n');
    }

    // Step 5: Sync other tables
    console.log('9️⃣  Syncing remaining tables...');
    await sequelize.sync({ alter: true });
    console.log('✅ All tables synced\n');

    console.log('🎉 Migration complete!\n');
    console.log('📊 Summary:');
    const gymCount = await Gym.count();
    const userCount = await User.count();
    const memberCount = await Member.count();
    const adminCount = await Admin.count();

    console.log(`   - Gyms: ${gymCount}`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Memberships: ${memberCount}`);
    console.log(`   - Admins: ${adminCount}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
