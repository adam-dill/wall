import React, {useState} from 'react';
import {useParams, Redirect, useHistory} from 'react-router-dom';
import { gql, useMutation, useQuery } from '@apollo/client';
import uuidAPIKey from 'uuid-apikey';
import {toast} from 'react-toastify';

const User = ({refreshUser}) => {
    const {id} = useParams();
    const { loading, error, data } = useQuery(GET_CURRENT_USER);
    const history = useHistory();

    // TODO: get around two seperate functions, because GET_CURRENT_USER 
    //       will fail if called after password update.
    const [updateUser] = useMutation(UPDATE_USER);
    const [updateUserRefresh] = useMutation(UPDATE_USER, {refetchQueries: [{query: GET_CURRENT_USER}]});
    const [password, setPassword] = useState('');

    // TODO: loading/error component?
    if (loading) return <p>Loading...</p>;
    if (error) toast.error(error.message);
    
    const handleGenerateKeyClick = () => {
        // TODO: should the server handle this?
        const api_key = uuidAPIKey.create().apiKey;
        updateUserRefresh({ variables: {userUpdate: {api_key}}})
            .then(({data}) => updateComplete(data));
    }

    const handleClearKeyClick = (e) => {
        const api_key = null;
        updateUserRefresh({ variables: {userUpdate: {api_key}}})
            .then(({data}) => updateComplete(data));
    }

    const handleUpdatePasswordClick = () => {
        updateUser({ variables: {userUpdate: {password}}})
            .then(({data}) => updateComplete(data));
    }

    const updateComplete = (data) => {
        const {token} = data.updateUser;
        localStorage.setItem('token', token);
        toast.success("Your profile has been updated.");
    }

    if (!data || !data.getCurrentUser) {
        toast.error('You must be logged in to access the user page.');
        return <Redirect to={'/login'} />;
    }
    const user = data?.getCurrentUser ?? {};
    return (
        <div>
            <h3 className="page-title">{user.email}</h3>
            <div className="my-4 ">
                <div>API Key: {user.api_key}</div> 
                <button className="btn btn-primary mr-2" onClick={handleGenerateKeyClick}>Generate</button>
                <button className="btn btn-secondary" onClick={handleClearKeyClick}>Clear</button>
            </div>
            <label>New Password:</label><br />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}></input>
            <br />
            <button className="btn btn-primary mt-2" onClick={handleUpdatePasswordClick}>Update Password</button>
        </div>
    );
};

const GET_CURRENT_USER = gql`
    query GetCurrentUser {
        getCurrentUser {
            id
            email
            api_key
        }
    }
`;

const UPDATE_USER = gql`
    mutation UpdateUser($userUpdate: UpdateUserInput!) {
        updateUser(userUpdate: $userUpdate) {
            token
        }
    }
`;

export default User;