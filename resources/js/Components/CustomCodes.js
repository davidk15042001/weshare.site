import React from 'react';
import { translate } from '@/Helpers';
import Input from './Input';
import Button from './Button';
import { FontAwesome } from 'react-web-vector-icons';
import IconButton from './IconButton';

export default function CustomCodes({className, customCodes, selectedSource, selectedCustomCode, onHandleSourceType, onHandleChange, onSave, onEdit, onRemove}) {
    return (
        <div className={className} style={{cursor: "pointer"}}>
            <div className="d-flex align-items-center justify-content-between mt-2">
                <div className="dropdown">
                    <button className="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        {selectedSource.label}
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        <li><a className="dropdown-item" href="#" onClick={() => onHandleSourceType({key: 'youtube', label: 'Youtube'})}>Youtube</a></li>
                        <li><a className="dropdown-item" href="#" onClick={() => onHandleSourceType({key: 'vimeo', label: 'Vimeo'})}>Vimeo</a></li>
                        <li><a className="dropdown-item" href="#" onClick={() => onHandleSourceType({key: 'iframe', label: 'iFrame'})}>iFrame</a></li>
                    </ul>
                </div>
            </div>
            <div className="mt-3">
                <Input
                    type="text"
                    name="title"
                    value={selectedCustomCode.title}
                    className="mb-2"
                    handleChange={onHandleChange} placeholder={translate("Title")}/>
                <Input
                    style={selectedSource.key === 'iframe' ? {display: 'block'} : {display: 'none'}}
                    multiline={true}
                    rows={5}
                    className="mb-2 h-10"
                    name="iframe"
                    value={selectedCustomCode.codes}
                    handleChange={onHandleChange} placeholder={translate("HTML Codes")}/>
                <Input
                    style={selectedSource.key !== 'iframe' ? {display: 'block'} : {display: 'none'}}
                    type="text"
                    name="url"
                    value={selectedCustomCode.codes}
                    handleChange={onHandleChange} placeholder={translate("URL")} className="mb-2"/>
            </div>
            <div className="d-flex justify-content-end">
                <Button onClick={onSave} type="button" className="btn btn-lg btn-primary fs-sm">
                    {typeof selectedCustomCode.id === "undefined" ? translate("Add Custom Code") : translate("Save Custom Code")}
                </Button>
            </div>
            {customCodes ? (
                <div className="mt-4">
                    {customCodes.map((c) => {
                            let icons = {iframe: 'code', youtube: 'youtube-play', vimeo: 'vimeo'};
                            return (
                                <div key={c.id} className="d-flex align-items-start justify-content-between mb-2">
                                    <div className="d-flex align-items-center">
                                        <div className="me-2"><FontAwesome name={icons[c.source]} color="#041E4F" size={25} /></div>
                                        <div className="fw-bold">
                                            {!c.title || c.title === '' ? translate('Untitled') : c.title}
                                        </div>
                                    </div>

                                    <div className="dropdown">
                                        <a
                                            href="#"
                                            role="button"
                                            id="serviceDropdown"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false">
                                            <IconButton width={20} height={20} icon="/assets/svg/ellipsis.svg" />
                                        </a>

                                        <ul
                                            className="dropdown-menu dropdown-menu-end list-group-flush rounded-5"
                                            aria-labelledby="serviceDropdown">
                                            <li
                                                className="list-group-item fs-reg d-flex align-items-center"
                                                role="button"
                                                onClick={() => onEdit(c)}>
                                                <FontAwesome name="edit" color="black" size={20} />
                                                <span className="ms-2">{translate("Edit Code")}</span>
                                            </li>
                                            <li
                                                className="list-group-item fs-reg"
                                                role="button"
                                                onClick={() => onRemove(c)}>
                                                <FontAwesome name="trash" color="black" size={20} />
                                                <span className="ms-2">{translate("Remove Code")}</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            );
                        }
                    )}
                </div>
            ) : null}
        </div>
    );
}