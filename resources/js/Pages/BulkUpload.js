import React, { useState } from 'react';
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { translate, toast} from "@/Helpers";

export default function BulkUpload(props) {
    const [customer, setCustomer] = useState(null);
    const [uploadedData, setUploadedData] = useState([]);
    const [unsuccessfulData, setUnsuccessfulData] = useState([]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            let formData = new FormData();
            formData.append("file", acceptedFiles[0]);
            if(customer) formData.append("customer_id", customer.uid);
    
            axios.post(route("bulkupload.store"), formData, {headers: { "Content-Type": "multipart/form-data" }})
            .then(({ data }) => {
                console.log('Uploaded response', data);
                setUploadedData(data.successful);
                setUnsuccessfulData(data.unsuccessful);
            })
            .catch(e => {
                toast(translate("Cannot Upload Sites"), "error");
            });
        },
        multiple: false,
    });
    return (
        <>
            <div className="position-fixed fixed-top py-3">
                <div className="d-flex justify-content-between container">
                    <div className="d-flex">
                        <a href="/" className="btn btn-light me-2">
                            <i className="bi bi-arrow-left"></i>
                        </a>
                        <h3>{translate('Import Sites')}</h3>
                    </div>
                </div>
            </div>
            <div className='container mt-10 px-10'>
                <div className="d-flex align-items-center justify-content-center mb-4">
                    <div class="dropdown">
                        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                            {customer ? customer.company : translate('Select Customer')}
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                            {props.customers.map(customer => {
                                let name = customer.company || customer.alias;
                                return <li key={customer.uid}><a class="dropdown-item" onClick={() => setCustomer(customer)}>{customer.uid} - {name}</a></li>
                            })}
                        </ul>
                    </div>
                </div>
                <div
                    {...getRootProps({
                        className:
                            "dropzone bg-white px-5 py-5 mb-2 d-flex align-items-center justify-content-center rounded-10",
                    })}
                    style={{
                        border: "1px dashed #828FA7",
                    }}
                >
                    <input
                        {...getInputProps()}
                    />
                    <div className="text-center">
                        <img src="/assets/svg/document-upload.svg" />
                        <div className="fs-sm text-blue-500 mt-3">
                            {translate(
                                "Drag the file or Select to upload"
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {unsuccessfulData && unsuccessfulData.length > 0 && (
                <div className="container mx-0 mt-5 py-3">
                    <div className='d-flex align-items-center justify-content-between'>
                        <h1>{translate('Unsuccessful')} <span className='text-danger'>{unsuccessfulData.length}</span></h1>
                        <a type="button" href="/bulkupload/export" className="btn bg-danger text-white">{translate('Export')}</a>
                    </div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">{translate('First Name')}</th>
                                <th scope="col">{translate('Last Name')}</th>
                                <th scope="col">{translate('Company Name')}</th>
                                <th scope="col">{translate('Job Title')}</th>
                                <th scope="col">{translate('Office Number')}</th>
                                <th scope="col">{translate('Mobile Number')}</th>
                                <th scope="col">{translate('E-mail')}</th>
                                <th scope="col">{translate('Adresse')}</th>
                                <th scope="col">{translate('Facebook')}</th>
                                <th scope="col">{translate('Linkedin')}</th>
                                <th scope="col">{translate('Whatsapp')}</th>
                                <th scope="col">{translate('Errors')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unsuccessfulData.map(data => {
                                return (
                                    <tr key={data.email}>
                                        <td scope="col">{data.first_name}</td>
                                        <td scope="col">{data.last_name}</td>
                                        <td scope="col">{data.company_name}</td>
                                        <td scope="col">{data.job_title}</td>
                                        <td scope="col">{`${data.office_number}`}</td>
                                        <td scope="col">{`${data.mobile_number}`}</td>
                                        <td scope="col">{data.email}</td>
                                        <td scope="col">{data.adresse}</td>
                                        <td scope="col">{data.facebook}</td>
                                        <td scope="col">{data.linkedin}</td>
                                        <td scope="col">{data.whatsapp}</td>
                                        <td scope="col" className='text-danger'>{data.errors}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {uploadedData && uploadedData.length > 0 && (
                <div className="container mx-0 mt-5 py-3">
                    <h1>{translate('Succesfully Uploaded')} <span className='text-success'>{uploadedData.length}</span> {translate('records')}</h1>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">{translate('First Name')}</th>
                                <th scope="col">{translate('Last Name')}</th>
                                <th scope="col">{translate('Company Name')}</th>
                                <th scope="col">{translate('Job Title')}</th>
                                <th scope="col">{translate('Office Number')}</th>
                                <th scope="col">{translate('Mobile Number')}</th>
                                <th scope="col">{translate('E-mail')}</th>
                                <th scope="col">{translate('Adresse')}</th>
                                <th scope="col">{translate('Facebook')}</th>
                                <th scope="col">{translate('Linkedin')}</th>
                                <th scope="col">{translate('Whatsapp')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {uploadedData.map(data => {
                                return (
                                    <tr key={data.email}>
                                        <td scope="col">{data.first_name}</td>
                                        <td scope="col">{data.last_name}</td>
                                        <td scope="col">{data.company_name}</td>
                                        <td scope="col">{data.job_title}</td>
                                        <td scope="col">{`${data.office_number}`}</td>
                                        <td scope="col">{`${data.mobile_number}`}</td>
                                        <td scope="col">{data.email}</td>
                                        <td scope="col">{data.adresse}</td>
                                        <td scope="col">{data.facebook}</td>
                                        <td scope="col">{data.linkedin}</td>
                                        <td scope="col">{data.whatsapp}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}