import React from 'react';
import {Switch, Route} from "react-router-dom";
import { Login, Request, Reset, Home, MyUploads, GroupDisplay, User, ImageDisplay, AddImage, SearchResults } from './';
import Register from './Register';


const Routes = () => {
    return (
        <Switch>
            <Route path="/image/add">
                <AddImage />
            </Route>
            <Route path="/image/:id">
                <ImageDisplay />
            </Route>
            <Route path="/user/:id">
                <User />
            </Route>
            <Route path="/group/:id">
                <GroupDisplay />
            </Route>
            <Route path="/login/reset/:token">
                <Reset />
            </Route>
            <Route path="/login/forgot">
                <Request />
            </Route>
            <Route path="/login">
                <Login />
            </Route>
            <Route path="/register">
                <Register />
            </Route>
            <Route path="/search">
                <SearchResults />
            </Route>
            <Route path="/mine">
                <MyUploads />
            </Route>
            <Route path="/">
                <Home />
            </Route>
        </Switch>
    );
};

export default Routes;