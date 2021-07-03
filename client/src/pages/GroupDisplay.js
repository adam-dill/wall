import React, {useState} from 'react';
import {useParams, useHistory} from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import ImageListQuery from '../components/ImageListQuery';
import {toast} from 'react-toastify';

const GroupDisplay = () => {
    const history = useHistory();
    const {id} = useParams();
    const [editing, setEditing] = useState(false);
    const [groupLabel, setGroupLabel] = useState();
    const { data, error } = useQuery(GET_DATA, {variables:{groupId: id}});
    const [updateLabel] = useMutation(UPDATE_GROUP);
    const [deleteGroup] = useMutation(DELETE_GROUP, {refetchQueries: [{query: GET_CURRENT_USER}]});

    if (error) toast.error(error.message);

    const user = data?.getCurrentUser ?? {};
    const group = data?.getGroup ?? {};

    const handleLabelClick = (e) => {
        setEditing(true);
        setGroupLabel(group.label);
    }

    const handleLabelChange = (e) => {
        setGroupLabel(e.target.value);
    }

    const handleSaveLabel = (e) => {
        updateLabel({ variables: {id: id, group: {label: e.target.value}}})
            .then(() => {
                setEditing(false);
                window.dispatchEvent(new Event('updatesidebar'));
            })
            .catch(err => toast.error(err.message));
    }

    const handleDeleteClick = (e) => {
        // TODO: create a modal system instead of windows alert/confirm/prompts
        const go = window.confirm("Are you sure?")
        if (!go) return;
        
        deleteGroup({ variables: {id: id}})
            .then(result => {
                toast.success(`${group.label} deleted.`);
                history.goBack();
            });
    }

    // TODO: move to a helper function
    const url = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
        ? `${window.location.protocol}//${window.location.hostname}:4000`
        : `${window.location.protocol}//${window.location.hostname}`
    return (
        <div className="d-flex flex-column h-100">
            <div className="d-flex justify-content-between mb-2">
                <div className="page-title">
                    {editing 
                        ? <input className="d-line-block" type="text" value={groupLabel} 
                            onChange={handleLabelChange}
                            onBlur={handleSaveLabel}
                            autoFocus={true}></input>
                        : <h3 className="d-inline-block editable-text" onClick={handleLabelClick}>{group.label}</h3>
                    }
                    
                    {user.api_key
                        ? <a href={`${url}/api/images?key=${user.api_key}&group=${group.id}`} target="_blank">api <i className="fas fa-rocket"></i></a>
                        : <span className="ml-3">No API Key</span>
                    }
                </div>
                <div className="d-flex flex-column justify-content-end">
                    <button className="btn btn-danger mb-2" onClick={handleDeleteClick}><span className='d-none d-md-inline-block'>Delete Group</span><i className="far fa-trash-alt ml-md-2"></i></button>
                </div>
            </div>
            <ImageListQuery groupId={id} />
        </div>
    );
};

const GET_DATA = gql`
    query GetData($groupId: ID!) {
        getCurrentUser {
            id
            api_key
        }
        getGroup(id: $groupId) {
            id
            label
        }
    }
`;

const UPDATE_GROUP = gql`
    mutation UpdateGroup($id: ID!, $group: GroupInput!) {
        updateGroup(id: $id, group: $group) {
            id
            label
        }
    }
`;

const DELETE_GROUP = gql`
    mutation DeleteGroup($id: ID!) {
        deleteGroup(id: $id)
    }
`;

const GET_CURRENT_USER = gql`
    query GetCurrentUser {
        getCurrentUser {
            id
            groups {
                id
                label
            }
        }
    }
`;

export default GroupDisplay;