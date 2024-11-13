import React from "react";
import { useNavigate } from "react-router-dom";
import './css/friends.css';

export default function ProfileFriends({post}){
    const navigate = useNavigate()

    function handleNavigation() {
        navigate(`profile/${post.username}`);
    }


    return(
        <div className="friends-main my-3" onClick={handleNavigation}>
                <div className="image-profile mr-2">
                    <img src={post.profile_image} alt="Friends Profile" />
                </div>
                <div>
                    <div className="friends-username">
                        {post.username}
                    </div>
                    <div className="friends-email">
                        {post.email}
                    </div>
                </div>
        </div>
    )
}