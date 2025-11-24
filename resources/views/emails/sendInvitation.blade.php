<div>
    <p><b>{{translate('Dear')}} {{$data['name']}},</b></p>
    <p>{{translate('Your WeShare.Site Digital Business Card has been created by')}} {{$data['created_by']}}.</p>
    <p>{{translate('Please tap the following button to access your card:')}}</p>
    <div style="margin:20px 0">
        <a href="{{route('setpassword', ['token' => $data['token']])}}" style="background-color:#df2351;color:#fff;text-decoration:none;padding:10px;border-radius:5px">{{translate('Edit Your Site')}}</a>
    </div>
    <p>{{translate('In case you have any questions, our customer success team is always available to assist you. We pride ourselves in providing quick responses.')}}</p>
    <p>{{translate("If you have any further questions regarding the process, don't hesitate to reach out.")}}</p>
    <div style="margin:20px 0">
        {{translate('Warm regards')}},
        <div>The <a href="{{env('APP_URL', 'https://app.weshare.site')}}">{{env('APP_NAME', 'WeShare.Site')}}</a> Team</div>
    </div>
</div>