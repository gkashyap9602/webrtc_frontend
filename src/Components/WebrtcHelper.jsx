const fetchUserMedia = (constraints = { video: true, audio: false }) => {
  
  return new Promise(async (resolve, reject) => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia(constraints);
      resolve(userStream);
    } catch (err) {
      console.error("Error accessing user media", err?.message);
      reject(err?.message);
    }
  });
};


export default { fetchUserMedia };
