import React, { useEffect, useState } from "react";
import Drawer from "@/Components/Drawer";
import Language from "@/Components/Langauge";
import IconButton from "@/Components/IconButton";
import ApplicationLogo from "@/Components/ApplicationLogo";
import SearchBar from "@/Components/SearchBar";
import { Link, useForm, usePage } from "@inertiajs/inertia-react";
// import { Link } from "react-router-dom";
import { translate } from "@/Helpers";
import ProfilePicture from "@/Components/ProfilePicture";

export default function Authenticated({ header, hideMenuDrawer, children }) {
    const { auth } = usePage().props;
    const { get, post } = useForm();
    const [selectedRoute, setSelectedRoute] = useState(route().current() || "");

    const menus = [
        {
            id: 1,
            title: translate("Dashboard"),
            route: "dashboard",
            icon: "",
            visible: true,
        },
        {
            id: 2,
            title: translate("My V-Sites"),
            route: "cards.index",
            icon: "",
            visible: (auth.plan !== 'enterprise' || (auth.plan === 'enterprise' && !auth.siteAdmin)),
        },
        {
            id: 6,
            title: translate("Company Settings"),
            route: "company.settings.create",
            icon: "",
            visible: (auth.plan === 'enterprise' && auth.siteAdmin),
        },
        {
            id: 3,
            title: translate("Team Sites"),
            route: "team.index",
            icon: "",
            visible: (auth.plan === 'enterprise' && auth.siteAdmin),
        },
        {
            id: 4,
            title: translate("Contacts"),
            route: "contacts.index",
            icon: "",
            visible: auth.plan !== 'free',
        },
        {
            id: 5,
            title: translate("Account Settings"),
            route: "account.settings",
            icon: "",
            visible: true,
        },
    ];

    return (
        <div className="container-fluid overflow-auto">
            <div className="row bg-light">
                <div
                    className="d-inline-block nav d-lg-none h-lg-10 p-0 position-absolute bg-light"
                    style={{ zIndex: 10 }}
                >
                    <nav className="navbar navbar-expand-lg navbar-light">
                        <div className="w-100 pt-2 ps-3 d-flex justify-content-between align-items-center">
                            <a className="navbar-brand" href="#">
                                <ApplicationLogo />
                            </a>
                            <div className="d-flex align-items-center">
                                {/* <IconButton width={20} height={20} icon='/assets/svg/bell.svg' /> */}
                                <Language style={{ marginLeft: "20px" }} />
                                <button
                                    className="ms-3 navbar-toggler border-0"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#navbarSupportedContent"
                                    aria-controls="navbarSupportedContent"
                                    aria-expanded="false"
                                    aria-label="Toggle navigation"
                                >
                                    <span className="navbar-toggler-icon"></span>
                                </button>
                            </div>
                        </div>

                        <div
                            className="bg-light collapse navbar-collapse"
                            id="navbarSupportedContent"
                            style={{ height: "100vh" }}
                        >
                            <ul className="navbar-nav align-items-center py-4 fs-4">
                                <li className="nav-item text-blue-300 pb-5">
                                    <a href={route("account.settings")} role="button">
                                        <ProfilePicture
                                            profileImg={auth.user.avatar}
                                            size={80}
                                            rounded
                                        />
                                    </a>
                                </li>
                                <li className="nav-item text-blue-300 pb-2">
                                    <a
                                        className="nav-link"
                                        href={route("dashboard")}
                                    >
                                        {translate("Dashboard")}
                                    </a>
                                </li>
                                <li className="nav-item pb-2">
                                    <a
                                        className="nav-link"
                                        href={route("cards.index")}
                                    >
                                        {translate("My Vi-Sites")}
                                    </a>
                                </li>
                                {auth.plan === 'enterprise' && auth.siteAdmin && (
                                    <li className="nav-item pb-2">
                                        <a
                                            className="nav-link"
                                            href={route("team.index")}
                                        >
                                            {translate("Team Sites")}
                                        </a>
                                    </li>
                                )}

                                {auth.plan !== 'free' && (
                                    <li className="nav-item pb-2">
                                        <a
                                            className="nav-link"
                                            href={route("contacts.index")}
                                        >
                                            {translate("Contacts")}
                                        </a>
                                    </li>
                                )}

                                {auth.plan === 'free' && (
                                    <li className="nav-item pb-2">
                                        <a
                                            className="nav-link"
                                            href={route("subscriptions.index")}
                                        >
                                            {translate("Subscriptions")}
                                        </a>
                                    </li>
                                )}
                                <li className="nav-item pb-2">
                                    <a
                                        className="nav-link"
                                        href={route("account.settings")}
                                    >
                                        {translate("Account Settings")}
                                    </a>
                                </li>
                                <li className="nav-item pb-2">
                                    <a
                                        className="nav-link"
                                        href={`mailto:alexc@d3.net?subject=${translate(
                                            "Support Needed"
                                        )}`}
                                    >
                                        {translate("Support")}
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        href={route("logout")}
                                        method="post"
                                        as="button"
                                        type="button"
                                        className="btn btn-sm btn-danger px-6 mt-2"
                                    >
                                        {translate("Logout")}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
                {(typeof hideMenuDrawer === "undefined" || !hideMenuDrawer) && (
                    <div className="bg-white col-md-4 col-lg-2 p-0 d-none d-lg-inline-block vh-100">
                        <Drawer
                            menus={menus.filter(menu => menu.visible)}
                            defaultRoute={selectedRoute}
                            onReady={(r) => {
                                setSelectedRoute(r);
                                get(route(r));
                            }}
                            auth={auth}
                        />
                    </div>
                )}
                <div
                    className={`p-0 ${
                        typeof hideMenuDrawer === "undefined" || !hideMenuDrawer
                            ? "col-lg-10"
                            : "col-lg-12"
                    } vh-100`}
                >
                    <main className="m-auto p-0 pt-lg-0 vh-100 overflow-none overflow-lg-hidden">
                        <div
                            className="d-none  pt-3 d-lg-flex align-items-center justify-content-end"
                            style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                marginRight: "3%",
                                zIndex: 100,
                            }}
                        >
                            {/* <IconButton width={20} height={20} icon='/assets/svg/bell.svg' /> */}
                            <Language
                                className="ms-4"
                                lang="Eng"
                                width={25}
                                height={25}
                            />
                            <div className="ms-4 dropdown">
                                <a
                                    href="#"
                                    className="profile-dropdown-toggle"
                                    role="button"
                                    id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <ProfilePicture
                                        profileImg={auth.user.avatar}
                                        size={40}
                                        rounded
                                    />
                                </a>
                                <ul
                                    className="dropdown-menu text-center"
                                    aria-labelledby="dropdownMenuButton1"
                                >
                                    <li>
                                        <Link
                                            className="dropdown-item fs-lg"
                                            href={route("account.settings")}
                                        >
                                            {translate("Account Settings")}
                                        </Link>
                                    </li>
                                    <li>
                                        <a
                                            className="dropdown-item fs-lg"
                                            href={`mailto:alexc@d3.net?subject=${translate("Support Needed")}`}
                                        >
                                            {translate("Support")}
                                        </a>
                                    </li>
                                    <li>
                                        <Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                            type="button"
                                            className="btn btn-sm btn-danger px-3 mt-2"
                                        >
                                            {translate("Logout")}
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
