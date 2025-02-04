import React from 'react';
import { BrowserRouter as Router, Route, Routes as Switch, Navigate } from 'react-router-dom';

// Import your page components
import { Home } from '../Components/Pages/Home';
import { Peer2Peer } from '../Components/Peer2Peer/Peer2Peer';
import { Conference } from '../Components/Conference/Conference';
// import NotFound from './pages/NotFound';

export const Routes = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" element={<Home />} />
                <Route path="/peer2peer" element={<Peer2Peer />} />
                <Route path="/conference" element={<Conference />} />
                {/* Redirect to home if route doesn't exist */}
                {/* <Route path="*" element={<Navigate to="/" />} /> */}
                {/* Uncomment below if you want a 404 page */}
                {/* <Route path="*" element={<NotFound />} /> */}
            </Switch>
        </Router>
    );
};
