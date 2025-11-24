import React from "react";
import { translate } from "@/Helpers";
import ColorPicker from "./ColorPicker";

export default function ColorSettings({className, settings, onHandleChangeQRColor, onHandleChangeButtonBgColor, onHandleChangeButtonTextColor}) {
    return (
        <div className={className}>
            <div className="row m-0">
                <div className="col-6 g-2">
                    {translate("QR")}
                </div>
                <div className="col-6 g-2 d-flex justify-content-end">
                    <ColorPicker color={settings.qrColor} onHandleChange={(c) => onHandleChangeQRColor(c)} />
                </div>
            </div>
            <div className="row m-0">
                <div className="col-6 g-2">
                    {translate("Button's Background")}
                </div>
                <div className="col-6 g-2 d-flex justify-content-end">
                    <ColorPicker color={settings.background} onHandleChange={(c) => onHandleChangeButtonBgColor(c)} />
                </div>
            </div>
            <div className="row m-0">
                <div className="col-6 g-2">
                    {translate("Button's Text")}
                </div>
                <div className="col-6 g-2 d-flex justify-content-end">
                    <ColorPicker color={settings.color} onHandleChange={(c) => onHandleChangeButtonTextColor(c)} />
                </div>
            </div>
        </div>
    );
}