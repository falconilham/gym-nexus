const { User, Member, Gym, sequelize } = require('./database');

async function cleanupAndCreateMembers() {
  try {
    console.log('🧹 Cleaning up Members data...\n');

    // Delete all existing members
    await Member.destroy({ where: {}, truncate: true });
    console.log('✅ Deleted all existing members\n');

    // Get existing users and gyms
    const users = await User.findAll();
    const gyms = await Gym.findAll();

    console.log(`Found ${users.length} users and ${gyms.length} gyms\n`);

    if (users.length === 0 || gyms.length === 0) {
      console.log('⚠️  No users or gyms found. Please run seed.js first.');
      return;
    }

    console.log('📝 Creating new member data...\n');

    // Calculate dates
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const threeMonthsFromNow = new Date(today);
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const sixMonthsFromNow = new Date(today);
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    const oneYearFromNow = new Date(today);
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    // Create comprehensive member data
    const membersData = [
      // John Doe - Multiple gym memberships
      {
        userId: users[0].id, // John Doe
        gymId: gyms[0].id, // PowerHouse Gym
        status: 'active',
        suspended: false,
        joinDate: oneMonthAgo,
        endDate: oneYearFromNow,
        duration: '1 Year',
      },
      {
        userId: users[0].id, // John Doe
        gymId: gyms[1].id, // Iron Forge Fitness
        status: 'active',
        suspended: false,
        joinDate: oneMonthAgo,
        endDate: sixMonthsFromNow,
        duration: '6 Months',
      },

      // Jane Smith - Single gym, expiring soon
      {
        userId: users[1].id, // Jane Smith
        gymId: gyms[0].id, // PowerHouse Gym
        status: 'active',
        suspended: false,
        joinDate: new Date(today.getFullYear(), today.getMonth() - 11, today.getDate()),
        endDate: twoWeeksFromNow,
        duration: '1 Year',
      },
    ];

    // Add memberships for additional gyms if they exist
    if (gyms.length > 2 && users.length > 1) {
      membersData.push({
        userId: users[1].id, // Jane Smith
        gymId: gyms[2].id, // Third gym
        status: 'active',
        suspended: true, // Suspended membership
        joinDate: oneMonthAgo,
        endDate: threeMonthsFromNow,
        duration: '3 Months',
      });
    }

    if (gyms.length > 3 && users.length > 0) {
      membersData.push({
        userId: users[0].id, // John Doe
        gymId: gyms[3].id, // Fourth gym
        status: 'active',
        suspended: false,
        joinDate: oneMonthAgo,
        endDate: threeMonthsFromNow,
        duration: '3 Months',
      });
    }

    // Create members
    const createdMembers = await Member.bulkCreate(membersData);

    console.log(`✅ Created ${createdMembers.length} new memberships\n`);

    // Display created members
    console.log('📊 New Members Data:\n');
    console.log('─'.repeat(100));
    console.log(
      'ID | User Name       | Gym Name            | Status | Suspended | Join Date  | End Date   | Duration'
    );
    console.log('─'.repeat(100));

    for (const member of createdMembers) {
      const user = await User.findByPk(member.userId);
      const gym = await Gym.findByPk(member.gymId);

      const joinDate = new Date(member.joinDate).toLocaleDateString();
      const endDate = new Date(member.endDate).toLocaleDateString();
      const daysRemaining = Math.ceil(
        (new Date(member.endDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      console.log(
        `${member.id.toString().padEnd(3)}| ` +
          `${user.name.padEnd(16)}| ` +
          `${gym.name.padEnd(20)}| ` +
          `${member.status.padEnd(7)}| ` +
          `${(member.suspended ? 'Yes' : 'No').padEnd(10)}| ` +
          `${joinDate.padEnd(11)}| ` +
          `${endDate.padEnd(11)}| ` +
          `${member.duration} (${daysRemaining} days left)`
      );
    }
    console.log('─'.repeat(100));

    console.log('\n✨ Members data cleanup and creation complete!\n');

    // Summary
    console.log('📈 Summary:');
    console.log(`   Total Memberships: ${createdMembers.length}`);
    console.log(`   Active: ${createdMembers.filter(m => !m.suspended).length}`);
    console.log(`   Suspended: ${createdMembers.filter(m => m.suspended).length}`);
    console.log(
      `   Expiring Soon (< 30 days): ${
        createdMembers.filter(m => {
          const days = Math.ceil((new Date(m.endDate) - new Date()) / (1000 * 60 * 60 * 24));
          return days < 30 && days > 0;
        }).length
      }`
    );

    console.log('\n💡 Test Scenarios:');
    console.log('   ✅ Multi-gym user (John Doe has multiple memberships)');
    console.log('   ✅ Single-gym user (Jane Smith at PowerHouse)');
    console.log('   ✅ Expiring membership (Jane Smith expires in ~14 days)');
    console.log('   ✅ Suspended membership (if available)');
    console.log('   ✅ Various durations (3 months, 6 months, 1 year)');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Run the cleanup
cleanupAndCreateMembers();
