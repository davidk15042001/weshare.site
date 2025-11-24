<div>
    <p><b>{{translate('Dear')}} {{$data['name']}},</b></p>
    <p>{{translate('Thank you for reaching out regarding the bulk upload.')}}</p>
    <p>{{translate('Please find the attached excel spreadsheet and fill it with the required team card information. Once done, kindly share the file with our support team. We will complete the upload on the back-end within the next 3-4 business days, and you will have the chance to review the cards before sending activation emails to your team.')}}</p>
    <p>{{translate('If you need to schedule a meeting with our team, reply to this email.')}}</p>
    <p>{{translate("If you have any further questions regarding the process, don't hesitate to reach out.")}}</p>
    <div style="margin:20px 0">
        <div>{{translate('Best regards')}},</div>
        <div>The <a href="{{env('APP_URL', 'https://app.vi-site.de')}}">{{env('APP_NAME', 'WeShare.Site')}}</a> Team</div>
    </div>
</div>