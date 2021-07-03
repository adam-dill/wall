import React, {useEffect, useState} from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import ImageList from './ImageList';

const ImageListQuery = ({ limit, groupId, currentUserOnly=false }) => {
    const [loadImages, { loading, error, data }] = useLazyQuery(GET_IMAGES);
    const [reset, setReset] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);

    useEffect(() => {
        setReset(true);
        setInitialLoaded(false);
    }, [groupId]);

    const loadMoreImages = (offset) => {
        if (limit === 0) return;
        if (initialLoaded && !limit) return;
        setInitialLoaded(true);
        
        setReset(false);
        loadImages({
            variables: {
                offset: offset,
                limit: limit,
                groupId: groupId,
                currentUserOnly: currentUserOnly
            },
            fetchPolicy:'no-cache'
        });
    }

    const images = data ? data.getImages : [];

    return <ImageList images={images} loading={loading} loadMore={loadMoreImages} reset={reset} />;
};

export const ImageSearchQuery = ({ limit, term }) => {
    const [loadImages, { loading, error, data }] = useLazyQuery(SEARCH);
    const [reset, setReset] = useState(false);

    useEffect(() => {
        setReset(true);
    }, [term]);

    const loadMoreImages = (offset) => {
        setReset(false);
        loadImages({
            variables: {
                offset: offset,
                limit: limit,
                term: term
            },
            fetchPolicy:'no-cache'
        });
    }
    const images = data ? data.search.images : [];

    return <ImageList images={images} loading={loading} loadMore={loadMoreImages} reset={reset} />;
};


const GET_IMAGES = gql`
    query GetImages($offset: Int!, $limit: Int, $groupId: ID, $currentUserOnly: Boolean) {
        getImages(offset: $offset, limit: $limit, groupId: $groupId, currentUserOnly: $currentUserOnly) {
            id
            title
            image_small
            user {
                email
            }
        }
    }
`;

const SEARCH = gql`
    query Search($offset: Int, $limit: Int, $term: String!) {
        search(offset: $offset, limit: $limit, term: $term) {
            images {
                id
                title
                image_small
                user {
                    id
                    email
                }
            }
        }
    }
`;

export default ImageListQuery;