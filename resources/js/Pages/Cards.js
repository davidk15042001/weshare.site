import React, { useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, useForm, usePage } from '@inertiajs/inertia-react';
import { translate } from '@/Helpers';
import SearchBar from '@/Components/SearchBar';
import VCard from '@/Components/VCard';
import AddCard from '@/Components/AddCard';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Modal } from 'bootstrap';
import ShareSiteModal from '@/Components/ShareSiteModal';

export default function Cards(props) {
    const {get, post} = useForm();

    const { domain, protocol, auth } = usePage().props;
    const [cards, setCards] = useState(props.cards);
    const [shareCard, setShareCard] = useState(null);
    const [loading, setLoading] = useState(false); 
    
    // const addCard = () => {
    //     if(cards.length < auth.subscription.quantity) {
    //         post(route('cards.initcard'));
    //     } else {
    //         const swalWithBootstrapButtons = Swal.mixin({
    //             customClass: {
    //                 confirmButton: 'btn btn-danger mx-2',
    //                 cancelButton: 'btn btn-light mx-2'
    //             },
    //             buttonsStyling: false
    //         })
              
    //         swalWithBootstrapButtons.fire({
    //             title: translate('Maximum Number of Sites Reached'),
    //             html: "<p>"+translate('Upgrade your account to get more Sites!')+"</p> <p>"+translate('For just 3€ per site/month or 19€ per site/year, you can create and host additional sites.')+"</p>",
    //             icon: 'warning',
    //             showCancelButton: true,
    //             confirmButtonText: translate('Click here to upgrade now'),
    //             cancelButtonText: translate('Cancel'),
    //             reverseButtons: true,
    //             backdrop: 'swal2-backdrop-hide',
    //         }).then((result) => {
    //             if (result.isConfirmed) {
    //                 document.location.href = route('billing');
    //             }
    //         })
    //     }
        
    // }

    const addCard = () => {
        if (loading) return; // Prevent multiple calls if already loading
    
        if (cards.length < auth.subscription.quantity) {
            setLoading(true); // Set loading to true before making the request
            post(route('cards.initcard'), {}, {
                onSuccess: () => {
                    setLoading(false); // Reset loading after the request is successful
                },
                onError: () => {
                    setLoading(false); // Reset loading if the request fails
                }
            });
        } else {
            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                    confirmButton: 'btn btn-danger mx-2',
                    cancelButton: 'btn btn-light mx-2'
                },
                buttonsStyling: false
            });
    
            swalWithBootstrapButtons.fire({
                title: translate('Maximum Number of Sites Reached'),
                html: "<p>" + translate('Upgrade your account to get more Sites!') + "</p> <p>" + translate('For just 3€ per site/month or 19€ per site/year, you can create and host additional sites.') + "</p>",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: translate('Click here to upgrade now'),
                cancelButtonText: translate('Cancel'),
                reverseButtons: true,
                backdrop: 'swal2-backdrop-hide',
            }).then((result) => {
                if (result.isConfirmed) {
                    document.location.href = route('billing');
                }
            });
        }
    };

    const shareSite = (card) => {
        setShareCard(card);
        new Modal(document.getElementById("sharesite-modal")).show();
    }

    const openCard = (card) => {
        get(route("cards.edit", card.id));
        console.log('onclick openCard');
    }

    const editCard = (card) => {
        route('cards.edit', card.id);
        console.log('onclick editCard');
    }

    const openPreview = (card) => {
        //console.log('onclick openPreview');
        console.log(`${protocol}://${card.identifier}.${domain}`);
        window.open(`${protocol}://${card.identifier}.${domain}`);
    }

    const deleteCard = (card) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-danger mx-2',
                cancelButton: 'btn btn-light mx-2'
            },
            buttonsStyling: false
        })
          
        swalWithBootstrapButtons.fire({
            title: translate('Remove Card?'),
            text: '',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: translate('Remove'),
            cancelButtonText: translate('Cancel'),
            reverseButtons: true,
            backdrop: 'swal2-backdrop-hide',
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(route('cards.destroy', card.id)).then(({data}) => {
                    const newCards = cards.filter(c => c.id !== data.id);
                    setCards(newCards);
                });
            }
        })
    }

    return (
        <Authenticated>
            <Head title={translate('My V-Site Cards')} />

            <div className="container-fluid mt-8">
                <div className="row pb-10 pb-lg-0">
                    {auth.plan === 'pro' && (
                        <div className='col-lg-4 g-3 add-card'>
                            <AddCard onClick={addCard} width={300} height={180} />
                        </div>
                    )}
                    {cards.map(card => {
                        return (
                            <div className='col-lg-4 g-3' key={card.id}>
                                <VCard
                                    onClick={() => openCard(card)}
                                    onClickEdit={() => editCard(card)}
                                    onClickView={() => openPreview(card)}
                                    onClickRemove={() => deleteCard(card)}
                                    onClickShare={() => shareSite(card)}
                                    canDelete={cards.length > 1}
                                    width={300}
                                    height={180}
                                    details={card}
                                    editable={true} />
                            </div>
                        );
                    })}
                </div>
            </div>

            <ShareSiteModal id='sharesite-modal' card={shareCard} />
        </Authenticated>
    );
}