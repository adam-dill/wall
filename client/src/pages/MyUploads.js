import React from 'react';
import ImageListQuery from '../components/ImageListQuery';

// TODO: don't have an entire page for these types of user filters
const MyUploads = () => {
    return (
        <div className="d-flex flex-column h-100">
            <h3 className="page-title">My Images</h3>
            <ImageListQuery limit={12} currentUserOnly={true} />
        </div>
    );
};

export default MyUploads;