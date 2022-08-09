import { Db } from 'mongodb';
import { v4 as uuid } from 'uuid';

module.exports = {
  async up(db: Db) {
    const allLobbies = await db.collection('lobbies').find({}).toArray();
    for (const lobby of allLobbies) {
      for (const increment of lobby.increments) {
        if (!increment.id) {
          increment.id = uuid();
        }
      }
      await db.collection('lobbies').updateOne({ _id: lobby._id }, { $set: lobby });
    }
  },

  async down(db: Db) {
    await db.collection('lobbies').updateMany({}, { $unset: { 'increments.$[].id': '' } });
  }
};
