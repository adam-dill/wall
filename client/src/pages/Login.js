import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';


const Login = () => {
    let history = useHistory();
    const [loginUser] = useMutation(LOGIN);

    const handleSubmit = (e) => {
        e.preventDefault();
        const elements = e.target.elements;
        const inputData = [...elements].reduce((acc, curr) => {
            if (!curr || !curr.name || curr.name === "") return acc;
            return {
                ...acc,
                [curr.name]: curr.value
            }
        }, {});
        loginUser({ variables: {email: inputData.email, password: inputData.password}})
            .then(response => {
                const {data} = response;
                const {token} = data.loginUser;
                localStorage.setItem('token', token);
                history.push('/');
            })
            .catch(err => {
                toast.error(err.message);
            })
    }

    const handleCancelClick = (e) => {
        e.preventDefault();
        history.push('/');
    }
    return (
        <div className="login">
            <div className=" panel d-flex flex-column">
                <h1 className="text-dark">Login</h1>                
                <form onSubmit={handleSubmit} className="d-flex flex-column">
                    <label>email:</label>
                    <input name="email" type="input" />
                    <label>password:</label>
                    <input name="password" type="password" />
                    <div className="d-flex mt-3">
                        <button type="button" className="btn btn-secondary w-100 mr-1" onClick={handleCancelClick}>Cancel</button>
                        <button type="submit" className="btn btn-success  w-100 ml-1">Login</button>
                    </div>
                </form>
                <hr />
                <div>
                    <Link to="/login/forgot" className="text-info">Forgot password</Link>
                    <Link to="/register" className="text-info">Register</Link>
                </div>
            </div>
        </div>
    );
};

const LOGIN = gql`
    mutation LoginUser($email: String!, $password: String!) {
        loginUser(email: $email, password: $password) {
            token
        }
    }
`;

export default Login;