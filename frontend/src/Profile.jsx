import React from "react";
import { useState, useEffect } from "react";
import Post from "./Post";
import Cookies from 'js-cookie';
import { Link, useParams, useNavigate } from "react-router-dom";
import "./css/profile.css";

const fetchProfileInfo = (setProfileInfo) => {
    const token = Cookies.get("authToken");

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
            profile_image: data.profile_image
        })

    })
    .catch(err => {
        console.log("Error fetching the info: ", err);
    })
}


function fetchUserInfo(setUser, username) {
    const token = Cookies.get('authToken');
    console.log("username: ", username);
    if(!username) {
        console.log("The username is empty");
        useNavigate("/");
    }

    fetch('http://127.0.0.1:8000/get_user_info/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
            'username': username
        })
    })
    .then(response => {
        if(response.ok) {
            return response.json();
        }
        else {
            console.error("Error with the fetching user info: ", response.status);
        }
    })
    .then(data => {
        setUser({
            username: data.username,
            email: data.email,
            image: data.profile_image,
            following: data.following,
            followers: data.followers
        })
    })
    .catch(error => console.error(error))
}


export default function Profile(){

    const [profileInfo, setProfileInfo] = useState({
        username: '',
        email: '',
        profile_image: null
    });
    const [user, setUser] = useState({
        username: '',
        email: '',
        following: 0,
        followers: 0,
        image: null
    })
    const [profileImage, setprofileImage] = useState(null);
    const [displayChange, setDisplayChange] = useState({
        display: false
    });
    const [isProfileOwner, setIsProfileOwner] = useState(false);
    const [posts, setPosts] = useState([]);
    const token = Cookies.get('authToken');
    const { username } = useParams();   

    // Determine if the user is the owner of the seeing profile
    useEffect(() => {
        if(username === profileInfo.username) {
            setIsProfileOwner(true);
        } else {
            setIsProfileOwner(false);
        }
        console.log(isProfileOwner);
    }, [username, profileInfo.username])
    

    // ---------------- Upload the changes made to the profile ------------------------ //
    const handleUpload = async (event) => {
        event.preventDefault();
        const formData = new FormData();

        if(profileImage) {
            formData.append('profile_image', profileImage);
        }
        formData.append('username', profileInfo.username);
        formData.append('email', profileInfo.email);


        try {
            const response = await fetch('http://127.0.0.1:8000/profile_image/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`
                },
                body: formData,
            });

            if(response.ok) {
                const data = await response.json()
                console.log("Image has been updated successfully", data)
                setprofileImage(null);

                // Reflect the changes on the html
                fetchProfileInfo(setProfileInfo);
                setDisplayChange({display: false});
            } else {
                console.error("Error uploading the image", response.statusText);
            }
        } catch (error) {
            console.log("error:", error)
        }
    }
    // -------------------------------------------------------------------------------- //

    // ---------------- Get the posts by the username owner ----------------------- //
    useEffect(() => {
        fetch('http://127.0.0.1:8000/get_profile_posts/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                'username': username
            })
        })
        .then(response => {
            if(response.ok){
                return response.json()
            }
            else {
                console.error("Hey look at the status code. Smth is wrong")
            }
        })
        .then(data => {
            setPosts(data);
        }) 
        .catch(error => console.log("Here you go the error: ", error))

    }, [])
    // -------------------------------------------------------------------------------- //


    // ----------------- Fetching username and password ------------------------------- //
    useEffect(() => {
        fetchProfileInfo(setProfileInfo, username);
    }, [])
    // -------------------------------------------------------------------------------- //


    useEffect(() => {
        fetchUserInfo(setUser, username);
    }, [])

    // Input handlers
    const handleFileChange = (event) => {
        setprofileImage(event.target.files[0]);
    };

    const handleusername = (event) => {
        setProfileInfo({
            ...profileInfo,
            username: event.target.value
        })
    } 

    const handleEmail = (event) => {
        setProfileInfo({
            ...profileInfo,
            email: event.target.value
        })
    }

    const handleInfoChange = () => {
        setDisplayChange({
            display: true
        })
    }
    return (
        <div className="profile-main">
            <div className="profile-left">
                <Link to={"/"}>
                    <i className="fa-solid fa-arrow-left exit"></i>
                </Link>
                { !displayChange.display && 
                    <div> 
                        <div className="profile-img-main">
                            <img src={user.image} alt="Profile picture"/>
                        </div>
                        <div className="profile-username-main my-1 h4 text-center">
                            { user.username }
                        </div>
                        <div className="profile-email-main my-1 text-muted text-center">
                            { user.email } 
                            {   
                                isProfileOwner &&
                                <i className="fa-regular fa-pen-to-square" onClick={handleInfoChange}></i>
                            }                        
                        </div>
                        <div className="profile-info">
                            <div className="profile-followers">
                                <h4>Followers</h4>
                                <i className="fa-solid fa-user-group m-2"></i>
                                {user.followers}
                            </div>
                            <div className="profile-following">
                                <h4>Following</h4>  
                                <i className="fa-solid fa-user-plus m-2"></i>
                                {user.following}
                            </div>
                        </div>
                    </div>
                }
                {
                    displayChange.display &&
                    <div> 
                        <form onSubmit={handleUpload}>
                            <div className="profile-inputs">
                                <label htmlFor="profile_image" className="profile_label">Change Profile image</label>
                                <input type="file" id="profile_image" name="profile_image" className="profile-image" accept="image/*" onChange={handleFileChange}/>
                                <label htmlFor="username">Username</label>
                                <input type="text" id="username" value={profileInfo.username} onChange={handleusername}/>
                                <label htmlFor="email">Email </label>
                                <input type="email" id="email" value={profileInfo.email} onChange={handleEmail}/>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                }

            </div>
            <div className="profile-right">
                <div className="profile-title p-2">
                    <h3>The latest posts from the user</h3>
                </div>
                { posts.length === 0 &&
                    <div>The user has not posted any posts yet.</div>
                }
                { posts.length >= 1 &&
                    posts.map((post) => (
                        <Post post={post} />
                    ))
                }
            </div>
        </div>
    )
}