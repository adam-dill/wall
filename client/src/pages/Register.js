import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import {toast} from 'react-toastify';


const Register = () => {
    const history = useHistory();
    const [addUser] = useMutation(ADD_USER);
    const [formData, setFormData] = useState({email:'', password:''});

    const handleSubmit = (e) => {
        e.preventDefault();
        addUser({variables: {email: formData.email, password: formData.password}})
            .then(({data}) => {
                const {token} = data.addUser;
                localStorage.setItem('token', token);
                history.push('/');
            })
            .catch(err => toast.error(err.message));
    }

    const handleChange = (e) => {
        const data = JSON.parse(JSON.stringify(formData));
        data[e.target.name] = e.target.value;
        setFormData(data);
    }

    const handleCancelClick = (e) => {
        e.preventDefault();
        history.goBack();
    }

    return (
        <div className="login">
            <div className=" panel d-flex flex-column">
                <h1 className="text-dark">Register</h1>
                <form onSubmit={handleSubmit} className="d-flex flex-column">
                    <label>email:</label>
                    <input name="email" type="input" value={formData.email} onChange={handleChange} />
                    <label>password:</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} />
                    <div className="d-flex mt-3">
                        <button className="btn btn-secondary w-100 mr-1" onClick={handleCancelClick}>Cancel</button>
                        <button className="btn btn-success w-100 ml-1" type="submit">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ADD_USER = gql`
    mutation AddUser($email: String!, $password: String!) {
        addUser(email: $email, password: $password) {
            token
        }
    }
`;

export default Register;