import React, { useEffect, useState } from "react";
import style from "./home.css";
import WebrtcHelper from "../WebrtcHelper";
export const Home = () => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    WebrtcHelper.fetchUserMedia()
      .then((stream) => {
        setLocalStream(stream);
      })
      .catch((err) => {
        console.log(err, "err");
        alert(err?.message);
      });

    //when user visit the route get the user media camera audio video etc
  }, []);

  return (
    <div>
      <div className="videos">
        <div className="video-wrapper">
          <video
            autoPlay
            playsInline
            muted
            // src={localStream}
            ref={(video) => {
              if (video && localStream) {
                video.srcObject = localStream;
              }
            }}
            className="local-video"
            id="video-player"
          />
          <video
            autoPlay
            playsInline
            className="remote-video"
            id="video-player"
          />
        </div>
      </div>
    </div>
  );
};
