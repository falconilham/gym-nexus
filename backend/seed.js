const { sequelize, Gym, Admin, User, Member, CheckIn, Class, Trainer } = require('./database');

async function seed() {
  console.log('🌱 Seeding database with real data...');

  try {
    await sequelize.sync({ force: true }); // WARNING: This clears the DB
    console.log('🧹 Database cleared');

    // 1. Create Gyms
    const gymA = await Gym.create({
      name: 'PowerHouse Gym',
      subdomain: 'powerhouse',
      logo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&auto=format&fit=crop',
      address: '123 Muscle Ave, Venice Beach, CA',
      phone: '+1 (555) 012-3456',
      email: 'contact@powerhouse.com',
      plan: 'pro',
      status: 'active',
    });

    const gymB = await Gym.create({
      name: 'Iron Forge Fitness',
      subdomain: 'ironforge',
      logo: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200&auto=format&fit=crop',
      address: '404 Steel Blvd, Chicago, IL',
      phone: '+1 (555) 098-7654',
      email: 'info@ironforge.com',
      plan: 'starter',
      status: 'active',
    });

    console.log('✅ Gyms created');

    // 2. Create Admins
    // Super Admin (Attached to Gym A for now, or null if schema allows, but schema says gymId NOT NULL)
    // Wait, Admin schema says gymId is NOT NULL.
    // Usually Super Admin shouldn't be tied to a gym or should be tied to a "HQ" gym.
    // I will attach Super Admin to Gym A but give role 'super_admin'.

    await Admin.create({
      gymId: gymA.id,
      name: 'Super Admin',
      email: 'super@gymnexus.com',
      password: 'admin123', // Will be hashed by hook
      role: 'super_admin',
      status: 'active',
    });

    await Admin.create({
      gymId: gymA.id,
      name: 'PowerHouse Manager',
      email: 'admin@powerhouse.com',
      password: 'password123',
      role: 'admin',
      status: 'active',
    });

    await Admin.create({
      gymId: gymB.id,
      name: 'Iron Forge Owner',
      email: 'admin@ironforge.com',
      password: 'password123',
      role: 'admin',
      status: 'active',
    });

    console.log('✅ Admins created');

    // 3. Create Users & Members
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      phone: '555-1111',
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'user123',
      phone: '555-2222',
    });

    // Memberships
    const member1 = await Member.create({
      userId: user1.id,
      gymId: gymA.id,
      status: 'Active',
      joinDate: new Date().toISOString(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      duration: '12',
    });

    const member2 = await Member.create({
      userId: user2.id,
      gymId: gymA.id,
      status: 'Active',
      joinDate: new Date().toISOString(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      duration: '1',
    });

    // Member 2 also join Gym B
    const member3 = await Member.create({
      userId: user2.id,
      gymId: gymB.id,
      status: 'Active',
      joinDate: new Date().toISOString(),
      duration: '1',
    });

    console.log('✅ Users & Memberships created');

    // 4. Create Fake Check-ins
    // John Check-in today
    await CheckIn.create({
      gymId: gymA.id,
      memberId: member1.id,
      memberName: user1.name,
      status: 'granted',
      timestamp: new Date(),
    });

    // Jane Check-in yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await CheckIn.create({
      gymId: gymA.id,
      memberId: member2.id,
      memberName: user2.name,
      status: 'granted',
      timestamp: yesterday,
    });

    console.log('✅ Check-ins created');

    console.log('\n🎉 Data Seeded Successfully!');
    console.log('-------------------------------------------');
    console.log('Super Admin: super@gymnexus.com / admin123');
    console.log('PowerHouse Admin: admin@powerhouse.com / password123');
    console.log('IronForge Admin: admin@ironforge.com / password123');
    console.log('-------------------------------------------');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
