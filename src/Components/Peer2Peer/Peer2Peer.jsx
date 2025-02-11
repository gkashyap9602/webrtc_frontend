import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./peer2peer.css";
import cameraPng from '../../assets/camera.png'
import phonePng from '../../assets/phone.png'
import micPng from '../../assets/mic.png'
import { initializeSocket } from "../Socket.listener";
import { io } from "socket.io-client";


export const Peer2Peer = () => {
  const socketRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteStream = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const room = queryParams.get("invite_link");
    console.log(room, "room")
    if (!room) {
      navigate('/lobby')
      return;
    }
    setRoomId(room);
    //get local stream on the page visit of the user 
    initLocalStream();

    const newSocket = initializeSocket(io);
    socketRef.current = newSocket

    newSocket.emit("join-room", room);

    newSocket.on("user-joined", handleUserJoined);
    newSocket.on("offer", handleOffer);
    newSocket.on("answer", handleAnswer);
    newSocket.on("candidate", handleCandidate);
    newSocket.on("user-left", handleUserLeft);


    return () => {
      // newSocket.disconnect();
      // leaveRoom();
    };
  }, []);//ends

  const initLocalStream = async () => {
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const createPeerConnection = async () => {
    //create peer connection with stun servers
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Ensure local stream is ready before creating a connection
    if (!localStream.current) {
      await initLocalStream(); // Wait until local stream is initialized
    }
    //create new media stream for remote user
    remoteStream.current = new MediaStream();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream.current;
    }
    //add local tracks so that they can be sent with peerconnection once the connection is established
    localStream.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    //add recieving tracks from the peer connection to remote stream so the remote stream will be played on the UI
    peerConnection.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.current.addTrack(track);
      });
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('New Ice Candidate Found!', event.candidate)
        socketRef.current.emit("candidate", { roomId, candidate: event.candidate });
      }
    };
  };//ends

  const handleUserJoined = async () => {
    console.log("handleUserJoined")
    if (peerConnection.current) {
      console.log("Peer connection already exists, skipping offer creation.");
      return;
    }
    await createPeerConnection();
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socketRef.current.emit("offer", { roomId, offer, sender: socketRef.current.id });
  };

  const handleOffer = async ({ sender, offer }) => {
    console.log("handleOffer")
    if (socketRef.current.id === sender) return; // Ignore self messages
    createPeerConnection();
    await peerConnection.current.setRemoteDescription(offer);
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    socketRef.current.emit("answer", { roomId, answer });
  };

  const handleAnswer = async ({ answer }) => {
    console.log("handleAnswer")
    await peerConnection.current.setRemoteDescription(answer);
  };

  const handleCandidate = async ({ sender, candidate }) => {
    console.log('handleCandidate')

    if (socketRef.current.id === sender) return; // Ignore self messages

    if (!peerConnection.current) {
      console.warn("PeerConnection not initialized yet");
      return;
    }

    await peerConnection.current.addIceCandidate(candidate);
  };

  const handleUserLeft = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
  };

  const leaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit("leaveRoom", roomId);
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }
    console.log("leaveRoom")
    navigate('/lobby')
  };

  const toggleCamera = () => {
    const videoTrack = localStream.current.getTracks().find(track => track.kind === 'video');
    videoTrack.enabled = !videoTrack.enabled;
  };

  const toggleMic = () => {
    const audioTrack = localStream.current.getTracks().find(track => track.kind === 'audio');
    audioTrack.enabled = !audioTrack.enabled;
  };

  return (
    <div>
      <div id="videos">
        <video ref={localVideoRef} autoPlay playsInline className="video-player" />
        <video ref={remoteVideoRef} autoPlay playsInline className="video-player" />
      </div>
      <div id="controls">
        <div className="control-container" id="camera-btn" >
          <img src={cameraPng} alt="Camera" onClick={toggleCamera} />
        </div>

        <div className="control-container" id="mic-btn">
          <img src={micPng} alt="Microphone" onClick={toggleMic} />
        </div>

        <div className="control-container" id="leave-btn" >
          <img src={phonePng} alt="Leave" onClick={leaveRoom} />
        </div>
      </div>
    </div>
  );
};


