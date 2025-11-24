import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/inertia-react";
import { Inertia } from "@inertiajs/inertia";
import { translate, toast, socials as socialsHelper } from "@/Helpers";
import Authenticated from "@/Layouts/Authenticated";
import ApplicationLogo from "@/Components/ApplicationLogo";
import IconButton from "@/Components/IconButton";
import Button from "@/Components/Button";
import ColorPicker from "@/Components/ColorPicker";
import Accordion from "@/Components/Accordion";
import Input from "@/Components/Input";
import SitePreview from "./SitePreview";
import MobileIcon from "@/svg/MobileIcon";
import DesktopIcon from "@/svg/DesktopIcon";
import VLinkInput from "@/Components/VLinkInput";
import { useDropzone } from "react-dropzone";
import { FontAwesome } from "react-web-vector-icons";
import axios from "axios";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import "cropperjs/dist/cropper.css";
import ShareSiteModal from "@/Components/ShareSiteModal";
import UpgradeToProOverlay from "@/Components/UpgradeToProOverlay";

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

export default function CardForm(props) {
    const { auth } = usePage().props;
    const { domain, protocol } = usePage().props;
    const [processing, setProcessing] = useState(false);
    const [viewType, setViewType] = useState("desktop");
    const [subdomain, setSubdomain] = useState(props.card.identifier || "");
    const [scrollTop, setScrollTop] = useState(0);

    const LibraryTypes = {
        'photo': 'Photo',
        'video': 'Video',
    };

    console.log('user authorization', auth)

    const [coverSelectedType, setCoverSelectedType] = useState('upload');
    const [libraryType, setLibraryType] = useState('photo');
    const [searchedKeyword, setSearchedKeyword] = useState(translate('Business'));
    const [resultLibraries, setResultLibraries] = useState({});
    const [selectedLibrary, setSelectedLibrary] = useState(null);

 
    useEffect(() => setSubdomain(props.card.identifier), [props.card.identifier]);

    const codeTypes = {
        youtube: 'Youtube',
        vimeo: 'Vimeo',
        iframe: 'iFrame'
    }

    const [customSourceType, setCustomSourceType] = useState({key: 'youtube', label: codeTypes.youtube});
    const [customCodesDetails, setCustomCodesDetails] = useState({title: '', codes: ''});
    const [customCodes, setCustomCodes] = useState(props.card.customcodes || []);

    const card = {
        cover: '',
        cover_type: 'photo',
        cover_thumbnail: '',
        avatar: "",
        logo: "",
        about: "",
        firstname: "",
        lastname: "",
        job: "",
        company: "",
        address: "",
        phone: "",
        mobile: "",
        email: "",
    };
    const [cardDetails, setCardDetails] = useState(props.card);

    const [galleries, setGalleries] = useState(props.card.galleries || []);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [coverVideoUploadLoading, setCoverVideoUploadLoading] = useState(false)

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

    const [covers, setCovers] = useState(props.card.covers);

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

    const onSelectCover = (library) => {
        console.log('library', library)
        setCardDetails({ ...cardDetails, cover: library.url, cover_type: library.type, cover_thumbnail:  library.thumbnail});
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
        console.log('libraryType', libraryType)
        setCardDetails({ ...cardDetails, cover: src, cover_type: libraryType, cover_thumbnail: thumbnail});
    }

    const onSaveCover = () => {
        if (coverSelectedType === 'color') {
            onHandleCoverChange('');
        }
        if (coverSelectedType === 'gallery' && cardDetails.cover) {
            axios
            .post(route("card.covers.store"), { cover: cardDetails.cover, thumbnail: cardDetails.cover_thumbnail, type: libraryType })
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
        const file = acceptedFiles[0]
        console.log('accepted files', file, acceptedFiles)
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];

        if (!validTypes.includes(file.type)) {
            toast(translate('Cannot Save Image'), 'error')
            return;
        }
            const maxSizeInMB = 6;
            const fileSizeInMB = file.size / (1024 * 1024);
            
            console.log(`Selected file size: ${fileSizeInMB.toFixed(2)} MB`);
            
            if (fileSizeInMB > maxSizeInMB) {
            toast(`File is too large! Maximum size is ${maxSizeInMB} MB.`, 'error');
            return;
        }

        let done = function (url) {
            onHandleCoverChange(url);
            axios
                .post(route("card.covers.store"), { cover: url })
                .then(({ data }) => {
                    console.log('cover data', data)
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

    // const onUploadVideo = async (acceptedFiles) => {
    //     const videoFile = acceptedFiles[0];

    //     console.log('accepted files', videoFile, acceptedFiles)
    //     const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/mov'];

    //     if (!validVideoTypes.includes(videoFile.type)) {
    //         toast(translate('Cannot Save Video'), 'error')
    //         return;
    //     }
    
    //     console.log('dropping video', videoFile)
    //     const formData = new FormData();
    //     formData.append("file", videoFile);
    //     formData.append("label", 'cover');
    
    //     try {
    //         console.log('trying to upload', props.card.id, formData)

    //         const response = await axios
    //         .post(route("cards.video", props.card.id), formData, {
    //             headers: {
    //                 'Content-Type': 'multipart/form-data'
    //             }
    //         })
            
    //         .then(({ data }) => {
    //             // const filtered = galleries.filter((g) => g.id !== image.id);
    //             // setGalleries(filtered);
    //             console.log('data', data)
    //         });
            
    
    //         console.log('response datas', response);
    
    //         const { video_url } = response.data;
    
    //         console.log('Upload success')
    //         onHandleCoverChange(video_url);
    //         await axios.post(route("card.covers.store"), { cover: video_url });
    //         setCovers([{ url: video_url }, ...covers]);
    //         Modal.getOrCreateInstance(document.getElementById("cover_modal")).hide();
    
    //     } catch (error) {
    //          console.error('Upload failed:', error.response?.data || error.message);
    //     }
    // };
    
    
    // const onUploadVideo = async (acceptedFiles) => {

    //     setCoverVideoUploadLoading(true)
    //     const videoFile = acceptedFiles[0];

    //     const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/mov'];
    //     if (!validVideoTypes.includes(videoFile.type)) {
    //         toast('Cannot Save Video', 'error');
    //         console.log('bad video')
    //         return;
    //     }

    //     console.log('videoFile', videoFile)

    //     const formData = new FormData();
    //     formData.append('file', videoFile);
    //     formData.append('label', 'cover');

    //     console.log('form data and videofile', formData, videoFile)
    //     try {
    //         const response = await axios.post(route('cards.video', props.card.id), formData);
            
    //         console.log('Upload success:', response.data);

    //         const { video_url, cover , thumbnail} = response.data;

    //         console.log('video url', video_url, response.data)

    //         onHandleCoverChange(video_url, thumbnail);
    //         console.log('covers', covers)          
    //         setCovers([cover, ...covers]);  
    //         setCardDetails({ ...cardDetails, cover: video_url, cover_type: 'video'});

    //         setCoverVideoUploadLoading(false)
    //         Modal.getOrCreateInstance(document.getElementById("cover_modal")).hide();
    //         console.log('covers2', covers)   
    //     } catch (error) {
    //         console.error('Upload failed:', error.response?.data || error.message);
    //     }
    // };


    const onUploadVideo = async (acceptedFiles) => {
        const videoFile = acceptedFiles[0];
    
        const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/mov'];
        if (!validVideoTypes.includes(videoFile.type)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Video Format',
                text: 'Please upload a valid video file (MP4, MOV, QuickTime).',
            });
            console.log('bad video');
            return;
        }

        const maxSizeInMB = 50;
        const fileSizeInMB = videoFile.size / (1024 * 1024);
        
        console.log(`Selected file size: ${fileSizeInMB.toFixed(2)} MB`);
        
        if (fileSizeInMB > maxSizeInMB) {
        toast(`File is too large! Maximum size is ${maxSizeInMB} MB.`, 'error');
        return;
    }
    
        console.log('card details', cardDetails, covers)
        const hasVideoCover = cardDetails.cover_type === 'video' || covers.some(item => item.type === 'video');
    
        if (hasVideoCover) {
            Swal.fire({
                title: 'Replace cover video?',
                text: 'You already have a cover video. Do you want to replace it with the new one?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, replace it!',
                cancelButtonText: 'Cancel',
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // Find and delete the current video cover
                    const videoCover = covers.find(item => item.type === 'video');
                    if (videoCover) {
                        await onHandleDeleteCover(videoCover, false); // skip confirmation
                    }
    
                    await handleVideoUpload(videoFile);
                } else {
                    console.log('User cancelled the video replacement.');
                }
            });
        } else {
            await handleVideoUpload(videoFile);
        }
    };
    
    const handleVideoUpload =async (videoFile) => {
        setCoverVideoUploadLoading(true);
        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('label', 'cover');
    
        try {
            const response = await axios.post(route('cards.video', props.card.id), formData);
    
            const { video_url, cover } = response.data;
    
            console.log('video url', video_url);
            const filteredCovers = covers.filter(item => item.type !== 'video');
    
            const newCovers = [cover, ...filteredCovers];
    
            setCovers(newCovers);
    
            setCardDetails({ ...cardDetails, cover: video_url, cover_type: 'video' });
    
            setCoverVideoUploadLoading(false);
    
            Modal.getOrCreateInstance(document.getElementById("cover_modal")).hide();
    
        } catch (error) {
            console.error('Upload failed:', error.response?.data || error.message);
    
            toast(translate('Upload failed'), 'error');
    
            setCoverVideoUploadLoading(false);
        }
    };
    

    // const onHandleDeleteCover = (cover) => {
    //     showConfirmation(translate("Remove Cover?"), () => {
    //         axios
    //             .delete(route("card.covers.destroy", cover.id))
    //             .then(({ data }) => {
    //                 const filtered = covers.filter((c) => c.id !== cover.id);
    //                 console.log('filtered covers', filtered)
    //                 setCovers(filtered);
    //                 if (cover.url === covers[0].url) {
    //                     onHandleCoverChange(covers[1].url);
    //                 } else {
    //                     onHandleCoverChange(covers[0].url);
    //                 }
    //             });
    //     });
    // };

    const onHandleDeleteCover = async (cover, confirm = true) => {
        const proceedDelete = async () => {
            try {
                const response = await axios.delete(route("card.covers.destroy", cover.id));
    
                const filtered = covers.filter((c) => c.id !== cover.id);
                console.log('filtered covers', filtered);
    
                setCovers(filtered);
    
                if (cover.url === covers[0]?.url) {
                    onHandleCoverChange(covers[1]?.url);
                } else {
                    onHandleCoverChange(covers[0]?.url);
                }
    
            } catch (error) {
                console.error('Failed to delete cover:', error);
            }
        };
    
        if (confirm) {
            showConfirmation(translate("Remove Cover?"), proceedDelete);
        } else {
            await proceedDelete();
        }
    };
    
    const {
        getRootProps: getRootCoverProps,
        getInputProps: getInputCoverProps,
    } = useDropzone({
        onDrop: onUploadCover,
        multiple: false,
        accept: { "image/png": [".png", ".jpg", ".jpeg"] },
    });

    const {
        getRootProps: getRootVideoProps,
        getInputProps: getInputVideoProps,
      } = useDropzone({
        onDrop: onUploadVideo,
        multiple: false,
        accept: { "video/mp4": [".mp4", ".mov", ".avi"] },
      });

    const initProject = {
        attachment: "",
        title: "",
        description: "",
        company: "",
        link: "",
        month: "",
        year: "",
    };
    const [projects, setProjects] = useState(props.card.projects || []);
    const [project, setProject] = useState(initProject);

    const initService = {
        title: "",
        description: "",
    };
    const [services, setServices] = useState(props.card.services || []);
    const [service, setService] = useState(initService);

    const initSocials = socialsHelper();
    const [socials, setSocials] = useState(Array.isArray(props.card.socials) ? {} : props.card.socials || {});

    const [settings, setSettings] = useState({
        placeId: props.card.settings && typeof props.card.settings.place_id !== 'undefined' ? props.card.settings.place_id || '' : "",
        placeName: props.card.settings && typeof props.card.settings.place_name !== 'undefined' ? props.card.settings.place_name || '' : "",
        show_review: props.card.settings && typeof props.card.settings.show_review !== 'undefined' ? props.card.settings.show_review : true,
        cover_overlay: props.card.settings && typeof props.card.settings.cover_overlay !== 'undefined' ? props.card.settings.cover_overlay : "#df2351",
        color: props.card.settings && typeof props.card.settings.button !== 'undefined' ? props.card.settings.button.color : "#ffffff",
        background: props.card.settings && typeof props.card.settings.button !== 'undefined' ? props.card.settings.button.background : "#df2351",
        qrColor: props.card.settings && typeof props.card.settings.qr_color !== 'undefined' ? props.card.settings.qr_color : "#df2351",
        formColor: props.card.settings && typeof props.card.settings.form_color !== 'undefined' ? props.card.settings.form_color : "#041E4F",
        contactButtons: props.card.settings && typeof props.card.settings.contactButtons !== 'undefined' ? props.card.settings.contactButtons : [],
        // metaTitle: props.card.settings && typeof props.card.settings.seo !== 'undefined' ? props.card.settings.seo.metaTitle : `${props.card.firstname} ${props.card.lastname}`,
        // metaDescription: props.card.settings && typeof props.card.settings.seo !== 'undefined' ? props.card.settings.seo.metaDescription : `${props.card.job} at ${props.card.company}`,
        metaTitle: props.card.settings?.seo?.metaTitle ?? ([props.card.firstname, props.card.lastname].filter(Boolean).join(" ") || ''),
        metaDescription: props.card.settings?.seo?.metaDescription ||
            [props.card.job, props.card.company].filter(Boolean).join(" at ") || '',
        imprint: props.card.settings && typeof props.card.settings.footer !== 'undefined' ? props.card.settings.footer.imprint || '' : '',
        privacyPolicy: props.card.settings && typeof props.card.settings.footer !== 'undefined' ? props.card.settings.footer.privacyPolicy || '' : '',
    });

    const contactButtonsInit = [
        {id: 1, key: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp', color: '#25d366', value: socials['whatsapp'], url: socials['whatsapp'], size: 23},
        {id: 2, key: 'phone', label: 'Phone', icon: 'phone', color: '#949292', value: cardDetails.phone, url:`tel:${cardDetails.phone}`, size: 23},
        {id: 3, key: 'mobile', label: 'Mobile', icon: 'mobile', color: '#041E4F', value: cardDetails.mobile, url:`tel:${cardDetails.mobile}`, size: 25},
        {id: 4, key: 'email', label: 'Email', icon: 'envelope-o', color: '#1da1f2', value: cardDetails.email, url:`mailto:${cardDetails.email}`, size: 23},
    ];

    const initCallback = {
        card_id: props.card.id,
        name: "",
        email: "",
        reachability: "",
        phone: "",
        accept: false,
    };

    const [contactButtons, setContactButtons] = useState(contactButtonsInit);
    const [callBack, setCallBack] = useState(initCallback);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        setContactButtons(contactButtonsInit);

        let settingsContactButtons = [...settings.contactButtons];
        if (Object.keys(socials).length === 0 || typeof socials['whatsapp'] === 'undefined' || !socials['whatsapp'] || socials['whatsapp'] === '') {
            settingsContactButtons = settingsContactButtons.filter(obj => obj.key !== 'whatsapp');
        }
        if (!cardDetails.phone || cardDetails.phone === '') {
            settingsContactButtons = settingsContactButtons.filter(obj => obj.key !== 'phone');
        }
        if (!cardDetails.mobile || cardDetails.mobile === '') {
            settingsContactButtons = settingsContactButtons.filter(obj => obj.key !== 'mobile');
        }
        if (!cardDetails.email || cardDetails.email === '') {
            settingsContactButtons = settingsContactButtons.filter(obj => obj.key !== 'email');
        }
        setSettings({ ...settings, contactButtons: settingsContactButtons});
    }, [cardDetails, socials]);

    const [documents, setDocuments] = useState(props.card.documents || []);
    const onAddDocument = (file) => {

        let formData = new FormData();
        formData.append("file", file[0]);
        formData.append("card_id", props.card.id);
        formData.append("title", file[0].name);

        axios
            .post(route("card.documents.store"), formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then(({ data }) => {
                const newDocuments = [...documents, data];
                setDocuments(newDocuments);
            });
    };
    
    const onRemoveDocument = (document) => {
        axios
            .delete(route("card.documents.destroy", document.id))
            .then(({ data }) => {
                const filtered = documents.filter((d) => d.id !== document.id);
                setDocuments(filtered);
            });
    };

    const resetNewCard = () => {
        // if(subdomain.search('new-') > -1) {
        //     axios.delete(route('cards.destroy', props.card.id));
        // }
        // history.go(-1);
        // setTimeout(() => location.reload(), 100);
        if (subdomain.includes("new-")) {
            showConfirmation(translate('Delete unsaved draft?'), () =>{
                axios
                    .delete(route("cards.destroy", props.card.id))
                    .then(() => {
                        Inertia.visit(route('cards.index'));
                    })
                    .catch((error) => console.error("Failed to delete:", error));
            })
        } else {
            Inertia.visit(route('cards.index'));
        }
    }

    const changeToMobile = () => {
        setViewType("mobile");
    };

    const changeToDesktop = () => {
        setViewType("desktop");
    };

    const onHandleDomainChange = (event) => {
        setSubdomain(event.target.value);
    };

    const onHandleShareDomain = () => {
        new Modal(document.getElementById("sharesite-modal")).show();
    }

    const onHandleCardChange = (event) => {
        const { name, value } = event.target;
    
        if (name === 'phone' || name === 'mobile') {
            const filteredValue = value.replace(/[^0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/g, '');
            setCardDetails({
                ...cardDetails,
                [name]: filteredValue,
            });
        } else {
            setCardDetails({
                ...cardDetails,
                [name]: value,
            });
        }
    };

    // function base64FileSizeInMB(base64String) {
    //     let padding = 0;
      
    //     if (base64String.endsWith('==')) padding = 2;
    //     else if (base64String.endsWith('=')) padding = 1;
      
    //     const base64Length = base64String.length;
    //     const fileSizeInBytes = (base64Length * 3) / 4 - padding;
      
    //     const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2)
      
    //     return fileSizeInMB;
    //   }

    const onHandleCardImage = (name, image) => {
        setCardDetails({ ...cardDetails, [name]: image });
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
            case 'project':
                message = translate('Remove project icon?')
            default:
                break;
        }
        showConfirmation(message, () => {
            onHandleCardImage(name, null);
        });
    };

    const onHandleGallery = (image) => {
        setLoadingGallery(true);
        axios
        .post(route("card.galleries.store"), {
            card_id: props.card.id,
            file: image
        })
        .then(({ data }) => {
            setGalleries([...galleries, data]);
            setLoadingGallery(false);
        })
        .catch(e => {
            toast(translate('Cannot Save Image'), 'error');
            setLoadingGallery(false);
        });
    }

    const onRemoveGallery = (image) => {
        showConfirmation(translate("Remove This Image?"), () => {
            axios
                .delete(route("card.galleries.destroy", image.id))
                .then(({ data }) => {
                    const filtered = galleries.filter((g) => g.id !== image.id);
                    setGalleries(filtered);
                });
        });
    }

    const onHandleProjectChange = (event) => {
        setProject({ ...project, [event.target.name]: event.target.value });
    };

    const onHandleProjectImage = (image) => {
        setProject({ ...project, attachment: image });
    };

    const onSaveProject = () => {
        let payload = {
            card_id: props.card.id,
            title: project.title,
            description: project.description,
            company: project.company,
            attachment: project.attachment,
            link: project.link,
            month: project.month,
            year: project.year,
        };

        if (typeof project.id === "undefined") {
            axios
                .post(route("card.projects.store"), payload)
                .then(({ data }) => {
                    setProjects([...projects, data]);
                    setProject(initProject);
                })
                .catch(e => {
                    if (e.response && e.response.data && e.response.data.errors) {
                        const titleError = e.response.data.errors.title?.[0];
                        toast(titleError || translate('Cannot Save Project'), 'error');
                    } else {
                        toast(translate('Cannot Save Project'), 'error');
                    }
                });
        } else {
            axios
                .put(route("card.projects.update", project.id), payload)
                .then(({ data }) => {
                    const filtered = projects.filter(
                        (p) => p.id !== project.id
                    );
                    setProjects([project, ...filtered]);
                    setProject(initProject);
                })
                .catch(e => {
                    if (e.response && e.response.data && e.response.data.errors) {
                        const titleError = e.response.data.errors.title?.[0];
                        toast(titleError || translate('Cannot Save Project'), 'error');
                    } else {
                        toast(translate('Cannot Save Project'), 'error');
                    }
                });
        }
    };

    const onEditProject = (project) => {
        setProject(project);
    };

    const onHandleCustomCodesChange = (event) => {
        const name = event.target.name === 'iframe' || event.target.name === 'url' ? 'codes' : event.target.name;
        setCustomCodesDetails({ ...customCodesDetails, [name]: event.target.value });
    };

    const onSaveCustomCode = () => {
        const payload = {
            card_id: props.card.id,
            title: customCodesDetails.title,
            codes: customCodesDetails.codes,
            source: customSourceType.key
        };

        if (typeof customCodesDetails.id === "undefined") {
            axios
                .post(route("card.customcodes.store"), payload)
                .then(({ data }) => {
                    setCustomCodes([...customCodes, data]);
                    setCustomCodesDetails({title:'', codes: ''});
                });
        } else {
            axios
                .put(route("card.customcodes.update", customCodesDetails.id), payload)
                .then(({ data }) => {
                    const filtered = customCodes.filter(
                        (c) => c.id !== customCodesDetails.id
                    );

                    let codes = [{...customCodesDetails, source: customSourceType.key}, ...filtered].sort((a, b) => {
                        return a.id - b.id;
                    })

                    setCustomCodes(codes);
                    setCustomCodesDetails({title:'', codes: ''});
                });
        }
    };

    const onEditCustomCode = (code) => {
        setCustomCodesDetails({id: code.id, title: code.title, codes: code.codes});
        setCustomSourceType({key: code.source, label: codeTypes[code.source]});
    };

    const onRemoveCustomCode = (code) => {
        showConfirmation(translate("Remove Custom Code?"), () => {
            axios
                .delete(route("card.customcodes.destroy", code.id))
                .then(({ data }) => {
                    const filtered = customCodes.filter(
                        (c) => c.id !== code.id
                    );
                    setCustomCodes(filtered);
                    setCustomCodesDetails({title:'', codes: ''});
                });
        });
    };

    const showConfirmation = (message, callback) => {
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
                }
            });
    };

    const onRemoveProject = (project) => {
        showConfirmation(translate("Remove Project?"), () => {
            axios
                .delete(route("card.projects.destroy", project.id))
                .then(({ data }) => {
                    const filtered = projects.filter(
                        (p) => p.id !== project.id
                    );
                    setProjects(filtered);
                    setProject(initProject);
                });
        });
    };

    const onHandleServiceChange = (event) => {
        setService({ ...service, [event.target.name]: event.target.value });
    };

    const onSaveService = () => {
        const payload = {
            card_id: props.card.id,
            title: service.title,
            description: service.description,
        };

        if (typeof service.id === "undefined") {
            axios
                .post(route("card.services.store"), payload)
                .then(({ data }) => {
                    setServices([...services, data]);
                    setService(initService);
                })
                .catch(e => {
                    toast(translate('Cannot Save Service'), 'error');
                });
        } else {
            axios
                .put(route("card.services.update", service.id), payload)
                .then(({ data }) => {
                    const filtered = services.filter(
                        (s) => s.id !== service.id
                    );
                    setServices([service, ...filtered]);
                    setService(initService);
                })
                .catch(e => {
                    toast(translate('Cannot Save Service'), 'error');
                });
        }
    };

    const onEditService = (service) => {
        setService(service);
    };

    const onRemoveService = (service) => {
        showConfirmation(translate("Remove Service?"), () => {
            axios
                .delete(route("card.services.destroy", service.id))
                .then(({ data }) => {
                    const filtered = services.filter(
                        (s) => s.id !== service.id
                    );
                    setServices(filtered);
                    setService(initService);
                });
        });
    };

    const onHandleSocialChange = (event) => {
        const names = ['whatsapp', 'skype', 'website'];
    
        if (names.includes(event.target.name)) {
            let value = event.target.value;

            if (['whatsapp'].includes(event.target.name)) {
                value = value.replace(/[^0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/g, '');
            }
    
            if (value === '') {
                let newSocials = { ...socials };
                delete newSocials[event.target.name];
                setSocials(newSocials);
            } else {
                setSocials({ ...socials, [event.target.name]: value });
            }
            return;
        }
    
        const base = initSocials[event.target.name].placeholder;
        const splitString = base !== '' ? event.target.value.split(base) : [];
    
        if (event.target.value === '' || splitString.length <= 1 || (splitString.length > 1 && splitString[1] === '')) {
            let newSocials = { ...socials };
            delete newSocials[event.target.name];
            setSocials(newSocials);
        } else {
            setSocials({ ...socials, [event.target.name]: event.target.value });
        }
    };

    const [loadingReviews, setLoadingReviews] = useState(false);
    const onHandleChangePlace = place => {
        setSettings({...settings, placeId: place.place_id, placeName: place.name});
    }

    const onHandleSettingsChange = (name, value) => {
        setSettings({ ...settings, [name]: value });
    };

    const onHandleCoverColor = (color) => {
        setSettings({ ...settings, cover_overlay: color });
    };

    const onToggleContactButtons = (button) => {
        let buttons = [...settings.contactButtons];
        const filter = buttons.filter(obj => obj.key === button.key);
        if (filter.length > 0) {
            buttons = buttons.filter(obj => obj.key !== button.key);
        } else {
            buttons = [...settings.contactButtons, button];
        }

        setSettings({ ...settings, contactButtons: buttons});
    }

    const onSaveCard = () => {
        setProcessing(true);

        const sortedContactButtons = settings.contactButtons.sort((a, b) => {
            return a.id - b.id;
        })

        let payload = {
            ...cardDetails,
            socials,
            settings: {
                place_id: settings.placeId,
                place_name: settings.placeName,
                show_review: settings.show_review,
                cover_overlay: settings.cover_overlay,
                qr_color: settings.qrColor,
                form_color: settings.formColor,
                button: {
                    color: settings.color,
                    background: settings.background,
                },
                seo: {
                    metaTitle: settings.metaTitle,
                    metaDescription: settings.metaDescription,
                },
                footer: {
                    imprint: settings.imprint,
                    privacyPolicy: settings.privacyPolicy
                },
                contactButtons: sortedContactButtons
            },
        };
        // if (isCreate) {
        //     payload.identifier = subdomain;
        //     axios
        //         .post(route("cards.store"), payload)
        //         .then(({ data }) => {
        //             toast(translate("Card created!"));
        //             setProcessing(false);

        //             get(route("cards.index"));
        //         })
        //         .catch((e) => {
        //             setProcessing(false);
        //         });
        // } else {
            payload.identifier = subdomain;
            axios
                .put(route("cards.update", props.card.id), payload)
                .then(({ data }) => {
                    setSubdomain((data?.identifier || "default-subdomain"));
                    console.log('new Doman', subdomain)
                    // setCardDetails({payload})
                    toast(translate("Card details changed"));
                    // get(route('cards.index'));
                    setProcessing(false);
                })
                .catch((e) => {
                    console.log("Axios error:", e);
                    setProcessing(false);
                });
       // }
    };


    const onhandleCallbackChange = (event) => {
        const {name, value} = event.target

        if (event.target.type === "checkbox") {
            return setCallBack({
                ...callBack,
                [name]: !callBack.accept,
            });
        }else{
            if(name ==='phone'){
                const filteredValue = value.replace(/[^0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/g, '');
                setCallBack({ ...callBack, [name]: filteredValue });
            }else{   
                setCallBack({ ...callBack, [name]: value });
            }
        }
    };

        const onSendRequest = () => {
            if (!callBack.accept) {
                toast(translate('Please accept the Privacy Policy'), 'error')
                return
            }
            
            setSending(true);
    
            let modal = Modal.getInstance(document.getElementById("savecontact-modal"));
    
            axios
                .post(route("cards.callbacks.store"), callBack)
                .then(({ data }) => {
                    console.log('data')
                    setCallBack(initCallback);
                    toast(translate("Contact Information successfully downloaded and sent to your email"));
                    
                    modal.hide();
                    
                   // window.open(`/download${!isPublic ? "?identifier=" + card.identifier : ""}`);
                   window.open(`/download?identifier=${props.card.identifier}`);
    
                    setSending(false);
                })
                .catch((e) => {
                    console.error('e', e)
                    toast(translate("Cannot send request"), "error");
                    setSending(false);
                });
        };

    const blurred = auth.plan === 'free' ? 'blur-content' : '';
    
    return (
        <Authenticated hideMenuDrawer={true}>
            <div className="container-fluid m-0 px-0 p-0">
                <div className="row m-0 p-0">

                     <div
                                    className="modal fade"
                                    id="savecontact-modal"
                                    data-bs-keyboard="true"
                                    tabIndex="-1"
                                    aria-labelledby="savecontact-label"
                                    aria-hidden="true"
                                >
                                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                                        <div className="modal-content bg-light border-light-gray-1 rounded-10">
                                            <div className="modal-header bg-light ">
                                                <div className="fs-header fw-bolder">
                                                    {translate("Save Contact Details")}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    data-bs-dismiss="modal"
                                                    aria-label="Close"
                                                ></button>
                                            </div>
                                            <div className="modal-body">
                                                <div>
                                                    <div className="mb-3">
                                                        <input
                                                            type="text"
                                                            onChange={onhandleCallbackChange}
                                                            value={callBack.name}
                                                            className="form-control"
                                                            name="name"
                                                            placeholder={`${translate("Name")}*`}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <input
                                                            type="text"
                                                            onChange={onhandleCallbackChange}
                                                            value={callBack.company}
                                                            className="form-control"
                                                            name="company"
                                                            placeholder={translate("Company")}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <input
                                                            type="email"
                                                            onChange={onhandleCallbackChange}
                                                            value={callBack.email}
                                                            className="form-control"
                                                            name="email"
                                                            placeholder={`${translate("Email")}*`}
                                                        />
                                                    </div>
                                                    <div className="mb-3">
                                                        <input
                                                            type="text"
                                                            onChange={onhandleCallbackChange}
                                                            value={callBack.phone}
                                                            className="form-control"
                                                            name="phone"
                                                            placeholder={translate("Phone Number")}
                                                        />
                                                    </div>
                                                    <div className="form-check mb-3">
                                                        <input
                                                            onChange={onhandleCallbackChange}
                                                            checked={callBack.accept}
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            name="accept"
                                                            id="accept"
                                                        />
                                                        {/* <label
                                                            className="form-check-label"
                                                            htmlFor="accept">
                                                            {translate("I accept and read the V-Site's Privacy Policy")}
                                                        </label> */}
                                                        <label className="form-check-label" htmlFor="accept">
                                                            {translate("I accept and read the")}{" "}
                                                            {
                                                                settings.privacyPolicy ?        
                                                                    <a href={settings.privacyPolicy} target="_blank" rel="noopener noreferrer" className="text-primary">
                                                                        {translate("Privacy Policy")}
                                                                    </a>
                                                                :
                                                                translate("Privacy Policy")
                                                            }
                                                        </label>
                                                        {}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={onSendRequest}
                                                        textColor={settings.color}
                                                        backgroundColor={settings.background}
                                                        className="btn"
                                                        disabled={sending ? true : false}
                                                    >
                                                        <i className="bi bi-send me-2"></i>
                                                        {translate(sending ? "Sending..." : "Send")}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                    <div className="col-lg-4 m-0 px-0 pb-0 pt-8 pt-lg-0 position-relative vh-100">
                        <div
                            className="position-absolute bg-white border-top px-3 pt-3 pb-4 w-100"
                            style={{ zIndex: 99, bottom: 0 }}
                        >
                            <div className="row justify-content-center">
                                <div className="col-6 d-flex pe-1 justify-content-end">
                                    <div className="d-flex align-items-center me-2 text-decoration-none w-100">
                                        <a
                                            onClick={resetNewCard}
                                           // href={route("cards.index")}
                                            type="button"
                                            padding={12}
                                            className="btn h-100 d-flex align-items-center justify-content-center btn-lg btn-danger fs-sm w-100">
                                            {translate("Cancel")}
                                        </a>
                                    </div>
                                </div>
                                <div className="col-6 ps-1">
                                    <Button
                                        onClick={onSaveCard}
                                        processing={processing}
                                        type="button"
                                        padding={12}
                                        className="btn btn-lg btn-primary fs-sm w-100">
                                        {translate("Save")}
                                    </Button>
                                </div>
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

                        <div className="bg-white h-15 px-4 d-none d-lg-flex align-items-center justify-content-between">
                            <div className="ms-2">
                                <ApplicationLogo />
                            </div>
                            <a
                                onClick={resetNewCard}
                                //href={route("cards.index")}
                                className="d-flex align-items-center me-2 text-decoration-none">
                                <IconButton
                                    width={20}
                                    height={20}
                                    icon="/assets/svg/back.svg"
                                />
                                <span className="ms-2" style={{cursor: 'pointer'}}>
                                    {translate("Back")}
                                </span>
                            </a>
                        </div>

                        <div className="h-85 pb-6 pb-lg-8 overflow-scroll">
                            <form>
                                {props.settings.cover || props.settings.avatar || props.settings.logo ? (
                                    <Accordion
                                        className="accordion-primary"
                                        headerClassName="text-white"
                                        show={true}
                                        icon="/assets/svg/person_circle.svg"
                                        id="header"
                                        title={translate("Header")}>
                                        {props.settings.cover ? (
                                            <Accordion
                                                className="accordion-white"
                                                headerClassName="text-black fs-sm py-1"
                                                show={true}
                                                id="cover"
                                                title={translate("Cover Photo")}>
                                                <div className="pb-4">
                                                    <CoverForm
                                                        className="row m-0 p-0 px-3 px-lg-4"
                                                        covers={covers}
                                                        selectedCover={cardDetails.cover}
                                                        dataTarget="#cover_modal"
                                                        overlayColor={settings.cover_overlay}
                                                        auth={auth}
                                                        onSelectCover={(cover) => {
                                                            console.log('covvs', cover)
                                                            onSelectCover(cover)
                                                        }}
                                                        onHandleDeleteCover={(cover) => onHandleDeleteCover(cover)} />
                                                    
                                                </div>
                                                <hr className="bg-black-600 my-1 mt-3" />
                                            </Accordion>
                                        ) : null}

                                        <div className="row m-0 p-0 px-3 px-lg-4 py-4">
                                            {props.settings.avatar ? (
                                                <div className="col-6 g-2 h-90 lh-sm">
                                                    <div className="fs-sm">{translate("Profile Photo")}</div>
                                                    <UploadPhoto
                                                        className="fs-sm h-90 lh-sm"
                                                        src={cardDetails.avatar}
                                                        onHandleCardImage={(image) => onHandleCardImage("avatar", image)}
                                                        onRemoveImage={() => onRemoveImage("avatar")} />
                                                </div>
                                            ) : null}

                                            {props.settings.logo ? (
                                                <div className="col-6 g-2 h-90 lh-sm">
                                                    <div className="fs-sm">{translate("Brand Logo")}</div>
                                                    <UploadLogo
                                                        className="fs-sm h-90 lh-sm"
                                                        src={cardDetails.logo}
                                                        onHandleCardImage={(image) => onHandleCardImage("logo", image)}
                                                        onRemoveImage={() => onRemoveImage("logo")} />
                                                </div>
                                            ) : null}
                                        </div>
                                    </Accordion>
                                ) : null}

                                <Accordion
                                    className="accordion-primary"
                                    headerClassName="text-white"
                                    show={true}
                                    icon="/assets/svg/info-circle.svg"
                                    id="personalInfo"
                                    title={translate("Personal Information")}
                                >
                                    <Accordion
                                        className="accordion-white"
                                        headerClassName="text-black fs-sm py-1"
                                        show={true}
                                        id="bio-data"
                                        title={translate("Bio Data")}
                                    >
                                        <div className="p-0 px-3 px-lg-4">
                                            <Input
                                                multiline={true}
                                                rows={5}
                                                className="mb-2 h-10"
                                                name="about"
                                                value={cardDetails.about}
                                                handleChange={
                                                    onHandleCardChange
                                                }
                                                placeholder={translate(
                                                    "Write Something here..."
                                                )}
                                            />
                                        </div>
                                    </Accordion>
                                    <hr className="bg-black-600 my-1 mt-3" />
                                    <Accordion
                                        className="accordion-white"
                                        headerClassName="text-black fs-sm py-1"
                                        show={true}
                                        id="personal-details"
                                        title={translate("Personal Details")}
                                    >
                                        <div className="p-0 px-3 px-lg-4">
                                            <Input
                                                type="text"
                                                name="firstname"
                                                value={cardDetails.firstname}
                                                handleChange={
                                                    onHandleCardChange
                                                }
                                                placeholder={translate(
                                                    "First name"
                                                )}
                                                className="mb-2"
                                            />
                                            <Input
                                                type="text"
                                                name="lastname"
                                                value={cardDetails.lastname}
                                                handleChange={
                                                    onHandleCardChange
                                                }
                                                placeholder={translate(
                                                    "Last name"
                                                )}
                                                className="mb-2"
                                            />
                                            <Input
                                                type="text"
                                                name="job"
                                                value={cardDetails.job}
                                                handleChange={
                                                    onHandleCardChange
                                                }
                                                placeholder={translate(
                                                    "Job Title"
                                                )}
                                                className="mb-2"
                                            />
                                            <Input
                                                type="text"
                                                name="company"
                                                value={cardDetails.company}
                                                handleChange={
                                                    onHandleCardChange
                                                }
                                                placeholder={translate(
                                                    "Company name"
                                                )}
                                                className="mb-2"
                                            />
                                            <Input
                                                type="text"
                                                name="address"
                                                value={cardDetails.address}
                                                handleChange={
                                                    onHandleCardChange
                                                }
                                                placeholder={translate(
                                                    "Address"
                                                )}
                                                className="mb-2"
                                            />
                                            <Input
                                                type="text"
                                                name="phone"
                                                value={cardDetails.phone}
                                                handleChange={
                                                    onHandleCardChange
                                                }
                                                placeholder={translate(
                                                    "Phone number"
                                                )}
                                                className="mb-2"
                                            />
                                            <Input
                                                type="text"
                                                name="mobile"
                                                value={cardDetails.mobile}
                                                handleChange={
                                                    onHandleCardChange
                                                }
                                                placeholder={translate(
                                                    "Mobile number"
                                                )}
                                                className="mb-2"
                                            />
                                            <Input
                                                type="email"
                                                name="email"
                                                value={cardDetails.email}
                                                handleChange={
                                                    onHandleCardChange
                                                }
                                                placeholder={translate("Email")}
                                                className="mb-2"
                                            />
                                        </div>
                                        <hr className="bg-black-600 my-1 mt-3" />
                                    </Accordion>
                                    
                                    {props.settings.socials ? (
                                        <Accordion
                                            className="accordion-white"
                                            headerClassName="text-black fs-sm py-1"
                                            show={true}
                                            id="social-media"
                                            title={translate("Social Media")}>
                                            <div className="p-0 px-3 px-lg-4">
                                                {Object.keys(initSocials).map(
                                                    (social) => {
                                                        return (
                                                            <Input
                                                                key={social}
                                                                type="text"
                                                                name={social}
                                                                value={socials && typeof socials[social] !== "undefined" ? socials[social] : initSocials[social].placeholder}
                                                                handleChange={onHandleSocialChange}
                                                                placeholder={translate(social)}
                                                                className="mb-2"
                                                            />
                                                        );
                                                    }
                                                )}
                                            </div>
                                            <hr className="bg-black-600 my-1 mt-3" />
                                        </Accordion>
                                    ) : null}
                                    
                                    {props.settings.services ? (
                                        <Accordion
                                            className={`accordion-white`}
                                            headerClassName="text-black fs-sm py-1"
                                            show={true}
                                            id="services"
                                            title={translate("Services")}
                                        >
                                            <div className="position-relative" style={{position: 'relative'}}>
                                                <UpgradeToProOverlay title={translate('Upgrade to pro')} visible={auth.plan === "free"} />
                                                <Services
                                                    className={`p-0 px-3 px-lg-4 ${blurred}`}
                                                    service={service}
                                                    services={services}
                                                    onHandleServiceChange={onHandleServiceChange}
                                                    onSaveService={onSaveService}
                                                    onEditService={(s) => onEditService(s)}
                                                    onRemoveService={(s) => onRemoveService(s)} />
                                            </div>
                                            <hr className="bg-black-600 my-1 mt-3" />
                                        </Accordion>
                                    ) : null}

                                    {props.settings.gallery ? (
                                        <Accordion
                                            className={`accordion-white`}
                                            headerClassName="text-black fs-sm py-1"
                                            show={true}
                                            id="gallery"
                                            title={translate("Gallery")}>
                                            <div className="position-relative" style={{position: 'relative'}}>
                                                <UpgradeToProOverlay title={translate('Upgrade to pro')} visible={auth.plan === "free"} />
                                                <Galleries 
                                                    className={`p-0 px-3 px-lg-4 pb-4 ${blurred}`}
                                                    galleries={galleries}
                                                    loading={loadingGallery}
                                                    blurred={blurred}
                                                    onHandleGallery={onHandleGallery}
                                                    onRemoveGallery={gallery => onRemoveGallery(gallery)} />
                                            </div>
                                            <hr className="bg-black-600 my-1 mt-3" />
                                        </Accordion>
                                    ) : null}

                                    {props.settings.projects ? (
                                        <Accordion
                                            className={`accordion-white`}
                                            headerClassName="text-black fs-sm py-1"
                                            show={true}
                                            id="projects"
                                            title={translate("Projects")}>
                                            <div className="position-relative" style={{position: 'relative'}}>
                                                <UpgradeToProOverlay title={translate('Upgrade to pro')} visible={auth.plan === "free"} />
                                                <Projects 
                                                    className={`p-0 px-3 px-lg-4 ${blurred}`}
                                                    projects={projects}
                                                    selectedProject={project}
                                                    onHandleProjectImage={onHandleProjectImage}
                                                    onHandleProjectChange={onHandleProjectChange}
                                                    onSaveProject={onSaveProject}
                                                    onEditProject={p => onEditProject(p)}
                                                    onRemoveImage={setProject}
                                                    onRemoveProject={p => onRemoveProject(p)} />
                                            </div>
                                            <hr className="bg-black-600 my-1 mt-3" />
                                        </Accordion>
                                    ) : null}

                                    {props.settings.documents ? (
                                        <Accordion
                                            className={`accordion-white`}
                                            headerClassName="text-black fs-sm py-1"
                                            show={true}
                                            id="documents"
                                            title={translate("Documents")}>
                                            <div className="position-relative" style={{position: 'relative'}}>
                                                <UpgradeToProOverlay title={translate('Upgrade to pro')} visible={auth.plan === "free"} />
                                                <Documents
                                                className={`p-0 px-3 px-lg-4 pb-4 ${blurred}`}
                                                documents={documents}
                                                onHandleFile={file => onAddDocument(file)}
                                                onRemoveDocument={onRemoveDocument} />
                                            </div>
                                            <hr className="bg-black-600 my-1 mt-3" />
                                        </Accordion>
                                    ) : null}

                                    {props.settings.custom_codes ? (
                                        <Accordion
                                            className="accordion-white"
                                            headerClassName="text-black fs-sm py-1"
                                            show={true}
                                            id="customCodes"
                                            //title={translate("Add Videos and Custom Codes (e.g. Calendly, Certificates)")}
                                            titleComponent={() => {
                                                return (
                                                    <div>
                                                        <span>{translate("Add Videos and Custom Codes")} </span>
                                                        <span>{'(e.g. '}</span>
                                                        <span onClick={(e) => {
                                                            window.open('https://calendly.com/');
                                                            e.stopPropagation();
                                                        }} style={{cursor: 'pointer'}} className="text-decoration-underline">
                                                            Calendly,{' '}
                                                        </span>
                                                        <span>{translate('Certificates')} {')'}</span>
                                                    </div>
                                                )
                                            }}>
                                                <div className="position-relative" style={{position: 'relative'}}>
                                                    <UpgradeToProOverlay title={translate('Upgrade to pro')} visible={auth.plan === "free"} />
                                                    <CustomCodes
                                                        className={`p-0 px-3 px-lg-4 pb-4 ${blurred}`}
                                                        selectedSource={customSourceType}
                                                        customCodes={customCodes}
                                                        selectedCustomCode={customCodesDetails}
                                                        onHandleSourceType={type => setCustomSourceType(type)}
                                                        onHandleChange={onHandleCustomCodesChange}
                                                        onSave={onSaveCustomCode}
                                                        onEdit={onEditCustomCode}
                                                        onRemove={onRemoveCustomCode} />
                                                </div>
                                        </Accordion>
                                    ) : null}
                                </Accordion>

                                <Accordion
                                    className="accordion-primary pb-5 bg-white"
                                    headerClassName="text-white"
                                    show={true}
                                    icon="/assets/svg/setting.svg"
                                    id="settings"
                                    title={translate("Settings")}
                                >

                                    <div className="position-relative" style={{position: 'relative'}}>
                                        <UpgradeToProOverlay title={translate('Upgrade to pro')} visible={auth.plan === "free"} />
                                        <div className={blurred}>
                                            {props.settings.google_review ? (
                                                <div className="text-black fs-sm py-1">
                                                    <div className="mx-4 mb-3">
                                                        <Switch name="google_review" label={translate("Google Review")} checked={settings.show_review} onHandleChange={() => onHandleSettingsChange('show_review', !settings.show_review)} switchClass='mt-1' />
                                                    </div>
                                                    <GoogleReview
                                                        loading={loadingReviews}
                                                        className="p-0 px-3 px-lg-4 pb-8 pb-lg-4 fs-sm"
                                                        selectedPlace={{placeId: settings.placeId, placeName: settings.placeName}}
                                                        onHandleChange={onHandleChangePlace} />
                                                </div>
                                            ) : null}

                                            <Accordion
                                                className="accordion-white"
                                                headerClassName="text-black fs-sm py-1"
                                                show={true}
                                                id="seo-settings"
                                                title={translate("SEO")}>
                                                <div className="mx-3 pb-4">
                                                    <Input
                                                        type="text"
                                                        name="metaTitle"
                                                        value={settings.metaTitle}
                                                        handleChange={(e) => onHandleSettingsChange('metaTitle', e.target.value)}
                                                        placeholder={translate("Meta Title")}
                                                        className="mb-2"
                                                    />
                                                    <Input
                                                        type="text"
                                                        name="metaDescription"
                                                        value={settings.metaDescription}
                                                        handleChange={(e) => onHandleSettingsChange('metaDescription', e.target.value)}
                                                        placeholder={translate("Meta Description")}
                                                        className="mb-2"
                                                    />
                                                </div>
                                            </Accordion>
                                            
                                            {props.settings.colors ? (
                                                <Accordion
                                                    className="accordion-white"
                                                    headerClassName="text-black fs-sm py-1"
                                                    show={true}
                                                    id="colors-settings"
                                                    title={translate("Colors")}
                                                >
                                                    <ColorSettings
                                                        className="mx-3"
                                                        settings={settings}
                                                        onHandleChangeQRColor={c => onHandleSettingsChange("qrColor", c)}
                                                        onHandleChangeButtonBgColor={c => onHandleSettingsChange("background", c)}
                                                        onHandleChangeButtonTextColor={c => onHandleSettingsChange("color", c)} />
                                                </Accordion>
                                            ) : null}

                                            {contactButtons.filter(obj => obj.value && obj.value !== '').length > 0 && (
                                                <Accordion
                                                    className="accordion-white"
                                                    headerClassName="text-black fs-sm py-1 pt-8 pt-lg-4"
                                                    show={settings.contactButtons && settings.contactButtons.length >0}
                                                    id="contact-buttons-settings"
                                                    title={translate("Contact Buttons")}
                                                >
                                                    <div className="d-flex align-items-center flex-wrap p-4 pt-2">
                                                        {contactButtons.map(button => {
                                                            if(!button.value || button.value === '') return null;

                                                            const isSelected = settings.contactButtons.filter(obj => obj.key === button.key).length > 0;
                                                            const backColor = isSelected ? button.color : '#f3f4f6';
                                                            const frontColor = isSelected ? '#ffffff' : '#b0b0b0';
                                                            return (
                                                                <div key={button.key} onClick={() => onToggleContactButtons(button)} tooltip={button.label} className="rounded-pill me-2 d-flex justify-content-center align-items-center" style={{backgroundColor: backColor, width: 40, height: 40, cursor: 'pointer'}}>
                                                                    <FontAwesome name={button.icon} color={frontColor} size={button.size} />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </Accordion>
                                            )}

                                            <Accordion
                                                className="accordion-white"
                                                headerClassName="text-black fs-sm py-1"
                                                show={true}
                                                id="footer-settings"
                                                title={translate("Footer")}>
                                                <div className="mx-3">
                                                    <Input
                                                        type="text"
                                                        name="imprint"
                                                        value={settings.imprint.length > 0 ? settings.imprint : 'https://'}
                                                        handleChange={(e) => onHandleSettingsChange('imprint', e.target.value)}
                                                        placeholder={translate("Link to imprint")}
                                                        className="mb-2"
                                                    />
                                                    <Input
                                                        type="text"
                                                        name="privacyPolicy"
                                                        value={settings.privacyPolicy.length > 0 ? settings.privacyPolicy : 'https://'}
                                                        handleChange={(e) => onHandleSettingsChange('privacyPolicy', e.target.value)}
                                                        placeholder={translate("Link to privacy policy")}
                                                        className="mb-2"
                                                    />
                                                </div>
                                            </Accordion>
                                        </div>
                                    </div>
                                </Accordion>
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

                            <VLinkInput
                                className="ms-4"
                                protocol={protocol}
                                subdomain={subdomain}
                                domain={domain}
                                onHandleChange={onHandleDomainChange}
                                onHandleShare={onHandleShareDomain}
                            />

                            <div className="w-10"></div>
                        </div>
                        <div className="h-90 overflow-scroll" 
                            onScroll={(event) => {
                                setScrollTop(event.currentTarget.scrollTop);
                            }}>
                            <div className="d-flex justify-content-center overflow-hidden">
                                <SitePreview
                                    view={viewType}
                                    socials={socials}
                                    card={cardDetails}
                                    projects={projects}
                                    services={services}
                                    documents={documents}
                                    customCodes={customCodes}
                                    galleries={galleries}
                                    settings={settings}
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
                                        card={cardDetails}
                                        socials={socials}
                                        projects={projects}
                                        services={services}
                                        documents={documents}
                                        customCodes={customCodes}
                                        galleries={galleries}
                                        settings={settings}
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
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{maxWidth: '600px'}}>
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
                                        <li className="nav-item" onClick={() => setCoverSelectedType('video')}>
                                            <a className={`nav-link ${coverSelectedType === 'video' ? 'active' : ''}`} href="#">{translate('Upload Video')}</a>
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
                                                    {translate("Drag the image you want to upload")}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* {coverSelectedType === 'video' && (
                                        <div {...getRootVideoProps({ className: "dropzone bg-white py-5 mb-6 d-flex align-items-center justify-content-center rounded-10"})} style={{border: "1px dashed #828FA7"}}>
                                           <input
                                                {...getInputVideoProps()}/>
                                            <div className="text-center">
                                                <img src="/assets/svg/document-upload.svg" />
                                                <div className="fs-sm text-blue-500 mt-3">
                                                    {translate("Drag the video you want to upload")}
                                                </div>
                                            </div>
                                        </div>
                                    )} */}
                                    {coverSelectedType === 'video' && (
                                        <div
                                            {...getRootVideoProps({
                                                className: "dropzone bg-white py-5 mb-6 d-flex align-items-center justify-content-center rounded-10",
                                            })}
                                            style={{ border: "1px dashed #828FA7", position: "relative" }}
                                        >
                                            <input {...getInputVideoProps()} />

                                            {/* Spinner overlay when loading */}
                                            {coverVideoUploadLoading && (
                                                <div
                                                    className="position-absolute d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75 w-100 h-100"
                                                    style={{
                                                        top: 0,
                                                        left: 0,
                                                        zIndex: 10,
                                                    }}
                                                >
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">{translate("Uploading...")}</span>
                                                    </div>
                                                    <div className="text-muted fs-sm mt-2">{translate("Uploading video...")}</div>
                                                </div>
                                            )}

                                            {/* Content when not loading */}
                                            {!coverVideoUploadLoading && (
                                                <div className="text-center">
                                                    <img src="/assets/svg/document-upload.svg" />
                                                    <div className="fs-sm text-blue-500 mt-3">
                                                        {translate("Drag the video you want to upload")}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {coverSelectedType === 'color' && (
                                        <div className="mt-3 mb-6 d-flex align-items-center justify-content-center">
                                            <ColorPicker type='chromepicker' color={settings.cover_overlay} onHandleChange={onHandleCoverColor} />
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
                                                {console.log('result libraries', resultLibraries)}
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

                <ShareSiteModal id='sharesite-modal' card={cardDetails} />
            </div>

             <svg 
             width='0' height='0' style={{position: 'absolute'}}
              id="svg-filter">
                <filter id="svg-blur">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4"></feGaussianBlur>
                </filter>
            </svg>
        </Authenticated>
    );
}
