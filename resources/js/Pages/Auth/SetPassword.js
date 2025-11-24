import React, { useEffect } from 'react';
import Button from '@/Components/Button';
import Guest from '@/Layouts/Guest';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import Checkbox from '@/Components/Checkbox';
import {translate} from '@/Helpers';
import ValidationErrors from '@/Components/ValidationErrors';
import { Head, Link, useForm } from '@inertiajs/inertia-react';

export default function SetPassword(props) {
    const { data, setData, post, get, processing, errors, reset } = useForm({
        id: props.id,
        email: props.email,
        password: '',
        password_confirmation: '',
        terms: false,
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const onHandleChange = (event) => {
        setData(event.target.name, event.target.type === 'checkbox' ? event.target.checked : event.target.value);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('savepassword'));
    };

    return (
        <Guest>
            <Head title={translate("Set Password")} />

            <h3 className="text-back-100">{translate('Set Password')}</h3>
            <div className="mt-4">
                <form onSubmit={submit}>
                    <ValidationErrors errors={errors} />
                    <div className='form-group'>
                        <div className='d-flex align-items-center mb-2'>
                            <i className='bi bi-envelope me-2'></i>
                            <span>{data.email}</span>
                        </div>
                        <input type="hidden" name="id" value={data.id} />
                        <Input type="password" name="password" placeholder={translate('Password')} value={data.password} handleChange={onHandleChange} className="mb-2" />
                        <Input type="password" name="password_confirmation" placeholder={translate('Confirm Password')} value={data.password_confirmation} handleChange={onHandleChange} className="mb-2" />
                        
                        <label className="d-flex items-center">
                            <Checkbox name="terms" value="1" handleChange={onHandleChange} checked={data.terms}/>
                            <div className="ms-2 text-black-400 lh-sm" style={{fontSize:'11px'}}>{translate('By signing-up, you are accepting our terms of use, privacy policies and Cookie policy.')}</div>
                        </label>
                    </div>
                    <div className="d-grid mt-3">
                        <Button
                            type="submit"
                            // onClick={submit}
                            className="btn btn-lg btn-danger"
                            borderRadius={10}
                            padding={12}>
                            {translate('Proceed')}
                        </Button>
                    </div>
                </form>
            </div>
        </Guest>
    );
}
