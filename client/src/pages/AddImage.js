import React from 'react';
import {Redirect, useHistory} from 'react-router-dom';
import { useMutation, useQuery, gql } from '@apollo/client';
import {toast} from 'react-toastify';

const AddImage = () => {
    const history = useHistory();
    const { loading, error, data } = useQuery(GET_CURRENT_USER);
    const [addImage, { imageData }] = useMutation(ADD_IMAGE);

    // TODO: loading/error component?
    if (loading) return <p>Loading...</p>;
    if (error) return <Redirect to='/login' />;

    const handleSubmit = (e) => {
        e.preventDefault();
        const elements = e.target.elements;
        // Iterate over the form controls and create an object
        const data = [...elements].reduce((acc, curr) => {
                if (!curr || !curr.name || curr.name === "") return acc;
                return {
                    ...acc,
                    [curr.name]: curr.value
                }
            }, {});
        data.file = e.target.file.files[0];
        data.groups = [...e.target.groups.options]
            .filter(option => option.selected)
            .map(option => parseInt(option.value));
        addImage({ variables: {image: data}})
            .then(({data}) => {
                toast.success('Image has been added.');
                history.goBack();
            })
            .catch(err => toast.error(err.message));
    }

    const groups = data.getCurrentUser.groups;
    return (
        <div>
            <h3 className="page-title">Image Upload</h3>
            <form onSubmit={handleSubmit} encType={'multipart/form-data'} className="d-flex flex-column">
                <label>Title:</label>
                <input name="title" type="input" />
                <input name="file" type="file" accept=".png,.jpg" className="my-3" />
                <div className="d-flex w-100">
                    <div className="flex-grow-1 d-flex flex-column mr-3">
                        <label>Description:</label>
                        <textarea name="description" rows={3} />
                    </div>
                    
                    <div className="flex-grow-1 d-flex flex-column ml-3">
                        <label>Groups:</label>
                        <select name="groups" className="flex-grow-1" multiple>
                            {groups.map(group => {
                                return <option key={group.id} value={group.id}>{group.label}</option>
                            })}
                        </select>
                    </div>
                    
                </div>
                <div className="mt-3">
                    <button type="submit" className="btn btn-primary">Upload</button>
                </div>
                
            </form>
        </div>
        
    );
};


const GET_CURRENT_USER = gql`
    query GetCurrentUser {
        getCurrentUser {
            groups {
                id
                label
            }
        }
    }
`;

const ADD_IMAGE = gql`
  mutation AddImage($image: ImageInput!) {
    addImage(image: $image) {
        id
        title
    }
  }
`;

export default AddImage;