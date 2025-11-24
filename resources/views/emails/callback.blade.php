<div>
    <p><b>Hi {{$callback->card->firstname}},</b></p>
    <p>{{$callback->name}} {{translate('recently got your WeShare.Site and has sent you their details:')}}</p>
    <div>
        {{translate('Email')}}: {{$callback->email}}
    </div>
    <div>
        {{translate('Phone number')}}: {{$callback->phone}}
    </div>
    <div style="margin:20px 0">
        <a href="{{route('contacts.index')}}" style="background-color:#df2351;color:#fff;text-decoration:none;padding:10px;border-radius:5px">View in WeShare.Site</a>
    </div>
    <p>{{translate('You can send a message to [:name] by replying to this email.', ["name" => $callback->name])}}</p>
</div>