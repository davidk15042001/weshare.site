import React, { useEffect, useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, Link, useForm, usePage } from '@inertiajs/inertia-react';
import { translate, toast } from '@/Helpers';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import axios from "axios";
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import IconButton from '@/Components/IconButton';
import Checkbox from '@/Components/Checkbox';

export default function Team(props) {
    const {get} = useForm();
    
    const { auth, domain, protocol, } = usePage().props;
    const [cards, setCards] = useState(props.cards);
    const [searchText, setSearchText] = useState('');
    const [sortCol, setSortCol] = useState('');
    const [isSortAsc, setIsSortAsc] = useState(false);
    const [sending, setSending] = useState(false);
    const [bulkUploadDetails, setBulkUploadDetails] = useState({numOfSites: '', message: ''})
    
    const addSiteDetailsInit = {
        firstname: '',
        lastname: '',
        company: props.company ? props.company.company : '',
        jobTitle: '',
        phone: '',
        mobile: '',
        email: '',
        address:'',
        invitation: true,
        socials: {}
    }
    const [addSiteDetails, setAddSiteDetails] = useState(addSiteDetailsInit)

    const [sendingInviteTo, setSendingInviteTo] = useState(null);

    useEffect(() => {
        setCards(props.cards);
    }, [props.cards])

    useEffect(() => {
        document
            .getElementById("addsite-modal")
            .addEventListener("hidden.bs.modal", function (event) {
                setAddSiteDetails(addSiteDetailsInit)
            });
    });
    
    const onSearch = (e) => {
        console.log('search event', e);
        setSearchText(e.target.value);

        if (e.target.value.length === 0) {
            return setCards(props.cards);
        }
    
        let filtered = props.cards.filter(contact => {
            const value = e.target.value.toLowerCase();
            const name = contact.name.toLowerCase();
            return name.indexOf(value.toLowerCase()) > -1;
        });

        setCards(filtered);
    }

    const onHandleSorting = (key) =>{
        setSortCol(`${key}_${!isSortAsc?'desc':'asc'}`);
        setIsSortAsc(!isSortAsc);
        const sorted = [...cards].sort((a, b) => {
            const field = key === 'date' ? 'created_at' : key;
            return (
                a[field].toString().localeCompare(b[field].toString(), "en", {
                    numeric: true,
                }) * (isSortAsc ? 1 : -1)
            );
        });
        setCards(sorted);
    }

    const onSendInvation = (record) => {
        setSendingInviteTo(record.id);
        axios
            .post(route("team.invitation"), {id: record.user_id})
            .then(({ data }) => {
                toast(translate("Invitation successfully sent."));
                setSendingInviteTo(null);
            })
            .catch((e) => {
                toast(translate("Cannot send invitation"), "error");
                setSendingInviteTo(null);
            });
    }

    const onHandleAddSiteDetails = (event) => {
        setAddSiteDetails({
            ...addSiteDetails,
            [event.target.name]: event.target.name === 'invitation' ? event.target.checked : event.target.value,
        });
    }

    const onHandleAddSocials = (event) => {
        setAddSiteDetails({
            ...addSiteDetails,
            socials: {
                ...addSiteDetails.socials,
                [event.target.name]: event.target.value,
            }
        })
    }

    const onSaveSite = () => {
        setSending(true);

        let modal = Modal.getInstance(document.getElementById("addsite-modal"));

        if(addSiteDetails.id) {
            axios
            .put(route("teamsites.update", addSiteDetails.id), addSiteDetails)
            .then(({ data }) => {
                console.log('Updated Account', data);
                setAddSiteDetails(addSiteDetailsInit);

                const index = cards.findIndex(card => card.user_id === addSiteDetails.id);
                const newCards = [...cards];
                newCards[index] = data;
                setCards(newCards);

                toast(translate("Site successfully updated."));
                
                modal.hide();
                setSending(false);
            })
            .catch((e) => {
                toast(translate("Cannot Save Site"), "error");
                setSending(false);
            });
        } else {
            axios
            .post(route("teamsites.store"), addSiteDetails)
            .then(({ data }) => {
                setCards([...cards, data]);
                setAddSiteDetails(addSiteDetailsInit);
                toast(translate("New Site successfully added."));
                
                modal.hide();
                setSending(false);
            })
            .catch((e) => {
                toast(translate("Cannot Add Site"), "error");
                setSending(false);
            });
        }
    }

    const onHandleBulkDetails = (event) => {
        setBulkUploadDetails({
            ...bulkUploadDetails,
            [event.target.name]: event.target.value,
        });
    }

    const onSendRequest = () => {
        if(bulkUploadDetails.numOfSites <= 10) {
            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                    confirmButton: "btn btn-primary mx-2",
                },
                buttonsStyling: false,
            });
    
            return swalWithBootstrapButtons.fire({
                title: translate('Number of Sites should be greater than 10'),
                text: "",
                icon: "warning",
                confirmButtonText: translate("Okay"),
                backdrop: "swal2-backdrop-hide",
            });
        }

        setSending(true);
        
        let modal = Modal.getInstance(document.getElementById("bulkupload-modal"));

        axios
            .post(route("team.request.bulkupload"), bulkUploadDetails)
            .then(({ data }) => {
                setBulkUploadDetails({numOfSites: '', message: ''});
                toast(translate("Bulk Upload Instruction Email Successfully Sent."));
                
                modal.hide();
                setSending(false);
            })
            .catch((e) => {
                toast(translate("Cannot send request"), "error");
                setSending(false);
            });
    }

    const onOpenCard = (card) => {
        window.open(`${protocol}://${card.identifier}.${domain}`);
    }

    const onEditAccount = (card) => {
        setAddSiteDetails({
            id: card.user_id,
            firstname: card.contactDetails.firstname || '',
            lastname: card.contactDetails.lastname || '',
            company:  card.contactDetails.company || '',
            phone:  card.contactDetails.telephone || '',
            mobile:  card.contactDetails.cellphone || '',
            email:  card.uemail || '',
            address: card.contactDetails.address || '',
            socials: {},
        });
    }

    const onEditCard = (card) => {
        route('cards.edit', card.id);
    }

    const onRemove = (details) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-danger mx-2",
                cancelButton: "btn btn-light mx-2",
            },
            buttonsStyling: false,
        });

        swalWithBootstrapButtons
            .fire({
                title: translate("Remove Site?"),
                text: "",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: translate("Remove"),
                cancelButtonText: translate("Cancel"),
                reverseButtons: true,
                backdrop: "swal2-backdrop-hide",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    axios
                    .delete(route("teamsites.delete", details.user_id))
                    .then(({ data }) => {
                        const filtered = cards.filter(card => card.user_id !== details.user_id);
                        setCards(filtered);
                    })
                    .catch((e) => {
                        toast(translate("Cannot Remove Site"), "error");
                    });
                }
            });
    }

    const ActionsComponent = ({card}) => {
        return (
            <div className="d-flex align-items-center">
                {!card.email_verified_at && (
                    <div className="me-3">
                        {card.sent_invitation ? (
                            <span className='text-primary'>{translate('Sent Invitation')}</span>
                        ) : 
                            sendingInviteTo && sendingInviteTo === card.id ? (
                                <span className='text-primary'>{translate('Sending Invitation')}</span>
                            ) : (
                                <span className='text-decoration-underline text-primary' style={{cursor: 'pointer'}} onClick={() => onSendInvation(card)}>{translate('Send Invitation')}</span>
                            )
                        }
                    </div>
                )}
                <IconButton
                    onClick={() => onOpenCard(card)}
                    className="me-2"
                    width={22}
                    height={22}
                    icon="/assets/svg/globe_dark.svg"
                    tooltip={translate('Preview')}
                />
                <IconButton
                    dataBsToggle='modal'
                    dataBsTarget='#addsite-modal'
                    tooltip={translate('Edit Account')}
                    onClick={() => onEditAccount(card)}
                    className="me-1"
                    width={30}
                    height={30}
                    icon="/assets/svg/edit_account.svg"
                />
                <Link href={route("cards.edit", card.id)}>
                    <IconButton
                        //onClick={() => onEditCard(card)}
                        width={40}
                        height={40}
                        icon="/assets/svg/edit_dark.svg"
                        tooltip={translate('Edit Card')}
                    />
                </Link>
                {card.user_id !== auth.user.id ? (
                    <IconButton
                        onClick={() => onRemove(card)}
                        width={40}
                        height={40}
                        icon="/assets/svg/trash_dark.svg"
                        tooltip={translate('Remove')}
                    />
                ) : null}
            </div>
        )
    }

    const headers = [
        {key: 'name', label: translate('Name'), sortable: true},
        {key: 'email', label: translate('Email'), sortable: true},
        {key: 'phone', label: translate('Phone'), sortable: true},
        {key: 'identifier', label: translate('URL'), sortable: true},
        {key: 'action', label: translate('Action'), sortable: false}
    ];

    return (
        <Authenticated>
            <Head title={translate('Team Sites')} />
            <div className="row m-0 pt-8">
                <div className="px-4 vh-none vh-lg-100">
                    <div className='vh-100 overflow-lg-scroll'>
                        <h3 className="mb-3">
                            {translate("Team Sites")}
                        </h3>
                        <div className='my-4 d-flex align-items-center justify-content-between'>
                            <div><Input type="text" value={searchText} handleChange={onSearch} placeholder={translate("Search Name")} /></div>
                            <div className='d-flex align-items-center justify-content-between'>
                                <a data-bs-toggle="modal" data-bs-target="#addsite-modal" type="button" href='#' className="btn bg-primary text-white me-3"><i className='bi bi-plus'></i>{translate('Add Site')}</a>
                                <a data-bs-toggle="modal" data-bs-target="#bulkupload-modal" type="button" href='#' className="btn bg-danger text-white"><i className='bi bi-plus'></i>{translate('Bulk Upload')}</a>
                            </div>
                        </div>

                        <div className='d-none d-md-flex pb-10'>
                            <table className="table">
                                <thead>
                                    <tr>
                                        {headers.map(header => {
                                            return (
                                                <th key={header.key} scope="col">
                                                    <div id={header.key} className='d-flex align-items-center' onClick={() => onHandleSorting(header.key)} style={{cursor: header.sortable ? 'pointer' : 'default'}}>
                                                        {header.label}
                                                        {header.sortable && (
                                                            <div className='ms-2 fw-bold' style={{fontSize: '18px', fontWeight: 'bold'}}>
                                                                <i id='desc' className={`bi bi-arrow-up-short p-0 m-0 ${sortCol === `${header.key}_asc` ? 'text-primary' : 'text-secondary'}`}></i>
                                                                <i id='asc' className={`bi bi-arrow-down-short p-0 m-0 ${sortCol === `${header.key}_desc` ? 'text-primary' : 'text-secondary'}`}></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                </th>
                                            )
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {cards.map(card => {
                                        return (
                                            <tr key={card.id}>
                                                <td>{card.contactDetails.firstname} {card.contactDetails.lastname}</td>
                                                <td><a href={`mailto:${card.uemail}`} className="text-primary text-decoration-none">{card.uemail}</a></td>
                                                <td>
                                                    {typeof card.contactDetails.telephone !== 'undefined' ? (
                                                        <a href={`tel:${card.contactDetails.telephone}`} className="text-primary text-decoration-none">{card.contactDetails.telephone}</a>
                                                    ) : null}
                                                </td>
                                                <td><a href={`${protocol}://${card.identifier}.${domain}`} target='_blank' className="text-primary">{card.identifier}</a></td>
                                                <td><ActionsComponent card={card} /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className='d-block d-md-none'>
                            {cards.map(card => {
                                return (
                                    <div key={card.id} className='bg-white rounded-10 p-4 mb-4'>
                                        <div><span className="fw-bold">{translate('Name')}</span>: {card.name}</div>
                                        <div><span className="fw-bold">{translate('Email')}</span>: <a href={`mailto:${card.uemail}`} className="text-primary text-decoration-none">{card.uemail}</a></div>
                                        {card.contactDetails.telephone && (<div><span className="fw-bold">{translate('Phone')}</span>: <a href={`tel:${card.contactDetails.telephone}`} className="text-primary text-decoration-none">{card.contactDetails.phone}</a></div>)}
                                        <div><span className="fw-bold">{translate('URL')}</span>: {card.identifier}</div>
                                        <div><ActionsComponent card={card} /></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal fade"
                id="addsite-modal"
                data-bs-keyboard="true"
                tabIndex="-1"
                aria-labelledby="addsite-label"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content bg-light border-light-gray-1 rounded-10">
                        <div class="modal-header bg-light ">
                            <div className="fs-header fw-bolder">
                                {addSiteDetails.id ? translate('Edit Account') : translate("Add Site")}
                            </div>
                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <div className="mb-2 d-flex align-items-center justify-content-between">
                                    <input
                                        type="text"
                                        onChange={onHandleAddSiteDetails}
                                        value={addSiteDetails.firstname}
                                        className="form-control me-1"
                                        name="firstname"
                                        placeholder={`${translate("First name")}*`}
                                    />
                                    <input
                                        type="text"
                                        onChange={onHandleAddSiteDetails}
                                        value={addSiteDetails.lastname}
                                        className="form-control ms-1"
                                        name="lastname"
                                        placeholder={`${translate("Last name")}*`}
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        onChange={onHandleAddSiteDetails}
                                        value={addSiteDetails.company}
                                        className="form-control"
                                        name="company"
                                        placeholder={translate("Company Name")}
                                    />
                                </div>
                                {!addSiteDetails.id && (
                                    <div className="mb-2">
                                        <input
                                            type="text"
                                            onChange={onHandleAddSiteDetails}
                                            value={addSiteDetails.jobTitle}
                                            className="form-control"
                                            name="jobTitle"
                                            placeholder={`${translate("Job Title")}*`}
                                        />
                                    </div>
                                )}
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        onChange={onHandleAddSiteDetails}
                                        value={addSiteDetails.phone}
                                        className="form-control"
                                        name="phone"
                                        placeholder={translate("Office Number")}
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        onChange={onHandleAddSiteDetails}
                                        value={addSiteDetails.mobile}
                                        className="form-control"
                                        name="mobile"
                                        placeholder={translate("Mobile number")}
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        onChange={onHandleAddSiteDetails}
                                        value={addSiteDetails.email}
                                        className="form-control"
                                        name="email"
                                        placeholder={`${translate("Email")}*`}
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        onChange={onHandleAddSiteDetails}
                                        value={addSiteDetails.address}
                                        className="form-control"
                                        name="address"
                                        placeholder={translate("Address")}
                                    />
                                </div>

                                {!addSiteDetails.id && (
                                    <>
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                onChange={onHandleAddSocials}
                                                value={addSiteDetails.socials.facebook || ''}
                                                className="form-control"
                                                name="facebook"
                                                placeholder={translate("Facebook")}
                                            />
                                        </div>
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                onChange={onHandleAddSocials}
                                                value={addSiteDetails.socials.linkedin || ''}
                                                className="form-control"
                                                name="linkedin"
                                                placeholder={translate("Linkedin")}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                onChange={onHandleAddSocials}
                                                value={addSiteDetails.socials.whatsapp || ''}
                                                className="form-control"
                                                name="whatsapp"
                                                placeholder={translate("Whatsapp")}
                                            />
                                        </div>
                                    </>
                                )}

                                {!addSiteDetails.id && (
                                    <div className="mb-2">
                                        <label className="d-flex items-center">
                                            <Checkbox name="invitation" handleChange={onHandleAddSiteDetails} checked={addSiteDetails.invitation} />
                                            <div className="ms-2 text-black-400 lh-sm" style={{fontSize:'11px'}}>{translate('Would you like to automatically send an invitation link when creating this profile? Alternatively, you can choose to do this at a later time.')}</div>
                                        </label>
                                    </div>
                                )}
                                
                                <Button
                                    type="button"
                                    onClick={onSaveSite}
                                    className="btn bg-primary text-white px-4"
                                    disabled={sending ? true : false}>
                                    {translate(sending ? "Saving..." : addSiteDetails.id ? "Save" : "Add")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal fade"
                id="bulkupload-modal"
                data-bs-keyboard="true"
                tabIndex="-1"
                aria-labelledby="bulkupload-label"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content bg-light border-light-gray-1 rounded-10">
                        <div class="modal-header bg-light ">
                            <div className="fs-header fw-bolder">
                                {translate("Bulk Upload")}
                            </div>
                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div>
                                <div className="mb-3">{translate('If you have more than 10 sites you would like to create, we can bulk upload the sites for you. Fill out this form and we will send you an email to [:email] with instruction.', {email: auth.user.email})}</div>

                                <div className="mb-3">
                                    <input
                                        type="text"
                                        onChange={onHandleBulkDetails}
                                        value={bulkUploadDetails.numOfSites}
                                        className="form-control"
                                        name="numOfSites"
                                        placeholder={translate("Number of Sites you need")}
                                    />
                                </div>
                                <div className="mb-3">
                                    <textarea
                                        name="message"
                                        onChange={onHandleBulkDetails}
                                        value={bulkUploadDetails.message}
                                        rows={5}
                                        className="form-control"
                                        placeholder={translate('Message')}
                                    ></textarea>
                                </div>
                                <Button
                                    type="button"
                                    onClick={onSendRequest}
                                    className="btn bg-primary text-white"
                                    disabled={sending ? true : false}
                                >
                                    <i className="bi bi-send me-2"></i>
                                    {translate(sending ? "Sending..." : "Request Bulk Upload")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}