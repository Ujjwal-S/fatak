import { useState } from "react";
import { RoomModeType } from "../types";
import Navbar from "./Navbar";
import { v4 as uuidv4 } from 'uuid';
import homeImgURL from "../../assets/HomePage/home.png";
import arrowForwardImgURL from "../../assets/HomePage/arrow_forward.svg"
import toast from "react-hot-toast";
import diceImgURL from "../../assets/HomePage/dice.png"
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateRoomName, updateUsername } from "../../store/appScreenSlice";
import { updateLanguage } from "../../store/codeSlice";
import { useNavigate } from "react-router-dom";


const HomePage = () => {
    const [roomMode, setRoomMode] = useState<RoomModeType>("join")
    const updateRoomMode = (updateTo:RoomModeType) => {
        setRoomMode(updateTo);
    }
    const navigate = useNavigate()
    const dispatch = useAppDispatch();
    const roomName = useAppSelector(state => state.appScreen.roomName)
    const username = useAppSelector(state => state.appScreen.username)

    const generateRoomName = () => {
        const name = uuidv4( )
        dispatch(updateRoomName(name));
        toast.success('Created a new room.')
    }

    const updateCodingLanguage = (e:any) => {
        dispatch(updateLanguage(e.target.value))
    }
    
    const joinRoom = () => {
        if (!roomName || !username) {
            return toast.error("Room Name & Username are required!")
        }

        navigate('/editor/')
    }

    return (
        <div className="bg-primary text-white w-screen h-screen">
            <div className="flex flex-col max-w-7xl h-full mx-auto">
                <Navbar updateRoomMode={updateRoomMode} roomMode={roomMode} />
                <div className="grow home-background">
                    <div className="py-8 px-6 shadow-2xl bg-home-box-bg rounded-lg w-96 mx-auto my-32">
                        <div className="flex justify-center items-start mb-6">
                            <img src={homeImgURL} alt="room icon" draggable="false" />
                            <h4 className="pl-3 text-xl font-bold tracking-wide">
                                { roomMode === "create" ? 'Create A Room' : 'Enter Room Name' }
                            </h4>
                        </div>
                        <div className="relative">
                            <input
                                className="outline-none bg-home-input-bg px-4 py-2 rounded-xl w-full text-sm mb-4"
                                type="text" 
                                disabled={roomMode === "create" && true}
                                placeholder="Room Name"
                                value={roomName}
                                onChange={(e) => dispatch(updateRoomName(e.target.value))}
                            />
                            {
                                roomMode === "create" 
                                &&
                                <button className="absolute top-2 right-3" onClick={generateRoomName}>
                                    <img src={diceImgURL} className="h-4" alt="creare room" draggable={false} />
                                </button>
                            }
                            <input
                                className="outline-none bg-home-input-bg px-4 py-2 rounded-xl w-full text-sm"
                                type="text" 
                                placeholder="Username" 
                                onChange={(e) => dispatch(updateUsername(e.target.value))}
                            />
                            {
                                roomMode === "create" 
                                &&
                                <div
                                    className="outline-none text-gray-400 bg-home-input-bg px-4 py-2 rounded-xl w-full text-sm mt-4 flex justify-between items-center"
                                >
                                    <label htmlFor="langauge">Choose a Language</label>
                                    <select name="language" id="langauge" className="outline-none text-gray-400 bg-home-input-bg" onChange={updateCodingLanguage}>
                                        <option value="python">Python</option>
                                        <option value="cpp">C++</option>
                                    </select>
                                </div>
                            }
                            <p className="text-sm text-secondary w-3/4 text-center mx-auto mt-6">
                                {roomMode === "create"
                                    ? 'Create a room invite your colleagues and start coding.'
                                    : 'Already got a room? Enter the room name and join!'
                                }
                            </p>
                        </div>
                        <button 
                            onClick={joinRoom}
                            className="flex justify-center items-center bg-primary-button rounded-full w-[35%] py-1 mx-auto mt-3">
                            Next
                            <img src={arrowForwardImgURL} alt="next" className="ml-1 scale-90" draggable="false" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage;