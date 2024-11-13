import React, { useEffect, useRef } from "react";
import Cookies from "js-cookie"
import { useState } from "react";
import './css/home.css';
import Navbart from "./Navbar_top";
import Navbar from "./Navbar";
import Post from "./Post";
import ProfileFriends from "./Friends-proflie";
import { useNavigate } from "react-router-dom";

function Home({activeTab, setActiveTab}){
    const [friends, setFriends] = useState({
    });
    const [posts, setPosts] = useState([]);
    const [followingPosts, setFollowingPosts] = useState([]);
    const [NextPage, setNextPage] = useState(null);
    const [PrevPage, setPrevPage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [followePage, setFollowPage] = useState({
        currentPage: 1,
        prevPage: null,
        nextPage: null
    });
    const [triggerPostFetch, setTriggerPostFetch] = useState(0);
    const [followingUsers, setFollowingUsers] = useState([]);
    const [profileInfo, setProfileInfo] = useState({
        username: '',
        email: '',
        profile_image: ''
    });

    const postContainer = useRef(null);

    const navigate = useNavigate()
    let token = Cookies.get("authToken");

    if(!token) {
        useEffect(() => {
            navigate("/login");
        }, [])
    }

    
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


    // --------------- Fetch the posts and set the variables for Home ---------------------- //
    const fetchPosts = (url) => {
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            }
        })
        .then(response => {
            if(response.ok){
                return response.json();
            }
            console.log("Error with the fetch: ", response.status)
        })
        .then(data => {
            setPosts(data.results);
            setNextPage(data.next);
            setPrevPage(data.previous);
        })
        .catch(error => console.log("Error with fetching posts: ", error));
    };
    // ------------------------------------------------------------------------------------- //


    // ---------------------- Calling the fetching posts data for home page ---------------- //
    useEffect(() => {
        fetchPosts(`http://127.0.0.1:8000/post_list/?page=${currentPage}`)
    }, [currentPage]);    
    // ------------------------------------------------------------------------------------ //

    // ------------------ Fetching post for follow page ---------------------------------- //
    useEffect(() => {
        fetch(`http://127.0.0.1:8000/following_posts/?page=${followePage.currentPage}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            }
        })
        .then(response => {
            if(response.ok) {
                return response.json();
            }
            else {
                return response.json().then(error => console.log("Error with the status code of following posts ", error));
            }
        })
        .then(data => {
            setFollowingPosts(data.results);
            setFollowPage({
                ...followePage, 
                nextPage: data.next,
                prevPage: data.prevPage
            })
        })
        .catch(error => console.log("Error with the following posts", error));
    }, [followePage.currentPage, triggerPostFetch])
    // ------------------------------------------------------------------------------------ //

    // ------------------ Logout the user ---------------------- //
    useEffect(() => {
        if (activeTab === 'logout') {
            const confirmLogout = window.confirm("Do you want to logout?");
            
            if(confirmLogout) {
                Cookies.remove("authToken", {path: '/'});
                window.location.href = '/login';
            }
            else {
                window.location.href = '/';
            }
        }
    }, [activeTab])
    // ---------------------------------------------------------- //

    // ------------------ Get the following the users 1st time ----------- //
    useEffect(() => {
        fetch("http://127.0.0.1:8000/following_users/", {
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
                console.log("Error with the status code of the following users");
            }
        })
        .then(data => {
            setFollowingUsers(data.following_users);
        })
        .catch(error => console.log(error))
    }, [])
    // ---------------------------------------------------------- //

    const scrollToTop = () => {
        if(postContainer.current)  {
            postContainer.current.scrollTop = 0;
        }
    }

    // ------------------ Get following people for a tab ---------------------- //
    function handleFriends(event) {
        const newValue = event.target.value;

        setFriends( newValue );

        fetch("http://127.0.0.1:8000/get_following_letters/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                'letters': newValue
            })
        })
        .then(response => {
            if(response.ok) {
                return response.json()
            }
            else {
                console.error("Problem with the status code. Go check django server")
            }
        })
        .then(data => {
            setFollowingUsers(data.following_users);
        })
        .catch(error => console.log("Fetch error: ", error))
    }
    // ------------------------------------------------------------------------ //

    function handlePrevious() {
        if(activeTab === 'home') {
            setCurrentPage(currentPage - 1);
        }
        scrollToTop();
    }

    function handleNext() {
        if(activeTab === "home") {
            setCurrentPage(currentPage + 1);
        }
        scrollToTop();
    }


    return (
        <div className="main">
            <Navbart profileInfo={profileInfo} />
                <div className="main-content mt-3">
                    <div className="navbar">
                        <Navbar activeTab={activeTab} setActiveTab={setActiveTab}/>
                    </div>
                    <div className="posts" ref={postContainer}>
                        <ul>
                            {activeTab === "home" && Array.isArray(posts) && posts.map((post) => (
                                <li key={post.id}>
                                    <Post post={post} triggerPostFetch={triggerPostFetch} setTriggerPostFetch={setTriggerPostFetch} username={profileInfo.username}/>
                                </li>
                            ))}
                            {
                                activeTab === "home" &&
                                <div className="buttons mt-3">
                                    {
                                        PrevPage 
                                        &&
                                        <button className="btn btn-primary" disabled={!PrevPage} onClick={handlePrevious}>Previous</button>                                    
                                    }
                                    {
                                        NextPage &&
                                        <button className="btn btn-primary" disabled={!NextPage} onClick={handleNext}>Next</button>
                                    }
                                </div>
                            }
                            {activeTab === "following" && Array.isArray(followingPosts) && followingPosts.map((post) => (
                                <li key={post.id}>
                                    <Post post={post} triggerPostFetch={triggerPostFetch} setTriggerPostFetch={setTriggerPostFetch} username={profileInfo.username}/>
                                </li>
                            ))}
                            {
                                activeTab === "following" &&
                                <div className="buttons mt-3">
                                    {
                                        followePage.prevPage
                                        &&
                                        <button className="btn btn-primary" disabled={!PrevPage} onClick={handlePrevious}>Previous</button>                                    
                                    }
                                    {
                                        followePage.nextPage &&
                                        <button className="btn btn-primary" disabled={!NextPage} onClick={handleNext}>Next</button>
                                    }
                                </div>
                            }
                        </ul>
                    </div>
                    <div className="following">
                        <div className="friends-heading">
                            Friends
                        </div>
                        <div className="form-group mt-2">
                        <input type="text" placeholder="Search friends" value={friends.friends} onChange={handleFriends} className="form-control" />
                        </div>
                        <div className="friends-profile">
                        {followingUsers && 
                            followingUsers.map((post) => (
                                <ProfileFriends post={post} key={post.id} />
                            ))
                        }
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default Home;