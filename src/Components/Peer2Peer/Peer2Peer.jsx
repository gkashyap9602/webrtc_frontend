import React, { useEffect, useState, useRef } from "react";
import style from "./peer2peer.css";
import * as WebrtcHelper from "../WebrtcHelper";
import { peerConfiguration } from "../../Constant.js/Constant";
import { io } from "socket.io-client";
import { initializeSocket } from "../Socket.listener";
const userName = "User-Mac" + Math.floor(Math.random() * 100000)
const password = "solution";

export const Peer2Peer = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [didiIOffer, setDidIOffer] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    socketRef.current = initializeSocket(io, userName, password);

    //on connection get all available offers and call createOfferEls
    socketRef.current.on('availableOffers', offers => {
      console.log(offers, "availableOffers")
    })

    //someone just made a new offer and we're already here - call createOfferEls
    socketRef.current.on('newOfferAwaiting', offers => {
      console.log(offers, "newOfferAwaiting")
    })

    socketRef.current.on('answerResponse', offerObj => {
      console.log(offerObj, "offerObj")
      WebrtcHelper.addAnswer(peerConnectionRef.current, offerObj)
    })

    socketRef.current.on('receivedIceCandidateFromServer', iceCandidate => {
      WebrtcHelper.addNewIceCandidate(iceCandidate)
    })


    socketRef.current.on('peerDisconnected', (data) => {
      console.log(`Peer ${data.userName} has disconnected.`);
    });


    return () => socketRef.current.disconnect();

  }, []);

  useEffect(() => {
    // Cleanup peer connection on unmount
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
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
      const pc = await WebrtcHelper.createPeerConnection(peerConfiguration,userStream, socketRef.current, userName, true);

      // Set up peer connection with other user
      const { peerConnection, remoteStream } = pc?.data
      setRemoteStream(remoteStream);

      peerConnectionRef.current = peerConnection //setting up peerconnection refrence
      await WebrtcHelper.createOffer(peerConnection, socketRef.current);
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
      const pc = await WebrtcHelper.createPeerConnection(peerConfiguration, userStream, socketRef.current, userName, false, offerObj);

      // Set up peer connection with other user
      const { peerConnection, remoteStream } = pc?.data
      setRemoteStream(remoteStream);
      peerConnectionRef.current = peerConnection //setting up peerconnection refrence
      const answerToOffer = await WebrtcHelper.createAnswer(peerConnection, offerObj, socketRef.current);
      // const { answer, offerObj } = answerToOffer?.data

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
