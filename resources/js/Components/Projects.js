import React from 'react';
import UploadImage from './UploadImage';
import Input from './Input';
import Button from './Button';
import IconButton from './IconButton';
import { FontAwesome } from "react-web-vector-icons";
import { translate } from '@/Helpers';

export default function Projects({
    className,
    projects,
    selectedProject,
    onHandleProjectImage,
    onHandleProjectChange,
    onSaveProject,
    onEditProject,
    onRemoveProject,
    onRemoveImage
}) {

    return (
        <div className={className}>
            <UploadImage
                width="100%"
                height="200px"
                hideCropping
                className="rounded-10"
                reset={selectedProject.attachment === ""}
                image={selectedProject.attachment}
                onHandleCropped={onHandleProjectImage}
                onRemove={() => {
                    onRemoveImage({
                        ...selectedProject,
                        attachment: "",
                    });
                }}
            />
            <Input
                type="text"
                name="title"
                value={selectedProject.title}
                handleChange={onHandleProjectChange}
                placeholder={translate("Project name")}
                className="mb-2"
            />
            <Input
                multiline={true}
                rows={5}
                className="mb-2 h-10"
                name="description"
                value={selectedProject.description}
                handleChange={onHandleProjectChange}
                placeholder={translate("Write Something here...")}
            />
            <Input
                type="text"
                name="company"
                value={selectedProject.company}
                handleChange={onHandleProjectChange}
                placeholder={translate("Client / Company")}
                className="mb-2"
            />
            <Input
                type="text"
                name="link"
                value={selectedProject.link}
                handleChange={onHandleProjectChange}
                placeholder={translate("Project URL")}
                className="mb-2"
            />
            <div className="row m-0 p-0">
                <div className="col m-0 p-0 me-1">
                    <Input
                        type="text"
                        name="month"
                        value={selectedProject.month}
                        handleChange={onHandleProjectChange}
                        placeholder={translate("Month")}
                        className="mb-2"
                    />
                </div>
                <div className="col m-0 p-0 ms-1">
                    <Input
                        type="text"
                        name="year"
                        value={selectedProject.year}
                        handleChange={onHandleProjectChange}
                        placeholder={translate("Year")}
                        className="mb-2"
                    />
                </div>
            </div>
            <div className="d-flex justify-content-end">
                <Button
                    onClick={onSaveProject}
                    type="button"
                    className="btn btn-lg btn-primary fs-sm">
                    {typeof selectedProject.id !== "undefined" ? translate("Save Project") : translate("Add Project")}
                </Button>
            </div>

            {projects ? (
                <div className="mt-4">
                    {projects.map(
                        (p) => {
                            return (
                                <div key={p.id} className="d-flex align-items-start justify-content-between m-auto mb-2">
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="bg-light rounded-10 me-3"
                                            src={p.attachment}
                                            style={{
                                                width: "80px",
                                                height: "80px",
                                                backgroundImage: `url('${p.attachment}')`,
                                                backgroundPosition: "center",
                                                backgroundRepeat: "no-repeat",
                                                backgroundSize: "cover",
                                            }}
                                        />
                                        <div className="fs-sm me-4">
                                            {p.link !==
                                                "" ? (
                                                    <a
                                                        href={p.link}
                                                        target="_blank"
                                                        className="text-decoration-none text-primary">
                                                        {p.title}
                                                    </a>
                                                ) : (
                                                    <div>{p.title} </div>
                                                )}
                                            <div className="text-black-400">
                                                {p.company}{" "}*{" "}{p.month}{" "}{p.year}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="dropdown">
                                        <a
                                            href="#"
                                            role="button"
                                            id="projectDropdown"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false">
                                            <IconButton
                                                width={20}
                                                height={20}
                                                icon="/assets/svg/ellipsis.svg"
                                            />
                                        </a>

                                        <ul
                                            className="dropdown-menu dropdown-menu-end list-group-flush rounded-5"
                                            aria-labelledby="projectDropdown"
                                        >
                                            <li
                                                className="list-group-item fs-reg d-flex align-items-center"
                                                role="button"
                                                onClick={() => onEditProject(p)}>
                                                <FontAwesome
                                                    name="edit"
                                                    color="black"
                                                    size={20} />
                                                <span className="ms-2">
                                                    {translate("Edit Project")}
                                                </span>
                                            </li>
                                            <li
                                                className="list-group-item fs-reg"
                                                role="button"
                                                onClick={() => onRemoveProject(p)}>
                                                    {/* This might be the problem */}
                                                <FontAwesome
                                                    name="trash"
                                                    color="black"
                                                    size={20} />
                                                <span className="ms-2">
                                                    {translate("Remove Project")}
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