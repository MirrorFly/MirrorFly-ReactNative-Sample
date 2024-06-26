import {
   GROUPS_DATA,
   GROUPS_UPDATE_DATA,
   GROUPS_MEMBER_DATA,
   CURRENT_CALL_GROUP_MEMBERS,
   GROUPS_MEMBER_PARTICIPANTS_LIST_DATA,
} from './Constants';

export const GroupsDataAction = data => {
   return {
      type: GROUPS_DATA,
      payload: {
         id: Date.now(),
         data,
      },
   };
};

export const GroupsMemberListAction = data => {
   return {
      type: GROUPS_MEMBER_DATA,
      payload: {
         id: Date.now(),
         data,
      },
   };
};

export const GroupDataUpdateAction = data => {
   return {
      type: GROUPS_UPDATE_DATA,
      payload: {
         id: Date.now(),
         data: data,
      },
   };
};

export const currentCallGroupMembers = data => {
   return {
      type: CURRENT_CALL_GROUP_MEMBERS,
      payload: {
         id: Date.now(),
         data: data || {},
      },
   };
};

export const GroupsMemberParticipantsListAction = data => {
   return {
      type: GROUPS_MEMBER_PARTICIPANTS_LIST_DATA,
      payload: {
         id: Date.now(),
         data,
      },
   };
};
