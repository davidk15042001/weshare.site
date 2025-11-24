import React from 'react';
import { translate } from '@/Helpers';
import IconButton from './IconButton';
import Input from './Input';
import Button from './Button';
import { FontAwesome } from "react-web-vector-icons";

export default function Services({className, services, service, onHandleServiceChange, onSaveService, onEditService, onRemoveService}) {
    return (
        <div className={className}>
            <Input
                type="text"
                name="title"
                value={service.title}
                handleChange={onHandleServiceChange}
                placeholder={translate("Title")}
                className="mb-2"
            />
            <Input
                multiline={true}
                rows={5}
                className="mb-2 h-10"
                name="description"
                value={service.description}
                handleChange={onHandleServiceChange}
                placeholder={translate("Write Something here...")}
            />
            <div className="d-flex justify-content-end">
                <Button
                    onClick={onSaveService}
                    type="button"
                    className="btn btn-lg btn-primary fs-sm">
                    {typeof service.id === "undefined" ? translate("Add Service") : translate("Save Service")}
                </Button>
            </div>

            {services ? (
                <div className="mt-4">
                    {services.map(
                        (s) => {
                            return (
                                <div key={s.id} className="d-flex align-items-start justify-content-between mb-2">
                                    <div>
                                        <div className="fw-bold">{s.title}</div>
                                        <div className="fs-reg">{s.description}</div>
                                    </div>

                                    <div className="dropdown">
                                        <a
                                            href="#"
                                            role="button"
                                            id="serviceDropdown"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false">
                                            <IconButton
                                                width={20}
                                                height={20} icon="/assets/svg/ellipsis.svg" />
                                        </a>

                                        <ul
                                            className="dropdown-menu dropdown-menu-end list-group-flush rounded-5"
                                            aria-labelledby="serviceDropdown"
                                        >
                                            <li
                                                className="list-group-item fs-reg d-flex align-items-center"
                                                role="button"
                                                onClick={() =>onEditService(s)}>
                                                <FontAwesome
                                                    name="edit"
                                                    color="black"
                                                    size={
                                                        20
                                                    }
                                                />
                                                <span className="ms-2">
                                                    {translate(
                                                        "Edit Service"
                                                    )}
                                                </span>
                                            </li>
                                            <li
                                                className="list-group-item fs-reg"
                                                role="button"
                                                onClick={() => onRemoveService(s)}>
                                                <FontAwesome
                                                    name="trash"
                                                    color="black"
                                                    size={
                                                        20
                                                    }
                                                />
                                                <span className="ms-2">
                                                    {translate(
                                                        "Remove Service"
                                                    )}
                                                </span>
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