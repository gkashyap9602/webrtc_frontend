import React from 'react';
import { BrowserRouter as Router, Route, Routes as Switch, Navigate } from 'react-router-dom';

// Import your page components
import { Home } from '../Components/Pages/Home';
import { Peer2Peer } from '../Components/Peer2Peer/Peer2Peer';
import { Lobby } from '../Components/Lobby/Lobby';
import AdminNFC from '../Components/NFC/AdminNFC';
import { NFCReader } from '../Components/NFC/NFCReader';
// import NotFound from './pages/NotFound';

export const Routes = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" element={<Home />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/peer2peer/:room" element={<Peer2Peer />} />
                <Route path="/nfc" element={<AdminNFC />} />
                <Route path="/web_nfc" element={<NFCReader />} />
                {/* Redirect to home if route doesn't exist */}
                {/* <Route path="*" element={<Navigate to="/" />} /> */}
                {/* Uncomment below if you want a 404 page */}
                {/* <Route path="*" element={<NotFound />} /> */}
            </Switch>
        </Router>
    );
};
