import React from 'react';
import Document from './Document';
import { translate } from '@/Helpers';
import { useDropzone } from "react-dropzone";

export default function Documents({className, documents, onHandleFile, onRemoveDocument}) {
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => onHandleFile(acceptedFiles),
        multiple: false,
    });

    return (
        <div className={className} style={{cursor: "pointer"}}>
            <div
                {...getRootProps({className: "dropzone bg-light py-5 mb-2 d-flex align-items-center justify-content-center rounded-10"})}
                style={{border: "1px dashed #828FA7"}}>
                <input {...getInputProps()} />
                <div className="text-center">
                    <img src="/assets/svg/document-upload.svg" />
                    <div className="fs-sm text-blue-500 mt-3">
                        {translate("Drag the file or Select to upload")}
                    </div>
                </div>
            </div>
            {documents ? (
                <div className="py-2 px-3 px-lg-4">
                    {documents.map(
                        (file) => (
                            <Document
                                key={file.id}
                                file={file}
                                icon="trash-o"
                                handleOnClickIcon={onRemoveDocument} />
                        )
                    )}
                </div>
            ) : null}
        </div>
    );
}