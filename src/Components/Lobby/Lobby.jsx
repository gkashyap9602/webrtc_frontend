import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./lobby.css";
// import "../../App.css";


export const Lobby = () => {
    const [inviteCode, setInviteCode] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        navigate(`/peer2peer/${encodeURIComponent(inviteCode)}`); // Make sure to encode the link
    };

    return (
        <main className="lobby-container">
            <div className="form-container">
                <div className="form__container__header">
                    <p>👋 Create OR Join a Room</p>
                </div>
                <div className="form__content__wrapper">
                    <form onSubmit={handleSubmit}>
                        <input
                            className="invite_code"
                            type="text"
                            name="invite_link"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            required
                        />
                        <input type="submit" value="Join Room" />
                    </form>
                </div>
            </div>
        </main>
    );
};

