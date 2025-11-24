import React, { useState } from 'react';
import { Modal } from 'bootstrap';
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

export default function TestUpload() {
    let [image, setImage] = useState(null);
    const [cropper, setCropper] = useState(null);

    const uploadCropData = async () => {
        if (typeof cropper !== "undefined") {
            // await axios.post('/asdf', {avatar: cropper.getCroppedCanvas().toDataURL()}).then(function(){
            //     alert('uploaded');
            // });
            let myModalEl = document.getElementById('staticBackdrop')
            let modal = Modal.getInstance(myModalEl)
            modal.hide();
        }
    };
    const handleChange = (event) => {
        let files = event.target.files;
        let done = function(url){
            // console.log('url', url);
            // img.src = url
            (new Modal(document.getElementById('staticBackdrop'), {
                keyboard: false
            })).show();
            document.getElementById('staticBackdrop').addEventListener('shown.bs.modal', function (event) {
                setImage(url);
            })
            // console.log('image', img);
            files = null;
        }
        if(files && files.length > 0){
            let reader = new FileReader();
            reader.onload = function(event){
                done(reader.result);
            };
            reader.readAsDataURL(files[0]);
        }
    };
    return (
        <>
            <div>
                <label for="avatar">Choose a profile picture:</label>

                <input type="file"
                    id="avatar" name="avatar"
                    accept="image/png, image/jpeg" onChange={handleChange}></input>
            </div>
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                Launch static backdrop modal
            </button>
        
            <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="staticBackdropLabel">Modal title</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        {image && (
                            <Cropper 
                                src={image} 
                                initialAspectRatio="1" 
                                onInitialized={(instance) => {
                                    setCropper(instance);
                                }}/>
                        )}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onClick={uploadCropData}>Done</button>
                    </div>
                    </div>
                </div>
            </div> 
        </>
    );
}
