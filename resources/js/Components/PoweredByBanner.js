import React, {useState} from 'react';
import ApplicationLogo from './ApplicationLogo';
import { translate } from '@/Helpers';
import { Link } from "@inertiajs/inertia-react";

export default function PoweredByBanner() {
    const height = '30px';
    const poweredByComponent = () => {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{height}}>
                <div>{translate('Powered by')}</div>
                <ApplicationLogo white width="80" style={{ marginLeft: "10px" }} usedOn="SitePreview" color="white" />
            </div>
        );
    }

    const upgradeToRemoveComponent = () => {
        return <div className="d-flex align-items-center justify-content-center" style={{height}}>{translate('Upgrade to remove')}</div>;
    }

    const [poweredBy, setPoweredBy] = useState(poweredByComponent);

    return (
        <Link href={route("subscriptions.index")} onMouseEnter={() => setPoweredBy(upgradeToRemoveComponent)} onMouseLeave={() => setPoweredBy(poweredByComponent)} className={`bg-danger position-absolute top-0 w-100 py-1 text-white text-center text-decoration-none rounded-0 rounded-lg-top-left-20 rounded-lg-top-right-20`} style={{cursor:'pointer'}}>
            {poweredBy}
        </Link>
    )
}