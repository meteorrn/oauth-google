import Meteor from '@meteorrn/core';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Login with Google using Meteor Accounts and React Native
 * @param configuration Options for the configure method of GoogleSignin.
 * @returns {Promise<void> | Promise.Promise}
 */
Meteor.loginWithGoogle = function(configuration) {
	return new Promise(async(resolve, reject) => {
		try {
			GoogleSignin.configure(configuration);
			await GoogleSignin.hasPlayServices({
				showPlayServicesUpdateDialog: true
			});
			let userInfo;
			const isSignedIn = await GoogleSignin.isSignedIn();
			if (!isSignedIn) {
				userInfo = await GoogleSignin.signIn();
				if (!userInfo) {
					reject({ reason: 'Something went wrong obtaining user info', details: { userInfo } });
					return;
				}
			} else {
				userInfo = await GoogleSignin.signInSilently();
				if (!userInfo) {
					reject({ reason: 'Something went wrong obtaining user info', details: { userInfo } });
					return;
				}
			}
			const tokens = await GoogleSignin.getTokens();
			Meteor._startLoggingIn();
			Meteor.call(
				'login',
				{
					googleSignIn: true,
					accessToken: tokens.accessToken,
					refreshToken: undefined,
					idToken: tokens.idToken,
					serverAuthCode: userInfo.serverAuthCode,
					email: userInfo.user.email,
					imageUrl: userInfo.user.photo,
					userId: userInfo.user.id
				},
				(error, response) => {
					if (error) {
						GoogleSignin.revokeAccess();
						GoogleSignin.signOut();
						reject(error);
					}
					Meteor._endLoggingIn();
					Meteor._handleLoginCallback(error, response);
					resolve();
				}
			);
		} catch (error) {
			reject({ reason: 'Error in Google Signing', details: error });
		}
	});
};

Meteor.logoutFromGoogle = function() {
	return Promise((resolve, reject)=>{
		Meteor.logout((error) => {
			if (!error) {
				GoogleSignin.revokeAccess();
				GoogleSignin.signOut();
				resolve();
			}else{
				reject(error);
			}
		});
	})
};
