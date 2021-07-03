import React from 'react';
import {Link} from 'react-router-dom';

// TODO: is it good that some compoenents get their data and other rely on the page.
const ImageThumb = (props) => {
    return (
        <Link to={`/image/${props.id}`} className="thumb-cell">
            <div className="thumb-overlay">
                <div>
                    <div className="thumb-title">{props.title ? props.title : 'Untitled'}</div>
                    <div className="text-secondary">by {props.user.email}</div>
                </div>
            </div>
            <img key={props.id} src={props.image_small} />
        </Link>
    );
};

export default ImageThumb;