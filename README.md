# [Draft] Accounts Google for Meteor React Native.

## Prerequisites

Have RN >= 0.60.0

## Installation

In your react native app, run the following command to install it:

```shell
npm install @meteorrn/oauth-google
```

In your meteor app, make sure you have installed the following packages:

```shell
meteor add accounts-base accounts-password accounts-google service-configuration
```

And add this configuration in a server's file:

```js
import { Meteor } from 'meteor/meteor';
import { ServiceConfiguration } from 'meteor/service-configuration';

if (Meteor.isDevelopment) {
    if (Meteor.settings.private?.OAUTH?.google) {
        process.env.OAUTH_GOOGLE_CLIENT_ID = Meteor.settings.private.OAUTH.google.CLIENT_ID;
        process.env.OAUTH_GOOGLE_SECRET = Meteor.settings.private.OAUTH.google.SECRET;
    } else {
        console.warn('[App name] - Google OAuth settings are not configured.');
    	process.env.OAUTH_GOOGLE_CLIENT_ID = '';
    	process.env.OAUTH_GOOGLE_SECRET = '';
    }
}

ServiceConfiguration.configurations.upsert({ service: 'google' }, {
    $set: {
        clientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
        loginStyle: "popup",
        secret: process.env.OAUTH_GOOGLE_SECRET
    }
});
```

Make sure you have environment variables configured in your `settings-settings.json` file:

```json
{
  "private": {
    "ROOT_URL": "http://localhost",
    "OAUTH": {
      "google": {
        "CLIENT_ID": "yourAppId",
        "SECRET": "yourSecret"
      }
    }
  }
}
```
### Configuration for Android/iOS

Then follow the 
[Android guide](https://github.com/react-native-google-signin/google-signin/blob/master/docs/android-guide.md) and 
[iOS guide](https://github.com/react-native-google-signin/google-signin/blob/master/docs/ios-guide.md)

## Usage

In the below example, you will have to load your client ids (for Android and iOS) from a `.env` file located in your 
project root since `react-native-config` is being used.

_projectRoot/.env_
```
GOOGLE_CLIENT_ID_IOS=<client_id_ios>.apps.googleusercontent.com
GOOGLE_CLIENT_ID_ANDROID=<client_id_android>.apps.googleusercontent.com
```
 - _GOOGLE_CLIENT_ID_IOS: You can find it in GoogleServices-Info.plist as CLIENT_ID_
 - _GOOGLE_CLIENT_ID_ANDROID: You can find it in google-services.json as client-> oauth_client -> client_id_

### Login

```js
import { Component } from 'react';
import { View } from 'react-native';
import { Config } from 'react-native-config';
import { Platform } from 'react-native';
import Meteor from '@meteorrn/core';
import '@meteorrn/oauth-google';//this should be inside of meteorrn/core package (PR is needed).
import GoogleButton from './path/to/customGoogleButton';

export default class Login extends Component {

    handleGoogleLogin() {
    	const clientId = Platform.OS === 'ios' ? Config.GOOGLE_CLIENT_ID_IOS : Config.GOOGLE_CLIENT_ID_ANDROID;
    	Meteor.loginWithGoogle({ webClientId: clientId }, (error) => {
                if (!error) {
    	            //Do anything
                } else {
    	            console.error('There was an error in login with Facebook: ', error);
                }
            });
    }

    render() {
        return (
            <View>
                <GoogleButton onPress={ handleGoogleLogin }/>
            </View>
        );
    }
};
```

If you want to do **logout**, remember to use this way:

```js
Meteor.logoutFromGoogle();
```

This allows to revoke access from Google Signing.
