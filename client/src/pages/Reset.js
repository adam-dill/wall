import React, {useState} from 'react';
import { useHistory, useParams, Link } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';

const Reset = () => {
    const {token} = useParams();
    let history = useHistory();
    const [password, setPassword] = useState();
    const { loading, error, data } = useQuery(VALIDATE_RESET_TOKEN, {variables: {token}});
    const [updateUser] = useMutation(UPDATE_USER);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error.toString()}</p>;
    if (data.validateResetToken === false) {
        return <p>Invalid token <Link to='/login/forgot'>Back</Link></p>
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        updateUser({ variables: {userUpdate: {password}, token: token}})
            .then(({data}) => {
                const {token} = data.updateUser;
                localStorage.setItem('token', token);
                history.push('/');
            });
    }

    return (
        <div className="login">
            <div className="panel d-flex flex-column">
                <h1 className="text-dark">Password Reset</h1>
                <form onSubmit={handleSubmit} className="d-flex flex-column">
                    <label>password:</label>
                    <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button className="btn btn-success mt-3" type="submit">Update</button>
                </form>
            </div>
        </div>
    );
};

const VALIDATE_RESET_TOKEN = gql`
    query ValidateResetToken($token: String!) {
        validateResetToken(token: $token)
    }
`;

const UPDATE_USER = gql`
    mutation UpdateUser($userUpdate: UpdateUserInput!, $token: String) {
        updateUser(userUpdate: $userUpdate, token: $token) {
            token
        }
    }
`;

export default Reset;