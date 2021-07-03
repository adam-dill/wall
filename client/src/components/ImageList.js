import React, {useEffect, useState} from 'react';
import ImageThumb from '../components/ImageThumb';

const ImageList = ({images, loadMore, loading, reset}) => {
    const [storedImages, setStoredImages] = useState([]);
    useEffect(() => loadMore(0), []);

    useEffect(() => {
        if (!images || images.length === 0) return;

        setStoredImages(storedImages.concat(images));
    },[images]);

    useEffect(() => {
        setStoredImages([]);
        loadMore(0);
    }, [reset])

    const handleScroll = ({ currentTarget }) => {
        if (
            currentTarget.scrollTop + currentTarget.clientHeight >=
            currentTarget.scrollHeight
        ) {
            loadMore(storedImages.length);
        }
    };

    return (
        <div className="flex-grow-1 overflow-auto"
             onScroll={handleScroll}>
            <div className="d-flex flex-wrap">
                {storedImages.map(image => {
                    return <ImageThumb key={image.id} {...image} />;
                })}
                {!loading && storedImages.length === 0 && <em>no results</em>}
                
            </div>
            {loading && (
                <div className="d-flex justify-content-center w-100 mt-3">
                    <div className="spinner-border text-dark" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageList;