import React, { useEffect, useState } from "react";
import Authenticated from "@/Layouts/Authenticated";
import { Head, useForm, usePage } from "@inertiajs/inertia-react";
import { translate } from "@/Helpers";
import VCard from "@/Components/VCard";
import IconButton from "@/Components/IconButton";
import { BarChart } from "@/Components/BarChart";
import Swal from 'sweetalert2';
import ShareSiteModal from '@/Components/ShareSiteModal';
import { Modal } from "bootstrap";
import UpgradeToProOverlay from "@/Components/UpgradeToProOverlay";

export default function Dashboard({ auth, cards }) {
    const { domain, protocol, auth: authenticated } = usePage().props;
    
    const username = !auth.user.name ? auth.user.email : auth.user.name;

    const [analytics, setAnalytics] = useState(null);
    const [clicks, setClicks] = useState(null);
    const [callBacks, setCallBacks] = useState(null);
    const [shareCard, setShareCard] = useState(null);

    const [totals, setTotals] = useState({
        views: 0,
        shares: 0,
        scans: 0,
    })

    const filterList = [
        {id: 1, interval: 'daily', value: 7, label: translate('Last 7 days')},
        {id: 2, interval: 'daily', value: 30, label: translate('Last 30 days')},
        {id: 3, interval: 'quarterly', value: 3, label: translate('Current Quarter')},
        {id: 4, interval: 'quarterly', value: -3, label: translate('Last Quarter')},
        {id: 5, interval: 'yearly', value: 12, label: translate('Current Year')},
        {id: 6, interval: 'yearly', value: -12, label: translate('Last Year')},
    ];

    const otherFilters = {personal: translate('Personal'), team: translate('Team')};

    const [filter, setFilter] = useState(filterList[0]);
    const [otherFilter, setOtherFilter] = useState('personal');

    const fetchAnalytics = async () => {
        const res = await fetch(
            route("analytics.index", {
                account: otherFilter,
                interval: filter.interval || 'daily',
                counter: filter.value || 7,
                type: ["visit", "scan", "share"]
            })
        );
        const data = await res.json();
        console.log('Analytics data', data);

        let views = 0;
        let shares = 0;
        let scans = 0;
        for (const count of data.visits) views += count;
        for (const count of data.shares) shares += count;
        for (const count of data.scans) scans += count;
        setTotals({views, shares, scans});

        setAnalytics(data);
    };
    const fetchClicks = async () => {
        const res = await fetch(route("analytics.index", { type: ["click"] }));
        const data = await res.json();
        console.log('Analytics clicks', data);
        setClicks(data);
    };
    const fetchCallBacks = async () => {
        const res = await fetch(route("callbacks.index"));
        const data = await res.json();
        setCallBacks(data);
    };

    const handleSelectFilter = (filter) => {
        setFilter(filter);
    }

    useEffect(() => {
        fetchAnalytics();
        fetchClicks();
        fetchCallBacks();
    }, []);

    useEffect(() => {
        console.log(filter);
        if(filter.interval != 'custom'){
            fetchAnalytics();
        }
    }, [filter, otherFilter]);

    const [vcards, setVCards] = useState([]);
    useEffect(() => {
        setVCards(cards);
    }, [cards]);

    const { get, post } = useForm();
    const editCard = (card) => {
        get(route("cards.edit", card.id));
    };

    const addCard = () => {
        if(cards.length < authenticated.subscription.quantity) {
            post(route('cards.initcard'));
        } else {
            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                    confirmButton: 'btn btn-danger mx-2',
                    cancelButton: 'btn btn-light mx-2'
                },
                buttonsStyling: false
            })
              
            swalWithBootstrapButtons.fire({
                title: translate('Maximum Number of Sites Reached'),
                html: "<p>"+translate('Upgrade your account to get more Sites!')+"</p> <p>"+translate('For just 3€ per site/month or 19€ per site/year, you can create and host additional sites.')+"</p>",
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
            })
        }
    };

    const openCard = (card) => {
        window.open(`${protocol}://${card.identifier}.${domain}`);
    }

    const shareSite = (card) => {
        setShareCard(card);
        new Modal(document.getElementById("sharesite-modal")).show();
    }

    const blurred = authenticated.plan === 'free' ? 'blur-content' : '';

    return (
        <Authenticated auth={auth}>
            <Head title={translate("Dashboard")} />

            <div className="container-fluid bg-light m-0 px-0" style={{position: 'relative'}}>
                <UpgradeToProOverlay title={translate('Upgrade account for all features')} visible={authenticated.plan === 'free'} buttonPosition='fixed' dashboard />
                
                <div className="row m-0">
                    <div className="col-lg-8 px-0 px-lg-4 pb-4 vh-none vh-lg-100 overflow-none overflow-lg-scroll">
                        <div className={`fs-2 pb-3 px-4 px-lg-0 mt-9 mt-lg-4 ${blurred}`}>
                            {translate("Hello")}{" "}
                            <span className="text-red-300">{username}</span>!
                        </div>
                        <div className={`bg-white p-4 mb-4 rounded-3 ${blurred}`}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="fs-6 fw-bold">
                                    {translate("Views & Shares")}
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="text-black-400">{translate('Filter')}: </div>
                                        <div className="dropdown ms-2">
                                            <button className="btn btn-light dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                                {filter.label}
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                                {filterList.map(obj => {
                                                    return <li key={obj.id} onClick={()=>handleSelectFilter(obj)}><a className="dropdown-item" href="#">{obj.label}</a></li>
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                    {authenticated.plan === 'enterprise' && authenticated.siteAdmin && (
                                        <div className="dropdown ms-2">
                                            <button className="btn btn-light dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                                {otherFilters[otherFilter]}
                                            </button>
                                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                                <li onClick={()=>setOtherFilter('team')}><a className="dropdown-item" href="#">{translate('Team')}</a></li>
                                                <li onClick={()=>setOtherFilter('personal')}><a className="dropdown-item" href="#">{translate('Personal')}</a></li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="my-3 d-flex justify-content-center align-items-center text-black-700">
                                {analytics != null && (
                                    <BarChart
                                        className={blurred}
                                        data={analytics}
                                        totals={totals}
                                    />
                                )}
                            </div>

                            <div className="font-size-small text-black-400 text-center">
                                {translate(
                                    "The total number of card viewers and shares. Views and shares of the same user account also count."
                                )}
                            </div>
                        </div>
                        <div className={`bg-white p-4 rounded-3 ${blurred}`}>
                            <div className="d-flex align-items-end justify-content-between">
                                <div className="fs-6 fw-bold">
                                    {translate("Social Clicks")}
                                </div>
                                {/* <div className="fs-sm">{translate('Filter')}</div> */}
                            </div>
                            <div className="row my-3">
                                {clicks != null && clicks.length > 0 ? (
                                    <div
                                        style={{
                                            height: "80px",
                                            overflow: "scroll",
                                        }}
                                        className={`col d-flex align-items-center justify-content-md-center text-secondary ${blurred}`}
                                    >
                                        {clicks.map((click) => {
                                            return (
                                                <div
                                                    key={click.social}
                                                    className={`text-white ${
                                                        click.gain == "up"
                                                            ? "bg-primary"
                                                            : "bg-danger"
                                                    } fs-sm rounded mx-1 py-2 px-3 rounded-5`}
                                                >
                                                    <div className="mb-2">
                                                        <span className="fs-4">
                                                            {click.count}
                                                        </span>
                                                        <i
                                                            className={`fs-6 bi bi-arrow-${click.gain}-right`}
                                                        ></i>
                                                    </div>
                                                    <small className="text-capitalize ">
                                                        {click.social}
                                                    </small>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="col border border-light rounded-5 d-flex align-items-center justify-content-center text-secondary">
                                        {translate("No clicks yet.")}
                                    </div>
                                )}
                            </div>
                            <div className="font-size-small text-black-400 text-center">
                                <div>
                                    {translate(
                                        "Total visits per social network sites"
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`col-lg-4 p-4 pb-lg-4 dashboard-right-bar vh-lg-100 d-flex flex-column ${blurred}`}>
                        <div>
                            <div className="mt-8 text-blue-300 font-size-title fw-bold mb-3 d-flex align-items-center justify-content-between">
                                {translate("My Vi-Site Cards")}
                                <IconButton
                                    onClick={addCard}
                                    width={20}
                                    height={20}
                                    icon="/assets/svg/plus.svg"
                                />
                            </div>
                            <div>
                                {vcards.length > 0 && (
                                    <div
                                        id="cardsCarousel"
                                        className="carousel carousel-dark slide"
                                        data-bs-ride="carousel"
                                    >
                                        <div
                                            className="carousel-indicators"
                                            style={{ bottom: "-40px" }}
                                        >
                                            {vcards.map((card, index) => {
                                                return (
                                                    <li
                                                        key={card.id}
                                                        type="button"
                                                        data-bs-target="#cardsCarousel"
                                                        data-bs-slide-to={index}
                                                        className={`${
                                                            index === 0
                                                                ? "active"
                                                                : ""
                                                        } bg-primary`}
                                                        aria-current={
                                                            index === 0
                                                                ? "true"
                                                                : ""
                                                        }
                                                        aria-label={`card${card.id}`}
                                                    ></li>
                                                );
                                            })}
                                        </div>
                                        <div className="carousel-inner">
                                            {vcards.map((card, index) => {
                                                return (
                                                    <div
                                                        key={card.id}
                                                        className={`carousel-item ${
                                                            index === 0
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        data-bs-interval="10000"
                                                    >
                                                        <div className="d-block w-100">
                                                            <VCard
                                                                onClick={() => editCard(card)}
                                                                onClickView={() => openCard(card)}
                                                                onClickShare={() => shareSite(card)}
                                                                details={card}
                                                                width={300}
                                                                height={180}
                                                            />
                                                            {authenticated.plan !== 'free' && (
                                                                <div className="my-2 d-flex justify-content-center">
                                                                    <a href={`/download/qr?identifier=${card.identifier}`} className="btn btn-sm bg-primary text-white">{translate('Download QR-Code')}</a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="d-flex flex-column ">
                            <hr className="my-4" />
                            <div className={`mb-3 text-blue-300 font-size-title fw-bold d-flex align-items-center justify-content-between ${blurred}`}>
                                {translate("Contacts")} <a href={route('contacts.index')} className='fs-sm'>{translate('Show All')}</a>
                            </div>
                            <div className="d-flex flex-column ">
                                <div
                                    className="overflow-scroll"
                                    style={{ maxHeight: "200px" }}
                                >
                                    <div
                                        className={`accordion accordion-callbacks accordion-flush ${blurred}`}
                                        id="accordionCallbacks"
                                    >
                                        {callBacks != null &&
                                            callBacks.map((callback, index) => {
                                            return (
                                                <div
                                                    key={callback.id}
                                                    className="accordion-item bg-transparent p-0"
                                                >
                                                    <div
                                                        className="accordion-header m-0 p-0"
                                                        id={`callbackHeader${callback.id}`}
                                                    >
                                                        <div
                                                            style={{fontSize: '20px', fontWeight: '600', cursor: 'default'}}
                                                            className={`accordion-button text-primary px-0 py-0 collapsed`}
                                                            data-bs-toggle="collapse"
                                                            data-bs-target={`#callbackCollapse${callback.id}`}
                                                            aria-expanded="true"
                                                            aria-controls={`callbackCollapse${callback.id}`}
                                                        >
                                                            <div
                                                                key={callback.id}
                                                                className="d-flex align-items-center mb-3"
                                                                style={{cursor:'pointer'}}
                                                            >
                                                                <span className="me-2">
                                                                    <svg
                                                                        width="38"
                                                                        height="38"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <circle
                                                                            cx="19"
                                                                            cy="19"
                                                                            r="18"
                                                                            stroke="rgba(0,0,0,.2)"
                                                                            strokeWidth="1"
                                                                            fill="rgba(0,0,0,0.05)"
                                                                        />
                                                                        <text
                                                                            x="50%"
                                                                            y="55%"
                                                                            dominantBaseline="middle"
                                                                            textAnchor="middle"
                                                                            fill="#041E4F"
                                                                            fontSize="18px"
                                                                        >
                                                                            {callback.name.substr(0,1)}
                                                                        </text>
                                                                    </svg>
                                                                </span>
                                                                <div>
                                                                    <div className="fs-sm text-blue-300">
                                                                        <strong>
                                                                            {callback.name}
                                                                        </strong>{" "}
                                                                        {/* {translate("emailed a callback request")} */}
                                                                    </div>
                                                                    {/* <div className="fs-xs text-black-600">
                                                                        {callback.time}
                                                                    </div> */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        id={`callbackCollapse${callback.id}`}
                                                        className={`accordion-collapse collapse`}
                                                        aria-labelledby={`callbackHeader${callback.id}`}
                                                        data-bs-parent="#accordionCallbacks"
                                                    >
                                                        <div className="accordion-body p-2 px-3 mb-2 bg-light fs-sm">
                                                            <div><span className="fw-bold">{translate('Name')}: </span><span className="text-primary">{callback.name}</span></div>
                                                            <div><span className="fw-bold">{translate('Phone')}: </span><a href={`tel:${callback.phone}`} className="text-primary text-decoration-none">{callback.phone}</a></div>
                                                            <div><span className="fw-bold">{translate('Email')}: </span><a href={`mailto: ${callback.email}`} className="text-primary text-decoration-none">{callback.email}</a></div>
                                                            {callback.reachability && (
                                                                <div><span className="fw-bold">{translate('Reachability')}: </span><span className="text-primary">{callback.reachability}</span></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ShareSiteModal id='sharesite-modal' card={shareCard} />
            </div>

            <svg 
            width='0' height='0' style={{position: 'absolute'}}
             id="svg-filter">
                <defs>
                    <filter id="svg-blur">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4"></feGaussianBlur>
                    </filter>
                </defs>
            </svg>
        </Authenticated>
    );
}
