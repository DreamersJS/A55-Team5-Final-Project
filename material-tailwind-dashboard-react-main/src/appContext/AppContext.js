import { createContext } from "react";

export const AppContext = createContext({
  user: null,
  userData: null,
  setContext: () => { },
});

// import React, { createContext, useState, useContext } from 'react';

// export const AppContext = createContext();

// export const AppProvider = ({ children }) => {
//   const [state, setState] = useState({ user: null, userData: null });

//   const setContext = (newState) => {
//     setState(prevState => ({ ...prevState, ...newState }));
//   };

//   // Define setUser or any other method to update specific parts of the context
//   const setUser = (user) => {
//     setState(prevState => ({ ...prevState, user }));
//   };

//   return (
//     <AppContext.Provider value={{ ...state, setContext, setUser }}>
//       {children}
//     </AppContext.Provider>
//   );
// };

export const RoomContext = createContext({
  userId: null,
  friendId: null,
  roomId: null,
  setContext: () => { },
});

// export const RoomProvider = ({ children }) => {
//   const [roomId, setRoomId] = useState(null);

//   return (
//     <RoomContext.Provider
//       value={{
//         userId: null, // Your initial values
//         friendId: null, // Your initial values
//         roomId: roomId,
//         setRoomId: setRoomId,
//       }}
//     >
//       {children}
//     </RoomContext.Provider>
//   );
// };

// const { setRoomId } = useContext(RoomContext);
// Somewhere in your component, when you want to update roomId
// setRoomId(newRoomId);
