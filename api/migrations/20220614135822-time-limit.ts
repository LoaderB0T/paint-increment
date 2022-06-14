import { Db } from 'mongodb';

module.exports = {
  async up(db: Db) {
    const allLobbies = await db.collection('lobbies').find({}).toArray();
    for (const lobby of allLobbies) {
      if (!lobby.settings.timeLimit) {
        lobby.settings.timeLimit = 15;
        await db.collection('lobbies').updateOne({ _id: lobby._id }, { $set: lobby });
      }
    }
  },

  async down(db: Db) {
    const allLobbies = await db.collection('lobbies').find({}).toArray();
    for (const lobby of allLobbies) {
      if (lobby.settings.timeLimit) {
        await db.collection('lobbies').updateOne({ _id: lobby._id }, { $unset: { 'settings.timeLimit': '' } });
      }
    }
  }
};
