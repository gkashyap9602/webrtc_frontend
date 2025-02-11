import { useEffect, useState } from "react";

export const NFCReader = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {

    if (!("NDEFReader" in window)) {
      alert("NFC is not supported on this device.");
      return;
    }
    console.log(window.NDEFReader, "NFC is supported on this device")
    
  }, [])

  const readNFC = async () => {
    try {


      //   const ndef = new NDEFReader();
      //   await ndef.scan();
      //   console.log("Scan started...");

      //   ndef.onreading = (event) => {
      //     const decoder = new TextDecoder();
      //     for (const record of event.message.records) {
      //       setMessage(decoder.decode(record.data));
      //     }
      //   };
    } catch (error) {
      console.error("NFC Read Error:", error);
    }
  };

  return (
    <div>
      <h2>NFC Reader</h2>
      <button onClick={readNFC}>Read NFC Tag</button>
      {message && <p>Message: {message}</p>}
    </div>
  );
};


