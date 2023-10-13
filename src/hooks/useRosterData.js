import React from 'react';
import { useSelector } from 'react-redux';
import SDK from '../SDK/SDK';
import { updateUserProfileStore } from '../Helper/Chat/ChatHelper';

/**
 * @typedef {Object} userProfileDetails
 * @property {string} nickName - Nick name of the user
 * @property {string} image - Profile image url of the user
 * @property {string} status - Status of the user
 * @property {string} colorCode - Color code assigned by SDK for the user
 * @property {string} email - Email of the user
 * @property {string} userId - userId
 * @property {string} userJid - userJis
 * @property {string} mobileNumber - Mobile number
 * @property {number} isAdminBlocked - is blocked by Admin
 */

/**
 * Custom hook to get the contact user profile details for specific userId from rosterData redux reducer state
 * @param {string} userId userId of the profile details needed
 * @returns {userProfileDetails}
 */
const useRosterData = userId => {
  const data = useSelector(state => state.rosterData.data);
  const [userProfileData, setUserProfileData] = React.useState({});

  React.useLayoutEffect(() => {
    const userData = data[userId];
    if (!userData) {
      setUserProfileData({});
      getUserProfile(userId);
    } else {
      setUserProfileData(userData);
    }
  }, [data[userId]]);

  return userProfileData;
};

export default useRosterData;

const getUserProfile = userId => {
  SDK.getUserProfile(userId).then(res => {
    console.log(res, 'getUserProfile');
    if (res?.statusCode === 200) {
      updateUserProfileStore(res.data);
    }
  });
};
