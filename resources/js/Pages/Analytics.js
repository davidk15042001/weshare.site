import React from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head } from '@inertiajs/inertia-react';

export default function Analytics() {
    return (
        <Authenticated>
            <Head title="Analytics" />

            <div className="py-12">
                Analytics
            </div>
        </Authenticated>
    );
}