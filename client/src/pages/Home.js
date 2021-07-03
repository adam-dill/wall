import React from 'react';
import ImageListQuery from '../components/ImageListQuery';

const Home = () => {

    return (
        <div className="d-flex flex-column h-100">
            <h3 className="page-title">All Images</h3>
            <ImageListQuery limit={12} />
        </div>
    )
}

export default Home;