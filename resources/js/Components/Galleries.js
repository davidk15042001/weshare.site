import React from 'react';
import UploadImage from './UploadImage';
import DeleteIconButton from './DeleteIconButton';

export default function Galleries({className, galleries, loading, blurred, onHandleGallery, onRemoveGallery}) {
    return (
        <>
            <div className={className} style={{cursor: "pointer"}}>
                <UploadImage
                    width="100%"
                    height="200px"
                    hideCropping
                    className="rounded-10"
                    onHandleCropped={onHandleGallery}
                    loading={loading}
                />
            </div>
            <div className={`row m-0 px-3 ${blurred}`}>
                {galleries.map(gallery => {
                    return (
                        <div key={gallery.id} className="col-6 mb-3 position-relative">
                            <img src={gallery.url} className="rounded-10" width='100%' height='100%' style={{objectFit: "cover", height: '120px'}} />
                            <div
                                className="position-absolute w-100 h-100"
                                style={{ top: 10, left: 0, paddingRight: 10 }}>
                                <div className="d-flex align-items-center justify-content-end">
                                    <DeleteIconButton
                                        onClick={() => onRemoveGallery(gallery)}
                                        width={36}
                                        height={36}
                                        icon={"/assets/svg/trash_dark.svg"}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}