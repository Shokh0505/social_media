import React from "react";
import { useState, useEffect } from "react";
import Cookies from 'js-cookie';
import {Link} from 'react-router-dom';
import './css/navbar.css'

export default function Navbar({activeTab, setActiveTab}){
    
    const [selected, setSelected] = useState({
        home: true,
        following: false,
        logout: false
    });

    // -------- Change active tab to know which tab is active in the Home component ---- //
    useEffect(() => {
        if(selected.home) {
            setActiveTab("home");
        }
        else if(selected.following) {
            setActiveTab("following");
        }
        else {
            setActiveTab("logout");
        }
    }, [selected, activeTab]);
    // ------------------------------------------------------------------------------- //

    function handleNavigation(event) {
        let select = event.target;
        let dataItem = event.target.dataset.item;
        while (dataItem === undefined) {
            select = select.parentElement;
            dataItem = select.dataset.item;
        }
    
        // Change state in order to show selected navigation item
        if(dataItem === 'home') {
            setSelected({
                following: false,
                logout: false,
                home: true
            });
        }
        else if (dataItem === 'following') {
            setSelected({
                following: true,
                logout: false,
                home: false
            });
        }
        else if(dataItem === 'logout') {
            setSelected({
                following: false,
                logout: true,
                home: false
            });
        }
    }

    // Get the info about the user
    const [profileInfo, setProfileInfo] = useState({
        username: '',
        email: '',
        image: null,
    })

    // ------------------ Get the user info ------------------ //
    useEffect(() => {
        const token = Cookies.get('authToken');

        fetch("http://127.0.0.1:8000/profile_info/", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            }
        })
        .then(response => {
            if(response.ok) {
                return response.json()
            } else {
                console.log("Error with the fetch: ", response.status)
            }
        })
        .then(data => {
            setProfileInfo({
                username: data.username,
                email: data.email,
                image: data.profile_image
            })
        })
        .catch(err => {
            console.log("Error fetchin the info: ", err);
        })
    }, [])
    // ------------------------------------------------------- //

    return (
        <div>
            <Link to={`profile/${profileInfo.username}`}>
                <div className="profile-div">
                    <div className="profile-img"> 
                        <img src={profileInfo.image} alt="Profile photo" />
                    </div>
                    <div className="profile-text">
                        <p className="profile-username">
                            { profileInfo.username }
                        </p>
                        <p className="profile-email">
                            { profileInfo.email }
                        </p>
                    </div>
                </div>
            </Link>
            <div className="navigation mt-3">
                <div className={`navigation-item ${selected.home ? 'bg blue': ''}`} data-item="home" onClick={handleNavigation}>
                    {selected.home && <div className="nav-blue"></div>} 
                    <div className="nav-bg"></div>
                    <i className="fa-solid fa-house"></i> 
                    <div className="nav-text">
                        <a href="#" className={selected.home ? 'blue' : ''}>
                            Home
                        </a>
                    </div>
                </div>
                <div className={`navigation-item ${selected.following ? 'bg blue': ''}`} data-item="following" onClick={handleNavigation}>
                    {selected.following && <div className="nav-blue"></div>}                    
                    <div className="nav-bg"></div>
                    <i className="fa-solid fa-user-group"></i> 
                    <div className="nav-text">
                        <a href="#" className={selected.following ? 'blue' : ''}>
                            Following
                        </a>
                    </div> 
                </div>
                <div className={`navigation-item ${selected.logout ? 'bg blue': ''}`} data-item="logout" onClick={handleNavigation}>
                    {selected.logout && <div className="nav-blue"></div>}                    
                    <div className="nav-bg"></div>
                        <i className="fa-solid fa-right-from-bracket"></i> 
                        <div className="nav-text">
                            <a href="#" className={selected.logout ? 'blue' : ''}>
                                Logout
                            </a>
                        </div> 
                    </div>
            </div>

            <Link to="/createPost">
                <button className="btn btn-primary create-btn ml-2 mt-3">
                    Create Post  
                </button>
            </Link>
            
        </div>
    )
}