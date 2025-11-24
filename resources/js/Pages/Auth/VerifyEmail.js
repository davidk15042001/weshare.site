import React from 'react';
import Button from '@/Components/Button';
import Guest from '@/Layouts/Guest';
import { Head, Link, useForm } from '@inertiajs/inertia-react';
import { translate } from '@/Helpers';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm();

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <Guest>
            <Head title="Email Verification" />

            <div className='rounded-20 bg-yellow-800 text-center p-5 px-4'>
                <img className="mb-4" src='/assets/svg/entreprenuer_box.svg' />
                <h4 className="mb-4 fw-bold">
                    {translate('Please check your email for verification to proceed')}
                </h4>

                {status === 'verification-link-sent' && (
                    <div className="mb-4 fs-sm">
                        {translate('A new verification link has been sent to the email address you provided during registration.')}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="mt-4 mb-2 fs-sm">{translate('Did you not receive the email?')}</div>
                    <div className="d-flex align-items-center justify-content-center">
                        <Button borderRadius={8} className='btn btn-sm btn-danger px-3 py-2' processing={processing}>
                            {translate('Resend Verification Email')}
                        </Button>
                    </div>
                </form>
            </div>
        </Guest>
    );
}
