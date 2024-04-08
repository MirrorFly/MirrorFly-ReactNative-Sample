import SDK from '../../SDK/SDK';
import { GroupsMemberListAction, GroupsMemberParticipantsListAction } from '../../redux/Actions/GroupsAction';
import { updateRosterData } from '../../redux/Actions/rosterAction';
import Store from '../../redux/store';
import { mflog } from '../../uikitHelpers/uikitMethods';
import { isLocalUser } from './ChatHelper';
import { MIX_BARE_JID } from './Constant';
import { getUserIdFromJid } from './Utility';

export const fetchGroupParticipants = async (groupId, iq = false) => {
   try {
      if (MIX_BARE_JID.test(groupId)) {
         const grpList = await SDK.getGroupParticipants(groupId, iq);
         const sortedParticipants =
            grpList.participants?.sort((a, b) => {
               const isAUserLocal = isLocalUser(getUserIdFromJid(a.userJid));
               const isBUserLocal = isLocalUser(getUserIdFromJid(b.userJid));

               if (isAUserLocal) {
                  return 1;
               } else if (isBUserLocal) {
                  return -1;
               } else {
                  return 0;
               }
            }) || [];
         setGroupParticipantsByGroupId(groupId, sortedParticipants);
         grpList.participants?.forEach(element => {
            const { userId, userJid, userProfile } = element;
            Store.dispatch(updateRosterData({ userId, userJid, ...userProfile }));
         });
      }
   } catch (error) {
      mflog('Failed to fetch group participants from SDK', error);
   }
};

export const setGroupParticipants = res => {
   Store.dispatch(GroupsMemberListAction(res));
};

export const setGroupParticipantsByGroupId = (groupId, participantsList) => {
   const uniqueUserJids = {};
   const uniqueParticipantsList = participantsList.filter(item => {
      if (item.userType !== '' && !uniqueUserJids[item.userJid]) {
         uniqueUserJids[item.userJid] = true;
         return true;
      }
      return false;
   });
   Store.dispatch(
      GroupsMemberParticipantsListAction({
         groupId: groupId,
         participantsList: uniqueParticipantsList,
      }),
   );
};

/**
 * Get the group data from groups list
 * @param {*} groupId
 */
export const getGroupData = (groupId = '') => {
   const { data: groupData } = Store.getState().groupsData;
   return groupData && groupData.find(obj => groupId.indexOf(obj.groupId) > -1);
};

/**
 * Check Given user exist in group or not
 */
export const isUserExistInGroup = (userId, groupUsers) => {
   if (!userId || (groupUsers && !Array.isArray(groupUsers))) {
      return false;
   }

   if (!groupUsers) {
      const { groupsMemberListData: { data: { participants } = {} } = {} } = Store.getState();
      if (!participants) {
         return false;
      }
      groupUsers = participants;
   }
   return groupUsers.some(user => user.userId === userId);
};

/**
 * Check Given user exist in group or not
 */
export const getUserFromGroup = (userId, groupUsers) => {
   if (!userId || (groupUsers && !Array.isArray(groupUsers))) {
      return false;
   }
   userId = getUserIdFromJid(userId);
   if (!groupUsers) {
      const { groupsMemberListData: { data: { participants } = {} } = {} } = Store.getState();
      if (!participants) {
         return false;
      }
      groupUsers = participants;
   }
   return groupUsers.find(user => user.userId === userId);
};
