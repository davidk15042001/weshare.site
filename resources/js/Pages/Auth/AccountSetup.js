import React, { useEffect } from 'react';
import Button from '@/Components/Button';
import Guest from '@/Layouts/Guest';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import Checkbox from '@/Components/Checkbox';
import UploadImage from '@/Components/UploadImage';
import {translate} from '@/Helpers';
import ValidationErrors from '@/Components/ValidationErrors';
import { Head, Link, useForm } from '@inertiajs/inertia-react';
import IconButton from '@/Components/IconButton';

export default function AccountSetup(props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        avatar: '',
        firstname: '',
        lastname: '',
        job: '',
        company: '',
        phone: '',
        email: props.email
    });

    const onHandleChange = (event) => {
        setData(event.target.name, event.target.value);
    };

    const onHandleImage = (image) => {
        setData('avatar', image);
    }

    const onBack = () => {

    }

    const submit = (e) => {
        e.preventDefault();
        post(route('account.setup'));
    };

    return (
        <Guest>
            <Head title={translate('Setup Account')} />
            <h5 className="text-back-100 text-center">{translate('Setup your account')}</h5>
            { props.plan != null && (
                <div className='border-radius-20 bg-yellow-800 text-center p-3 mb-4 d-flex flex-column align-items-center'>
                    <div className='fs-6 fw-bold'>{props.plan.name}</div>
                    {(typeof props.plan.price !== 'undefined' && props.plan.price !== 0) && (
                        <div className='fs-6'>
                            <span className='fw-bold'>{props.plan.fprice}</span>
                            <span className='fs-sm'> / {props.plan.period}</span>
                        </div>
                    )}

                    {props.plan.trial && props.plan.trial > 0 && (
                        <div className='fs-sm mt-2 text-secondary fst-italic'><b>{props.plan.trial}</b>-<span className='fw-light'>{translate('day free trial. Cancel any time.')}</span></div>
                    )}
                </div>
            )}

            <div className="d-flex align-items-center justify-content-center">
                <UploadImage width='70px' height='70px' image={data.avatar} round onHandleCropped={(image) => onHandleImage(image)} />
            </div>
            <div className="mt-4">
                <ValidationErrors errors={errors} />

                <form onSubmit={submit}>
                    <div className="mb-3">
                        <Label forInput="firstname" value={translate("Full Name")} className="mb-2" />
                        <div className="d-flex justify-content-between">
                            <Input className="me-2" type="text" name="firstname" placeholder={translate("First name")} value={data.firstname} handleChange={onHandleChange}  />
                            <Input type="text" name="lastname" placeholder={translate("Last name")} value={data.lastname} handleChange={onHandleChange} />
                        </div>
                    </div>
                    <div className="mb-3">
                        <Label forInput="job" value={translate("Job Details")} className="mb-2" />
                        <div>
                            <Input type="text" name="job" placeholder={translate('Job Title')} value={data.job} handleChange={onHandleChange} className="mb-2" />
                            <Input type="text" name="company" placeholder={translate('Company name')} value={data.company} handleChange={onHandleChange} />
                        </div>
                    </div>
                    <div className="mb-3">
                        <Label forInput="phone" value={translate("Contact Details")} className="mb-2" />
                        <div>
                            <Input type="text" name="phone" placeholder={translate('Phone number')} value={data.phone} handleChange={onHandleChange} className="mb-2" />
                            <Input type="email" name="email" placeholder={translate('Email')} value={data.email} handleChange={onHandleChange} />
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                        <a
                            href={route("logout")}
                            className="d-flex align-items-center me-2 text-decoration-none"
                        >
                            <IconButton
                                width={20}
                                height={20}
                                icon="/assets/svg/back.svg"
                            />
                            <span className="ms-2" style={{cursor: 'pointer'}}>
                                {translate("Back")}
                            </span>
                        </a>
                        <Button
                            type="submit"
                            className="btn btn-lg btn-danger px-4 py-2">
                            {translate('Continue')}
                        </Button>
                    </div>
                </form>
            </div>
        </Guest>
    );
}