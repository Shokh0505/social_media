import React from 'react';
import Cookies from 'js-cookie';
import { useNavigate, Link } from "react-router-dom";
import { useState } from 'react';
import './css/login.css'

function Login() {

    const [data, setData] = useState({
        username: '',
        password: ''
    })

    const [isDisabled, setIsDisabled] = useState(false); 

    const navigate = useNavigate()


    const storeToken = (token) => {
        Cookies.set('authToken', token, {expires: 7, path: '/'});
    }

    const storeId = (id) => {
        Cookies.set("id", id, {expires: 7, path: '/'});
    }

    function handleUsername(event) {
        setData({
            ...data,
            username: event.target.value
        })
    }

    function handlePassword(event) {
        setData({
            ...data,
            password: event.target.value
        })
    }

    function handleSubmit(event) {
        event.preventDefault();
        
        setIsDisabled(true);
    
        fetch("http://127.0.0.1:8000/login/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "username": data.username,
                "password": data.password,
            })
        })
        .then(res => {
            if(res.ok) {
                return res.json();
            } else {
                console.log("Error logging in the user");
                throw new Error('Login failed');
            }
        })
        .then(response => {
            console.log("Response received:", response);
            storeToken(response.token);
            storeId(response.id);
            console.log("Stored ID:", response.id);
            navigate("/");
        })
        .catch(error => console.error("Error during login:", error));
    }
    

    return (
        <div className='main'>
            <div className="container">
                <form onSubmit={handleSubmit}>
                { isDisabled && <div>Logging in...</div> }
                {
                    !isDisabled && 
                    <div className="login-container form-group">
                    <h1 className='text-center mb-4'>Login</h1>
                    <input type="text"  placeholder='Username' className='form-control my-3' onChange={handleUsername} value={data.username} />
                    <input type="password" placeholder="Password" className='form-control my-3' onChange={handlePassword} value={data.password}/>
                    <div className='button'> 
                        <button type='submit' className="btn btn-primary">Login</button>
                    </div>
                    <div className='text-center mt-2'>
                        Create an account: <Link to={"/signup"}>Sign Up</Link>
                    </div>
                    </div>
                }
                </form>
            </div>
        </div>
    )
}

export default Login;