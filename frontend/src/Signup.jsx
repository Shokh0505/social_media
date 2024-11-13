import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useState } from 'react';
import './css/signup.css'

function Signup() {

    const navigate = useNavigate();

    const [data, setData] = useState({
        username: '',
        password: '',
        email: '',
        password2: '',
        first_name: '',
        last_name: '',
    })

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

    function handleEmail(event){
        setData({
            ...data,
            email: event.target.value
        })
    }

    function handleSubmit(event) {
        event.preventDefault();

        fetch('http://127.0.0.1:8000/signup/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "username": data.username,
                "email": data.email,
                "password": data.password,
                "password2": data.password2,
                "first_name": data.first_name,
                "last_name": data.last_name,
            }),
        })
        .then(res => {
            if(res.ok) {

                setData({
                    username: '',
                    password: '',
                    password2: '',
                    first_name: '',
                    last_name: '',
                    email: '',
                })

                navigate("/login")
                return res.json();
            }
            return res.json()
        })
        .then(res => {
            console.log(res);
        })
        .catch(error => {
            console.log(data)
            console.log('Error with the api: ', error);
        })


    }

    return (
        <div className='main'>
            <div className="container">
                <form onSubmit={handleSubmit}>
                <div className="signup-container form-group">
                    <h1 className='text-center mb-4'>Signup</h1>
                    <input 
                        type="text"  
                        placeholder='Username' 
                        className='form-control my-3' 
                        onChange={handleUsername} 
                        value={data.username}
                        required={true}
                    />
                    <input 
                        type="text" 
                        placeholder='First Name' 
                        className='form-control my-3' 
                        onChange={e => setData({...data, first_name: e.target.value})} 
                        value={data.first_name}
                        required={true}
                    />
                    <input 
                        type="text" 
                        placeholder='Last Name' 
                        className='form-control my-3' 
                        onChange={e => setData({...data, last_name: e.target.value})} 
                        value={data.last_name}
                        required={true}
                    />
                    <input 
                        type="email" 
                        className="form-control my-3" 
                        placeholder='Email' 
                        onChange={handleEmail} 
                        value={data.email}
                        required={true}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className='form-control my-3' 
                        onChange={handlePassword} 
                        value={data.password}
                        required={true}
                    />
                    <input 
                        type="password" 
                        placeholder="Confirm password" 
                        className='form-control my-3' 
                        onChange={(e) => setData({...data, password2: e.target.value})} 
                        value={data.password2}
                        required={true}
                    />
                    <div className='button'> 
                        <button type='submit' className="btn btn-primary">Signup</button>
                    </div>
                    <div className='text-muted text-center mt-3'>Already have an account? <Link to={"/login"}>Login</Link></div>
                </div>
                </form>
            </div>
        </div>
    )
}

export default Signup;