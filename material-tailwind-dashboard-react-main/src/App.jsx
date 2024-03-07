import { Dashboard, Auth } from "@/layouts";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { auth } from "./config.firebase/firebase-config";
import { RecoilRoot } from 'recoil';
import { useAuthState } from "react-firebase-hooks/auth";
import { AppContext } from "./appContext/AppContext";
import { getUserData } from "./services/users.service";
import Authenticated from "./authenticated/Authenticated";
import ChatView from "./pages/dashboard/ChatView";


function App() {
  const [context, setContext] = useState({
    user: null,
    userData: null,
  });
  const [user, loading, error] = useAuthState(auth);
  const { id } = useParams();
  useEffect(() => {
    if (user) {
      getUserData(user.uid)
        .then((snapshot) => {
          if (snapshot.exists()) {
            console.log(snapshot.val());
            setContext({
              user,
              userData: snapshot.val()[Object.keys(snapshot.val())[0]],
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [user]);

  return (
    <AppContext.Provider value={{ ...context, setContext }}>
    <RecoilRoot> 
    <Routes>
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
      {/* <Route path="/dashboard/chats/:id?" element={<ChatView />} /> */}
    </Routes>
    </RecoilRoot> 
    </AppContext.Provider>
  );
}

export default App;
