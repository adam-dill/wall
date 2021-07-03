import {useState, useEffect} from 'react';
import { gql, useMutation } from '@apollo/client';
import {toast} from 'react-toastify';

const RefreshToken = () => {
    // TODO: log any actually errors, or remove this.
    const [display, setDisplay] = useState(null);
    const [refreshToken] = useMutation(REFRESH_TOKEN);

    const fireRefresh = () => {
        refreshToken()
                .then(response => {
                    const {data} = response;
                    const {token} = data.refreshToken;
                    localStorage.setItem('token', token);
                })
                .catch(err => toast.error(err.message));
    }

    useEffect(() => {
        // TODO: time this interval globally based on the JWT expiration
        setInterval(fireRefresh, 10 * 60000);
        fireRefresh();
    }, []);
    
    return null;
};

const REFRESH_TOKEN = gql`
    mutation RefreshToken {
        refreshToken {
            token
        }
    }
`;

export default RefreshToken;