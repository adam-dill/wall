import React, {useState} from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import {toast} from 'react-toastify';

const NewGroup = () => {
    const [groupName, setGroupName] = useState('');
    const [addGroup] = useMutation(ADD_GROUP, {refetchQueries: [{query: GET_CURRENT_USER}]});

    const handleCancel = (e) => {
        setGroupName('');
        window.dispatchEvent(new Event('closemodal'));
    }

    const handleAdd = (e) => {
        addGroup({variables: {group: {label: groupName}}})
                .then(() => {
                    setGroupName('');
                    toast.success('Group created');
                    window.dispatchEvent(new Event('closemodal'));
                })
                .catch(err => toast.error(err.message));
    }

    return (
        <div>
            <h1 className="text-dark">Create New Group</h1>
            <div className="d-flex flex-column">
                <label>Name:</label>
                <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)}></input>
                <div className="mt-3">
                    <button className="btn btn-secondary mr-2" onClick={handleCancel}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleAdd}>Add</button>
                </div>
            </div>
        </div>
    );
};

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

const ADD_GROUP = gql`
    mutation AddGroup($group: GroupInput!) {
        addGroup(group: $group) {
            id
            label
        }
    }
`;

export default NewGroup;