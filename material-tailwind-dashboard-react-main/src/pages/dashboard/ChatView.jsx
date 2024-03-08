import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { serverTimestamp } from "firebase/database";
import { useContext, useEffect, useState } from "react";
import { db } from "../../config.firebase/firebase-config";
import { get, query, ref, push, update, orderByChild, equalTo } from "firebase/database";
import { useNavigate, useParams } from "react-router-dom";
import { getAllUsers } from "../../services/users.service";
import { useRecoilState } from 'recoil';
import { currentRoomId } from '../../atom/atom';
import { AppContext } from "@/appContext/AppContext";

export function ChatView() {
  const { user, userData } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();
  let { id } = useParams();

  const [currentRoom, setCurrentRoom] = useRecoilState(currentRoomId);

  const [room, setRoom] = useState({
      id: '',
      participants: [],
      messages: [{ messageId: "", },],
  });

  const selectFriend = async (friend) => {
    const userId = user?.uid;
    const friendId = friend.uid;
    
    if (!userId || !friendId) {
        console.error("User ID or friend ID is missing.");
        return;
    }      
    const participants = [userId, friendId];
    const room = await getRoom(participants);
      console.log({ room });
      
      if (!room) {
          const newRoom = await createRoom(participants);
           console.log({newRoom});
          setRoom(newRoom);
      } else {
          setRoom(room);
      }
      setCurrentRoom(room.id);
      navigate(`/rooms/${room.id}`);
      console.log({currentRoom});
  }
  useEffect(() => {
      console.log("Current Room in useEffect:", currentRoom);
  }, [currentRoom]);

  const getRoom = async (participants) => {
    console.log({participants});
      try {
          const roomsRef = ref(db, 'rooms');
          const snapshot = await get(roomsRef);
  
          if (snapshot.exists()) {
              const allRooms = snapshot.val();
              const roomId = Object.keys(allRooms).find(roomId => {
                  const room = allRooms[roomId];
                  const roomParticipants = Object.keys(room.participants);
                  return (
                      roomParticipants.length === participants.length &&
                      roomParticipants.every(participant => participants.includes(participant))
                  );
              });
  
              if (roomId) {
                  return {
                      id: roomId,
                      ...allRooms[roomId]
                  };
              }
          }
          return null;
      } catch (error) {
          console.error('Error fetching room:', error);
          return null;
      }
  };
  
  const createRoom = async (participants) => {
      const newRoom = {
          participants: participants.reduce((acc, key) => ({
              ...acc,
              [key]: true

          }), {}),
      };

      const roomRef = push(ref(db, "rooms"));
      await update(roomRef, newRoom);

      for (const participant of participants) {
          await update(ref(db, `users/${participant}/rooms`), {
              [roomRef.key]: true
          });
      }

      return {
          id: roomRef.key,
          ...newRoom
      };
  };

  useEffect(() => {
      getAllUsers().then((users) => setUsers(users));
  }, []);

  //-------------------------------------------------------------------------------------

  const [messages, setMessages] = useState([]);

  const checkRoomMessages = async (id = id) => {
      const roomRef = ref(db, `rooms/${id}`);

      try {
          const snapshot = await get(roomRef);

          if (snapshot.exists()) {
              console.log("Data exists:", snapshot.val());

              const messagesRef = child(roomRef, 'messages');
              const messagesSnapshot = await get(messagesRef);
              if (messagesSnapshot.exists()) {
                  console.log("Messages exist:", messagesSnapshot.val());
              } else {
                  console.log("No messages yet in this room.");
              }
          } else {
              console.log("Room does not exist.");
          }
      } catch (error) {
          console.error("Error accessing roomRef:", error);
      }
  }

  useEffect(() => {
      try {
          if (id) {

              const roomRef = ref(db, `rooms/${id}/messages`);// useParams
              const queryRef = query(roomRef);
              const unsubscribe = onChildAdded(queryRef, (snapshot) => {
                  const messageData = snapshot.val();
                  console.log({ messageData});
                  if (messageData) {
                      setMessages((prevMessages) => [...prevMessages, messageData]);
                  }
              });
              return () => {
                  unsubscribe();
              };

          } else {
              // If there's no current room, clear the messages
              setMessages([]);
          }
      } catch (error) {
          console.log("Error accessing roomRef:", error);
      }
  }, [currentRoom]);

  const handleInputMessage = (e) => {
      e.preventDefault();
      const message = e.target.value;
      setNewMessage(message);
  };

  const sendMessage = async () => {
      if (!newMessage.trim()) return;

      const message = {
          senderId: userData.uid,
          senderName: userData.username,
          content: newMessage,
          timestamp: serverTimestamp(),
          avatar: userData?.photoURL || null,
      };

      console.log("Message to be sent:", message);

      await push(ref(db, `rooms/${currentRoom}/messages`), message);
      setNewMessage("");
  };


  return (
    <div className="mt-12">
      
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-scroll border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Friends
              </Typography>
             
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Action</MenuItem>
                <MenuItem>Another Action</MenuItem>
                <MenuItem>Something else here</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
            <thead>
                <tr>
                  {["chats", "status"].map(
                    (el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-6 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-medium uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
              <ul className="chat-user-list">
                            {users.length > 0 &&
                                users.map((user) => (
                                    <li key = {user.id} className="px-5 py-[15px] group-data-[theme-color=violet]:hover:bg-slate-100 group-data-[theme-color=green]:hover:bg-green-50/50 group-data-[theme-color=red]:hover:bg-red-50/50 transition-all ease-in-out border-b border-white/20 dark:border-zinc-700 group-data-[theme-color=violet]:dark:hover:bg-zinc-600 group-data-[theme-color=green]:dark:hover:bg-zinc-600 group-data-[theme-color=red]:dark:hover:bg-zinc-600 dark:hover:border-zinc-700">
                                      <h5 user={user} key={user.id} onClick={() => (selectFriend(user))}>{user.username}</h5>
                                    </li>
                                ))}
                        </ul>
              </tbody>
            </table>
          </CardBody>
        </Card>
        {/* End of friends list */}
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Chats
            </Typography>
            
          </CardHeader>
          <CardBody className="pt-0">
            <p>Select a chat</p>
            { id ?  checkRoomMessages(id) : <p>Select a friend to start a chat.</p>}
            {messages.length > 0 &&
                         messages.map((message) => (
                            <div key={message.messageId} className="flex items-center gap-4">
                                                        <img src={message?.avatar} alt="" className="rounded-full h-9 w-9" />
                                     <p>
                                                                    {message.content}
                                     </p>
                            </div>
                               ) )
                                }

                                    {/* handleSendMessage    sendMessage(messages) */}
<div className="flex-grow">
                                    <input type="text" value={newMessage} onChange={handleInputMessage} onClick={() => { sendMessage(messages) }} onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }} className="w-full border-transparent rounded bg-gray-50 placeholder:text-14 text-14 dark:bg-zinc-700 dark:placeholder:text-gray-300 dark:text-gray-300" placeholder="Enter Message..." />
                                </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default ChatView;
