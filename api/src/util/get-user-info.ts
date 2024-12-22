import supertokens from 'supertokens-node';

import { UserInfo } from '../auth/user-info.dto.js';

export async function getUserInfo(userId: string): Promise<UserInfo> {
  const user = await supertokens.getUser(userId);
  if (!user) {
    throw new Error('No user info found');
  }
  return {
    email: user.emails[0],
    id: user.id,
  };
}
