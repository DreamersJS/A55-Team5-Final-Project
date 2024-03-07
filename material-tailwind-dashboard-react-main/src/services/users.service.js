import { get, set, ref, query, equalTo, orderByChild, update, getDatabase, push, child } from 'firebase/database';
import { format } from 'date-fns';
import { auth, db } from '@/config.firebase/firebase-config';


export const getAllUsers = async () => {
  const snapshot = await get(query(ref(db, "users")));
  if (!snapshot.exists()) {
      return [];
  }
  const users = Object.keys(snapshot.val()).map((key) => ({
      id: key,
      ...snapshot.val()[key],
  }));

  return users;
}

export const getUserByUid = (uid) => {
  return get(ref(db, `users/${uid}`));
};

export const createUserProfile = (uid, username, email, password, phoneNumber, role = 'user', status, friendsList, sentRequests, pendingRequests ) => {
  const readableDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

  return set(ref(db, `users/${uid}`), {
    uid,
    username,
    email,
    password,
    phoneNumber,
    role,
    status,
    friendsList,
    sentRequests,
    pendingRequests,
    profilePhotoURL: '',
    fileURL: '',
    location: '',
    createdOnReadable: readableDate,
  });
};

export const getUserData = (uid) => {
  return get(query(ref(db, 'users'), orderByChild('uid'), equalTo(uid)));
};

export const updateUserData = async (uid, data) => {
  const userRef = ref(db, `users/${uid}`);

  try {
    await update(userRef, data);
    console.log("User data updated successfully.");
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const userSnapshot = await get(
      query(ref(db, 'users'), orderByChild('email'), equalTo(email))
    );
    return userSnapshot;
  } catch (error) {
    console.error('Error getting user by email:', error.message);
    throw error;
  }
};

// FRIENDS REQUESTS:      Тhis code is taken from youtube i don't know if it works!!!

// function SendRequest(key) {
//   const currentUserKey = auth.currentUser.uid; 
  
//   let notification = {
//     sendTo: key,
//     sendFrom: currentUserKey,
//     name: auth.currentUser.displayName,
//     photo: auth.currentUser.photoURL,
//     dateTime: new Date().toLocaleString(),
//     status: 'Pending',
//   };

//   db.ref('notifications').push(notification, function (error) {
//     if (error) alert(error);
//     else {
//       // do something
//       // PopulateUserList(); // This function is not defined in the provided code
//     }
//   });
// }

// function NotificationCount() {
//   const currentUserKey = auth.currentUser.uid; // Get the current user's UID
//   let dbRef = db.ref('notifications');

//   dbRef.orderByChild('sendTo').equalTo(currentUserKey).on('value', function (noti) {
//     let notiArray = Object.values(noti.val() || {}).filter(n => n.status === 'Pending');
//     document.getElementById('notification').innerHTML = notiArray.length;
//   });
// }

// function Reject(key) {
//   let dbRef = db.ref('notifications').child(key);
//   dbRef.once('value', function (noti) {
//     let obj = noti.val();
//     obj.status = 'Reject';
//     dbRef.update(obj, function (error) {
//       if (error) alert(error);
//       else {
//         // do something
//         // PopulateNotifications(); // This function is not defined in the provided code
//       }
//     });
//   });
// }

// function Accept(key) {
//   let dbRef = db.ref('notifications').child(key);
//   dbRef.once('value', function (noti) {
//     var obj = noti.val();
//     obj.status = 'Accept';
//     dbRef.update(obj, function (error) {
//       if (error) alert(error);
//       else {
//         // do something
//         // PopulateNotifications(); // This function is not defined in the provided code
//         var friendList = { friendId: obj.sendFrom, userId: obj.sendTo };
//         db.ref('friend_list').push(friendList, function (error) {
//           if (error) alert(error);
//           else {
//             //do Something
//           }
//         });
//       }
//     });
//   });
// }