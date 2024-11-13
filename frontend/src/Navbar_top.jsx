import React from "react";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import './css/navbart.css';

export default function Navbart({profileInfo}) {


    return (
        <div className="navbar-main">
            <div className="nav-left">
                <ul className="nav-text">
                    <li className="mx-3">
                        <a href="https://cs50.harvard.edu/web/2020/projects/4/network/">CS50 Network</a>
                    </li>
                </ul>
            </div>
            <div className="nav-right mr-4">
                <Link to="createPost">
                    <button className="btn btn-primary mr-3">Create</button>
                </Link>   
                <div className="right-image ml-4">
                    <img src={profileInfo.image} alt="profile-photo" />
                </div>
            </div>
        </div>
    )
}