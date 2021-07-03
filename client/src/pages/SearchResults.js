import React from 'react';
import {useLocation, Link} from 'react-router-dom';
import {ImageSearchQuery} from '../components/ImageListQuery';

const SearchResults = () => {
    const query = new URLSearchParams(useLocation().search);
    const term = query.get('term');

    return (
        <div className="d-flex flex-column h-100">
            <div className="d-flex">
                <h3 className="page-title">Search Results: {term}</h3>
                <Link to="/" className="page-title p-0 ml-3"><i className="fas fa-times-circle"></i></Link>
            </div>
            {/* TODO: this is the same as the ImageList, but a differnt query. */}
            <ImageSearchQuery limit={24} term={term} />
        </div>
    );
};

export default SearchResults;