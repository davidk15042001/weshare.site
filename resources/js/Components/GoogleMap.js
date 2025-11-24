import Autocomplete from "react-google-autocomplete"

export const GoogleMap = ({ data }) => {
    const API_KEY = 'AIzaSyBqPwb37NpSIzBFeQk5_Q-fl664iSzM_zA'
    return (
        <Autocomplete
            className="form-control"
            placeholder="Search location"
            apiKey={API_KEY}
            options={{types:['establishment']}}
            onPlaceSelected={(place) => {
                //  
            }}
        />
    )
}