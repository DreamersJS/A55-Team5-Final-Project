import { Link } from "react-router-dom"


export function SingleChat({ user, roomId, onClick }) {

  return (
    <>
    <div onClick={onClick}>
        <div className="flex">
            <div className="relative self-center ltr:mr-3 rtl:ml-3">
                <img src="./assets/images/users/avatar-2.jpg" className="rounded-full w-9 h-9" alt="" />
                <span className="absolute w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full top-7 ltr:right-1 rtl:left-1 dark:border-zinc-600"></span>
            </div>

            <div className="flex-grow overflow-hidden">
                <h5 className="mb-1 text-base truncate dark:text-gray-50">{user.username}</h5>
                <p className="mb-0 text-gray-500 truncate dark:text-gray-300 text-14">Hey! there I'm available</p>
            </div>
            <div className="text-gray-500 text-11 dark:text-gray-300">05 min</div>
        </div>
    </div>
    </>
    )
  }