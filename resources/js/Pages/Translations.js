import Translation from "@/Components/Translation";
import React, { useEffect, useState } from "react";

export default function Translations(props) {
    const [filter, setFilter] = useState("");

    const handleFilterChange = (e) => {
        //e.preventDefault();
        setFilter(e.target.value);
    };

    useEffect(() => {
        // Update the document title using the browser API
        console.log("filter change", filter);
    }, [filter]);

    return (
        <>
            <div className="position-fixed fixed-top py-3">
                <div className="d-flex justify-content-between container">
                    <div className="d-flex">
                        <a href="/" className="btn btn-light me-2">
                            <i className="bi bi-arrow-left"></i>
                        </a>
                        <h3>Translations</h3>
                    </div>
                    <span>
                        <div class="input-group border-bottom">
                            <span
                                class="input-group-text bg-white border-0"
                                id="basic-addon1"
                            >
                                <i class="bi bi-search"></i>
                            </span>
                            <input
                                type="text"
                                class="form-control border-0"
                                placeholder="Filter"
                                value={filter}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </span>
                </div>
            </div>
            <div className="container mt-5 py-3">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Default</th>
                            <th scope="col">English</th>
                            <th scope="col">German</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.translations.map((translation) => {
                            return (
                                translation.default
                                    .toLowerCase()
                                    .indexOf(filter.toLocaleLowerCase()) !==
                                    -1 && (
                                    <Translation
                                        key={translation.id}
                                        translation={translation}
                                    />
                                )
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}
