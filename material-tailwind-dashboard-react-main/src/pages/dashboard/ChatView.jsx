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

import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../appContext/AppContext";
import { db } from "../../config.firebase/firebase-config";
import { get, query, ref, push, update, orderByChild, equalTo } from "firebase/database";
import { useNavigate, useParams } from "react-router-dom";
import { getAllUsers } from "../../services/users.service";
import { useRecoilState } from 'recoil';
import { currentRoomId } from '../../atom/atom';
// import { SingleChat } from "./SingleChat";

export function ChatView() {
  const { user, userData } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
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
      const participants = [user?.uid, friend.uid];
      const room = await getRoom(participants);
      console.log({ room });
      
      if (!room) {
          const newRoom = await createRoom(participants);
           // console.log({newRoom});
          setRoom(newRoom);
      } else {
          setRoom(room);
      }
      setCurrentRoom(room.id);
      navigate(`/rooms/${room.id}`);
      // console.log({currentRoom});
  }
  // useEffect(() => {
  //     console.log("Current Room in useEffect:", currentRoom);
  // }, [currentRoom]);

  const getRoom = async (participants) => {
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

  const handleSearchChange = async (e) => {
      const value = e.target.value.toLowerCase();
      setSearch(value);

      if (value.trim() === "") {
          const updatedUsers = await getAllUsers();
          setUsers(updatedUsers);
      } else {
          const snapshot = await get(query(ref(db, "users")));
          if (snapshot.exists()) {
              const users = Object.keys(snapshot.val()).map((key) => ({
                  id: key,
                  ...snapshot.val()[key],
              }));

              const filteredUsers = users.filter((user) =>
                  user.username.toLowerCase().includes(value) ||
                  user.email.toLowerCase().includes(value)
              );
              setUsers(filteredUsers);
          }
      }
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
                {users.length > 0 && users.map(
                  ({ profilePhotoURL, username, uid, status }, key) => {
                    const className = `py-3 px-5 ${
                      key === users.length - 1
                        ? ""
                        : "border-b border-blue-gray-50"
                    }`;

                    return (
                      <tr key={uid}>
                        <td className={className}>
                          <div className="flex items-center gap-4"   user={user} onClick={() => (selectFriend(user))} >
                            <Avatar src={profilePhotoURL} alt='' size="sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {username}
                            </Typography>
                          </div>
                        </td>
                       
                        
                        
                      </tr >
                    );
                  }
                )}
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
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default ChatView;
