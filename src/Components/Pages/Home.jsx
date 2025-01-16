import React, { useEffect, useState } from "react";
import style from "./home.css";
import * as WebrtcHelper from "../WebrtcHelper";
import { peerConfiguration } from "../../Constant.js/Constant";
export const Home = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [didiIOffer, setDidIOffer] = useState(false);

  useEffect(() => {
    startCall()
  }, []);

  const startCall = async () => {
    try {
      //STEP 1: Fetch local media stream audio video etc
      const streamResponse = await WebrtcHelper.fetchUserMedia();
      if (!streamResponse.status) {
        alert(streamResponse?.message);
      }
      //after successful fetch get user media
      const userStream = streamResponse?.data
      // console.log(userStream,"streamresdata")
      setLocalStream(userStream);

      //STEP 2: Create peer connection
      const pc = await WebrtcHelper.createPeerConnection(peerConfiguration, userStream);
      if (!pc.status) {
        alert(pc?.message);
      }
      // Set up peer connection with other user
      const { peerConnection, remoteStream } = pc?.data
      setRemoteStream(remoteStream);

      const offerResponse = await WebrtcHelper.createOffer(peerConnection);
      if (!offerResponse.status) {
        alert(offerResponse?.message);
      }

    } catch (error) {
      console.error("Error starting the call:", error);
    }
  }//ends

  return (
    <div>
      <div className="videos">
        <div className="video-wrapper">
          {/* video player 1 */}
          <video
            autoPlay
            playsInline
            muted
            className="local-video"
            id="video-player"
            ref={(video) => {
              if (video && localStream) {
                video.srcObject = localStream; // add local stream to the video player
              }
            }}
          />
          {/* video player 2 */}
          <video
            autoPlay
            playsInline
            className="remote-video"
            id="video-player"
            ref={(video) => {
              if (video && remoteStream) {
                video.srcObject = remoteStream; // add local stream to the video player
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
