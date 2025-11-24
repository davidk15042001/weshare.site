<div>
    <p><b>Hello!</b></p>
    <p>{{translate('You have received [:firstname] [:lastname] Contact Information', ['firstname' => $callback->card->firstname, 'lastname' => $callback->card->lastname])}}.</p>
    <div style="margin:20px 0">
        <a href="{{$callback->download_url}}" style="background-color:#df2351;color:#fff;text-decoration:none;padding:10px;border-radius:5px">Save to your phone</a>
    </div>
    <p>{{translate('View the Site here')}}:</p>
    <p><a href="{{$callback->identifierURL}}">{{$callback->identifier}}</a></p>
    <p>{{translate('If you want to create your own free Site, to be able to share your information easily, get your own WeShare.Site!')}}</p>
    <div style="margin:20px 0">
        <a href="{{route('register')}}" style="background-color:#df2351;color:#fff;text-decoration:none;padding:10px;border-radius:5px">Get WeShare.Site</a>
    </div>
    <p>{{translate('You can send a message to [:firstname] [:lastname] by replying to this email.', ['firstname' => $callback->card->firstname, 'lastname' => $callback->card->lastname])}}</p>
</div>