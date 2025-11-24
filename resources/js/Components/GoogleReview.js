import React, {useState} from 'react';
import { translate } from '@/Helpers';
import Autocomplete from "react-google-autocomplete";

export default function({className, selectedPlace, onHandleChange, loading}) {
    const API_KEY = "AIzaSyBqPwb37NpSIzBFeQk5_Q-fl664iSzM_zA";
    const [editing, setEditing] = useState(false);
    const [place, setPlace] = useState({});

    return (
        <div className={className}>
            {editing ? (
                <>
                    <div className="d-flex mb-3">
                        <a
                            className="text-danger"
                            href="javascript:void(0);"
                            onClick={() => setEditing(false)}>
                            <i className="bi bi-arrow-left me-3"></i>{" "}
                            {translate("Cancel")}
                        </a>
                    </div>
                    <Autocomplete
                        className="form-control form-control-sm"
                        placeholder="Search location"
                        apiKey={API_KEY}
                        options={{
                            types: [
                                "establishment",
                            ],
                            fields: [
                                "place_id",
                                "formatted_address",
                                "name",
                            ]}}
                        onPlaceSelected={(place) => {
                            setPlace(place);
                            onHandleChange(place);
                            setEditing(false);
                        }}
                    />
                </>
            ) : (
                <div>
                    <p className="d-flex align-items-center mb-0">
                        {translate("Place")}:{" "}
                        {!selectedPlace.placeId ? translate("Not set yet") : ""}{" "}

                        {loading ? (
                            <span className='text-danger small ms-3'>
                                <div class="spinner-border spinner-border-sm text-danger me-1" role="status">
                                    <span class="visually-hidden">{translate('Loading')}...</span>
                                </div>
                                {translate('Getting Reviews...')}
                            </span>
                        ) : (
                            <a
                                className="text-danger small ms-3"
                                href="javascript:void(0);"
                                onClick={() => setEditing(true)}>
                                {translate("Change")}{" "}
                                <i className="bi bi-pencil"></i>
                            </a>
                        )}
                    </p>
                    {loading && (
                        <div>
                            <p className="mb-0 fs-6">{translate("Name")}:{" "}{place.name}</p>
                            <p className="mb-0">{translate("ID")}:{" "}{place.place_id}</p>
                        </div>
                    )}
                    {!loading && selectedPlace.placeId && (
                        <div>
                            <p className="mb-0 fs-6">{translate("Name")}:{" "}{selectedPlace.placeName}</p>
                            <p className="mb-0">{translate("ID")}:{" "}{selectedPlace.placeId}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}