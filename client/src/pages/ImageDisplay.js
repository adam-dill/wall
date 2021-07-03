import React, {useState} from 'react';
import {useParams, useHistory} from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import {toast} from 'react-toastify';

const ImageDisplay = () => {
    const history = useHistory();
    const {id} = useParams();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const { loading, error, data } = useQuery(GET_IMAGE, {variables: {id}});
    const [removeGroup] = useMutation(REMOVE_GROUP, {refetchQueries: [{query: GET_IMAGE, variables: {id}}]});
    const [addGroup] = useMutation(ADD_GROUP, {refetchQueries: [{query: GET_IMAGE, variables: {id}}]});
    const [deleteImage] = useMutation(DELETE_IMAGE);
    const [updateImage] = useMutation(UPDATE_IMAGE);

    // TODO: loading/error component?
    if (loading) return <p>Loading...</p>;

    const {getCurrentUser:user, getImage:image} = data;

    const handleTitleClick = (e) => {
        setEditingTitle(true);
        setTitle(image.title);
    }

    const handleDecriptionClick = (e) => {
        setEditingDescription(true);
        setDescription(image.description);
    }

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    }

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    }

    const handleSave = (e) => {
        updateImage({ variables: {id: id, image: {title: title, description: description}}})
            .then(() => {
                setEditingTitle(false);
                setEditingDescription(false);
            })
            .catch(err => toast.error(err.message));
    }

    const handleGroupClick = (e) => {
        const groupId = e.target.dataset.id;
        const fn = e.target.classList.contains('btn-success')
            ? removeGroup
            : addGroup;
        fn({ variables: {imageId: id, groupId: groupId}})
            .then(({data}) => {
                // Nothing
            })
            .catch(err => toast.error(err.message));

    }

    const handleDownloadClick = (e) => {
        const {getImage:image} = data;
        const url = image.image_large;
        downloadFile(url, `${image.title}.jpg`);
    }

    const handleDeleteClick = (e) => {
        const go = window.confirm("Are you sure?");
        if (!go) return;

        deleteImage({ variables: {id: id}})
            .then(response => {
                toast.success('Image have been deleted.');
                window.history.back();
            })
            .catch(err => toast.error(err.message));
    }

    const handleClose = (e) => {
        history.goBack();
    }

    function downloadFile(url, filename) {
        const options = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        fetch(url, options)
            .then( response => {
                response.blob().then(blob => {
                        let url = window.URL.createObjectURL(blob);
                        let a = document.createElement('a');
                        a.href = url;
                        a.download = filename;
                        a.click();
                    });
            }); 
    }
    const editable = user && user.id === image.user.id;
    return (
        <div className="image-display page-title d-flex flex-column h-100">
            <div className="mb-4"><button className="btn btn-dark" onClick={handleClose}>Close</button></div>
            <div className="d-flex flex-column flex-lg-row overflow-auto">
                <div className="flex-grow-1">
                    <div className="loader">loading...</div>
                    <img className="w-100" src={image.image_medium} />
                </div>
                <div className="image-information px-lg-4">
                    {editingTitle && editable
                        ? <input className="d-block" type="text" value={title} 
                            onChange={handleTitleChange}
                            onBlur={handleSave}
                            autoFocus={true}></input>
                        : <h3 className={`mt-4 mt-lg-0 ${editable ? 'editable-text': null}`} onClick={handleTitleClick}>{image.title && image.title !== '' ? image.title : 'Untitled'}</h3>
                    }
                    <em>by {image.user.email}</em>
                    {editingDescription && editable
                        ? <textarea rows="3" className="d-block" value={description} 
                            onChange={handleDescriptionChange}
                            onBlur={handleSave}
                            autoFocus={true}></textarea>
                        : <p className={`${editable ? 'editable-text': null}`} onClick={handleDecriptionClick}>{image.description ? image.description : 'no description'}</p>
                    }
                    <button className="btn btn-info" onClick={handleDownloadClick}>Download <i className="fas fa-download"></i></button>
                    <hr />
                    <div className="d-flex flex-wrap">
                        {user && user.groups.map(group => {
                            // check to see if this group has the image linked.
                            const style = image.groups.find(value => value.id === group.id)
                                ? 'btn-success'
                                : 'btn-dark';
                            return <button key={group.id} className={`btn ${style} mb-2 w-100`} data-id={group.id} onClick={handleGroupClick}>{group.label}</button>;
                        })}
                    </div>
                    
                    { editable && (
                    <>
                        <hr />
                        <button className="btn btn-danger" onClick={handleDeleteClick}>Delete Image<i className="fas fa-trash-alt ml-2"></i></button>
                    </>
                    )}
                    
                </div>
            </div>
        </div>
    );
};

const GET_IMAGE = gql`
    query GetImage($id: ID!) {
        getCurrentUser {
            id
            groups {
                id
                label
            }
        }
        getImage(id: $id) {
            id
            title
            description
            image_medium
            image_large
            user {
                id
                email
            }
            groups {
                id
                label
            }
        }
    }
`;

const UPDATE_IMAGE = gql`
    mutation UpdateImage($id: ID!, $image: ImageInput) {
        updateImage(id: $id, image: $image) {
            id
        }
    }
`;

const REMOVE_GROUP = gql`
    mutation RemoveGroup($imageId: ID!, $groupId: ID!) {
        removeImageFromGroup(imageId: $imageId, groupId: $groupId) {
            id
            label
        }
    }
`;

const ADD_GROUP = gql`
    mutation AddGroup($imageId: ID!, $groupId: ID!) {
        addImageToGroup(imageId: $imageId, groupId: $groupId) {
            id
            label
        }
    }
`;

const DELETE_IMAGE = gql`
    mutation DeleteImage($id: ID!) {
        deleteImage(id: $id)
    }
`;



export default ImageDisplay;