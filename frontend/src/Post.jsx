import React from "react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";
import './css/post.css';

function extractDate(datetime){
    const date = new Date(datetime);

    const formatteddata = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    return formatteddata;
}

export default function Post({post, triggerPostFetch, setTriggerPostFetch, username}){

    const token = Cookies.get("authToken");
    const [isFollowing, setIsFollowing] = useState({
        following: null,
    });
    const [fetchTrigger, setFetchTrigger] = useState(0);
    const [liked, setLiked] = useState(null);
    const [likes, setLikes] = useState(0);
    const [triggerLikeFetch, setTriggerLikeFetch] = useState(0);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        if(post.author.username === username) {
            setIsOwner(true);
        }
    }, [])

    // ----------- FOLLOWING THE USER ------------------//
    function handlefollow() {

        if(!post.id || !post.author) {
            console.log("Either id or author cannot be loaded")
            return 1;
        }
        
        fetch("http://127.0.0.1:8000/follow_user/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify({
                'post_id': post.id,
                'author': post.author,
            })
        })
        .then(response => {
            if(response.ok) {
                return response.json();
            } return response.json().then(errorData => {
                console.log("Error with the follow btn: ", errorData.message);
            });
        })
        .then(data => {
            setFetchTrigger(fetchTrigger + 1);
            setTriggerPostFetch(triggerPostFetch + 1);
        })
        .catch(error => {
            console.log("Serious error with follow btn: ", error)
        })
    }
    // ------------- END OF THE FOLLOWING THE USER --------------//

    // --------------- LIKING THE POST ------------------- //
    function handleLike() {
        fetch("http://127.0.0.1:8000/like_post/",{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                'post_id': post.id
            })
        })
        .then(response => {
            if(response.ok) {
                return response.json()
            } else {
                return response.json().then(data => console.log("A little problem with liking the post", data.message))
            }
        })
        .then(data => {
            console.log(data);
            setTriggerLikeFetch(triggerLikeFetch + 1);
        })
        .catch(error => console.log("Like is not working: ", error))
    }
    // --------------End of the likin the post ---------- //

    // -------------- Unfollow a user ----------------- //
    function handleUnfollow() {
        fetch("http://127.0.0.1:8000/unfollow/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                'author_id': post.author.id
            })
        })
        .then(response => {
            if(response.ok) {
                return response.json()
            }
            else {
                return response.json().then(errorData => console.log("Bug with unfollowing a user(status code): ", errorData));
            }
        })
        .then(data => {
            setFetchTrigger(fetchTrigger + 1);
            setTriggerPostFetch(triggerPostFetch + 1);
        })
        .catch(error => console.log("Error with unfollowing a user ", error))
    }
    // -------------- /Unfollow a user ---------------- //

    // --------------- Is the user follower of the post author ---------- //
    useEffect(() => {
        fetch("http://127.0.0.1:8000/is_follower/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                'author_id': post.author.id
            })
        })
        .then(response => {
            if(response.ok){
                return response.json()
            }
            else {
                return response.json().then(errorData => console.log("Error with the status code of is_follower", errorData));
            }
        })
        .then(data => {
            if(data.following) {
                setIsFollowing({
                    following: true
                });
            }
            else {
                setIsFollowing({
                    following: false
                })
            }
        })
        .catch(error => console.log("Error with the is follower: ", error))
    }, [fetchTrigger])
    // ---------------------------------------------------------------- //

    // ---------------- Has liked the post ----------------------------//
    useEffect(() => {
        fetch("http://127.0.0.1:8000/user_liked/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                'post_id': post.id
            })
        })
        .then(response => {
            if(response.ok) {
                return response.json();
            }
            else {
                return response.json().then(error => console.log("Problem with status code of is liked", error))
            }
        })
        .then(data => {
            if(data.liked) {
                setLiked(true);
            }
            else {
                setLiked(false);
            }
            setLikes(data.likes);
        })
        .catch(error => console.log("Error with the catch liked: ", error))
    }, [triggerLikeFetch])
    // --------------------------------------------------------------- //

    return(
        <div className="main-post">
            <Link to={`profile/${post.author.username}`}>
                <div className="post-top">
                    {post.author.profile_image && 
                    <div className="post-profile-img">
                        <img src={post.author.profile_image} alt="Profile Photo" />
                    </div>
                    }
                    <div className="post-top-text">
                        <div className="post-username">
                            {post.author.username}
                        </div>
                        <div className="post-data">
                            {extractDate(post.created_at)}
                        </div>
                    </div>
                </div>
            </Link>
            {
                post.image &&
                <div className="post-image">
                    <img src={post.image} alt="Post image" />
                </div>
            }
            <div className="like my-3 pl-2">
                <i className={liked ? "fas fa-regular fa-heart pl-2 pr-1 red" : "fas fa-regular fa-heart pl-2 pr-1"} onClick={handleLike}></i>
                <span className="d-inline p-1 mr-1">{likes}</span>
                {
                    !isFollowing.following &&
                    <i className="fa-solid fa-user-plus px-2" onClick={handlefollow}></i>
                }
                {
                    isFollowing.following &&
                    <i className="fa-solid fa-user-minus" onClick={handleUnfollow}></i>
                }
            </div>
            <div className="post-text-1 my-3">
                <div className="post-title my-1 ml-2">
                    {post.title}
                </div>
                <div className="post-text-main my-1 ml-2">
                    {post.content}
                </div>
            </div>
            {
                isOwner &&
                <div className="d-flex flex-row-reverse"> 
                    <Link to={`update_post/${[post.id]}`}> 
                        <i className="fa-solid fa-pen"></i>
                    </Link> 
                </div>
            }
        </div>
    )
}