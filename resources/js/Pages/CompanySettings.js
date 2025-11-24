import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/inertia-react";
import { translate, toast, socials as socialsHelper } from "@/Helpers";
import Authenticated from "@/Layouts/Authenticated";
import Button from "@/Components/Button";
import ColorPicker from "@/Components/ColorPicker";
import Input from "@/Components/Input";
import SitePreview from "./SitePreview";
import MobileIcon from "@/svg/MobileIcon";
import DesktopIcon from "@/svg/DesktopIcon";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import "cropperjs/dist/cropper.css";

import CoverForm from "@/Components/CoverForm";
import UploadPhoto from "@/Components/UploadPhoto";
import UploadLogo from "@/Components/UploadLogo";
import Services from "@/Components/Services";
import Galleries from "@/Components/Galleries";
import Projects from "@/Components/Projects";
import Documents from "@/Components/Documents";
import CustomCodes from "@/Components/CustomCodes";
import GoogleReview from "@/Components/GoogleReview";
import ColorSettings from "@/Components/ColorSettings";
import Switch from "@/Components/Switch";

export default function CompanySettings(props) {
    const { auth } = usePage().props;
    const [processing, setProcessing] = useState(false);
    const [viewType, setViewType] = useState("desktop");
    const [scrollTop, setScrollTop] = useState(0);

    const initCompanySettingsSwitch = {
        cover: true,
        avatar: true,
        logo: true,
        services: true,
        socials: true,
        gallery: true,
        projects: true,
        documents: true,
        custom_codes: true,
        google_review: true,
        colors: true
    }
    const [companySettingsSwitch, setCompanySettingsSwitch] = useState(props.settings_switch ? props.settings_switch : initCompanySettingsSwitch);

    const initCompanySettings = {
        avatar: "",
        logo: "",
        cover: {src: '', thumbnail: '', type: 'photo'},
        socials: {},
        services: [],
        galleries: [],
        projects: [],
        documents: [],
        custom_codes: [],
        projects: [],
        settings: {
            button: {background: '#df2351', color: '#ffffff'},
        }
    };
    const [companySettings, setCompanySettings] = useState(props.settings ? props.settings : initCompanySettings);

    console.log('Props Setting Details', props.settings);
    console.log('Props Setting Details222', props.settings);

    const [covers, setCovers] = useState(props.covers);

    const LibraryTypes = {
        'photo': 'Photo',
        'video': 'Video',
    };

    const [coverSelectedType, setCoverSelectedType] = useState('upload');
    const [libraryType, setLibraryType] = useState('photo');
    const [searchedKeyword, setSearchedKeyword] = useState(translate('Business'));
    const [resultLibraries, setResultLibraries] = useState({});
    const [selectedLibrary, setSelectedLibrary] = useState(null);

    const [loadingGallery, setLoadingGallery] = useState(false);

    console.log('1')

    const initService = {
        title: "",
        description: "",
    };
    const [service, setService] = useState(initService);

    const initSocials = socialsHelper();

    const initProject = {
        attachment: "",
        title: "",
        description: "",
        company: "",
        link: "",
        month: "",
        year: "",
    };
    const [project, setProject] = useState(initProject);

    console.log('2')

    const codeTypes = {
        youtube: 'Youtube',
        vimeo: 'Vimeo',
        iframe: 'iFrame'
    }
    const initCustomCodeDetails = {title: '', codes: ''};

    const [customSourceType, setCustomSourceType] = useState({key: 'youtube', label: codeTypes.youtube});
    const [customCodesDetails, setCustomCodesDetails] = useState(initCustomCodeDetails);
    
    const [isModalPreview, setIsModalPreview] = useState(false);
    useEffect(() => {
        document
            .getElementById("preview_modal")
            .addEventListener("shown.bs.modal", function (event) {
                setIsModalPreview(true);
            });
        document
            .getElementById("preview_modal")
            .addEventListener("scroll", function (event) {
                setScrollTop(event.currentTarget.scrollTop);
            });
    }, []);

    useEffect(() => {
        axios.get(route('pexels.photos'), { params: {
                keyword: searchedKeyword,
                per_page: 10,
                page: 1
            }
        })
        .then(({ data }) => {
            setResultLibraries(data);
        });
    }, []);

    const onHandleSettingsSwitch = (name) => {
        setCompanySettingsSwitch({...companySettingsSwitch, [name]: !companySettingsSwitch[name]});
    }

    console.log('3')

    const onSelectCover = (library) => {
        setCompanySettings({ ...companySettings, cover: {
            src: library.url, 
            thumbnail:  library.thumbnail,
            type: library.type, 
        }});
    }

    const onSelectLibraryType = (type) => {
        if(type !== libraryType) setResultLibraries({});
        setLibraryType(type);

        let path = type === 'photo' ? 'pexels.photos' : 'pexels.videos';

        axios.get(route(path), { params: {
                keyword: searchedKeyword,
                per_page: 10,
                page: 1
            }
        })
        .then(({ data }) => {
            setResultLibraries(data);
        });
    }

    const handleSearchPhoto = (e) => {
        setSearchedKeyword(e.target.value);
        if(e.target.value.length < 1) setResultLibraries({});

        if(e.target.value.length > 2) {
            let path = libraryType === 'photo' ? 'pexels.photos' : 'pexels.videos';

            axios.get(route(path), { params: {
                    keyword: e.target.value,
                    per_page: 10,
                    page: 1
                }
            })
            .then(({ data }) => {
                setResultLibraries(data);
            });
        }
    }

    const loadMorePhotos = (page) => {
        let path = libraryType === 'photo' ? 'pexels.photos' : 'pexels.videos';

        axios.get(route(path), { params: {
                keyword: searchedKeyword,
                per_page: 10,
                page: page
            }
        })
        .then(({ data }) => {
            let response = {...data};

            if(libraryType === 'photo') {
                response.photos = [...resultLibraries.photos, ...data.photos];
            } else {
                response.videos = [...resultLibraries.videos, ...data.videos];
            }
            setResultLibraries(response);
        });
    }

    const onClickLibrary = (library) => {
        console.log('onClickLibrary library', library);
        setSelectedLibrary(library);
        let src = '';
        let thumbnail = '';
        if(libraryType === 'photo') {
            src = library.src.landscape;
        } else {
            const sorted = library.video_files.sort((a, b) => {
                return a.width.toString().localeCompare(b.width.toString(), "en", {numeric: true}) * -1;
            });
            src = sorted[0].link;
            thumbnail = library.image;
            console.log('onClickLibrary thumbnail', thumbnail);
        }
        onHandleCoverChange(src, thumbnail);
    }

    const onHandleCoverChange = (src, thumbnail = '') => {
        setCompanySettings({ ...companySettings, cover: {
            src,
            thumbnail: thumbnail,
            type: libraryType
        }});
    }

    const onSaveCover = () => {
        if (coverSelectedType === 'color') {
            onHandleCoverChange('');
        }
        if (coverSelectedType === 'gallery' && companySettings.cover.src !== '') {
            axios
            .post(route("card.covers.store"), {
                cover: companySettings.cover.src,
                thumbnail: companySettings.cover.thumbnail,
                type: libraryType,
                enterprise: true
            })
            .then(({ data }) => {
                setCovers([data, ...covers]);
            });
        }

        setSearchedKeyword('');
        setCoverSelectedType('upload');
        setLibraryType('photo');
        setResultLibraries({});
    }

    const onUploadCover = (acceptedFiles) => {
        let done = function (url) {
            onHandleCoverChange(url);
            axios
                .post(route("card.covers.store"), { cover: url, enterprise: true })
                .then(({ data }) => {
                    setCovers([data, ...covers]);
                    onHandleCoverChange(data.url);
                    Modal.getOrCreateInstance(document.getElementById("cover_modal")).hide();
                });
        };

        let reader = new FileReader();
        reader.readAsDataURL(acceptedFiles[0]);
        reader.onload = function (event) {
            done(reader.result);
        };
    };

    const onHandleDeleteCover = (cover) => {
        showConfirmation(translate("Remove Cover?"), null, () => {
            
        });
    };
    const {
        getRootProps: getRootCoverProps,
        getInputProps: getInputCoverProps,
    } = useDropzone({
        onDrop: onUploadCover,
        multiple: false,
        accept: { "image/png": [".png", ".jpg", ".jpeg"] },
    });

    const onHandleCardImage = (name, image) => {
        setCompanySettings({ ...companySettings, [name]: image });
    };

    const onRemoveImage = (name) => {
        let message = "";
        switch (name) {
            case "avatar":
                message = translate("Remove profile photo?");
                break;
            case "logo":
                message = translate("Remove brand logo?");
                break;
            default:
                break;
        }
        showConfirmation(message, null, () => {
            onHandleCardImage(name, null);
        });
    };

    const onHandleServiceChange = (event) => {
        setService({ ...service, [event.target.name]: event.target.value });
    };

    const onSaveService = () => {
        if (typeof service.id === "undefined") {
            setCompanySettings({
                ...companySettings, 
                services: [
                    {
                        id: companySettings.services.length > 0 ? companySettings.services[0]['id'] + 1 : 1,
                        ...service
                    },
                    ...companySettings.services
                ]});
        } else {
            let filtered = companySettings.services.filter((s) => s.id !== service.id);
            setCompanySettings({ ...companySettings, services: [service, ...filtered] });
        }
        setService(initService);
    };

    const onEditService = (service) => {
        setService(service);
    };

    const onRemoveService = (service) => {
        showConfirmation(translate("Remove Service?"), null, () => {
            const filtered = companySettings.services.filter(
                (s) => s.id !== service.id
            );
            setCompanySettings({ ...companySettings, services: filtered});
            setService(initService);
        });
    };

    console.log('4')


    const onHandleSocialChange = (event) => {
        if(event.target.name === 'whatsapp' || event.target.name === 'skype') {
            if (event.target.value === ''){
                let newSocials = { ...socials };
                delete newSocials[event.target.name];
                setCompanySettings({ ...companySettings, socials: newSocials});
            } else {
                setCompanySettings({ ...companySettings, socials: {...companySettings.socials, [event.target.name]: event.target.value}});
            }
            return ;
        }

        const base = initSocials[event.target.name].placeholder;
        const splitString = base !== '' ? event.target.value.split(base) : [];

        if (event.target.value === '' || splitString.length <= 1 || (splitString.length > 1 && splitString[1] === '')) {
            let newSocials = { ...socials };
            delete newSocials[event.target.name];
            setCompanySettings({ ...companySettings, socials: newSocials});
        } else {
            if (event.target.name === 'website') {
                let value = event.target.value
                    .replace('http://', '')
                    .replace('https://', '');

                setCompanySettings({ ...companySettings, socials: {...companySettings.socials, [event.target.name]: value}});
            } else {
                setCompanySettings({ ...companySettings, socials: {...companySettings.socials, [event.target.name]: event.target.value}});
            }
        }
    };

    const onHandleGallery = (image) => {
        setCompanySettings({
            ...companySettings, 
            galleries: [
                {
                    id: companySettings.galleries.length > 0 ? companySettings.galleries[0]['id'] + 1 : 1,
                    url:image
                },
                ...companySettings.galleries
            ]});
    }

    const onRemoveGallery = (image) => {
        showConfirmation(translate("Remove This Image?"), null, () => {
            const filtered = companySettings.galleries.filter((g) => g.id !== image.id);
            setCompanySettings({ ...companySettings, galleries: filtered });
        });
    }

    const onHandleProjectChange = (event) => {
        setProject({ ...project, [event.target.name]: event.target.value });
    };

    const onHandleProjectImage = (image) => {
        setProject({ ...project, attachment: image });
    };

    const onSaveProject = () => {
        if (typeof project.id === "undefined") {
            setCompanySettings({
                ...companySettings,
                projects: [
                    {
                        id: companySettings.projects.length > 0 ? companySettings.projects[0]['id'] + 1 : 1,
                        ...project
                    },
                    ...companySettings.projects,
                ]});
        } else {
            let filtered = companySettings.projects.filter((p) => p.id !== project.id);
            setCompanySettings({ ...companySettings, projects: [project, ...filtered] });
        }
        setProject(initProject);
    };

    console.log('food')

    const onEditProject = (project) => {
       setProject(project);
    };

    const onRemoveProject = (project) => {
        showConfirmation(translate("Remove Project?"), null, () => {
            const filtered = companySettings.projects.filter((p) => p.id !== project.id);
            setCompanySettings({ ...companySettings, projects: filtered });
        });
    };

    const onAddDocument = (file) => {
        console.log('File', file);
        let formData = new FormData();
        formData.append("file", file[0]);
        formData.append("title", file[0].name);

        axios
            .post(route("company.settings.document.store"), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then(({ data }) => {
                console.log('Company Documents data', data);
                const newDocuments = [...companySettings.documents, data];
                setCompanySettings({...companySettings, documents: newDocuments});
            });
    };
    
    const onRemoveDocument = (document) => {
        const filtered = companySettings.documents.filter((d) => d.id !== document.id);
        setCompanySettings({...companySettings, documents: filtered});
    };

    const onHandleCustomCodesChange = (event) => {
        const name = event.target.name === 'iframe' || event.target.name === 'url' ? 'codes' : event.target.name;
        setCustomCodesDetails({ ...customCodesDetails, [name]: event.target.value });
    };

    const onSaveCustomCode = () => {
        if (typeof customCodesDetails.id === "undefined") {
            setCompanySettings({ ...companySettings, custom_codes: [
                {
                    id: companySettings.custom_codes.length > 0 ? companySettings.custom_codes[0]['id'] + 1 : 1,
                    source: customSourceType.key, 
                    ...customCodesDetails
                },
                ...companySettings.custom_codes, 
            ]});
        } else {
            let filtered = companySettings.custom_codes.filter((c) => c.id !== customCodesDetails.id);
            setCompanySettings({ ...companySettings, custom_codes: [{...customCodesDetails, source: customSourceType.key}, ...filtered] });
        }
        setCustomCodesDetails(initCustomCodeDetails);
    };

    const onEditCustomCode = (code) => {
        setCustomCodesDetails({id: code.id, title: code.title, codes: code.codes});
        setCustomSourceType({key: code.source, label: codeTypes[code.source]});
    };

    const onRemoveCustomCode = (code) => {
        showConfirmation(translate("Remove Custom Code?"), null, () => {
            const filtered = companySettings.custom_codes.filter((c) => c.id !== code.id);
            setCompanySettings({ ...companySettings, custom_codes: filtered });
            setCustomCodesDetails(initCustomCodeDetails);
        });
    };

    const changeToMobile = () => {
        setViewType("mobile");
    };

    const changeToDesktop = () => {
        setViewType("desktop");
    };

    const showConfirmation = (message, cancelledCallback, callback) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-danger mx-2",
                cancelButton: "btn btn-light mx-2",
            },
            buttonsStyling: false,
        });

        swalWithBootstrapButtons
            .fire({
                title: message,
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
                    callback();
                } else {
                    cancelledCallback();
                }
            });
    };

    const onHandleSettingsChange = (name, value) => {
        console.log('Name', name);
        console.log('Color', value);
        if(name === 'background' || name === 'color') {
            setCompanySettings({ ...companySettings, settings: {
                ...companySettings.settings, 
                button: {...companySettings.settings.button, [name]: value}
            }});
        } else {
            setCompanySettings({ ...companySettings, settings: {...companySettings.settings, [name]: value }});
        }
    };

    const onHandleCoverColor = (color) => {
        onHandleSettingsChange('cover_overlay', color);
    };

    const onHandleGoogleReview = (place) => {
        setCompanySettings({ ...companySettings, settings: {...companySettings.settings, place_id: place.place_id, place_name: place.name} });
    }

    const onClickSave = () => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-primary mx-2",
                denyButton: "btn btn-primary mx-2",
            },
            buttonsStyling: false,
        });
        swalWithBootstrapButtons
            .fire({
                title: translate("Apply this to existing users?"),
                text: "",
                icon: "",
                showCloseButton: true,
                showDenyButton: true,
                denyButtonText: translate("No"),
                confirmButtonText: translate("Yes, Apply"),
                reverseButtons: true,
                backdrop: "swal2-backdrop-hide",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    applyToExistingUsersConfirmation();
                } else if(result.isDenied) {
                    onSaveCard({apply_to_existing_users: false});
                }
            });
    }

    const applyToExistingUsersConfirmation = () => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-danger mx-2",
                denyButton: "btn btn-primary mx-2",
            },
            buttonsStyling: false,
        });
        swalWithBootstrapButtons
            .fire({
                title: translate("Are you sure you want to apply the new settings to all existing users?"),
                text: translate('(This action will overwrite the data for all users)'),
                icon: "warning",
                showCloseButton: true,
                showDenyButton: true,
                denyButtonText: translate("Cancel"),
                confirmButtonText: translate("Proceed"),
                reverseButtons: true,
                backdrop: "swal2-backdrop-hide",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    onSaveCard({apply_to_existing_users: true});
                }
            });
    }

    const onSaveCard = (props) => {
        setProcessing(true);

        const payload = {
            ...props,
            details: companySettings,
            settings: companySettingsSwitch
        }

        console.log('Save Enterprise Payload', payload);

        axios.post(route('company.settings.store'), payload)
            .then(({data}) => {
                console.log('settings result data', data);
                toast(translate("Settings Saved!"));
                setProcessing(false);
            })
            .catch(e => {
                setProcessing(false);
            });
    };

    console.log('8')
    
    return (
        <Authenticated>
            <div className="container-fluid m-0 px-0 p-0 border-start border-light">
                <div className="row m-0 p-0">
                    <div className="col-lg-4 m-0 px-0 pb-0 pt-8 pt-lg-0 position-relative vh-100">
                        <div
                            className="position-absolute bg-white border-top px-3 pt-3 pb-4 w-100"
                            style={{ zIndex: 99, bottom: 0 }}
                        >
                            <div>
                                <Button
                                    onClick={onClickSave}
                                    processing={processing}
                                    type="button"
                                    padding={12}
                                    className="btn btn-lg btn-primary fs-sm w-100">
                                    {translate("Save")}
                                </Button>
                            </div>
                            <div className="d-flex d-lg-none pt-2">
                                <Button
                                    type="button"
                                    dataToggle="modal"
                                    dataTarget="#preview_modal"
                                    padding={12}
                                    className="btn btn-lg btn-danger fs-sm w-100">
                                    <MobileIcon
                                        width={20}
                                        height={20}
                                        className="svg-color-white me-2"
                                    />
                                    {translate("Preview")}
                                </Button>
                            </div>
                        </div>
                        <div className="h-100 pb-6 pb-lg-8 pt-8 bg-white overflow-scroll">
                            <form>
                                <div className="text-black fw-bold py-1">
                                    <div className="mx-4 mb-2">
                                        <Switch name="cover" label={translate("Cover Photo")} checked={companySettingsSwitch.cover} onHandleChange={() => onHandleSettingsSwitch('cover')} />
                                    </div>
                                    <div className="pb-4">
                                        <CoverForm
                                            className="row m-0 p-0 px-3 px-lg-4"
                                            covers={covers}
                                            selectedCover={companySettings.cover.src}
                                            dataTarget="#cover_modal"
                                            overlayColor={companySettings.settings.cover_overlay || '#fff'}
                                            auth={auth}
                                            onSelectCover={(cover) => onSelectCover(cover)}
                                            onHandleDeleteCover={(cover) => onHandleDeleteCover(cover)} />
                                        <hr className="bg-black-600 my-1 mt-3" />
                                        <div className="row m-0 p-0 px-3 px-lg-4 pb-3">
                                            <div className="col-6 g-2 h-90 lh-sm">
                                                <Switch name="avatar" label={translate("Profile Photo")} checked={companySettingsSwitch.avatar} onHandleChange={() => onHandleSettingsSwitch('avatar')} />
                                                <UploadPhoto
                                                    className="fs-sm h-90 lh-sm mt-2"
                                                    src={companySettings.avatar}
                                                    onHandleCardImage={(image) => onHandleCardImage("avatar", image)}
                                                    onRemoveImage={() => onRemoveImage("avatar")} />
                                            </div>
                                            <div className="col-6 g-2 h-90 lh-sm">
                                                <Switch name="logo" label={translate("Brand Logo")} checked={companySettingsSwitch.logo} onHandleChange={() => onHandleSettingsSwitch('logo')} />
                                                <UploadLogo
                                                    className="fs-sm h-90 lh-sm mt-2"
                                                    src={companySettings.logo}
                                                    onHandleCardImage={(image) => onHandleCardImage("logo", image)}
                                                    onRemoveImage={() => onRemoveImage("logo")} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-black fw-bold py-1">
                                    <div className="mx-4 mb-3">
                                        <Switch name="socials" label={translate("Social Media")} checked={companySettingsSwitch.socials} onHandleChange={() => onHandleSettingsSwitch('socials')} />
                                    </div>
                                    <div className="p-0 px-3 px-lg-4 pb-4">
                                        {Object.keys(initSocials).map(
                                            (social) => {
                                                return (
                                                    <Input
                                                        key={social}
                                                        type="text"
                                                        name={social}
                                                        value={companySettings.socials && typeof companySettings.socials[social] !== "undefined" ? companySettings.socials[social] : initSocials[social].placeholder}
                                                        handleChange={onHandleSocialChange}
                                                        placeholder={translate(social)}
                                                        className="mb-2"
                                                    />
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                <div className="text-black fw-bold py-1">
                                    <div className="mx-4 mb-3">
                                        <Switch name="services" label={translate("Services")} checked={companySettingsSwitch.services} onHandleChange={() => onHandleSettingsSwitch('services')} />
                                    </div>
                                    <div className="position-relative" style={{position: 'relative'}}>
                                        <Services
                                            className={`p-0 px-3 px-lg-4 pb-3`}
                                            service={service}
                                            services={companySettings.services}
                                            onHandleServiceChange={onHandleServiceChange}
                                            onSaveService={onSaveService}
                                            onEditService={(s) => onEditService(s)}
                                            onRemoveService={(s) => onRemoveService(s)} />
                                    </div>
                                </div>

                                <div className="text-black fw-bold py-1">
                                    <div className="mx-4 mb-3">
                                        <Switch name="gallery" label={translate("Gallery")} checked={companySettingsSwitch.gallery} onHandleChange={() => onHandleSettingsSwitch('gallery')} />
                                    </div>
                                    <div className="position-relative" style={{position: 'relative'}}>
                                        <Galleries 
                                            className={`p-0 px-3 px-lg-4 pb-4`}
                                            galleries={companySettings.galleries}
                                            loading={loadingGallery}
                                            blurred={false}
                                            onHandleGallery={onHandleGallery}
                                            onRemoveGallery={gallery => onRemoveGallery(gallery)} />
                                    </div>
                                </div>

                                <div className="text-black fw-bold py-1">
                                    <div className="mx-4 mb-3">
                                        <Switch name="projects" label={translate("Projects")} checked={companySettingsSwitch.projects} onHandleChange={() => onHandleSettingsSwitch('projects')} />
                                    </div>
                                    <div className="position-relative pb-3" style={{position: 'relative'}}>
                                        <Projects 
                                            className={`p-0 px-3 px-lg-4`}
                                            projects={companySettings.projects}
                                            selectedProject={project}
                                            onHandleProjectImage={onHandleProjectImage}
                                            onHandleProjectChange={onHandleProjectChange}
                                            onSaveProject={onSaveProject}
                                            onEditProject={p => onEditProject(p)}
                                            onRemoveProject={p => onRemoveProject(p)} />
                                    </div>
                                </div>
                                
                                <div className="text-black fw-bold py-1">
                                    <div className="mx-4 mb-3">
                                        <Switch name="documents" label={translate("Documents")} checked={companySettingsSwitch.documents} onHandleChange={() => onHandleSettingsSwitch('documents')} />
                                    </div>
                                    <div className="position-relative" style={{position: 'relative'}}>
                                        <Documents
                                            className={`p-0 px-3 px-lg-4 pb-4`}
                                            documents={companySettings.documents}
                                            onHandleFile={file => onAddDocument(file)}
                                            onRemoveDocument={onRemoveDocument} />
                                    </div>
                                </div>
                                
                                <div className="text-black fw-bold py-1">
                                    <div className="mx-4 mb-3">
                                        <div>
                                            <Switch name="custom_codes" label={translate("Add Videos and Custom Codes")} checked={companySettingsSwitch.custom_codes} onHandleChange={() => onHandleSettingsSwitch('custom_codes')} />
                                            <span>{'(e.g. '}</span>
                                            <span onClick={(e) => {
                                                window.open('https://calendly.com/');
                                                e.stopPropagation();
                                            }} style={{cursor: 'pointer'}} className="text-decoration-underline">
                                                Calendly,{' '}
                                            </span>
                                            <span>{translate('Certificates')} {')'}</span>
                                        </div>
                                    </div>
                                        <div className="position-relative" style={{position: 'relative'}}>
                                            <CustomCodes
                                                className={`p-0 px-3 px-lg-4 pb-4`}
                                                selectedSource={customSourceType}
                                                customCodes={companySettings.custom_codes}
                                                selectedCustomCode={customCodesDetails}
                                                onHandleSourceType={type => setCustomSourceType(type)}
                                                onHandleChange={onHandleCustomCodesChange}
                                                onSave={onSaveCustomCode}
                                                onEdit={onEditCustomCode}
                                                onRemove={onRemoveCustomCode} />
                                        </div>
                                </div>

                                <div className="text-black fw-bold py-1">
                                    <div className="mx-4 mb-3">
                                        <Switch name="google_review" label={translate("Google Review")} checked={companySettingsSwitch.google_review} onHandleChange={() => onHandleSettingsSwitch('google_review')} />
                                    </div>
                                    <GoogleReview
                                        className="p-0 px-3 px-lg-4 pb-8 pb-lg-4 fs-sm"
                                        selectedPlace={{
                                            placeId: companySettings.settings.place_id || '',
                                            placeName: companySettings.settings.place_name || ''
                                        }}
                                        onHandleChange={place => onHandleGoogleReview(place)} />
                                </div>

                                <div className="text-black fw-bold py-1">
                                    <div className="mx-4 mb-2">
                                        <Switch name="colors" label={translate("Colors")} checked={companySettingsSwitch.colors} onHandleChange={() => onHandleSettingsSwitch('colors')} />
                                    </div>
                                    <ColorSettings
                                        className="mx-3 pb-4"
                                        settings={{
                                            qrColor: companySettings.settings.qr_color ? companySettings.settings.qr_color : '#df2351',
                                            background: companySettings.settings.button.background ? companySettings.settings.button.background : '#df2351',
                                            color: companySettings.settings.button.color ? companySettings.settings.button.color : '#fff'
                                        }}
                                        onHandleChangeQRColor={c => onHandleSettingsChange("qr_color", c)}
                                        onHandleChangeButtonBgColor={c => onHandleSettingsChange("background", c)}
                                        onHandleChangeButtonTextColor={c => onHandleSettingsChange("color", c)} />
                                </div>
                            </form>
                        </div>
                    </div>
                    <div
                        className="d-none d-lg-inline-block col-lg-8 p-0"
                        style={{ height: "100vh" }}
                    >
                        <div className="h-10 bg-white d-flex align-items-center justify-content-between px-4">
                            <div className="d-flex w-10">
                                <div>
                                    <Button
                                        onClick={changeToMobile}
                                        type="button"
                                        className={`${
                                            viewType === "mobile"
                                                ? "btn-primary"
                                                : "btn-light"
                                        } btn btn-sm px-3 rounded-top-left-10 rounded-bottom-left-10`}
                                    >
                                        <MobileIcon
                                            width={15}
                                            height={15}
                                            className={
                                                viewType === "mobile"
                                                    ? "svg-color-white"
                                                    : "svg-color-primary"
                                            }
                                        />
                                    </Button>
                                </div>
                                <div>
                                    <Button
                                        onClick={changeToDesktop}
                                        type="button"
                                        className={`${
                                            viewType === "desktop"
                                                ? "btn-primary"
                                                : "btn-light"
                                        } btn btn-sm px-3 rounded-top-right-10 rounded-bottom-right-10`}
                                    >
                                        <DesktopIcon
                                            width={15}
                                            height={15}
                                            className={
                                                viewType === "desktop"
                                                    ? "svg-color-white"
                                                    : "svg-color-primary"
                                            }
                                        />
                                    </Button>
                                </div>
                            </div>

                            <div className="w-10"></div>
                        </div>
                        <div className="h-90 overflow-scroll" 
                            onScroll={(event) => {
                                setScrollTop(event.currentTarget.scrollTop);
                            }}>
                            <div className="d-flex justify-content-center overflow-hidden">
                                <SitePreview
                                    view={viewType}
                                    socials={companySettings.socials || {}}
                                    card={{
                                        ...props.card,
                                        cover: companySettings.cover.src,
                                        cover_type: companySettings.cover.type,
                                        cover_thumbnail: companySettings.cover.thumbnail,
                                        avatar: companySettings.avatar,
                                        logo: companySettings.logo,
                                    }}
                                    projects={companySettings.projects}
                                    services={companySettings.services}
                                    documents={companySettings.documents}
                                    customCodes={companySettings.custom_codes}
                                    galleries={companySettings.galleries}
                                    settings={{
                                        placeId: companySettings.settings.place_id ? companySettings.settings.place_id : "",
                                        placeName: companySettings.settings.place_name ? companySettings.settings.place_name : "",
                                        cover_overlay: companySettings.settings.cover_overlay ? companySettings.settings.cover_overlay : "#df2351",
                                        color: companySettings.settings.button.color ? companySettings.settings.button.color : "#ffffff",
                                        background: companySettings.settings.button.background ? companySettings.settings.button.background : "#df2351",
                                        qrColor: companySettings.settings.qr_color ? companySettings.settings.qr_color : "#df2351",
                                        contactButtons: [],
                                        metaTitle: '',
                                        metaDescription: '',
                                        imprint: '',
                                        privacyPolicy: ''
                                    }}
                                    showContactButton={(scrollTop >= 250)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="d-lg-none modal preview-modal fade"
                    id="preview_modal"
                    aria-labelledby="preview-modalLabel"
                    aria-hidden="true"
                >
                    <div className="d-lg-none modal-dialog modal-fullscreen">
                        <div className="modal-content bg-light">
                            <div className="w-100">
                                {isModalPreview && (
                                    <SitePreview
                                        width="100%"
                                        preview={true}
                                        card={{
                                            ...props.card,
                                            cover: companySettings.cover.src,
                                            cover_type: companySettings.cover.type,
                                            cover_thumbnail: companySettings.cover.thumbnail,
                                            avatar: companySettings.avatar,
                                            logo: companySettings.logo,
                                        }}
                                        socials={companySettings.socials}
                                        projects={companySettings.projects}
                                        services={companySettings.services}
                                        documents={companySettings.documents}
                                        customCodes={companySettings.customCodes}
                                        galleries={companySettings.galleries}
                                        settings={{
                                            placeId: companySettings.settings.place_id ? companySettings.settings.place_id : "",
                                            placeName: companySettings.settings.place_name ? companySettings.settings.place_name : "",
                                            cover_overlay: companySettings.settings.cover_overlay ? companySettings.settings.cover_overlay : "#df2351",
                                            color: companySettings.settings.button.color ? companySettings.settings.button.color : "#ffffff",
                                            background: companySettings.settings.button.background ? companySettings.settings.button.background : "#df2351",
                                            qrColor: companySettings.settings.qr_color ? companySettings.settings.qr_color : "#df2351",
                                            contactButtons: [],
                                            metaTitle: '',
                                            metaDescription: '',
                                            imprint: '',
                                            privacyPolicy: ''
                                        }}
                                        showContactButton={(scrollTop >= 250)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="modal fade"
                    id="cover_modal"
                    data-bs-keyboard="true"
                    tabIndex="-1"
                    aria-labelledby="cover-label"
                    aria-hidden="true"
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="modal-content bg-light border-light-gray-1 rounded-10" style={{position: 'relative'}}>
                            <div className="modal-header bg-light d-flex justify-content-end">
                                {/* <div className="fs-header fw-bolder">
                                    {translate("Save Contact Details")}
                                </div> */}
                                {/* <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"></button> */}
                                <button
                                    onClick={onSaveCover}
                                    type="button"
                                    padding={12}
                                    data-bs-dismiss="modal"
                                    className="btn btn-lg btn-primary fs-sm py-2 ms-2">
                                    {translate("Done")}
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-4 d-flex align-items-center justify-content-center">
                                    <ul className="nav nav-pills">
                                        <li className="nav-item" onClick={() => setCoverSelectedType('upload')}>
                                            <a className={`nav-link ${coverSelectedType === 'upload' ? 'active' : ''}`} href="#">{translate('Upload Image')}</a>
                                        </li>
                                        <li className="nav-item" onClick={() => setCoverSelectedType('color')}>
                                            <a className={`nav-link ${coverSelectedType === 'color' ? 'active' : ''}`} href="#">{translate('Choose Color')}</a>
                                        </li>
                                        <li className="nav-item" onClick={() => setCoverSelectedType('gallery')}>
                                            <a className={`nav-link ${coverSelectedType === 'gallery' ? 'active' : ''}`} href="#">{translate('Photo Gallery')}</a>
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    {coverSelectedType === 'upload' && (
                                        <div {...getRootCoverProps({ className: "dropzone bg-white py-5 mb-6 d-flex align-items-center justify-content-center rounded-10"})} style={{border: "1px dashed #828FA7"}}>
                                            <input {...getInputCoverProps()} />
                                            <div className="text-center">
                                                <img src="/assets/svg/document-upload.svg" />
                                                <div className="fs-sm text-blue-500 mt-3">
                                                    {translate("Drag the file or Select to upload")}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {coverSelectedType === 'color' && (
                                        <div className="mt-3 mb-6 d-flex align-items-center justify-content-center">
                                            <ColorPicker type='chromepicker' color={companySettings.settings.cover_overlay} onHandleChange={onHandleCoverColor} />
                                        </div>
                                    )}
                                    {coverSelectedType === 'gallery' && (
                                        <div className="px-2" style={{height: '60vh'}}>
                                            <div className="d-flex align-items-center px-5">
                                                <div className="input-group border-bottom">
                                                    <span
                                                        className="input-group-text bg-white border-0"
                                                        id="basic-addon1"
                                                    >
                                                        <i className="bi bi-search"></i>
                                                    </span>
                                                    <input
                                                        type="text"
                                                        className="form-control border-0"
                                                        placeholder={translate('Search Library')}
                                                        value={searchedKeyword}
                                                        onChange={handleSearchPhoto}
                                                    />
                                                </div>
                                                <div className="dropdown">
                                                    <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                                        {LibraryTypes[libraryType]}
                                                    </button>
                                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                                        <li><a className="dropdown-item" onClick={() => onSelectLibraryType('photo')}>{translate('Photo')}</a></li>
                                                        <li><a className="dropdown-item" onClick={() => onSelectLibraryType('video')}>{translate('Video')}</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                            {Object.keys(resultLibraries).length > 0 && (
                                                <>
                                                    <div className="row m-0 pt-4">
                                                        {libraryType === 'photo' && resultLibraries.photos.map((photo) => {
                                                            const style = selectedLibrary && photo.id === selectedLibrary.id ? 'border-primary-2' : '';
                                                            return (
                                                                <div key={photo.id} className={`col-6 mb-2`} onClick={() => onClickLibrary(photo)}>
                                                                    <img className={`w-100 rounded-5 ${style}`} src={photo.src.landscape} style={{objectFit: "contain"}} />
                                                                </div>
                                                            )
                                                        })}

                                                        {libraryType === 'video' && resultLibraries.videos.map((video) => {
                                                            const style = selectedLibrary && video.id === selectedLibrary.id ? 'border-primary-2' : '';
                                                            return (
                                                                <div key={video.id} className={`col-6 mb-2`} onClick={() => onClickLibrary(video)}>
                                                                    <img className={`w-100 rounded-5 ${style}`} src={video.image} style={{objectFit: "cover", height: '100px'}} />
                                                                </div>
                                                            )
                                                        })}
                                                    </div>

                                                    {resultLibraries.next_page > '' && (
                                                        <a
                                                            onClick={() => loadMorePhotos(resultLibraries.page+1)}
                                                            type="button"
                                                            padding={12}
                                                            className="btn btn-sm btn-secondary text-white w-100 py-2 me-2 mt-3 mb-2">
                                                            {translate("Load More")}
                                                        </a>
                                                    )}
                                                    <div className="d-flex align-items-center justify-content-center pb-3"><span>{translate('Provided by Pexels')}</span></div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
