import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import {toast} from 'react-toastify';

const Status = {
    SENDING:1,
    SUCCESS:2,
    FAILURE:3
}

const Request = () => {
    const history = useHistory();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState();
    const [forgotPassword] = useMutation(FORGOT_PASSWORD);

    const handleSubmit = (e) => {
        e.preventDefault();
        forgotPassword({ variables: {email: email}})
            .then(({data}) => {
                setStatus(Status.SUCCESS);
            })
            .catch(err => toast.error(err.message));
    }

    const handleCancelClick = (e) => {
        e.preventDefault();
        history.goBack();
    }

    // TODO: handle an email failure
    if (status === Status.SUCCESS) {
        return (
            <p>An email has been sent with instructions to reset your password.</p>
        );
    }

    return (
        <div className="login">
            <div className="panel d-flex flex-column">
                <h1 className="text-dark">Forgot Password</h1>
                <form onSubmit={handleSubmit} className="d-flex flex-column">
                    <label>email:</label>
                    <input name="email" type="input" value={email} onChange={(e)=>setEmail(e.target.value)} />
                    <div className="d-flex mt-3">
                        <button className="btn btn-secondary w-100 mr-1" onClick={handleCancelClick}>Cancel</button>
                        <button className="btn btn-success w-100 ml-1" type="submit">Send Reset</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const FORGOT_PASSWORD = gql`
    mutation ForgotPassword($email: String!) {
        forgotPassword(email: $email)
    }
`;

export default Request;