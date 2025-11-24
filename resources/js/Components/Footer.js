import { translate } from "@/Helpers";
import ApplicationLogo from "@/Components/ApplicationLogo";
import { usePage } from "@inertiajs/inertia-react";

function Footer() {
    const { domain, protocol } = usePage().props;
    return (
        <div className="position-absolute text-center w-100 my-3" style={{bottom: 40}}>
            <div className="mb-0 text-center d-flex justify-content-center align-items-center">
                <div>{translate('Powered by ')}</div>
                <ApplicationLogo
                    width="100"
                    usedOn="SitePreview"
                    style={{marginLeft: '10px'}}
                />
            </div>
            <a href={`${protocol}://${domain}`} className="btn border-0 text-decoration-none">
                {translate('Try for free')}{" "}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-arrow-right ms-2"
                    viewBox="0 0 16 16"
                >
                    <path
                        fillRule="evenodd"
                        d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
                    />
                </svg>
            </a>
        </div>
    );
}
export default Footer;
