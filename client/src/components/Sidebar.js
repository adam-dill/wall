import React, {useState, useEffect} from 'react';
import {NavLink} from 'react-router-dom';
import { gql, useLazyQuery } from '@apollo/client';
import Search from '../components/Search';
import {toast} from 'react-toastify';

const Sidebar = () => {
    const [updateUser, { loading, error, data }] = useLazyQuery(GET_CURRENT_USER, {fetchPolicy:'no-cache'});
    const [style, setStyle] = useState('');

    useEffect(() => {
        updateUser();
        window.addEventListener('updatesidebar', updateUser);
        return () => {
            window.removeEventListener('updatesidebar', updateUser);
        }
    }, []);

    // TODO: loading/error component?
    if (error) toast.error(error.message);

    const user = data?.getCurrentUser;
    const groups = data?.getCurrentUser?.groups;

    const handleAddGroupClick = (e) => {
        window.dispatchEvent(new CustomEvent('showmodal', {'detail':{'modaltype': 'newgroup'}}));
    }

    const handleNavigationToggle = (e) => {
        const newStyle = style === '' ? 'm-0' : '';
        setStyle(newStyle);
    }

    return (
        <>
            <button type="button" className="d-block d-sm-none toggle-menu-button" onClick={handleNavigationToggle}>
                <i className="fas fa-bars"></i>
            </button>
            <div className={`d-flex flex-column sidebar ${style}`}>
                <div className="project-title flex-shrink-0">Wall</div>
                <hr />
                {user && (
                <>
                    <NavLink to={'/image/add'} className="btn btn-primary flex-shrink-0">Add Image</NavLink>
                    <hr />
                    <NavLink to={`/user/${user.id}`} className="link flex-shrink-0">{user.email}</NavLink>
                    <NavLink exact to={`/mine`} className="link flex-shrink-0">My Images</NavLink>
                </>
                )}
                
                <NavLink exact to={`/`} className="link flex-shrink-0">All Images</NavLink>
                <Search />
                {groups && (
                <>
                    <hr />
                    <h3 className="mt-3 mt-sm-0">Groups</h3>
                    <div className="overflow-auto flex-grow-1 flex-shrink-1">
                        {groups && groups.slice()
                            .sort((a, b) => a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1)
                            .map(group => <NavLink key={group.id} to={`/group/${group.id}`} className="link">{group.label}</NavLink>)}
                    </div>
                    <button className="btn btn-primary my-1 flex-shrink-0" onClick={handleAddGroupClick}>Add Group</button>
                    <hr />
                </>
                )}
                
                {user && (
                    <button className="btn btn-secondary flex-shrink-0" onClick={() => {
                        localStorage.setItem('token', '');
                        window.location.href = '/';
                    }}>Logout<i className="fas fa-sign-out-alt ml-2"></i></button>
                )}
                {!user && (
                <>
                    <hr />
                    <NavLink to={'/login'} className="btn btn-primary flex-shrink-0 mt-3 mt-sm-0">Login<i className="fas fa-sign-in-alt ml-2"></i></NavLink>
                    <NavLink to={'/register'} className="btn btn-secondary flex-shrink-0 mt-3">Register<i className="fas fa-user-plus ml-2"></i></NavLink>
                </>
                )}
            </div>
        </>
    );
};

const GET_CURRENT_USER = gql`
    query GetCurrentUser {
        getCurrentUser {
            id
            email
            groups {
                id
                label
            }
        }
    }
`;

export default Sidebar;