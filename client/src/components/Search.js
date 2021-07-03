import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import { toast } from 'react-toastify';

const Search = () => {
    const history = useHistory();
    const [searchTerm, setSearchTerm] = useState('');

    // change spaces to +
    const parseTerm = (term) => term.replace(/\s+/g, '+');

    const handleSearchClick = (e) => {
        if (searchTerm === '') {
            e.preventDefault();
            toast.error('Enter a search phrase.');
        }
        setSearchTerm('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTerm === '') {
            toast.error('Enter a search phrase.');
        } else {
            history.push(`/search?term=${parseTerm(searchTerm)}`);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="d-flex mt-3 w-100">
            <input type="text" 
                placeholder="Search..." 
                className="w-100"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}></input>
            <button type="submit" className="btn btn-primary wrap"><i className="fas fa-search"></i></button>
        </form>
    );
};

export default Search;