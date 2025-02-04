import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./peer2peer.css";
import cameraPng from '../../assets/camera.png'
import phonePng from '../../assets/phone.png'
import micPng from '../../assets/mic.png'
import { initializeSocket } from "../Socket.listener";
import { io } from "socket.io-client";


export const Peer2Peer = () => {
  const [socket, setSocket] = useState(null);
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
      // window.location = "/lobby";
      return;
    }
    setRoomId(room);

    const newSocket = initializeSocket(io);
    setSocket(newSocket);

    newSocket.emit("joinRoom", room);

    newSocket.on("userJoined", handleUserJoined);
    newSocket.on("offer", handleOffer);
    newSocket.on("answer", handleAnswer);
    newSocket.on("candidate", handleCandidate);
    newSocket.on("userLeft", handleUserLeft);

    initLocalStream();

    return () => {
      newSocket.disconnect();
      leaveRoom();
    };
  }, []);

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

  const createPeerConnection = () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    remoteStream.current = new MediaStream();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream.current;
    }

    localStream.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    peerConnection.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.current.addTrack(track);
      });
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", { roomId, candidate: event.candidate });
      }
    };
  };

  const handleUserJoined = async () => {
    createPeerConnection();
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("offer", { roomId, offer });
  };

  const handleOffer = async ({ offer }) => {
    createPeerConnection();
    await peerConnection.current.setRemoteDescription(offer);
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    socket.emit("answer", { roomId, answer });
  };

  const handleAnswer = async ({ answer }) => {
    await peerConnection.current.setRemoteDescription(answer);
  };

  const handleCandidate = async ({ candidate }) => {
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
    if (socket) {
      socket.emit("leaveRoom", roomId);
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }
    console.log("leaveRoom")
    // navigate('/lobby')
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
        <div className="control-container" id="camera-btn" onClick={toggleCamera}>
          <img src={cameraPng} alt="Camera" />
        </div>

        <div className="control-container" id="mic-btn" onClick={toggleCamera}>
          <img src={micPng} alt="Microphone" />
        </div>

        <div className="control-container" id="leave-btn" onClick={leaveRoom}>
          <img src={phonePng} alt="Leave" />
        </div>
      </div>
    </div>
  );
};


