import React, {useEffect} from 'react';
import Guest from '@/Layouts/Guest';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import ValidationErrors from '@/Components/ValidationErrors';
import { Link, Head, useForm } from '@inertiajs/inertia-react';
import {translate} from '@/Helpers';

export default function Welcome(props) {
    const { data, setData, post, get, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const onHandleChange = (event) => {
        setData(event.target.name, event.target.value);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <>
            <Head title={translate("Log in")} />
            <Guest>
                <h3 className="text-back-100">{translate('Welcome Back!')}</h3>
                <div className="mt-4">
                    <ValidationErrors errors={errors} />
                    <form onSubmit={submit}>
                        <div className='form-group'>
                            <Input type="email" name="email" placeholder={translate('Email')} value={data.email} handleChange={onHandleChange} className="mb-2" />
                            <Input type="password" name="password" placeholder={translate('Password')} value={data.password} handleChange={onHandleChange} className="mb-1" />
                            <Link 
                                href={route('password.request')}
                                className="underline text-sm text-black-400 ms-3"
                                style={{fontSize: '12px'}}>
                                {translate('Forgot Password')}
                            </Link>
                        </div>
                        <div className="d-grid mt-3">
                            <Button
                                type="submit"
                                className="btn btn-lg btn-danger"
                                borderRadius={10}
                                padding={12}
                                processing={processing}
                            >{translate('Log in')}</Button>
                        </div>
                    </form>
                    <div className="my-3 d-flex justify-content-center align-items-center text-muted">{translate('or')}</div>
                    <div className="d-grid gap-1 mb-3">
                        <a href={route('social.redirect', {driver: 'google'})} className="btn btn-google text-white d-flex justify-content-center">
                            <img src='/assets/svg/google_white.svg' className='me-2'/>
                            <small>{translate('Continue with Google')}</small>
                        </a>
                        {/* <a href={route('social.redirect', {driver: 'facebook'})} className="btn btn-facebook text-white d-flex justify-content-center">
                            <img src='/assets/svg/facebook_white.svg' className='me-2'/>
                            <small>{translate('Continue with Facebook')}</small>
                        </a> */}
                        {/* <Button type="submit" icon='../../../assets/svg/facebook_white.svg' className="btn btn-facebook text-white">{translate('Continue with Facebook')}</Button>
                        <Button type="submit" icon='../../../assets/svg/apple_white.svg' className="btn btn-dark">{translate('Continue with Apple')}</Button> */}
                    </div>
                    <Link 
                        href={route('site.plans')}
                        className="text-black-400 text-decoration-none d-flex align-items-end justify-content-center"
                        style={{
                            fontSize: '12px',
                        }}>
                        <span className="text-black-400 ms-1 text-decoration-underline">{translate('Dont have an account?')}</span>
                        <span className="text-black-100 ms-1 fw-bold"> {translate('Sign up')}</span>
                    </Link>
                </div>
            </Guest>
        </>
    );
}
