import { toast } from "@/Helpers";
import { useForm } from "@inertiajs/inertia-react";
import { Modal } from "bootstrap";
import { useEffect, useState } from "react";

export default function Translation({ translation }) {
    const [en, setEn] = useState(
        translation.translated ? translation.translated.en : ""
    );
    const [de, setDe] = useState(
        translation.translated ? translation.translated.de : ""
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        en: en,
        de: de,
    });

    const onHandleChange = (event) => {
        setData(event.target.name, event.target.value);
    };

    const submit = (e) => {
        e.preventDefault();
        axios
            .put(route("translations.update", translation.id), {
                translation: JSON.stringify({
                    en: data.en,
                    de: data.de,
                }),
            })
            .then(() => {
                setEn(data.en);
                setDe(data.de);
                toast("Translation updated!");

                const btns = document.getElementsByClassName("btn-close");
                for (const i in btns) {
                    if (btns[i]) btns[i].click();
                }
            });
    };

    return (
        <>
            <tr>
                <th scope="row">
                    <a
                        href="javascript:void(0);"
                        data-bs-toggle="modal"
                        data-bs-target={`#translation-${translation.id}`}
                    >
                        {translation.default}
                    </a>
                </th>
                <td>{en}</td>
                <td>{de}</td>
            </tr>
            <div
                class="modal fade"
                id={`translation-${translation.id}`}
                tabindex="-1"
            >
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Translate</h5>
                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div class="modal-body">
                            <h5>{translation.default}</h5>
                            <form onSubmit={submit}>
                                <div class="mb-3">
                                    <label for="en" class="form-label">
                                        English
                                    </label>
                                    <input
                                        type="text"
                                        name="en"
                                        className="form-control"
                                        value={data.en}
                                        onChange={onHandleChange}
                                    />
                                </div>
                                <div class="mb-3">
                                    <label for="de" class="form-label">
                                        German
                                    </label>
                                    <input
                                        type="text"
                                        name="de"
                                        className="form-control"
                                        value={data.de}
                                        onChange={onHandleChange}
                                    />
                                </div>
                                <button type="submit" class="btn btn-primary">
                                    Submit
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
