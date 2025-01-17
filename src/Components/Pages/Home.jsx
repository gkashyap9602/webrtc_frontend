import React, { useEffect, useState, useRef } from "react";
import style from "./home.css";
import * as WebrtcHelper from "../WebrtcHelper";
import { peerConfiguration } from "../../Constant.js/Constant";
import { io } from "socket.io-client";
import { initializeSocket } from "../Socket.listener";


export const Home = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [didiIOffer, setDidIOffer] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const socket = initializeSocket(io);
    socket.on("connect", () => {
      console.log("Socket connected successfully with ID:", socket.id);
    });

    return () => {
      socket.disconnect(); // Clean up on component unmount
    };

  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream])


  const startCall = async () => {
    console.log("start the call")
    try {
      //STEP 1: Fetch local media stream audio video etc
      const streamResponse = await WebrtcHelper.fetchUserMedia();

      //after successful fetch get user media
      const userStream = streamResponse?.data
      // console.log(userStream,"streamresdata")
      setLocalStream(userStream);

      //STEP 2: Create peer connection
      const pc = await WebrtcHelper.createPeerConnection(peerConfiguration, userStream);

      // Set up peer connection with other user
      const { peerConnection, remoteStream } = pc?.data
      setRemoteStream(remoteStream);

      await WebrtcHelper.createOffer(peerConnection);

    } catch (error) {
      const errMsg = error.message ? error.message : error
      console.error("Error starting the call:", errMsg);
      alert(errMsg)
    }
  }//ends


  const answerCall = async (offerObj) => {
    console.log("answer the call")
    try {

      //STEP 1: Fetch local media stream audio video etc
      const streamResponse = await WebrtcHelper.fetchUserMedia();

      //after successful fetch get user media
      const userStream = streamResponse?.data
      // console.log(userStream,"streamresdata")
      setLocalStream(userStream);

      //STEP 2: Create peer connection
      const pc = await WebrtcHelper.createPeerConnection(peerConfiguration, userStream, offerObj);

      // Set up peer connection with other user
      const { peerConnection, remoteStream } = pc?.data
      setRemoteStream(remoteStream);

      const answerToOffer = await WebrtcHelper.createAnswer(peerConfiguration, offerObj);
      const answer = answerToOffer?.data
      await peerConnection.setLocalDescription(answer); //this is CLIENT2, and CLIENT2 uses the answer as the localDesc

    } catch (error) {
      const errMsg = error.message ? error.message : error
      console.error("Error answering the call:", errMsg);
      alert(errMsg)
    }
  }//ends

  return (
    <div>
      <div className="videos">
        <video autoPlay playsInline muted className="local-video" ref={localVideoRef} />
        <video autoPlay playsInline className="remote-video" ref={remoteVideoRef} />
      </div>

      <div className="controls">
        <button className="mt-4 btn btn-primary" onClick={startCall}>Call</button>
        <button className="mt-4 btn btn-success" onClick={answerCall}>Answer</button>
      </div>
    </div>
  );
};
