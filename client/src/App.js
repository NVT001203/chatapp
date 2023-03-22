import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./pages/styles/layout.scss";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import React from "react";
import FetchUser from "./pages/FetchUser";
import Messenger from "./pages/Messenger";

function App() {
    return (
        <div className="layout">
            <BrowserRouter>
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/fetch_user" element={<FetchUser />} />
                    <Route path="/messenger" element={<Messenger />} />
                    <Route path="/" element={<Home />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
