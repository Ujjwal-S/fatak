import { Outlet, Navigate } from "react-router-dom";
import { useAppSelector } from "./store/hooks";

const ProtectedRoute = () => {
    const roomName = useAppSelector(state => state.appScreen.roomName)
    const username = useAppSelector(state => state.appScreen.username)
    
    return (roomName && username) ? <Outlet /> : <Navigate to="/" />
}

export default ProtectedRoute;