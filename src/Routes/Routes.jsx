import React from 'react';
import { BrowserRouter as Router, Route, Routes as Switch, Navigate } from 'react-router-dom';

// Import your page components
import { Home } from '../Components/Pages/Home';
// import About from './pages/About';
// import Contact from './pages/Contact';
// import NotFound from './pages/NotFound';

export const Routes = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" element={<Home />} />
                {/* <Route path="/about" element={<About />} /> */}
                {/* <Route path="/contact" element={<Contact />} /> */}
                {/* Redirect to home if route doesn't exist */}
                {/* <Route path="*" element={<Navigate to="/" />} /> */}
                {/* Uncomment below if you want a 404 page */}
                {/* <Route path="*" element={<NotFound />} /> */}
            </Switch>
        </Router>
    );
};
