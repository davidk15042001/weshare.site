import React from 'react';
import UploadImage from './UploadImage';
import { translate } from '@/Helpers';

export default function UploadPhoto({className, src, onHandleCardImage, onRemoveImage}) {
    const onHandleCropped = (image) => {
        onHandleCardImage(image);
    }

    const onRemove = () => {
        onRemoveImage();
    }
    return (
        <div className={className}>
            <UploadImage
                width="100px"
                height="100px"
                image={src}
                round
                onHandleCropped={(image) => onHandleCropped(image)}
                onRemove={onRemove}
            />
            <div className="text-center">
                {translate("Recommended image size:")}
            </div>
            <div className="text-center">
                500 x 500 px
            </div>
        </div>
    );
}