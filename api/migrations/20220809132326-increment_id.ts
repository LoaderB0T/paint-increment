import { Db } from 'mongodb';
import { id } from '../src/util/id';

module.exports = {
  async up(db: Db) {
    const allLobbies = await db.collection('lobbies').find({}).toArray();
    for (const lobby of allLobbies) {
      for (const increment of lobby.increments) {
        if (!increment.id) {
          increment.id = id();
        }
      }
      await db.collection('lobbies').updateOne({ _id: lobby._id }, { $set: lobby });
    }
  },

  async down(db: Db) {
    await db.collection('lobbies').updateMany({}, { $unset: { 'increments.$[].id': '' } });
  }
};
