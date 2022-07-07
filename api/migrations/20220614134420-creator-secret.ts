import { Db } from 'mongodb';

module.exports = {
  async up(db: Db) {
    const allLobbies = await db.collection('lobbies').find({}).toArray();
    for (const lobby of allLobbies) {
      if (lobby.creatorUid) {
        lobby.creatorUids = [lobby.creatorUid];
        await db.collection('lobbies').updateOne({ _id: lobby._id }, { $set: lobby });
        await db.collection('lobbies').updateOne({ _id: lobby._id }, { $unset: { creatorUid: '' } });
      }
    }
  },

  async down(db: Db) {
    const allLobbies = await db.collection('lobbies').find({}).toArray();
    for (const lobby of allLobbies) {
      if (lobby.creatorUids) {
        lobby.creatorUid = lobby.creatorUids[0];
        await db.collection('lobbies').updateOne({ _id: lobby._id }, { $set: lobby });
        await db.collection('lobbies').updateOne({ _id: lobby._id }, { $unset: { creatorUids: '' } });
      }
    }
  }
};
