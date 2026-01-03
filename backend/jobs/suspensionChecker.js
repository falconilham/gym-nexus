const { Member, ActivityLog, User, sequelize } = require('../database');
const { Op } = require('sequelize');

const checkSuspensions = async () => {
  try {
    console.log('Checking for expired suspensions...');
    const now = new Date();

    // Find members who are suspended and whose suspensionEndDate has passed
    const membershipsToReactivate = await Member.findAll({
      where: {
        suspended: true,
        suspensionEndDate: {
          [Op.lte]: now,
        },
      },
      include: [{ model: User }],
    });

    if (membershipsToReactivate.length > 0) {
      console.log(`Found ${membershipsToReactivate.length} members to reactivate.`);

      for (const member of membershipsToReactivate) {
        console.log(`Reactivating member: ${member.User?.name || member.id}`);

        member.suspended = false;
        member.suspensionReason = null;
        member.suspensionEndDate = null;
        await member.save();

        // Log the activity
        await ActivityLog.create({
          gymId: member.gymId,
          adminName: 'System',
          action: 'MEMBER_ACTIVATED',
          details: JSON.stringify({
            name: member.User?.name || member.id,
            status: 'Active',
            reason: 'Auto-reactivation (Suspension period ended)',
          }),
        });
      }
    }
  } catch (error) {
    console.error('Error in suspension checker job:', error);
  }
};

// Run the check every hour
const startSuspensionChecker = () => {
  // Run immediately on start
  checkSuspensions();

  // Then run every hour
  setInterval(checkSuspensions, 60 * 60 * 1000);
};

module.exports = { startSuspensionChecker };
