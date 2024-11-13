import React from "react";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./css/createPost.css";

export default function UpdatePost() {
    const [filename, setFilename] = useState('No file has been chosen');
    const [preview, setPreview] = useState(null);
    const [formdata, setFormdata] = useState({
        title: '',
        image: null,
        content: ''
    });
    const { post_id } = useParams();
    const navigate = useNavigate();
    const token = Cookies.get('authToken');

    useEffect(() => {
        fetch('http://127.0.0.1:8000/get_post/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                'post_id': post_id
            })
        })
        .then(response => {
            if(response.ok){
                return response.json()
            }
            else {
                console.error("Hey, problem with the status code")
            }
        })
        .then(data => {
            console.log(data.post.title)
            setFormdata({
                title: data.post.title,
                content: data.post.content,
                image: data.post.simage
            });
        })
        .catch(error => console.log('Error', error));
    }, [])

    function handleFileChange(event) {
        const file = event.target.files[0];
        
        if(file) {
            setFilename(file.name);
            setFormdata({
                ...formdata,
                image: file
            })

            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    function handleTitle(event){
        setFormdata({
            ...formdata,
            title: event.target.value
        })
    }

    const handleContentChange = (event) => {
        setFormdata({
            ...formdata,
            content: event.target.value
        })
    }
    
    const handleSubmit = (event) => {
        event.preventDefault()

        const forminfo = new FormData();
        const token = Cookies.get("authToken");
        if(formdata.image) {
            forminfo.append('image', formdata.image);
        }

        forminfo.append('title', formdata.title);
        forminfo.append('content', formdata.content);
        forminfo.append('post_id', post_id);
        console.log(forminfo);

        fetch('http://127.0.0.1:8000/create_post/', {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`
            },
            body: forminfo
        })
        .then(response => {
            if(response.ok){
                return response.json()
            }
            else {
                throw new Error(`Request failed to fetch post data ${response.status}`);
            }
        })
        .then(data => {
            console.log("Successful: ", data);
            navigate("/");
        })
        .catch(error => {
            console.log(`Error with Post request for creating post ${error}`)
        })
    }

    return (
        <div className="post-main">
            <div className="post-container">
                <form onSubmit={handleSubmit}>
                    <div className="post-inputs form-group">
                        <h3 className="post-header mt-2 mb-3">Create a post:</h3>
                            {preview && 
                            <div className="preview-image my-3"> 
                                <img 
                                src={preview} 
                                alt="image preview" 
                                className="image-preview" 
                                /> 
                            </div>}
                        <input 
                            type="file" 
                            name="image" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            id="image-upload" 
                        />
                        <div className="post-img-info">
                            <div className="filename">
                                {filename}
                            </div>
                            <label htmlFor="image-upload">
                                <i className="fa-solid fa-camera"></i>
                            </label>
                        </div>
                        <input 
                            type="text" 
                            className="form-control my-3" 
                            value={formdata.title} 
                            onChange={handleTitle}
                            placeholder="Post title"
                        />
                        <textarea 
                            name="post-text" 
                            id="post-text" 
                            className="post-text form-control"
                            placeholder="Write your thoughts here..."
                            onChange={handleContentChange}
                            value={formdata.content}
                        >
                        </textarea>
                        <button className="btn btn-primary mt-3">
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}