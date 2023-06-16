import Realm from 'realm';
import { ProfileSchema, onChange } from './ProfileSchema';

export const realmConfig = {
    path: '/data/data/com.mirrorfly.qa/databases/sdk_db.realm',
    schema: [ProfileSchema], // Add your schema objects here
};

// Open the Realm instance and add the listener
Realm.open(realmConfig)
    .then((realm) => {
        const profiles = realm.objects('Profile');
        const listener = profiles.addListener(onChange);

        // Perform any other operations with the Realm instance as needed

        // When you're done, remove the listener and close the Realm instance
        listener.remove();
        realm.close()
    })
    .catch((error) => {
        console.log('Failed to open Realm', error);
    });
