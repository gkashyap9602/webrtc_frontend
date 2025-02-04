import { SOCKET_SERVER_URL1, SOCKET_SERVER_URL2 } from "../Constant.js/Constant";


const initializeSocket = (io, userName, password) => {
    //if trying it on a phone, use this instead...
    const socket = io.connect(SOCKET_SERVER_URL1, {
        // const socket = io.connect('https://localhost:8181/', {
        auth: {
            userName, password
        }
    });

    // Listen for a successful connection
    socket.on("connect", () => {
        console.log("Socket connected successfully with ID:", socket.id);
    });

    // Listen for connection errors
    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
    });

    // Listen for disconnection
    socket.on("disconnect", (reason) => {
        console.warn("Socket disconnected:", reason);
    });



    return socket
}


export { initializeSocket }