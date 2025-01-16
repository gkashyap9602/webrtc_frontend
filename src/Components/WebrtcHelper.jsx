import { showResponse, statusCodes } from "../Constant.js/Constant";

const fetchUserMedia = (constraints = { video: true, audio: false }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia(constraints);
      resolve(showResponse(true, "Get User Media Success", userStream, statusCodes.SUCCESS));
    } catch (err) {
      console.error("Error accessing user media", err?.message);
      reject(showResponse(false, err?.message, null, statusCodes.ERROR));
    }
  });
}; //ends

const addTracksToPeerConnection = (stream, peerConnection) => {
  stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
}; //ends

const addTracksToRemoteStream = (stream, remoteStream) => {
  stream.getTracks().forEach((track) => {
    console.log("Got a track from the other peer!!");
    remoteStream.addTrack(track, remoteStream);
  });
}; //ends


const createOffer = async (peerConnection) => {
  try {
    console.log("Creating offer...")
    const offer = await peerConnection.createOffer();
    // console.log(offer,"offer");
    peerConnection.setLocalDescription(offer);
    // didIOffer = true;
    // socket.emit('newOffer', offer); //send offer to signalingServer
    return showResponse(true, 'offer created successfully', offer, statusCodes.SUCCESS);
  } catch (err) {
    // console.log(err, "error offer")
    return showResponse(false, err?.message, null, statusCodes.ERROR);
  }
}; //ends



const createPeerConnection = (peerConfiguration, localStream, offerObj = null) => { //offer obj is optional
  return new Promise(async (resolve, reject) => {
    try {
      //RTCPeerConnection is the thing that creates the connection
      //we can pass a peerConfiguration object, and that config object can contain stun servers
      //which will fetch us ICE candidates
      const peerConnection = await new RTCPeerConnection(peerConfiguration); //we can also create a connection without stun server but for local only on production it required stun server
      //create a new media stream for remote user
      const remoteStream = new MediaStream();
      //STEP 1 : add localtracks so that they can be sent with peerconnection once the connection is established
      addTracksToPeerConnection(localStream, peerConnection);

      //STEP 2 : add event listeners for peerconnection state changes
      peerConnection.addEventListener("signalingstatechange", (event) => {
        // console.log(event, "event-signalingstatechange");
        console.log(peerConnection.signalingState, 'signalingstatechange');
      });

      //STEP 3 : add event listeners for ice candidates
      peerConnection.addEventListener('icecandidate', (event) => {
        //after setLocalDescription trigger this event and creates Ice Candidate
        // console.log(event, "event-onicecandidate");
        if (event.candidate) {
          console.log("New Ice Candidate found!......", event.candidate);
          //     socket.emit("sendIceCandidateToSignalingServer", {
          //       iceCandidate: e.candidate,
          //       iceUserName: userName,
          //       didIOffer,
          //     });
        }
      });

      //STEP 4 add tracks to the remote stream
      peerConnection.addEventListener('track', (event) => {
        // console.log(event,'event');
        addTracksToRemoteStream(event.streams[0], remoteStream);
      });

      //*************If Offer/Answer Recived From Other User ****************
      if (offerObj) {
        //will be set when we call from answerOffer()
        // console.log(peerConnection.signalingState) //should be stable because no setDesc has been run yet
        await peerConnection.setRemoteDescription(offerObj.offer);
        // console.log(peerConnection.signalingState) //should be have-remote-offer, because client2 has setRemoteDesc on the offer
      } //ends

      resolve(showResponse(true, "Peer Connection Created Successfully", { peerConnection, remoteStream }, statusCodes.SUCCESS));
    } catch (error) {
      reject(showResponse(false, error?.message, null, statusCodes.ERROR));
    }
  });
}; //ends





export {
  fetchUserMedia,
  createPeerConnection,
  addTracksToPeerConnection,
  createOffer,
};
