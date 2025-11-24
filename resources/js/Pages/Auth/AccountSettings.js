import React, { useEffect, useRef, useState } from "react";
import Authenticated from "@/Layouts/Authenticated";
import ProfilePicture from "@/Components/ProfilePicture";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import IconButton from "@/Components/IconButton";
import { Head, useForm, usePage, Link } from "@inertiajs/inertia-react";
import { translate, toast } from "@/Helpers";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import AccountPayment from "./AccountPayment";
import { FontAwesome, Feather } from "react-web-vector-icons";

export default function AccountSettings(props) {
    const { get } = useForm();
    const { auth } = usePage().props;
    const wrapperElement = useRef(null);
    // let height = 0;
    const [height, setHeight] = useState(0);

    const reasons = [
        translate("Too expensive"),
        translate("Missing features"),
        translate("Hasn't  met my expectations"),
    ];

    const user = {
        name: auth.user.name,
        email: auth.user.email,
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    };

    let timeout = null;

    const [account, setAccount] = useState(user);
    const [deactivate, setDeactivate] = useState({
        reason: "",
        other: "",
    });
    const [stripePK, setStripePK] = useState(null);
    const [stripeSK, setStripeSK] = useState(null);
    const onHandleAccountChange = (event) => {
        setAccount({ ...account, [event.target.name]: event.target.value });
    };
    const onHandleDeactivateChange = (event) => {
        setDeactivate({
            ...deactivate,
            [event.target.name]: event.target.value,
        });
    };

    const changeAccount = () => {
        console.log('account', account)
        if(!account?.name){
            toast(translate("Account name is required."), 'error');
        }

        if(!account?.email){
            toast(translate("Account email is required."), 'error');
        }

        if (!account?.name || !account?.email) return;

        axios
            .post(route("change.account"), {
                name: account.name,
                email: account.email,
            })
            .then(({ data }) => {
                toast(translate("Account details changed"));
            });
    };

    const changePassword = () => {
        axios
            .post(route("change.password"), {
                current: account.current_password,
                new: account.new_password,
                new_confirmation: account.new_password_confirmation,
            })
            .then(({ data }) => {
                toast(translate("Password changed!"));
                setAccount({
                    ...account,
                    current_password: "",
                    new_password: "",
                    new_password_confirmation: "",
                });
            }).catch((error) => {
                let errorMessage = translate("Something went wrong. Please try again.");
    
                if (error.response) {
                    if (error.response.status === 422) {
                        const errors = error.response.data.errors;
                        if (errors?.current) {
                            console.log('error', errors)
                            errorMessage = translate("Current password is incorrect.");
                        } else if (errors?.new) {
                            errorMessage = translate("New password is invalid.");
                        } else if (errors?.new_confirmation) {
                            errorMessage = translate("New password confirmation does not match.");
                        }
                    } 
                    else if (error.response.status === 401) {
                        errorMessage = translate("You are not authorized to perform this action.");
                    }
                }
    
                toast(errorMessage, 'error');
                console.error("Password change error:", error);
            });
    };

    const deleteAccount = () => {
        axios.post(route("account.delete")).then(({ data }) => {
            document.location.href = route('login');
        }).catch((error) => {
            if (error.response) {
                console.error('Error response:', error.response.data);
            } else if (error.request) {
                console.error('Error request:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
        });
    }

    const deactivateAccount = () => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-danger mx-2",
                cancelButton: "btn btn-primary mx-2",
            },
            buttonsStyling: false,
        });

        swalWithBootstrapButtons
            .fire({
                title: translate("Delete account?"),
                html: `<p>${translate("Are you sure? Here’s what you need to know before you leave")}:</p><ul className="text-start" style="text-align: left;"><li className="text-start">${translate('You can use your Site to save money on business cards')}</li><li>${translate('You can make a great first impression with our Site')}</li><li>${translate('You can share your details easily')}</li><li>${translate('Your Site is always with you')}</li></ul>`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: translate("Continue"),
                cancelButtonText: translate("KEEP MY ACCOUNT"),
                reverseButtons: true,
                backdrop: "#E1235180",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    if(auth.plan === 'pro') {
                        return discountAlert();
                    }
                    deleteAccount();
                }
            });
    };

    const discountAlert = () => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-primary mx-2",
                cancelButton: "btn btn-danger mx-2",
                denyButton: "btn btn-danger mx-2",
            },
            buttonsStyling: false,
        });
        
        swalWithBootstrapButtons
            .fire({
                title: translate("We have a little gift for you!"),
                html: `<p>${translate('With the Coupon Code 50OFF, you will get 50% off (Forever).')}</p>`,
                icon: "warning",
                showDenyButton: true,
                showCloseButton: true,
                denyButtonText: translate("DELETE"),
                confirmButtonText: translate("Redeem Coupon Code"),
                reverseButtons: false,
                backdrop: "#E1235180",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    axios.post(route("subscriptions.redeem")).then(({ data }) => {
                        toast('Coupon Redeemed Successfully!');
                    });
                } else if(result.isDenied) {
                    deleteAccount();
                }
            });
    }

    const deletePaymentMethod = (paymentmethod) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-danger mx-2",
                cancelButton: "btn btn-light mx-2",
            },
            buttonsStyling: false,
        });

        swalWithBootstrapButtons
            .fire({
                title: translate("Remove Paymentmethod?"),
                text: translate(
                    "You are about to delete your card ending in [:last4]!",
                    { last4: paymentmethod.last4 }
                ),
                icon: "warning",
                showCancelButton: true,
                confirmButtonText:
                    translate("Continue") +
                    '<i class="ms-2 bi bi-arrow-right"></i>',
                cancelButtonText: translate("Cancel"),
                reverseButtons: true,
                backdrop: "#E1235180",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    axios
                        .delete(
                            route("account.payments.destroy", paymentmethod.id)
                        )
                        .then(({ data }) => {
                            document.location.reload();
                        });
                }
            });
    };

    const addPaymentMethod = (e) => {
        e.preventDefault();

        new Modal(document.getElementById("add-payment-method"), {
            keyboard: false,
        }).show();
        document
            .getElementById("add-payment-method")
            .addEventListener("shown.bs.modal", function (event) {
                axios.get(route("account.payments.create")).then(({ data }) => {
                    setStripePK(data.pk);
                    setStripeSK(data.sk);
                });
            });
    };

    useEffect(() => {
        function h() {
            const height = wrapperElement.current.clientHeight - 10;
            setHeight(height);
        }
        h();
        window.addEventListener("resize", h);

        document.querySelectorAll('a.sub-menu[href^="#"]').forEach((anchor) => {
            let hash = window.location.hash;
            if (!hash.length) hash = "#account";
            if (anchor.getAttribute("href") == hash)
                anchor.classList.add("menu-selected");

            anchor.addEventListener("click", function (e) {
                document
                    .querySelectorAll('a.sub-menu[href^="#"]')
                    .forEach((aa) => {
                        aa.classList.remove("menu-selected");
                    });
                this.classList.add("menu-selected");
                e.preventDefault();

                document
                    .querySelector(this.getAttribute("href"))
                    .scrollIntoView({
                        behavior: "smooth",
                    });
                setTimeout(() => {
                    window.location.hash = this.getAttribute("href").substr(1);
                }, 500);
            });
        });
    }, []);

    return (
        <Authenticated>
            <Head title={translate("My V-Site Cards")} />
            <div className="row m-0">
                <div className="col-lg-3 px-0 pb-2 bg-white border-start border-light vh-none vh-lg-100">
                    <div
                        className="p-0 position-relative py-9"
                        style={styles.cover}
                    >
                        <ProfilePicture
                            profileImg={props.card.avatar}
                            brandImg={props.card.logo}
                            brandColor={
                                props.card.settings &&
                                props.card.settings.cover_overlay
                            }
                            size={120}
                            className="position-absolute profile-picture-sub"
                        />
                    </div>
                    <div className="profile-details-sub">
                        <div className="fw-bold">{auth.user.name}</div>
                        <div className="fs-sm">
                            <p className="text-break mb-0">
                                {props.card.job}
                            </p>
                            <p className="mb-0">
                                {translate("at")}
                            </p>
                            <p className="text-break mb-0">
                                <span className="fw-bold">
                                    {props.card.company}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="row d-none d-lg-flex m-0 pt-4 px-4 px-lg-0 px-lg-4 text-center">
                        <a
                            href="#account"
                            className="sub-menu col-4 col-lg-12 my-2 ps-4 py-2 py-lg-3 d-flex fs-sm align-items-center text-black text-decoration-none"
                        >
                            <div className="d-flex fs-sm align-items-center ">
                                <IconButton
                                    className="d-none d-lg-flex me-3"
                                    width={20}
                                    height={20}
                                    icon="/assets/images/profile-circle-black.png"
                                />
                                {translate("Account Settings")}
                            </div>
                        </a>
                        <a
                            href="#subscriptions"
                            className="sub-menu col-4 col-lg-12 my-2 ps-4 py-2 py-lg-3 d-flex fs-sm align-items-center text-black text-decoration-none"
                        >
                            <div className="d-flex fs-sm align-items-center">
                                <IconButton
                                    className="d-none d-lg-flex me-3"
                                    width={20}
                                    height={20}
                                    icon="/assets/images/crown-black.png"
                                />
                                {translate("Subscriptions")}
                            </div>
                        </a>
                    </div>

                    <div className="row d-md-flex d-lg-none m-0 pt-4 px-4 px-lg-0 px-lg-4 text-center">
                        <a
                            href="#account"
                            className="sub-menu col-4 col-lg-12 my-2 py-2 py-lg-3 d-flex fs-sm align-items-center justify-content-center text-black text-decoration-none"
                        >
                            {translate("Account Settings")}
                        </a>
                        <a
                            href="#subscriptions"
                            className="sub-menu col-4 col-lg-12 my-2 py-2 py-lg-3 d-flex fs-sm align-items-center justify-content-center  text-black text-decoration-none"
                        >
                            {translate("Subscriptions")}
                        </a>
                    </div>
                </div>
                <div className="col-lg-9 p-0" ref={wrapperElement}>
                    <div className="card border-0 rounded-0 bg-transparent vw-none vw-lg-80 m-auto">
                        <div className="card-body bg-transparent vh-100 vh-lg-100 overflow-none overflow-lg-scroll">
                            <div className="p-4 py-3 p-lg-3 account-setting mb-10">
                                <div id="account">
                                    <h3 className="mb-3">
                                        {translate("Account Settings")}
                                    </h3>
                                    <div className="pb-4 mb-4 border-bottom">
                                        <Input
                                            type="text"
                                            name="name"
                                            placeholder={translate("Name")}
                                            className="mb-2"
                                            value={account.name}
                                            handleChange={onHandleAccountChange}
                                        />
                                        <Input
                                            type="email"
                                            name="email"
                                            placeholder={translate("Email")}
                                            className="mb-2"
                                            value={account.email}
                                            handleChange={onHandleAccountChange}
                                        />
                                        <div>
                                            <Button
                                                type="button"
                                                onClick={changeAccount}
                                                className="btn btn-lg btn-danger fs-sm"
                                            >
                                                {translate("Save Changes")}
                                            </Button>
                                        </div>
                                    </div>
                                    <h6>{translate("Change Password")}</h6>
                                    <div className="pb-4 mb-4 border-bottom">
                                        <Input
                                            type="password"
                                            name="current_password"
                                            placeholder={translate(
                                                "Current Password"
                                            )}
                                            className="mb-2"
                                            value={account.current_password}
                                            handleChange={onHandleAccountChange}
                                        />
                                        <Input
                                            type="password"
                                            name="new_password"
                                            placeholder={translate(
                                                "New Password"
                                            )}
                                            className="mb-2"
                                            value={account.new_password}
                                            handleChange={onHandleAccountChange}
                                        />
                                        {account.new_password.length == 0 ||
                                        account.new_password.length >= 8 ? (
                                            ""
                                        ) : (
                                            <p className="text-danger fs-sm">
                                                {translate(
                                                    "Password should not be less than 8 characters"
                                                )}
                                            </p>
                                        )}
                                        <Input
                                            type="password"
                                            name="new_password_confirmation"
                                            placeholder={translate(
                                                "Retype New Password"
                                            )}
                                            className="mb-2"
                                            value={
                                                account.new_password_confirmation
                                            }
                                            handleChange={onHandleAccountChange}
                                        />
                                        {account.new_password_confirmation
                                            .length === 0 ||
                                        account.new_password ===
                                            account.new_password_confirmation ? (
                                            ""
                                        ) : (
                                            <p className="text-danger fs-sm">
                                                {translate(
                                                    "Password should match"
                                                )}
                                            </p>
                                        )}
                                        <div>
                                            <Button
                                                type="button"
                                                onClick={changePassword}
                                                className="btn btn-lg btn-danger fs-sm"
                                            >
                                                {translate("Change Password")}
                                            </Button>
                                        </div>
                                    </div>

                                    {auth.plan !== 'enterprise' && (
                                        <>
                                            <h6>{translate("Account Deactivation")}</h6>
                                            <div className="pb-2 mb-2 fs-sm">
                                                <div className="fw-bold">
                                                    {translate("What happens when you deactivate your account?")}
                                                </div>
                                                <ul>
                                                    <li>{translate("All created Vi-Sites won't be shown on anymore.")}</li>
                                                    <li>{translate("You won't be able to retrieve your Vi-Site account.")}</li>
                                                    <li>{translate("All saved data in your Vi-Site account will permanently deleted.")}</li>
                                                </ul>
                                                
                                                <div>
                                                    <div>
                                                        <Button
                                                            type="submit"
                                                            className="btn btn-lg btn-danger fs-sm"
                                                            onClick={deactivateAccount}>
                                                            {translate("Delete Account")}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div id="subscriptions" className="mt-5">
                                    <h3 className="mb-3">
                                        {translate("Subscription Details")}
                                    </h3>
                                    {/* <div className='pb-4 mb-4 border-bottom'>
                                        <Input type="text" name="name" placeholder={translate("Name")} className="mb-2" />
                                        <Input type="text" name="email" placeholder={translate("Email")} className="mb-2" />
                                    </div> */}
                                    <div style={{ fontSize: "10px" }}>
                                        {translate("Your current plan")}
                                    </div>
                                    {
                                        auth.plan == 'pro' ? (
                                            <>
                                                {props.subscription && props.subscription.plan && (
                                                    <div className="mb-3">
                                                        <h4>{props.subscription.plan?.name}</h4>
                                                        <div>{props.subscription.plan?.fprice} {translate('per '+ props.subscription.plan?.period)}</div>
                                                    </div>
                                                )}
                                                <a className="btn btn-lg btn-danger fs-sm" href={route('billing')}>{translate('Manage Subscription')}</a>
                                            </>
                                        ) : (
                                            <>
                                                <div className="mb-3 text-capitalize">
                                                    {auth.plan}
                                                </div>
                                                {auth.plan === 'free' && (
                                                    <a
                                                        href={route("subscriptions.index")}
                                                        className="btn btn-lg btn-danger fs-sm">
                                                        <i className="bi bi-stars me-2"></i>
                                                        {translate('Upgrade account')}
                                                    </a>
                                                )}
                                            </>
                                        )
                                        
                                    }
                                    {/* <div className="pb-4 mb-4">
                                        <div style={{ fontSize: "10px" }}>
                                            {translate("Your current plan")}
                                        </div>
                                        <div className="fs-sm">
                                            {props.subscription ? props.subscription.info : ''}
                                            {props.subscription && props.subscription.deactivation ==
                                                "" && (
                                                <Link
                                                    href={route(
                                                        "subscriptions.index"
                                                    )}
                                                    className="fs-sm fw-bold ms-3 text-decoration-underline"
                                                >
                                                    {translate("Change Plan")}
                                                </Link>
                                            )}
                                        </div>
                                        {props.subscription && props.subscription.deactivation ==
                                        "" ? (
                                            <div className="bg-white rounded-10 mt-4 p-3 border fs-sm">
                                                {translate(
                                                    props.subscription.started
                                                        ? "Your plan will be automatically renewed on"
                                                        : "Your plan will be billed starting on "
                                                )}{" "}
                                                <span className="fw-bold">
                                                    {
                                                        props.subscription
                                                            .nextbill
                                                    }
                                                </span>
                                                .{" "}
                                                {translate(
                                                    "It will be charged as one payment of"
                                                )}{" "}
                                                <span className="fw-bold">
                                                    {props.subscription.price}
                                                </span>
                                                .
                                            </div>
                                        ) : (
                                            <div className="alert alert-danger rounded-10 mt-4 p-3 border-0 fs-sm">
                                                {translate(
                                                    "Your sites will only be available until "
                                                )}{" "}
                                                <span className="fw-bold">
                                                    {
                                                        props.subscription ? props.subscription.deactivation : ''
                                                    }
                                                </span>
                                                .
                                            </div>
                                        )}
                                    </div> */}
                                    {/* <h6>{translate("Payment Method")}</h6> */}
                                    {/* {props.paymentmethods.map(
                                        (paymentmethod) => {
                                            return (
                                                <div
                                                    key={paymentmethod.id}
                                                    className="pb-2 mb-2 d-flex align-items-center justify-content-between"
                                                >
                                                    <div className="d-flex align-items-center">
                                                        {Object.keys(
                                                            paymentmethod.stripe
                                                        ).length > 0 &&
                                                            paymentmethod.stripe
                                                                .card && (
                                                                <>
                                                                    <i
                                                                        className={`fa-brands fa-cc-${paymentmethod.stripe.card.brand}`}
                                                                    />
                                                                    <div className="fs-sm ms-3">
                                                                        <div>
                                                                            {
                                                                                paymentmethod.name
                                                                            }
                                                                        </div>
                                                                        <div>
                                                                            ***
                                                                            {
                                                                                paymentmethod
                                                                                    .stripe
                                                                                    .card
                                                                                    .last4
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            deletePaymentMethod(
                                                                paymentmethod
                                                            )
                                                        }
                                                        type="button"
                                                        className="btn text-danger"
                                                    >
                                                        <i className="bi bi-dash-circle"></i>
                                                    </button>
                                                </div>
                                            );
                                        }
                                    )}
                                    <div className="d-flex">
                                        <a
                                            href="#"
                                            onClick={addPaymentMethod}
                                            className="btn btn-lg btn-danger fs-sm d-flex align-items-center"
                                        >
                                            <i className="bi bi-plus-lg me-2"></i>
                                            {translate(
                                                "Add new payment method"
                                            )}
                                        </a>
                                    </div> */}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal fade"
                id="edit-card"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex="-1"
                aria-labelledby="edit-modal-label"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="edit-modal-label">
                                {translate("Edit Card")}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body"></div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Close
                            </button>
                            <button type="button" className="btn btn-primary">
                                Understood
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="modal fade"
                id="add-payment-method"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex="-1"
                aria-labelledby="add-payment-method-modal-label"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5
                                className="modal-title"
                                id="add-payment-method-modal-label"
                            >
                                {translate("Add Payment Method")}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {stripeSK !== null ? (
                                <AccountPayment pk={stripePK} sk={stripeSK} />
                            ) : (
                                <div className="d-flex justify-content-center py-5">
                                    <div
                                        className="spinner-border text-light"
                                        role="status"
                                        style={{
                                            width: "4rem",
                                            height: "4rem",
                                        }}
                                    >
                                        <span className="visually-hidden">
                                            Loading...
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}

const styles = {
    cover: {
        backgroundImage: `url('../../assets/images/orange.jpg')`,
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
        backgroundSize: "110% 110%",
    },
};
