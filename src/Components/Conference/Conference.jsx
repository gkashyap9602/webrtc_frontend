import React, { useEffect, useState, useRef } from "react";
import style from "./conference.css";
import * as WebrtcHelper from "../WebrtcHelper";
import { peerConfiguration } from "../../Constant.js/Constant";
import { io } from "socket.io-client";
import { initializeSocket } from "../Socket.listener";
const userName = "User-Mac" + Math.floor(Math.random() * 100000)
const password = "solution";

export const Conference = () => {
  const [localStream, setLocalStream] = useState(null);
  const [peerConnections, setPeerConnections] = useState([]);
  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    socketRef.current = initializeSocket(io, userName, password);

    // Listen for available offers and handle accordingly
    socketRef.current.on('availableOffers', offers => {
      console.log(offers, "availableOffers");
    });

    // Handle new offers
    socketRef.current.on('newOfferAwaiting', offers => {
      console.log(offers, "newOfferAwaiting");
      if (offers.length > 0) {
        // For each offer, create a new peer connection and handle it
        offers.forEach(offerObj => {
          answerCall(offerObj);
        });
      } // Call the answer function when an offer is received
    });

    // Handle received answers
    socketRef.current.on('answerResponse', offerObj => {
      console.log(offerObj, "answerResponse_offerObj");
      WebrtcHelper.addAnswer(peerConnectionRef.current, offerObj);
    });

    // Handle received ICE candidates
    socketRef.current.on('receivedIceCandidateFromServer', iceCandidate => {
      console.log('receivedIceCandidateFromServer',iceCandidate)
      WebrtcHelper.addNewIceCandidate(peerConnectionRef.current,iceCandidate);
    });

    // Handle peer disconnection
    socketRef.current.on('peerDisconnected', (data) => {
      console.log(`Peer ${data.userName} has disconnected.`);
      removePeerConnection(data.userName);
    });

    return () => socketRef.current.disconnect();

  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const addPeerConnection = (peerId, remoteStream, peerConnection) => {
    setPeerConnections((prev) => [
      ...prev,
      { peerId, remoteStream, peerConnection },
    ]);
  };

  const removePeerConnection = (peerId) => {
    setPeerConnections((prev) => prev.filter((peer) => peer.peerId !== peerId));
  };

  const startCall = async () => {
    console.log("Start the call");
    try {
      // STEP 1: Fetch local media stream
      const streamResponse = await WebrtcHelper.fetchUserMedia();
      const userStream = streamResponse?.data;
      setLocalStream(userStream);

      // STEP 2: Create peer connection
      const pc = await WebrtcHelper.createPeerConnection(peerConfiguration, userStream, socketRef.current, userName, true);
      const { peerConnection, remoteStream } = pc?.data;

      addPeerConnection(userName, remoteStream, peerConnection);
      peerConnectionRef.current = peerConnection;
      await WebrtcHelper.createOffer(peerConnection, socketRef.current);
    } catch (error) {
      console.error("Error starting the call:", error);
      alert(error.message);
    }
  };

  const answerCall = async (offerObj) => {
    console.log("Answer the call",offerObj);
    try {
      // STEP 1: Fetch local media stream
      const streamResponse = await WebrtcHelper.fetchUserMedia();
      const userStream = streamResponse?.data;
      setLocalStream(userStream);

      // STEP 2: Create peer connection
      const pc = await WebrtcHelper.createPeerConnection(peerConfiguration, userStream, socketRef.current, userName, false, offerObj);
      const { peerConnection, remoteStream } = pc?.data;

      addPeerConnection(userName, remoteStream, peerConnection);
      peerConnectionRef.current = peerConnection;

      await WebrtcHelper.createAnswer(peerConnection, offerObj, socketRef.current);
    } catch (error) {
      console.error("Error answering the call:", error);
      alert(error.message);
    }
  };

  const hangUpCall = (peerId) => {
    const peer = peerConnections.find((p) => p.peerId === peerId);
    if (peer) {
      peer.peerConnection.close();
      removePeerConnection(peerId);
    }
  };

  return (
    <div>
      <div className="videos">
        <video autoPlay playsInline muted className="local-video" ref={localVideoRef} />

        {/* Remote Videos */}
        {peerConnections.map((peer, index) => (
          <div key={`${peer.peerId}-${index}`} className="peer-video">
            <video autoPlay playsInline className="remote-video" ref={(el) => (peer.videoRef = el)} />
            <button className='hangup-btn' onClick={() => hangUpCall(peer.peerId)}>Hang Up</button>
          </div>
        ))}

      </div>

      <div className="controls">
        <button className="mt-4 btn btn-primary" onClick={startCall}>Call</button>
        <button className="mt-4 btn btn-success" onClick={() => answerCall()}>Answer</button>
      </div>
    </div>
  );
};
