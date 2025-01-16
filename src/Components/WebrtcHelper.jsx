
const fetchUserMedia = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const userstream = await navigator.mediaDevices.getUserMedia({
        video: true,
        // audio: true,
      });
      resolve(userstream);
    } catch (err) {
      // console.error("Error accessing user media:", err);
      console.error("Error accessing user media", err?.message);
      // setError(err?.message);
      // alert(err?.message);
      reject(err);
    }
  });
}; //ends

export default { fetchUserMedia }