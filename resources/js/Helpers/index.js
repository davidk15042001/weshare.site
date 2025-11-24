import Swal from "sweetalert2";

export function translate(text, data = {}) {
    if (!text.length) return text;
    let lang = getCookie("locale");
    if (lang == null) lang = "en";
    let translated = "";
    // let translations = JSON.parse(getCookie('translations'));
    let translations = JSON.parse(
        document.querySelector('meta[name="translations"]').content
    );
    if (typeof translations === "string")
        translations = JSON.parse(translations);
    if (translations != null && translations[text] != null) {
        if (translations[text][lang] != null) {
            translated = translations[text][lang];
        }
    } else {
        if (getCookie("translator")) {
            axios.post(route("translations.store"), { default: text });
        }
    }

    if (!translated.length) translated = text;

    if (Object.keys(data).length > 0) {
        let keys = [];
        Object.keys(data).forEach(key => {
            keys.push(`[:${key}]`);
        });
        translated = translated.replace(keys, Object.values(data));
    }

    return translated;
}

export function toast(title, type = "success") {
    let background = "#27ae60";
    if (type == "error") {
        background = "#c0392b";
    }
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: type,
        iconColor: "#ffffff",
        title: `<span class="text-gray-100">${title}</span>`,
        background: background,
        color: "#ffffff",
        showConfirmButton: false,
        timer: 5000,
        showClass: {
            popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
            popup: "animate__animated animate__fadeOutUp",
        },
    });
}

export function socials() {
    return {
        website: {
            icon: "globe",
            placeholder: "www.",
            url: "",
            color: "#000000",
        },
        linkedin: {
            placeholder: "https://linkedin.com/",
            url: "",
            color: "#0a66c2",
        },
        instagram: {
            placeholder: "https://instagram.com/",
            url: "",
            color: "#7232bd",
        },
        facebook: {
            placeholder: "https://facebook.com/",
            url: "",
            color: "#1877f2",
        },
        tiktok: {
            placeholder: "https://tiktok.com/@",
            url: "",
            color: "#010101",
        },
        twitter: {
            placeholder: "https://twitter.com/",
            url: "",
            color: "#1da1f2",
        },
        pinterest: {
            placeholder: "https://pinterest.com/",
            url: "",
            color: "#E60023",
        },
        xing: { placeholder: "https://xing.com/", url: "", color: "#126567" },
        youtube: {
            placeholder: "https://youtube.com/",
            url: "",
            color: "#ff0000",
        },
        vimeo: { placeholder: "https://vimeo.com/", url: "", color: "#1ab7ea" },
        behance: {
            placeholder: "https://behance.com/",
            url: "",
            color: "#053eff",
        },
        github: {
            placeholder: "https://github.com/",
            url: "",
            color: "#171515",
        },
        link: {
            placeholder: "https://",
            url: "",
            color: "#1877f2",
        },
        skype: { placeholder: "", url: "", color: "#00aff0" },
        whatsapp: { placeholder: "", url: "", color: "#25d366" },
    };
}
export function getCookie(name) {
    var cookieArr = document.cookie.split(";");
    for (var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}
export function setCookie(name, value) {
    let yearsToLive = 1;
    var cookie = name + "=" + encodeURIComponent(value);
    if (typeof yearsToLive === "number") {
        cookie += "; max-age=" + yearsToLive * 365 * 24 * 60 * 60;
    }
    cookie += "; path=/";
    document.cookie = cookie;
}
