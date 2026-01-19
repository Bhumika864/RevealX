// src/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="header-container" onClick={() => navigate("/")}>
   
    </div>
  );
};

export default Header;
