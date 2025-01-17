const peerConfiguration = {
    iceServers: [
        {
            urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
        },
    ],
}; //ends


const showResponse = (status, message, data = null, code = null) => {

    const response = {
        status: status,
        message: message,
        code: 400
    };

    if (code !== null) {
        response.code = code;
    }
    if (data !== null) {
        response.data = data;
    }

    return response;
};


const statusCodes = {
    SUCCESS: 200,                  // ok
    ERROR: 400,                // bad request
}


// Replace with your server's URL
const SOCKET_SERVER_URL1 = "https://192.168.0.137:8181";
const SOCKET_SERVER_URL2 = "https://192.168.1.104:8181";

export { showResponse, peerConfiguration, statusCodes, SOCKET_SERVER_URL1, SOCKET_SERVER_URL2 }