import React, { useEffect, useState, useRef } from "react";
import Button from "@/Components/Button";
import IconButton from "@/Components/IconButton";
import Document from "@/Components/Document";
import ProfilePicture from "@/Components/ProfilePicture";
import ApplicationLogo from "@/Components/ApplicationLogo";
import VideoCover from "@/Components/VideoCover";
import PhotoCover from "@/Components/PhotoCover";
import { socials as socialsHelper, translate, getCookie, setCookie, toast } from "@/Helpers";
import MobileIcon from "@/svg/MobileIcon";
import { FontAwesome, FontAwesome5 } from "react-web-vector-icons";
import { Rating } from "react-simple-star-rating";
import axios from "axios";
import { Modal } from "bootstrap";
import Google from "@/svg/Google";
import { usePage, Link, Head } from "@inertiajs/inertia-react";
import { Row, Col } from "react-bootstrap";
import Project from "../Components/Project";
import Footer from "@/Components/Footer";
import { Container, Button as FAButton, Link as FABLink } from 'react-floating-action-button';
import ReactPlayer from 'react-player';
import parse from 'react-html-parser';
import SocialIcon from "@/Components/SocialIcon";
import MessageBox from "@/Components/MessageBox";
import QRCode from 'react-qr-code';

export default function SitePreview({
    isPublic,
    preview,
    card,
    socials,
    projects,
    services,
    documents,
    customCodes,
    galleries,
    settings,
    view,
    width,
    showContactButton
}) {
    const containerRef = useRef(null);
    const coverRef = useRef();
    const aboutRef = useRef(null);
    const { domain, protocol } = usePage().props;
    

    const [lang, setLang] = useState(getCookie('locale'));
    useEffect(() => {
        if(!lang) {
            const bLang = navigator.language.split('-');
            let newLang = (bLang.length > 0 && ['en', 'de'].includes(bLang[0])) ? bLang[0] : 'en';
            setCookie('locale', newLang);
            setLang(newLang);

            // axios.get(route(`/set/language`), {lang: newLang});
        }
    }, [lang]);

 
    const [isMobile, setIsMobile] = useState(false);
    const [isDesktop, setIsDesktop] = useState(true);
    const [image, setImage] = useState(null);
    const [selProject, setSelProject] = useState(null);
    const { auth } = usePage().props;
    const [sortedSocials, setSortedSocials] = useState(socials);
    const [mainSocials, setMainSocials] = useState([]);
    const [isFabOpen, setIsFabOpen] = useState(false);
    
   const [showFAB, setShowFAB] = useState(showContactButton || false);
    // const [showFAB, setShowFAB] = useState(false);

    useEffect(() => {
        if(!isPublic || preview) setShowFAB(showContactButton);
    }, [showContactButton]);

    useEffect(() => {
        if (auth.plan !== 'free' && isPublic) {
            const handleScroll = event => setShowFAB(window.scrollY >= 250);
            window.addEventListener('scroll', handleScroll);
          
            return () => {
                window.removeEventListener('scroll', handleScroll);
            };
        }
    }, []);

    useEffect(() => {
        let timeout;
    
        const handleScroll = () => {
            if (isFabOpen) {
                setIsFabOpen(false); 
            }
    
           
            clearTimeout(timeout);
            timeout = setTimeout(() => setIsFabOpen(true), 500); 
        };
    
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isFabOpen]);

    useEffect(() => {
        let favIcon = document.querySelector("link[rel~='icon']");
        if (!favIcon) {
            favIcon = document.createElement('link');
            favIcon.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(favIcon);
        }
        favIcon.href = card.avatar;

        let homeIcon = document.querySelector("link[rel~='apple-touch-icon-precomposed']");
        if (!homeIcon) {
            homeIcon = document.createElement('link');
            homeIcon.rel = 'apple-touch-icon-precomposed';
            document.getElementsByTagName('head')[0].appendChild(homeIcon);
        }
        homeIcon.href = card.avatar;
    }, []);

    useEffect(async () => {
        if (typeof view !== "undefined") {
            setIsMobile(view === "mobile");
            setIsDesktop(view === "desktop");
        }
    }, [view]);

    useEffect(() => {
        if (image !== null) {
            document
                .getElementById("image-preview-modal")
                .addEventListener("hidden.bs.modal", function (event) {
                    setImage(null);
                });
        }
    }, [image]);

    useEffect(() => {
        if (selProject !== null) {
            new Modal(document.getElementById("project-modal")).show();
            document
                .getElementById("project-modal")
                .addEventListener("hidden.bs.modal", function (event) {
                    setSelProject(null);
                });
        }
    }, [selProject]);

    const [reviews, setReviews] = useState(null);

    useEffect(() => {
        function getReviews() {
            axios.get(route("cards.reviews", settings.placeId)).then((data) => {
                setReviews(data.data);
            });
        }
        if (settings.placeId && settings.placeId !== "" && reviews === null) {
            getReviews();
        }
    }, [settings.placeId, reviews]);

    const number = num => {
        return num.replace(/[.*?^+#;,${}()|/[\]\\-\s]/g, '');
    }

    const toggleFAB = () => {
        setIsFabOpen(prevState => !prevState);
        console.log("Toggled");
    };

    const onOpenSocial = async (social, url) => {
        try {
            // await axios.post(("/analytics.store"), {
            //     social,
            //     card_id: card.id,
            //     type: "click",
            // });
    
            await axios.post("/analytics", {
                social,
                card_id: card.id,
                type: "share",
            });
    
            switch (social) {
                case "skype":
                    window.open(`skype:${url}`);
                    break;
                case "whatsapp":
                    window.open(whatsAppUrl(url));
                    break;
                default:
                    const fullUrl =
                        url.indexOf("http://") === -1 && url.indexOf("https://") === -1
                            ? "https://" + url
                            : url;
                    window.open(fullUrl);
                    break;
            }
        } catch (error) {
            console.error("Error in onOpenSocial:", error);
        }
    };
    
    const whatsAppUrl = (value) => {
        return `https://api.whatsapp.com/send?phone=${number(value)}`;
    }

    const shareCard = async (social, url) => {
        try{
            console.log('from')
            // await axios.post(route("analytics.store"), {
            //     social,
            //     card_id: card.id,
            //     type: "click",
            // });
    
            await axios.post("/analytics", {
                social,
                card_id: card.id,
                type: "share",
            });
            console.log('tooo')
            window.open(url);
        }catch(error){
            console.error("Error in onOpenSocial:", error); 
        } 
    };

    const initCallback = {
        card_id: card.id,
        name: "",
        email: "",
        reachability: "",
        phone: "",
        accept: false,
    };
    const [callBack, setCallBack] = useState(initCallback);
    const [sending, setSending] = useState(false);

    const onhandleCallbackChange = (e) => {
        if (e.target.type === "checkbox") {
            return setCallBack({
                ...callBack,
                [e.target.name]: !callBack.accept,
            });
        }
        setCallBack({ ...callBack, [e.target.name]: e.target.value });
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
                setCallBack(initCallback);
                toast(translate("Contact Information successfully downloaded and sent to your email"));
                
                modal.hide();
                
                window.open(`/download${!isPublic ? "?identifier=" + card.identifier : ""}`);

                setSending(false);
            })
            .catch((e) => {
                toast(translate("Cannot send request"), "error");
                setSending(false);
            });
    };

    useEffect(() => {
        const sortSocials = () => {
            let keys = Object.keys(socials);
            var presetOrder = [
                "website",
                "whatsapp",
                "linkedin",
                "facebook",
                "instagram",
                "tiktok",
            ];
    
            var result = [], i, j;
    
            for (i = 0; i < presetOrder.length; i++)
                while (-1 != (j = keys.indexOf(presetOrder[i])))
                    result.push(keys.splice(j, 1)[0]);
    
            return result.concat(keys);
        };
        const socs = sortSocials();
        const allSoc = sortSocials();
        const mainSoc = allSoc.splice(0, 5);
    
        setSortedSocials(socs);
        setMainSocials(mainSoc);
    }, [socials]);

    const profileMobile = isMobile ? { right: 0, marginInline: "auto" } : {};
    const profileStyle = {
        //bottom: "-60px",
        left: isDesktop ? "17px" : 0,
        ...profileMobile,
    };

    let container = "w-100";
    let contact = "d-block d-lg-flex align-items-center";
    if (typeof view !== "undefined") {
        container = view === "mobile" ? "w-50 w-xl-40" : "w-100";
        contact = view === "mobile" ? "d-block" : "d-lg-flex align-items-center";
    }

    let countContact = 0;
    if (card.phone) countContact++;
    if (card.mobile) countContact++;

    let qrboxstyles = {};
    if (!isPublic && !preview) {
        qrboxstyles = {
            paddingLeft: isDesktop ? '30%' : '5%',
            paddingRight: isDesktop ? '30%' :'5%',
        }
    }

    let fabPosBottom = '1vh';
    let fabPosRight = '2vh';
    if(preview) {
        fabPosBottom = '15vh';
        fabPosRight = '2vh';
    } else if(!isPublic) {
        fabPosBottom = (isDesktop ? '3vh' : '3vh');
        fabPosRight = (isDesktop ? '5vh' : '40vh');
    }

    const [profileTop, setProfileTop] = useState(0);
    useEffect(() => {
        if(isPublic || preview) {
            console.log('coverRef', coverRef);
            function h() {
                if(coverRef.current) {
                    const top = coverRef.current.clientHeight - 75;
                    setProfileTop(top);
                }
            }
            h();
            window.addEventListener("resize", h);
    
            return () => {
                window.removeEventListener("resize", h)
            }
        }
    }, [coverRef, coverRef.current, isPublic]);

    useEffect(() => {
        if(!isPublic) {
            let coverHeight = isDesktop ? 450 : 250;
            setProfileTop(coverHeight - 75);
        }
    }, [isPublic, card.cover_type, isDesktop, isMobile])

    console.log('sortedSocials:', sortedSocials);
console.log('settings.contactButtons:', settings.contactButtons);
console.log('reviews:', reviews);
console.log('settings.imprint:', settings.imprint);
console.log('settings.privacyPolicy:', settings.privacyPolicy);

    return (
        <div ref={containerRef} className="container-lg d-flex justify-content-center p-0 p-lg-3 ">
            <Head>
                <title>{settings.metaTitle}</title>
                <meta name="description" content={settings.metaDescription} />
            </Head>
            <div className={`p-0 pb-4 bg-white rounded-0 rounded-lg-20 ${container} position-relative`} style={{ transition: "width 0.2s" }}>
                
                {card.cover_type === 'photo' 
                    ? <PhotoCover coverRef={coverRef} cardAvatar={card.avatar} isMobile={isMobile} isDesktop={isDesktop} url={card.cover} color={settings.cover_overlay} logo={card.logo} isPublic={isPublic} plan={auth.plan} /> 
                    : <VideoCover coverRef={coverRef} cardAvatar={card.avatar} isMobile={isMobile} isDesktop={isDesktop} url={card.cover} color={settings.cover_overlay} logo={card.logo} isPublic={isPublic} plan={auth.plan} /> }

                {/* <ProfilePicture
                    profileImg={card.avatar}
                    brandImg={card.logo}
                    brandColor={settings.cover_overlay}
                    size={150}
                    className="position-absolute profile-picture"
                    style={{
                        zIndex: 10,
                        top: profileTop,
                        ...profileStyle
                    }}
                />             */}

            
                <div className={`row m-0 mt-7 ${isDesktop ? "mt-lg-0" : ""}`}>
                    {/** Profile details */}
                    <div className={`profile-details pt-3 mb-3 ${isDesktop ? "col-lg-8" : ""}`}
                        style={typeof view !== "undefined" ? {textAlign: isMobile ? "center" : "left", paddingLeft: isMobile ? 0 : "180px"}: {}}>
                        <h1>
                            <span className="fs-header fw-bold">{card.firstname} {card.lastname}</span>
                        </h1>

                        <h2>
                            <span className="fs-reg">
                                {card.job && card.job}
                                {card.company && card.company !== "" && (
                                    <span>{" "}@{" "}<span className="fw-bold">{card.company}</span></span>
                                )}
                            </span>
                        </h2>

                        {(card.phone || card.mobile || card.email) && (
                            <>
                                <div className={contact}>
                                    {card.phone && (
                                        <div className="fs-reg d-flex align-items-center justify-content-center me-0 me-lg-3">
                                            <FontAwesome name="phone" color="black" size={20} />
                                            <a href={`tel:${card.phone}`}className="ms-2 text-decoration-none">{card.phone}</a>
                                        </div>
                                    )}

                                    {card.mobile && (
                                        <div className="fs-reg d-flex align-items-center justify-content-center me-0 me-lg-3">
                                            <FontAwesome name="mobile" color="black" size={25} />
                                            <a href={`tel:${card.mobile}`}className="ms-2 text-decoration-none">{card.mobile}</a>
                                        </div>
                                    )}

                                    {countContact < 2 && (
                                        <div className="fs-reg d-flex align-items-center justify-content-center">
                                            <FontAwesome name="envelope-o" color="black" size={20} />
                                            <a href={`mailto:${card.email}`} className="ms-2 text-decoration-none">{card.email}</a>
                                        </div>
                                    )}
                                </div>

                                {card.email && countContact === 2 && (
                                    <div className={contact}>
                                        <div className="fs-reg d-flex align-items-center justify-content-center">
                                            <FontAwesome
                                                name="envelope-o"
                                                color="black"
                                                size={20}
                                            />
                                            <a href={`mailto:${card.email}`} className="ms-2 text-decoration-none">{card.email}</a>
                                        </div>
                                    </div>
                                )}
                                {console.log('auuuuttthh', auth.plan)}
                                {auth.plan !== "free" && (
                                    <div className={`d-inline-block pt-3 ${isDesktop ? "pt-lg-1" : ""}`}>
                                        <a
                                            data-bs-toggle="modal"
                                            data-bs-target="#savecontact-modal"
                                            // href={`/download${
                                            //     !isPublic
                                            //         ? "?identifier=" +
                                            //           card.identifier
                                            //         : ""
                                            // }`}
                                            className="btn btn-sm"
                                            style={{
                                                color: settings.color,
                                                background: settings.background,
                                            }}
                                        >
                                            {translate("Save Contact Details")}
                                        </a>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className={`mt-3 ${isDesktop ? "col-lg-4" : ""}`}>
                        {sortedSocials?.length > 0 ? (
                            <div
                                className={`d-flex align-items-center ${
                                    isDesktop
                                        ? " justify-content-center justify-content-lg-end"
                                        : " justify-content-center"
                                } `}
                            >
                                {mainSocials.map((social) => {
                                    const aesthetics = socialsHelper()[social];
                                    return (
                                        <SocialIcon
                                            key={social}
                                            onClick={() =>
                                                onOpenSocial(
                                                    social,
                                                    socials[social]
                                                )
                                            }
                                            className="me-2"
                                            url={socials[social]}
                                            color={aesthetics.color}
                                            icon={
                                                aesthetics.icon
                                                    ? aesthetics.icon
                                                    : social
                                            }
                                        />
                                    );
                                })}
                                {sortedSocials.length > 5 && (
                                    <>
                                        <a
                                            href="#"
                                            role="button"
                                            id="socialDropdown"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <IconButton
                                                className="me-2"
                                                width={20}
                                                height={20}
                                                icon="../../assets/svg/ellipsis.svg"
                                            />
                                        </a>

                                        <div
                                            className="dropdown-menu dropdown-menu-end bg-light border-light-gray-1 rounded-10"
                                            aria-labelledby="socialDropdown"
                                            style={{ width: "40vh"}}
                                        >
                                            <div className="d-flex justify-content-center flex-wrap ps-2 pt-2">
                                                {Object.keys(socials).map(
                                                    (social) => {
                                                        const aesthetics =
                                                            socialsHelper()[
                                                                social
                                                            ];
                                                        return (
                                                            <SocialIcon
                                                                key={social}
                                                                onClick={() =>
                                                                    onOpenSocial(
                                                                        social,
                                                                        socials[
                                                                            social
                                                                        ]
                                                                    )
                                                                }
                                                                className="me-2 mb-2"
                                                                url={
                                                                    socials[
                                                                        social
                                                                    ]
                                                                }
                                                                color={
                                                                    aesthetics.color
                                                                }
                                                                icon={
                                                                    aesthetics.icon
                                                                        ? aesthetics.icon
                                                                        : social
                                                                }
                                                            />
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className={`row m-0 px-3 mb-5 pb-5 `}>
                    <div>
                        {card.about && card.about !== "" && typeof card.about !== "undefined" ? (
                            <div className="mt-4">
                                <div className="fs-header fw-bolder mb-3">
                                    {translate("About Me")}
                                </div>
                                <div
                                    ref={aboutRef}
                                    className="fs-reg"
                                    style={{ whiteSpace: "pre-line", overflowWrap: 'break-word' }}>
                                    {card.about}
                                </div>
                            </div>
                        ) : null}

                        {services &&
                        services.length > 0 &&
                        auth.plan !== "free" ? (
                            <div className="mt-4">
                                <div className="fs-header fw-bolder mb-3">
                                    {translate("My Services")}
                                </div>
                                <div className="fs-reg">
                                    <div
                                        className="accordion accordion-services accordion-flush"
                                        id="accordionServices"
                                    >
                                        {services.map((service, index) => {
                                            return (
                                                <div
                                                    key={service.id}
                                                    className="accordion-item p-0"
                                                >
                                                    <div
                                                        className="accordion-header m-0 p-0"
                                                        id={`serviceHeader${service.id}`}
                                                    >
                                                        <div
                                                            style={{fontSize: '20px', fontWeight: '600', cursor: 'default'}}
                                                            className={`accordion-button text-primary px-0 py-2 ${index !== 0 ? 'collapsed' : ''}`}
                                                            data-bs-toggle="collapse"
                                                            data-bs-target={`#serviceCollapse${service.id}`}
                                                            aria-expanded="true"
                                                            aria-controls={`serviceCollapse${service.id}`}
                                                        >
                                                            {service.title}
                                                        </div>
                                                    </div>
                                                    <div
                                                        id={`serviceCollapse${service.id}`}
                                                        className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                                                        aria-labelledby={`serviceHeader${service.id}`}
                                                        data-bs-parent="#accordionServices"
                                                    >
                                                        <div className="accordion-body p-0 fs-reg">
                                                            {
                                                                service.description
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {galleries && galleries.length > 0 && auth.plan !== "free" ? (
                            <div className="mt-4">
                                <div className="fs-header fw-bolder mb-3">
                                    {translate("Gallery")}
                                </div>
                                <div className="row m-0">
                                    {galleries.map(gallery => {
                                        return (
                                            <div className={`${!isPublic ? isDesktop ? 'col-lg-4' : '' : 'col-lg-4'} mb-3`}>
                                                <img src={gallery.url} className="d-none d-lg-flex cursor-pointer rounded-10" onClick={() => setImage(gallery.url)} data-bs-toggle="modal" data-bs-target="#image-preview-modal" width='100%' height='100%'  style={{objectFit: "cover", height: isPublic ? '200px' : '180px'}} />
                                                <img src={gallery.url} className="d-flex d-lg-none rounded-10" width='100%' height='100%'  style={{objectFit: "cover", height: isPublic ? '200px' : '180px'}} />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : null}

                        <Row>
                            <Col xs={12}>
                                {projects &&
                                projects.length > 0 &&
                                auth.plan !== "free" ? (
                                    <div className="mt-4">
                                        <div className="fs-header fw-bolder mb-4">
                                            {translate("Projects")}
                                        </div>
                                        <div className="row m-0">
                                            {projects.map((project) => {
                                                const col =
                                                    isDesktop &&
                                                    projects.length > 0
                                                        ? "col-lg-6"
                                                        : "";
                                                return (
                                                    <div
                                                        key={project.id}
                                                        className={col}
                                                    >
                                                        <Project
                                                            size={
                                                                isDesktop
                                                                    ? "250px"
                                                                    : "180px"
                                                            }
                                                            attachment={
                                                                project.attachment
                                                            }
                                                            link={project.link}
                                                            title={
                                                                project.title
                                                            }
                                                            description={
                                                                project.description
                                                            }
                                                            company={
                                                                project.company
                                                            }
                                                            month={
                                                                project.month
                                                            }
                                                            year={project.year}
                                                            onClickImage={(
                                                                proj
                                                            ) =>
                                                                setSelProject(
                                                                    proj
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : null}
                            </Col>
                            <Col xs={12}>
                                {documents &&
                                documents.length > 0 &&
                                auth.plan !== "free" ? (
                                    <div className="mt-4">
                                        <div className="fs-header fw-bolder mb-3">
                                            {translate("Documents")}
                                        </div>
                                        <div className="row m-0">
                                            {documents.map((document) => {
                                                const col =
                                                    isDesktop &&
                                                    documents.length > 0
                                                        ? "col-lg-6"
                                                        : "";
                                                return (
                                                    <div
                                                        key={document.id}
                                                        className={col}
                                                    >
                                                        <Document
                                                            file={document}
                                                            handleOnClickIcon={() => {}}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : null}
                            </Col>
                        </Row>
                        {settings.show_review && reviews && reviews.reviews.length > 0 && auth.plan !== "free" ? (
                            <div className="mt-5 d-flex justify-content-center align-items-center flex-column">
                                <div className="fs-header fw-bolder mb-2 d-flex align-items-center">
                                    {translate("Google Reviews")}
                                </div>
                                {/** Google Rating */}
                                <div
                                    className="mt-4"
                                    style={{ maxWidth: "900px" }}
                                >
                                    <div className={`${!isPublic ? (isDesktop ? 'mx-5' : 'mx-0') : 'mx-0 mx-lg-5'} d-flex p-3 rounded-10 mb-2 align-items-end justify-content-between bg-light border-light-gray-1`}>
                                        <div className="mb-0">
                                            <div className="d-flex">
                                                <Google />
                                                <span className="fs-reg mx-2 mt-1">
                                                    {translate('Rating')}
                                                </span>
                                            </div>
                                            {reviews && reviews.average && (
                                                <div className="d-flex align-items-end fs-reg">
                                                    <span className="me-1">
                                                        {reviews.average}
                                                    </span>
                                                    <Rating
                                                        initialValue={
                                                            reviews.average
                                                        }
                                                        ratingValue={0}
                                                        size={15}
                                                        readonly
                                                        transition
                                                        allowHalfIcon
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className={`d-flex ${
                                                isMobile
                                                    ? "flex-column-reverse"
                                                    : "flex-column-reverse flex-sm-row "
                                            } align-items-center justify-content-end mb-1`}
                                        >
                                            {reviews && reviews.all && (
                                                <div
                                                    className={`d-flex justify-content-center mt-3 ${
                                                        isMobile
                                                            ? " "
                                                            : "mt-sm-0"
                                                    } `}
                                                >
                                                    <a
                                                        href={reviews.all}
                                                        style={{
                                                            color: settings.background,
                                                        }}
                                                        className="lh-1 fs-sm "
                                                        target="_blank"
                                                    >
                                                        {translate("View all")}
                                                    </a>
                                                </div>
                                            )}
                                            {reviews && reviews.add && (
                                                <div
                                                    className={`${
                                                        isDesktop
                                                            ? "ms-3 ms-lg-4"
                                                            : "ms-2"
                                                    }`}
                                                >
                                                    <a
                                                        href={reviews.add}
                                                        style={{
                                                            color: settings.color,
                                                            backgroundColor:
                                                                settings.background,
                                                        }}
                                                        className="btn btn-sm"
                                                        target="_blank"
                                                    >
                                                        {translate(
                                                            "Write a Review"
                                                        )}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        id="review-carousel"
                                        className={`mt-3 ${!isPublic ?  (isDesktop ? 'mx-5' : '') : 'mx-0 mx-lg-5 '} carousel carousel-dark slide pb-5 carousel-fade`}
                                        data-bs-ride="carousel"
                                    >
                                        <div className="carousel-indicators">
                                            {reviews.reviews.map(
                                                (review, i) => {
                                                    return (
                                                        <button
                                                            key={review.id}
                                                            type="button"
                                                            data-bs-target="#review-carousel"
                                                            className={
                                                                i == 0
                                                                    ? "active"
                                                                    : ""
                                                            }
                                                            data-bs-slide-to={i}
                                                        ></button>
                                                    );
                                                }
                                            )}
                                        </div>
                                        <div className={`carousel-inner `}>
                                            {reviews.reviews.map(
                                                (review, i) => {
                                                    return (
                                                        <div key={review.id} className={"carousel-item " + (i == 0 ? "active": "")}>
                                                            <GoogleReview review={review} />
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                        <button
                                            className="carousel-control-prev"
                                            style={{ width: "20px", marginTop: "-50px" }}
                                            type="button"
                                            data-bs-target="#review-carousel"
                                            data-bs-slide="prev">
                                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                            <span className="visually-hidden">{translate("Previous")}</span>
                                        </button>
                                        <button
                                            className="carousel-control-next"
                                            style={{
                                                width: "20px",
                                                marginTop: "-50px",
                                            }}
                                            type="button"
                                            data-bs-target="#review-carousel"
                                            data-bs-slide="next">
                                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                            <span className="visually-hidden">
                                                {translate("Next")}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                        {/** Contact/Inquiry */}
                        {/* {auth.plan !== "free" && (
                            <div className="mt-6">
                                <form
                                    className="text-light py-4 py-md-5 px-3 px-md-5 rounded-10"
                                    style={{
                                        backgroundColor: settings.formColor,
                                    }}
                                >
                                    <div className="fs-header fw-bolder mb-2">
                                        {translate("Request a free Callback")}
                                    </div>
                                    <div>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                onChange={
                                                    onhandleCallbackChange
                                                }
                                                value={callBack.name}
                                                className="form-control form-control-primary"
                                                name="name"
                                                placeholder={translate("Name")}
                                                style={{
                                                    border: `1px solid ${settings.background}`,
                                                    backgroundColor:
                                                        settings.formColor,
                                                }}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                onChange={
                                                    onhandleCallbackChange
                                                }
                                                value={callBack.phone}
                                                className="form-control form-control-primary"
                                                name="phone"
                                                placeholder={translate(
                                                    "Phone Number"
                                                )}
                                                style={{
                                                    border: `1px solid ${settings.background}`,
                                                    backgroundColor:
                                                        settings.formColor,
                                                }}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <input
                                                type="email"
                                                onChange={
                                                    onhandleCallbackChange
                                                }
                                                value={callBack.email}
                                                className="form-control form-control-primary"
                                                name="email"
                                                placeholder={translate("Email")}
                                                style={{
                                                    border: `1px solid ${settings.background}`,
                                                    backgroundColor:
                                                        settings.formColor,
                                                }}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                onChange={
                                                    onhandleCallbackChange
                                                }
                                                value={callBack.reachability}
                                                className="form-control form-control-primary"
                                                name="reachability"
                                                placeholder={translate(
                                                    "Reachability (eg: Wed & Thu 16 - 17 hr)"
                                                )}
                                                style={{
                                                    border: `1px solid ${settings.background}`,
                                                    backgroundColor:
                                                        settings.formColor,
                                                }}
                                            />
                                        </div>
                                        <div className="form-check mb-3">
                                            <input
                                                onChange={onhandleCallbackChange}
                                                checked={callBack.accept}
                                                className="form-check-input form-control-primary"
                                                type="checkbox"
                                                name="accept"
                                                id="accept"
                                                style={{
                                                    border: `1px solid ${settings.background}`,
                                                    backgroundColor:
                                                        settings.formColor,
                                                }}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="accept"
                                            >
                                                {translate(
                                                    "I accept and read the V-Site's Privacy Policy"
                                                )}
                                            </label>
                                        </div>
                                        <Button
                                            type="button"
                                            onClick={onSendRequest}
                                            textColor={settings.color}
                                            backgroundColor={
                                                settings.background
                                            }
                                            className="btn"
                                            disabled={sending ? true : false}
                                        >
                                            {translate(
                                                sending
                                                    ? "Sending Request"
                                                    : "Send Request"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )} */}

                        {
                            console.log('custom code', customCodes)
                        }
                        {auth.plan !== "free" && customCodes && customCodes.length > 0 && (
                            <div>
                                {customCodes.map(c => {
                                    return <CustomCode key={c.id} title={c.title} source={c.source} src={c.codes} />
                                })}
                            </div>
                        )} 
                      
                        {auth.plan !== "free" && (
                            <div className={`mt-5  ${isMobile ? "px-3" : ""}`}>
                                <div className="fs-header fw-bolder mb-2 d-flex align-items-center justify-content-center">
                                    {translate("Share my Vi-Site")}
                                </div>
                                <div className="d-flex justify-content-center mb-4">
                                    <SocialIcon
                                        onClick={() =>
                                            shareCard('facebook',
                                                `https://www.facebook.com/sharer.php?u=${protocol}://${card.identifier}.${domain}`
                                            )
                                        }
                                        className="me-2"
                                        color={
                                            socialsHelper()["facebook"].color
                                        }
                                        icon={"facebook"}
                                    />
                                    <SocialIcon
                                        onClick={() =>
                                            shareCard('whatsapp',
                                                `https://api.whatsapp.com/send?text=${
                                                    card.firstname +
                                                    " " +
                                                    card.lastname +
                                                    "%0a" +
                                                    card.job +
                                                    "%0a" +
                                                    protocol +
                                                    "://" +
                                                    card.identifier +
                                                    "." +
                                                    domain
                                                }`
                                            )
                                        }
                                        className="me-2"
                                        color={
                                            socialsHelper()["whatsapp"].color
                                        }
                                        icon={"whatsapp"}
                                    />
                                    <SocialIcon
                                        onClick={() => shareCard('linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${protocol}://${card.identifier}.${domain}`)}
                                        className="me-2"
                                        color={socialsHelper()["linkedin"].color}
                                        icon={"linkedin"}
                                    />
                                    <SocialIcon
                                        onClick={() =>
                                            shareCard('email',
                                                `mailto:?subject=${
                                                    card.firstname +
                                                    " " +
                                                    card.lastname +
                                                    " - " +
                                                    card.job
                                                }&body=${protocol}://${
                                                    card.identifier
                                                }.${domain}`
                                            )
                                        }
                                        className="me-2"
                                        color="#0072c6"
                                        icon={"envelope"}
                                    />
                                </div>
                                <div className={`${!isPublic && !preview ? '' : 'row'} justify-content-center`} style={qrboxstyles}>
                                    <div
                                        className={`p-1 rounded-10 position-relative ${!isPublic && !preview ? '' : 'col-10 col-sm-7 col-md-5'}`}
                                        style={{
                                            backgroundColor: settings.qrColor,
                                        }}
                                    >
                                        <div>
                                            <div className="d-flex rounded-top-left-10 rounded-top-right-10 align-items-center justify-content-center bg-white pt-4">
                                                <ProfilePicture
                                                    profileImg={card.avatar}
                                                    size={120}
                                                    style={{
                                                        alignSelf: "center",
                                                    }}
                                                />
                                            </div>
                                            <div
                                                className="pt-4"
                                                style={{
                                                    backgroundColor: "#fff",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <h4 className="m-0">
                                                    {card.firstname}{" "}
                                                    {card.lastname}
                                                </h4>
                                                <a href={`${protocol}://${card.identifier}.${domain}`} target="_blank" className="text-decoration-none">{card.identifier}.{domain}</a>
                                            </div>
                                            <div className="bg-white d-flex justify-content-center pt-4">
                                                <a
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#savecontact-modal"
                                                    className="btn btn-sm"
                                                    style={{
                                                        color: settings.color,
                                                        background: settings.background,
                                                    }}
                                                >
                                                    {translate("Save Contact Details")}
                                                </a>
                                            </div>
                                        </div>
                                        <div style={{ position: "relative", padding: 0, margin: 0 }} className="bg-white d-flex justify-content-center  rounded-bottom-left-10 rounded-bottom-right-10 pt-4 pb-4">
                                            <QRCode
                                                size={256}
                                                style={{ height: "auto", maxWidth: "80%", width: "100%" }}
                                                 value={card?.url || ""}
                                                fgColor={settings.qrColor}
                                                level='H'
                                            />
                                            {/* <img
                                                className="w-80"
                                                src={`https://chart.googleapis.com/chart?cht=qr&chco=${
                                                    settings.qrColor
                                                        ? settings.qrColor.replace(
                                                              "#",
                                                              ""
                                                          )
                                                        : "041e4f"
                                                }&chld=H|0&chs=200x200&chl=${
                                                    card.url
                                                }`}
                                            /> */}
                                            {card.logo > "" && (
                                                <div
                                                    className="col-4 d-flex justify-content-center align-items-center rounded-10 border-0 p-1"
                                                    style={{
                                                        background: '#fff',
                                                        position: "absolute",
                                                        top: "50%",
                                                        left: "50%",
                                                        transform:
                                                            "translate(-50%, -50%)",
                                                        //width: '30%', height: '30%'
                                                    }}
                                                >
                                                    <img
                                                        className="rounded-5"
                                                        src={card.logo}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
      
                {typeof preview !== "undefined" && preview && (
                    <div
                        className="position-fixed bg-white border-top px-3 pt-3 pb-4 w-100"
                        style={{ zIndex: 99, bottom: 0 }}
                    >
                        <div className="d-flex d-lg-none pt-2">
                            <Button
                                type="button"
                                dataDismiss="modal"
                                borderRadius={10}
                                padding={12}
                                className="btn btn-lg btn-light text-dark fs-reg w-100"
                            >
                                <MobileIcon
                                    width={20}
                                    height={20}
                                    className="svg-color-primary me-2"
                                />
                                {translate("Close Preview")}
                            </Button>
                        </div>
                    </div>
                )}
                {isPublic && auth.plan === 'free' ? <Footer /> : null}

            
                {(settings.imprint?.length > 0 || settings.privacyPolicy?.length > 0) && (
                    <div className={`d-flex align-items-center justify-content-center ${auth.plan === 'free' ? 'mt-10' : ''}`}>
                        <a href={settings.imprint} target="_blank">{translate('Imprint')}</a>
                        <span className="mx-2">|</span>
                        <a href={settings.privacyPolicy} target="_blank">{translate('Privacy Policy')}</a>
                    </div>
                )}

                {isPublic && (
                    <div className={`d-flex align-items-center justify-content-center ${auth.plan === 'free' ? 'mt-10' : ''}`}>
                        <a href='/set/language?lang=en' className={`text-decoration-none ${lang === 'en' ? 'fw-bold' : ''}`}>EN</a>
                        <span className="mx-2">|</span>
                        <a href='/set/language?lang=de' className={`text-decoration-none ${lang === 'de' ? 'fw-bold' : ''}`}>DE</a>
                    </div>
                )}

                {auth.plan !== 'free' && showFAB && settings.contactButtons.length > 0 && (
                    <Container styles={{
                        zIndex: 90,
                        bottom: fabPosBottom,
                        right: fabPosRight,
                    }}>
                        { isFabOpen && settings.contactButtons.map(button => {
                            if (button.key === 'whatsapp') {
                                return(
                                    <FAButton key={button.key} onClick={() => window.open(whatsAppUrl(button.url))} tooltip={button.label} styles={{backgroundColor: button.color}}>
                                        <FontAwesome name={button.icon} color="white" size={button.size} />
                                    </FAButton>
                                );
                            } else {
                                return(
                                    <FABLink key={button.key} href={button.url} tooltip={button.label} styles={{backgroundColor: button.color}}>
                                        <FontAwesome name={button.icon} color="white" size={button.size} />
                                    </FABLink>
                                );
                            }
                        })}
                        <FAButton rotate={isFabOpen} styles={{backgroundColor: settings.background}} onClick={toggleFAB}>
                            <FontAwesome name="plus" color={settings.color} size={25} />
                        </FAButton>
                    </Container>
                )}
           
            </div>
            <div
                className="modal fade"
                id="image-preview-modal"
                data-bs-keyboard="true"
                tabIndex="-1"
                aria-labelledby="image-modal-label"
                aria-hidden="true"
                style={{ backgroundColor: "transparent" }}
            >
                <div
                    className="modal-dialog modal-dialog-centered"
                    style={{ backgroundColor: "transparent" }}
                >
                    <div
                        className="modal-content"
                        style={{ backgroundColor: "transparent" }}
                    >
                        <div
                            className="modal-body"
                            style={{ backgroundColor: "transparent" }}
                        >
                            <div
                                className="w-100 d-flex align-items-center justify-content-center"
                                style={{ height: 500 }}
                            >
                                <img src={image} className="h-100" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal fade"
                id="project-modal"
                data-bs-keyboard="true"
                tabIndex="-1"
                aria-labelledby="project-modal-label"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {selProject && (
                                <>
                                    <img
                                        src={selProject.attachment}
                                        className="w-100"
                                    />
                                    <div className="mt-3">
                                        {selProject.link !== "" ? (
                                            <a
                                                href={selProject.link}
                                                target="_blank"
                                                className="fw-bold text-decoration-none text-primary"
                                            >
                                                {selProject.title}
                                            </a>
                                        ) : (
                                            <div className="fs-reg fw-bold">
                                                {selProject.title}
                                            </div>
                                        )}
                                        <div className="fs-reg">
                                            {selProject.description}
                                        </div>
                                        <div className="fs-reg">
                                            {selProject.company} -{" "}
                                            {selProject.month} {selProject.year}
                                        </div>

                                        {selProject.link && (
                                        <div className="d-flex justify-content-end">
                                            <a
                                                href={
                                                    selProject.link.indexOf('http://') == -1 && selProject.link.indexOf('https://') == -1
                                                        ? `https://${selProject.link}`
                                                        : selProject.link
                                                }
                                                target="_blank"
                                                className="btn btn-sm btn-danger text-white d-flex align-items-center justify-content-center"
                                                style={{width: '32%'}}
                                            >
                                                <small>
                                                    {translate("More details")}
                                                </small>
                                                <IconButton
                                                    width={40}
                                                    height={10}
                                                    icon="/assets/svg/arrow_right.svg"
                                                />
                                            </a>
                                        </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
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
                                    <label
                                        className="form-check-label"
                                        htmlFor="accept">
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
           
            {/* <MessageBox color={settings.cover_overlay} avatar={card.avatar} user={card.user_id}/> */}
        </div>
    );
}


const CustomCode = ({title, src, source}) => {
    return (
        <div className="my-4">
            <div className="d-flex align-items-center justify-content-center fs-header fw-bolder mb-2">
                {title}
            </div>
            <div className="d-flex align-items-center justify-content-center">
                {source === 'iframe' ? (
                    <div className='text-center' style={{width: '100%'}}>
                        {parse(src, {
                            transform: (node, index) => {
                               
                                switch(node.name) {
                                    case 'iframe':
                                        let attribs = node.attribs;
                                        return (
                                            <div className="d-flex align-items-center justify-content-center mx-0 mx-md-5 mx-lg-10">
                                                <iframe src={attribs.src} width='100%' height={360} allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' allowFullScreen></iframe>
                                            </div>
                                        );
                                    // case 'link':
                                    //     const link = document.createElement('link');
                                    //     link.rel = node.attribs.rel;
                                    //     link.href = node.attribs.href;
                                    //     document.getElementsByTagName('head')[0].appendChild(link);
                                    //     break;
                                    case 'script':
                                        const script = document.createElement("script");
                                        script.src = node.attribs.src;
                                        script.async = true;
                                        // append the script tag to the body
                                        document.body.appendChild(script);
                                        break;
                                    case 'img': 
                                        let props = node.attribs;
                                        delete props.style;
                                        return <img {...props} className="custom-code-img" id="custom-code-img" />;
                                    default:
                                        break;
                                }
                            }
                        })}
                    </div>
                ) : (
                    <ReactPlayer controls={true} url={src} style={{borderRadius: '6px', overflow: 'hidden'}} />
                )}
            </div>
        </div>
    );
};

const GoogleReview = ({ review }) => {
    return (
        <div
            className="p-3 mb-2 rounded-10 bg-light border-light-gray-1"
            style={{ color: "#5A5A5A" }}
        >
            <div className="mx-3">
                <div className="d-flex align-items-center">
                    <ProfilePicture profileImg={review.avatar} size={30} />
                    <div className="lh-sm ms-2">
                        <div className="fs-reg fw-bold">{review.author}</div>
                        <div className="d-flex align-items-center">
                            <div className="fs-reg">
                                <Rating
                                    initialValue={review.rating}
                                    ratingValue={0}
                                    size={15}
                                    readonly
                                    transition
                                    allowHalfIcon
                                />
                            </div>
                            <div className="fs-xs ms-1">{review.when}</div>
                        </div>
                    </div>
                </div>
                <div className="fs-reg mt-3">{review.text}</div>
            </div>
        </div>
    );
};
