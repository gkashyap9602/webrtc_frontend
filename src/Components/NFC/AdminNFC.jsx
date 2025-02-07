import React, { useEffect, useRef, useState } from "react";

const AdminNFC = () => {
    const [status, setStatus] = useState("Waiting for NFC...");
    const [uid, setUid] = useState("");
    const [nfcContent, setNFCContent] = useState("");
    const [writeText, setWriteText] = useState("");
    const ws = useRef(null)

    useEffect(() => {
        ws.current = new WebSocket("ws://localhost:8080");

        ws.current.onopen = () => console.log("Connected to NFC WebSocket");
        ws.current.onmessage = (event) => {
            console.log(event, "event")
            const data = JSON.parse(event.data);
            console.log("Received from NFC server:", data);

            if (data.type === "read") {
                setUid(data.uid);
                setNFCContent(data.content);
                setStatus("Card Read Successfully!");
            } else if (data.type === "write") {
                setStatus(data.message);
            } else if (data.status === "error") {
                setStatus(`Error: ${data.message}`);
            }
        };

        return () => {
            ws.current.close();
        };
    }, []);

    const readCard = () => {
        ws.current.send(JSON.stringify({ command: "read" }));
        setStatus("Reading NFC...");
    };

    const writeCard = () => {
        console.log(writeText, "writeText", writeText.length)
        if (writeText.length > 16) {
            setStatus("Error: Max 16 characters allowed");
            return;
        }
        ws.current.send(JSON.stringify({ command: "write", text: writeText }));
        setStatus("Writing NFC...");
    };

    return (
        <div>
            <h2>NFC Admin Panel</h2>
            <p>Status: {status}</p>
            {uid && <p>Card UID: {uid}</p>}
            <button onClick={readCard}>Read NFC</button>
            <input
                style={{ color: 'white' }}
                type="text"
                value={nfcContent}
                placeholder="NFC Read Content"
            />
            <input
                style={{ color: 'white' }}
                type="text"
                value={writeText}
                onChange={(e) => setWriteText(e.target.value)}
                placeholder="Write NFC data"
            />
            <button onClick={writeCard}>Write NFC</button>
        </div>
    );
};

export default AdminNFC;
