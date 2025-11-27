import React, { useEffect } from 'react';
import Button from '@/Components/Button';
import Guest from '@/Layouts/Guest';
import Input from '@/Components/Input';
import Label from '@/Components/Label';
import Checkbox from '@/Components/Checkbox';
import {translate} from '@/Helpers';
import ValidationErrors from '@/Components/ValidationErrors';
import { Head, Link, useForm } from '@inertiajs/inertia-react';

export default function Register(props) {
    const { data, setData, post, get, processing, errors, reset } = useForm({
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
        product: props.plan != null ? props.plan.id : 0
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

        post(route('register'));
    };

    return (
        <Guest>
            <Head title={translate("Register")} />

            <h3 className="text-back-100">{translate('Create Account')}</h3>
            <div className="mt-4">
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
                <form onSubmit={submit}>
                    <ValidationErrors errors={errors} />
                    <div className='form-group'>
                        <Input type="email" name="email" placeholder={translate('Email')} value={data.email} handleChange={onHandleChange} className="mb-2" />
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
                            className="btn btn-lg btn-danger"
                            borderRadius={10}
                            padding={12}>
                            {translate('Create account')}
                        </Button>
                    </div>
                </form>
                <div className="my-3 d-flex justify-content-center align-items-center text-muted">{translate('or')}</div>
                <div className="d-grid gap-1 mb-3">
                    <a href={route('social.redirect', {driver: 'google', product: data.product})} className="btn btn-google text-white d-flex justify-content-center">
                        <img src='/assets/svg/google_white.svg' className='me-2'/>
                        <small>{translate('Continue with Google')}</small>
                    </a>
                    {/* <a href={route('social.redirect', {driver: 'facebook', product: data.product})} className="btn btn-facebook text-white d-flex justify-content-center">
                        <img src='/assets/svg/facebook_white.svg' className='me-2'/>
                        <small>{translate('Continue with Facebook')}</small>
                    </a> */}
                    {/* <Button type="submit" icon='/assets/svg/google_white.svg' className="btn btn-google text-white">{translate('Continue with Google')}</Button>
                    <Button type="submit" icon='/assets/svg/facebook_white.svg' className="btn btn-facebook text-white">{translate('Continue with Facebook')}</Button> */}
                    {/* <Button type="submit" icon='/assets/svg/apple_white.svg' className="btn btn-dark">{translate('Continue with Apple')}</Button> */}
                </div>
                <Link
                    href={route('login')}
                    className="text-black-400 text-decoration-none d-flex align-items-end justify-content-center"
                    style={{
                        fontSize: '12px',
                    }}>
                    <span className="text-black-400 ms-1 text-decoration-underline">{translate('Already have an account?')}</span>
                    <span className="text-black-100 ms-1 fw-bold"> {translate('Log in')}</span>
                </Link>
            </div>
        </Guest>
    );
}
