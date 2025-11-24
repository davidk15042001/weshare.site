import React, {useState, useEffect} from 'react';
import { translate } from '@/Helpers';
import { usePage } from '@inertiajs/inertia-react';
import axios from 'axios';
import SocialIcon from "@/Components/SocialIcon";
import { socials as socialsHelper, toast } from '@/Helpers';

export default function ShareSiteModal({id, card}) {
    const { domain, protocol, auth } = usePage().props;
    const [qr, setQr] = useState(null);

    useEffect(() => {
        if (card && card.id) {
            axios
                .post(
                    route("cards.qr", card.id),
                    { color: "black"},
                    { responseType: "blob" }
                )
                .then(({ data }) => {
                    let blobURL = URL.createObjectURL(data);
                    setQr(blobURL);
                });
        }
    }, [card]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${protocol}://${card.identifier}.${domain}`);
        toast(translate("Copied to clipboard"));
    }

    const shareCard = async (social, url) => {
        try{
            await axios.post(route("analytics.store"), {
                social,
                card_id: card.id,
                type: "click",
            });
    
            await axios.post(route("analytics.store"), {
                social,
                card_id: card.id,
                type: "share",
            });
            window.open(url);
        }catch(error){
            console.error("Error in onOpenSocial:", error); 
        } 
    };

    return (
        <div
            className="modal fade"
            id={id}
            data-bs-keyboard="true"
            tabIndex="-1"
            aria-labelledby="sharesite-label"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-light border-light-gray-1 rounded-10">
                    <div className="modal-header bg-light ">
                        <div className="fs-header fw-bolder ps-4">
                            {translate("Share Site")}
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    {card && (
                        <div className="modal-body pt-4 pb-5 px-5">
                            <div className='px-4 py-3 rounded-10 bg-white d-flex align-items-center justify-content-between'>
                                <div>
                                    <i className="bi bi-link-45deg me-2" style={{fontSize: 20}}></i>{card.identifier}.{domain}
                                </div>
                                <div className='text-primary' style={{cursor: 'pointer'}} onClick={copyToClipboard}>{translate('Copy')}</div>
                            </div>
                            {auth.plan !== 'free' && (
                                <div className='mt-3 d-flex align-items-center justify-content-between px-4 py-3 rounded-10 bg-white'>
                                    <div className='d-flex align-items-center'>
                                        {qr && <img className="w-20 me-3" src={qr} />}
                                        <div>
                                            <div>{translate('Your business site')}</div>
                                            <div className='fs-sm'>{translate('QR Code')}</div>
                                        </div>
                                    </div>
                                    <div className='text-primary' style={{cursor: 'pointer'}}>
                                        <a href={`/download/qr?identifier=${card.identifier}`} className='text-decoration-none'>{translate('Download')}</a>
                                    </div>
                                </div>
                            )}
                            <div className='mt-4'>
                                <div className='my-4'>{translate('Share via')}</div>
                                <div onClick={() => shareCard('email',`mailto:?subject=${card.firstname+" "+card.lastname+" - "+card.job}&body=${protocol}://${card.identifier}.${domain}`)} className='d-flex align-items-center justify-content-between' style={{cursor: 'pointer'}}>
                                    <div className='d-flex align-items-center'>
                                        <SocialIcon
                                            className="me-3"
                                            color="#0072c6"
                                            icon={"envelope"}
                                        />
                                        <div>{translate('Share via Email')}</div>
                                    </div>
                                    <div><i className="bi bi-chevron-right" style={{fontSize: 20}}></i></div>
                                </div>
                                <div onClick={() =>shareCard('whatsapp',`https://api.whatsapp.com/send?text=${card.firstname+" "+card.lastname+"%0a"+card.job+"%0a"+protocol+"://"+card.identifier+"."+domain}`)} className='mt-3 d-flex align-items-center justify-content-between' style={{cursor: 'pointer'}}>
                                    <div className='d-flex align-items-center'>
                                        <SocialIcon
                                            className="me-3"
                                            color={
                                                socialsHelper()["whatsapp"].color
                                            }
                                            icon={"whatsapp"}
                                        />
                                        <div>{translate('Share via WhatsApp')}</div>
                                    </div>
                                    <div><i className="bi bi-chevron-right" style={{fontSize: 20}}></i></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}