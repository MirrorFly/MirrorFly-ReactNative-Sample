import { updateDBProfileDetails } from "../redux/dbSlice";
import store from "../redux/store";
import { realmConfig } from "./realm";
import Realm from 'realm';
import { v4 as uuidv4 } from 'uuid';

export const ProfileSchema = {
    name: 'Profile',
    primaryKey: 'id',
    properties: {
        id: 'string',
        name: 'string',
        email: 'string',
    },
};

// Function to handle changes in the Realm data
export const onChange = (newProfiles, changes) => {
    console.log('Realm data has changed');
    console.log('New Profiles:', newProfiles);
    console.log('Changes:', changes);
    const serializedProfiles = JSON.parse(JSON.stringify(newProfiles));
    store.dispatch(updateDBProfileDetails(serializedProfiles))
    // Perform any necessary actions based on the changes
};

// Create a new profile
export const createProfile = (name, email) => {
    const id = uuidv4();
    Realm.open(realmConfig)
        .then((realm) => {
            realm.write(() => {
                realm.create('Profile', { id, name, email });
            });
            console.log('Profile created successfully');
        })
        .catch((error) => {
            console.log('Failed to create profile', error);
        });
};

// Read all profiles
export const readProfiles = () => {
    Realm.open(realmConfig)
        .then((realm) => {
            const profiles = realm.objects('Profile');
            console.log('All Profiles:', profiles);
        })
        .catch((error) => {
            console.log('Failed to read profiles', error);
        });
};

// Update a profile
export const updateProfile = (id, name, age) => {
    Realm.open(realmConfig)
        .then((realm) => {
            const profile = realm.objectForPrimaryKey('Profile', id);
            if (profile) {
                realm.write(() => {
                    profile.name = name;
                    profile.age = age;
                });
                console.log('Profile updated successfully');
            } else {
                console.log('Profile not found');
            }
        })
        .catch((error) => {
            console.log('Failed to update profile', error);
        });
};

// Delete a profile
export const deleteProfile = (id) => {
    Realm.open(realmConfig)
        .then((realm) => {
            const profile = realm.objectForPrimaryKey('Profile', id);
            if (profile) {
                realm.write(() => {
                    realm.delete(profile);
                });
                console.log('Profile deleted successfully');
            } else {
                console.log('Profile not found');
            }
        })
        .catch((error) => {
            console.log('Failed to delete profile', error);
        });
};