import React, { useEffect, useState } from 'react';
import Authenticated from '@/Layouts/Authenticated';
import { Head, useForm, usePage } from '@inertiajs/inertia-react';
import { translate, toast } from '@/Helpers';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import IconButton from '@/Components/IconButton';
import { Modal } from "bootstrap";
import Swal from "sweetalert2";
import { fontSize } from 'tailwindcss/defaultTheme';

export default function Contacts(props) {
    const {get} = useForm();

    const { domain, protocol } = usePage().props;
    const [contacts, setContacts] = useState(props.contacts);
    const [searchText, setSearchText] = useState('');
    const [sortCol, setSortCol] = useState('');
    const [isSortAsc, setIsSortAsc] = useState(false);

    const contactDetailsInit = {
        card_id: 0,
        name: '',
        company: '',
        jobTitle: '',
        email: '',
        phone:'',
        notes: ''
    }
    const [contactDetails, setContactDetails] = useState(contactDetailsInit);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        setContacts(props.contacts);
    }, [props.contacts])
    
    const onSearchContact = (e) => {
        console.log('search event', e);
        setSearchText(e.target.value);

        if (e.target.value.length === 0) {
            return setContacts(props.contacts);
        }
    
        let filtered = props.contacts.filter(contact => {
            const value = e.target.value.toLowerCase();
            const name = contact.name.toLowerCase();
            const email = contact.email.toLowerCase();
            return name.indexOf(value.toLowerCase()) > -1 || email.indexOf(value.toLowerCase()) > -1;
        });

        setContacts(filtered);
    }

    const onHandleContactDetailsChange = (event) => {
        setContactDetails({...contactDetails, [event.target.name]: event.target.value});
    }

    const onHandleSorting = (key) =>{
        setSortCol(`${key}_${!isSortAsc?'desc':'asc'}`);
        setIsSortAsc(!isSortAsc);
        const sorted = [...contacts].sort((a, b) => {
            const field = key === 'date' ? 'created_at' : key;
            return (
                a[field].toString().localeCompare(b[field].toString(), "en", {
                    numeric: true,
                }) * (isSortAsc ? 1 : -1)
            );
        });
        setContacts(sorted);
    }

    const onEditContact = contact => {
        setContactDetails({
            id: contact.id,
            card_id: contact.card_id,
            name: contact.name,
            company: contact.company,
            email: contact.email,
            phone: contact.phone,
            notes: contact.notes
        });
    }

    const onDownloadContact = contact => {
        window.open(`/contacts/${contact.id}/download`);
    }

    const onRemoveContact = contact => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-danger mx-2",
                cancelButton: "btn btn-light mx-2",
            },
            buttonsStyling: false,
        });

        swalWithBootstrapButtons
            .fire({
                title: translate("Remove Contact?"),
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
                    .delete(route("contacts.destroy", contact.id))
                    .then(({ data }) => {
                        const filtered = contacts.filter(c => c.id !== contact.id);
                        setContacts(filtered);
                    })
                    .catch((e) => {
                        toast(translate("Cannot Remove Contact"), "error");
                    });
                }
            });
    }

    const onSaveContact = () => {
        setSending(true);

        let modal = Modal.getInstance(document.getElementById("editcontact-modal"));

        axios
            .put(route("contacts.update", contactDetails.id), contactDetails)
            .then(({ data }) => {
                console.log('Updated Contact', data);
                setContactDetails(contactDetailsInit);

                const index = contacts.findIndex(contact => contact.id === contactDetails.id);
                const newContacts = [...contacts];
                newContacts[index] = data;
                setContacts(newContacts);

                toast(translate("Contact successfully updated."));
                
                modal.hide();
                setSending(false);
            })
            .catch((e) => {
                toast(translate("Cannot Save Contact"), "error");
                setSending(false);
            });
    }

    console.log('newcontacts', contacts)

    const ActionsComponent = ({contact}) => {
        return (
            <div className="d-flex align-items-center">
                <IconButton
                    dataBsToggle='modal'
                    dataBsTarget='#editcontact-modal'
                    onClick={() => onEditContact(contact)}
                    width={36}
                    height={36}
                    icon="/assets/svg/edit_dark.svg"
                    tooltip={translate('Edit Card')}
                />
                <IconButton
                    onClick={() => onDownloadContact(contact)}
                    width={22}
                    height={22}
                    icon="/assets/svg/download_dark.svg"
                    tooltip={translate('Download')}
                />
                <IconButton
                    onClick={() => onRemoveContact(contact)}
                    width={36}
                    height={36}
                    icon="/assets/svg/trash_dark.svg"
                    tooltip={translate('Remove')}
                />
            </div>
        )
    }

    const headers = [
        {key: 'name', label: translate('Name'), sortable: true},
        {key: 'company', label: translate('Company'), sortable: true},
        {key: 'email', label: translate('Email'), sortable: true},
        {key: 'phone', label: translate('Phone'), sortable: true},
        {key: 'notes', label: translate('Notes'), sortable: true},
        {key: 'date', label: translate('Date'), sortable: true},
        {key: 'action', label: translate('Actions'), sortable: false}
    ];

    const convertTimestamp = (isoString) => {
        const date = new Date(isoString);
      
        // Subtract 1 hour
        date.setHours(date.getUTCHours() - 1);
      
        // Manually format the date
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        const year = date.getUTCFullYear();
        const hours = String(date.getUTCHours()).padStart(2, "0");
        const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      
        return `${month}-${day}-${year} ${hours}:${minutes}`;
      };
      
    return (
        <Authenticated>
            <Head title={translate('Contacts')} />
            <div className="row m-0 pt-8">
                <div className="px-4 vh-none overflow-lg-scroll vh-lg-100 pt-4">
                    <div className='vh-100'>
                        <h3 className="mb-3">
                            {translate("Contacts")}
                        </h3>
                        <div className='my-4 d-flex align-items-center justify-content-between'>
                            <div><Input type="text" value={searchText} handleChange={onSearchContact} placeholder={translate("Search Name or Email")} /></div>
                            <a type="button" href='/contacts/export' className="btn bg-danger text-white">
                                <span className="d-none d-sm-inline">{translate('Export Contacts')}</span>
                                <span className="d-inline d-sm-none">{translate('Export')}</span>
                            </a>
                        </div>

                        <div className='d-none d-lg-flex pb-10  overflow-lg-scroll'>
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
                                <tbody style={{fontSize: '14px'}}>
                                    {contacts.map(contact => {
                                        return (
                                            <tr key={contact.id} >
                                                <td>{contact.name}</td>
                                                <td>{contact.company}</td>
                                                <td><a href={`mailto:${contact.email}`} className="text-primary text-decoration-none">{contact.email}</a></td>
                                                <td><a href={`tel:${contact.phone}`} className="text-primary text-decoration-none">{contact.phone}</a></td>
                                                <td>{contact.notes}</td>
                                                <td>{contact.datetime ? contact.datetime : convertTimestamp(contact.updated_at)}</td>
                                                <td><ActionsComponent contact={contact} /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className='d-block d-lg-none'>
                            {contacts.map(contact => {
                                return (
                                    <div key={contact.id} className='bg-white border rounded-10 p-4 mb-4'>
                                        <div><span className="fw-bold">{translate('Name')}</span>: {contact.name}</div>
                                        {contact.company && (<div><span className="fw-bold">{translate('Company')}</span>: {contact.company}</div>)}
                                        <div><span className="fw-bold">{translate('Email')}</span>: <a href={`mailto:${contact.email}`} className="text-primary text-decoration-none">{contact.email}</a></div>
                                        {contact.phone && (<div><span className="fw-bold">{translate('Phone')}</span>: <a href={`tel:${contact.phone}`} className="text-primary text-decoration-none">{contact.phone}</a></div>)}
                                        <div><span className="fw-bold">{translate('Notes')}</span>: {contact.notes}</div>
                                        <div><span className="fw-bold">{translate('Date')}</span>: {contact.datetime ? contact.datetime : convertTimestamp(contact.updated_at)}</div>
                                        <div><ActionsComponent contact={contact} /></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="modal fade"
                id="editcontact-modal"
                data-bs-keyboard="true"
                tabIndex="-1"
                aria-labelledby="editcontact-label"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content bg-light border-light-gray-1 rounded-10">
                        <div class="modal-header bg-light ">
                            <div className="fs-header fw-bolder">
                                {translate('Edit Contact')}
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
                                        onChange={onHandleContactDetailsChange}
                                        value={contactDetails.name}
                                        className="form-control me-1"
                                        name="name"
                                        placeholder={`${translate("Name")}*`}
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        onChange={onHandleContactDetailsChange}
                                        value={contactDetails.company}
                                        className="form-control"
                                        name="company"
                                        placeholder={`${translate("Company")}`}
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        onChange={onHandleContactDetailsChange}
                                        value={contactDetails.email}
                                        className="form-control"
                                        name="email"
                                        placeholder={`${translate("Email")}*`}
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        onChange={onHandleContactDetailsChange}
                                        value={contactDetails.phone}
                                        className="form-control"
                                        name="phone"
                                        placeholder={`${translate("Phone")}*`}
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        type="text"
                                        onChange={onHandleContactDetailsChange}
                                        value={contactDetails.notes}
                                        className="form-control"
                                        name="notes"
                                        placeholder={translate("Notes")}
                                    />
                                </div>
                                
                                <Button
                                    type="button"
                                    onClick={onSaveContact}
                                    className="btn bg-primary text-white px-4"
                                    disabled={sending ? true : false}>
                                    {translate(sending ? "Saving..." : "Save")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}