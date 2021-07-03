import React from 'react';
import Sidebar from '../components/Sidebar';

const withSidebar = (Component) => (props) => {

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="p-3 flex-grow-1 vh-100 overflow-hidden">
                <Component {...props} />
            </div>
        </div>
    );
};

export default withSidebar;