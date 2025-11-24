<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="notranslate" translate="no">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="translations" content="{{config('translations.content')}}">
        

        <title inertia>{{ config('app.name', 'WeShare.Site') }}</title>

        <style> 
        @font-face{
            font-family:'Roboto';
            font-style:normal;
            font-weight:400;
            font-display: swap;
            src:url(/assets/fonts/Roboto-Regular.ttf) format('truetype')
        }

        @font-face{
            font-family:'DM Sans';
            font-style:normal;
            font-weight:400;
            font-display: swap;
            src:url(/assets/fonts/DMSans-Regular.ttf) format('truetype');
        }
        @font-face{
            font-family:'DM Sans';
            font-weight:bold;
            font-display: swap;
            src:url(/assets/fonts/DMSans-Bold.ttf) format('truetype');
        }
        @font-face{
            font-family:AntDesign;
            font-style:normal;
            font-weight:400;
            src:url(/fonts/vendor/react-web-vector-icons/AntDesign.ttf) format('truetype')
        }
        @font-face{
            font-family:Entypo;
            font-style:normal;
            font-weight:400;
            src:url(/fonts/vendor/react-web-vector-icons/Entypo.ttf) format('truetype')
        }
        @font-face{
            font-family:EvilIcons;
            font-style:normal;
            font-weight:400;
            src:url(/fonts/vendor/react-web-vector-icons/EvilIcons.ttf) format('truetype')
            }@font-face{font-family:Feather;font-style:normal;font-weight:400;src:url(/fonts/vendor/react-web-vector-icons/Feather.ttf) format('truetype')}@font-face{font-family:FontAwesome;font-style:normal;font-weight:400;src:url(/fonts/vendor/react-web-vector-icons/FontAwesome.ttf) format('truetype')}@font-face{font-family:FontAwesome5;font-style:normal;font-weight:400;src:url(/fonts/vendor/react-web-vector-icons/FontAwesome5.ttf) format('truetype')}@font-face{font-family:FontAwesome5Brands;font-style:normal;font-weight:400;src:url(/fonts/vendor/react-web-vector-icons/FontAwesome5_Brands.ttf) format('truetype')}@font-face{font-family:Foundation;font-style:normal;font-weight:400;src:url(/fonts/vendor/react-web-vector-icons/Foundation.ttf) format('truetype')}@font-face{font-family:Ionicons;font-style:normal;font-weight:400;src:url(/fonts/vendor/react-web-vector-icons/Ionicons.ttf) format('truetype')}@font-face{font-family:MaterialCommunityIcons;font-style:normal;font-weight:400;src:url(/fonts/vendor/react-web-vector-icons/MaterialCommunityIcons.ttf) format('truetype')}@font-face{font-family:MaterialIcons;font-style:normal;font-weight:400;src:url(/fonts/vendor/react-web-vector-icons/MaterialIcons.ttf) format('truetype')}@font-face{font-family:Octicons;font-style:normal;font-weight:400;src:url(/fonts/vendor/react-web-vector-icons/Octicons.ttf) format('truetype')}@font-face{font-family:SimpleLineIcons;font-style:normal;font-weight:400;src:url(/fonts/vendor/react-web-vector-icons/SimpleLineIcons.ttf) format('truetype')}@font-face{font-family:Zocial;font-style:normal;font-weight:400;src:url(/fonts/vendor/react-web-vector-icons/Zocial.ttf) format('truetype')}</style>
        
        <script type="text/javascript">
            var csrf_token = '<?php echo csrf_token(); ?>'; 
        </script>
        @if (env('APP_ENV') == 'local')
            <link rel="stylesheet" href="{{ mix('/css/app.dev.css') }}">
            @routes
            <script src="{{ mix('/js/app.dev.js') }}" defer></script>
        @else
            <link rel="stylesheet" href="{{ mix('/css/app.css') }}">
            @routes
            <script src="{{ mix('/js/app.js') }}" defer></script>
        @endif
        @inertiaHead
        <link rel="icon" href="{{ URL::asset('/assets/images/favicon.ico') }}" type="image/x-icon"/>
        <link rel="apple-touch-icon-precomposed" sizes="57x57" href="{{ URL::asset('/assets/images/favicon-57x57.png') }}" />
    </head>
    <body class="font-sans antialiased">
        @inertia

        @env ('local')
            <script src="http://localhost:8080/js/bundle.js"></script>
        @endenv
    </body>
</html>

