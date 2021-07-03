import React from 'react';
import {
    BrowserRouter as Router,
} from "react-router-dom";
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import { onError } from "@apollo/client/link/error";
import { ApolloLink } from "apollo-link";
import { createUploadLink } from 'apollo-upload-client';
import { setContext } from '@apollo/client/link/context';
import { ToastContainer, Slide } from 'react-toastify';

import AppProvider from './AppContext';
import {Routes} from './pages';
import RefreshToken from './components/RefreshToken';
import {NewGroupModal} from './modals';

// TODO: move to a helper function
const gqlUri = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
    ? `${window.location.protocol}//${window.location.hostname}:4000/graphql`
    : `${window.location.protocol}//${window.location.hostname}/graphql`

const uploadLink = createUploadLink({ uri: gqlUri });
// Log any GraphQL errors or network error that occurred
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
            console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
    if (networkError) console.error(`[Network error]: ${networkError}`);
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');

    return {
        headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
        }
    }
});

const defaultOptions = {
    query: {
        fetchPolicy: 'network-only',
    }
}

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: ApolloLink.from([errorLink, authLink, uploadLink]),
    defaultOptions: defaultOptions,
});

function App() {
    return (
        <AppProvider>
            <ApolloProvider client={client}>
                <RefreshToken />
                <ToastContainer transition={Slide} autoClose={3000} />
                <NewGroupModal />
                <div className={`app`}>
                    <Router>
                        <Routes />
                    </Router>
                </div>
            </ApolloProvider>
        </AppProvider>
    );
}

export default App;
