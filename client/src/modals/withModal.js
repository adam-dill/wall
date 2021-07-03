import React, {useEffect, useState} from 'react';

const withModal = (Component) => (props) => {
    const [modal, setModal] = useState();

    useEffect(() => {
        window.addEventListener('showmodal', showModal);
        window.addEventListener('closemodal', closeModal);

        return () => {
            window.removeEventListener('showmodal', showModal);
            window.removeEventListener('closemodal', closeModal);
        }
    }, []);

    const showModal = (e) => setModal(e.detail.modaltype);
    const closeModal = (e) => setModal(undefined);

    return (
        <div className={`custom-modal ${modal ? null : 'd-none'}`}>
            <div className="panel">
                <Component {...props} />
            </div>
        </div>
    );
};

export default withModal;