const ERROR_MESSAGES: Record<string, string> = {
  "auth/admin-restricted-operation":
    "This operation is restricted to administrators only.",
  "auth/argument-error":
    "Invalid argument passed to the function. Please check inputs and try again.",
  "auth/app-not-authorized":
    "This app is not authorized to authenticate with the provided Firebase project. Check your app's settings.",
  "auth/app-not-installed":
    "The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.",
  "auth/captcha-check-failed": "The CAPTCHA check failed. Try again.",
  "auth/code-expired":
    "The SMS code has expired. Please re-send the verification code to try again.",
  "auth/cordova-not-ready": "Cordova environment is not ready yet.",
  "auth/cors-unsupported": "This browser is not supported.",
  "auth/credential-already-in-use":
    "This credential is already associated with a different user account.",
  "auth/custom-token-mismatch":
    "The custom token corresponds to a different audience.",
  "auth/requires-recent-login":
    "This operation is sensitive and requires recent authentication. Log in again before retrying this request.",
  "auth/dependent-sdk-initialized-before-auth":
    "The Firebase SDK must be initialized before the authentication SDK.",
  "auth/dynamic-link-not-activated":
    "Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.",
  "auth/email-change-needs-verification":
    "Email changes require verification. Check your email for a verification link.",
  "auth/email-already-in-use":
    "The email address is already in use by another account.",
  "auth/emulator-config-failed":
    "Emulator configuration failed. Ensure your emulator is correctly setup.",
  "auth/expired-action-code":
    "The action code has expired. Please check the code and try again.",
  "auth/cancelled-popup-request":
    "The popup has been closed by the user before finalizing the operation.",
  "auth/internal-error": "An internal error has occurred. Please try again.",
  "auth/invalid-api-key":
    "Your API key is invalid. Please check you have copied it correctly from your Firebase project settings.",
  "auth/invalid-app-credential":
    "The phone verification request contains an invalid application credential. Check your configuration.",
  "auth/invalid-app-id":
    "The mobile app identifier is not registered for the current project.",
  "auth/invalid-user-token":
    "Your user's credential is no longer valid. The user must sign in again.",
  "auth/invalid-auth-event":
    "An internal error has occurred with the authentication event.",
  "auth/invalid-cert-hash": "The SHA-1 certificate hash provided is invalid.",
  "auth/invalid-verification-code":
    "The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and try again.",
  "auth/invalid-continue-uri":
    "The continue URI provided in the request is invalid.",
  "auth/invalid-cordova-configuration":
    "The Cordova project is not configured correctly. Ensure you have the correct plugins installed.",
  "auth/invalid-custom-token":
    "The custom token format is incorrect. Please check the documentation.",
  "auth/invalid-dynamic-link-domain":
    "The dynamic link domain used is not allowed for this project.",
  "auth/invalid-email": "The email address is badly formatted.",
  "auth/invalid-emulator-scheme": "The emulator scheme is not valid.",
  "auth/invalid-credential":
    "Your login credentials are invalid or have expired. Please try signing in again or reset your password.",
  "auth/invalid-message-payload":
    "The email template contains invalid characters in its body or subject.",
  "auth/invalid-multi-factor-session":
    "The request does not contain a valid multi-factor session. Please try again with a new multi-factor session.",
  "auth/invalid-oauth-client-id":
    "The OAuth client ID provided is either invalid or does not match the specified API key.",
  "auth/invalid-oauth-provider":
    "The OAuth provider configuration is not supported or enabled for this project.",
  "auth/invalid-action-code":
    "The action code is invalid. This can happen if the code is malformed, expired, or has already been used.",
  "auth/unauthorized-domain":
    "The domain of the redirect URI is not whitelisted. Whitelist the domain in the Firebase console.",
  "auth/wrong-password":
    "The password is invalid or the user does not have a password.",
  "auth/invalid-persistence-type":
    "The specified persistence type is invalid or not supported.",
  "auth/invalid-phone-number":
    "The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format.",
  "auth/invalid-provider-id": "The provider ID provided is not supported.",
  "auth/invalid-recipient-email":
    "The email address of the recipient is badly formatted.",
  "auth/invalid-sender":
    "The sender ID used to send the notification is invalid.",
  "auth/invalid-verification-id":
    "The verification ID used to create the phone auth credential is invalid.",
  "auth/invalid-tenant-id": "The Auth instance's tenant ID is not valid.",
  "auth/multi-factor-info-not-found":
    "The user does not have a second factor matching the identifier provided.",
  "auth/multi-factor-auth-required":
    "Proof of ownership of a second factor is required to complete sign-in.",
  "auth/missing-android-pkg-name":
    "An Android Package Name must be provided if the Android app is required to be installed.",
  "auth/missing-app-credential":
    "The request is missing an Android Package Name and must be provided to allow the app to be installed.",
  "auth/auth-domain-config-required":
    "This operation is sensitive and requires configuration of your project's auth domain.",
  "auth/missing-verification-code": "The verification code is missing.",
  "auth/missing-continue-uri":
    "A continue URI must be provided in the request.",
  "auth/missing-iframe-start":
    "An internal error occurred during sign-in initialization with an iframe.",
  "auth/missing-ios-bundle-id":
    "An iOS Bundle ID must be provided if an App Store ID is provided.",
  "auth/missing-or-invalid-nonce":
    "The request does not contain a valid nonce. This may occur if the nonce received is not the same as the one sent in the ID token payload.",
  "auth/missing-multi-factor-info": "No second factor identifier is provided.",
  "auth/missing-multi-factor-session":
    "The request is missing a multi-factor session.",
  "auth/missing-phone-number":
    "To send verification codes, please provide a phone number.",
  "auth/missing-verification-id": "The verification ID is missing.",
  "auth/app-deleted": "The Firebase App was deleted.",
  "auth/account-exists-with-different-credential":
    "An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.",
  "auth/network-request-failed":
    "Network error (such as timeout, interrupted connection, or unreachable host) has occurred. Check network connection and try again.",
  "auth/null-user": "The operation requires a signed-in user.",
  "auth/no-auth-event":
    "An internal error occurred during the authentication process.",
  "auth/no-such-provider": "The user does not have a password.",
  "auth/operation-not-allowed":
    "The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console.",
  "auth/operation-not-supported-in-this-environment":
    "This operation is not supported in the environment this application is running on. 'location.protocol' must be http, https or chrome-extension and web storage must be enabled.",
  "auth/popup-blocked":
    "Unable to establish a connection with the popup. It may have been blocked by the browser.",
  "auth/popup-closed-by-user":
    "The popup has been closed by the user before completing the sign in.",
  "auth/provider-already-linked":
    "This provider has already been linked to the account.",
  "auth/quota-exceeded": "The quota for this operation has been exceeded.",
  "auth/redirect-cancelled-by-user":
    "The redirect operation has been cancelled by the user before finalizing.",
  "auth/redirect-operation-pending":
    "A redirect sign-in operation is already pending.",
  "auth/rejected-credential":
    "The request contains malformed or mismatching credentials.",
  "auth/second-factor-already-in-use":
    "The second factor is already enrolled on this account.",
  "auth/maximum-second-factor-count-exceeded":
    "You have reached the maximum allowed number of second factors on a single user account.",
  "auth/tenant-id-mismatch":
    "Provided tenant ID does not match the Auth instance's tenant ID.",
  "auth/timeout": "The operation has timed out. Try again.",
  "auth/user-token-expired":
    "The user's credential is no longer valid. The user must sign in again.",
  "auth/too-many-requests":
    "We have blocked all requests from this device due to unusual activity. Try again later.",
  "auth/unauthorized-continue-uri":
    "The domain of the continue URI is not whitelisted. Whitelist the domain in the Firebase console.",
  "auth/unsupported-first-factor":
    "The first factor that this operation is trying to replace is not supported.",
  "auth/unsupported-persistence-type":
    "The specified persistence type is not supported.",
  "auth/unsupported-tenant-operation":
    "This operation is not supported in a multi-tenant context.",
  "auth/unverified-email": "The email address is not verified.",
  "auth/user-cancelled":
    "The user did not grant your application the permissions it requested.",
  "auth/user-not-found":
    "There is no user record corresponding to this identifier. The user may have been deleted.",
  "auth/user-disabled":
    "The user account has been disabled by an administrator.",
  "auth/user-mismatch":
    "The supplied credentials do not correspond to the previously signed in user.",
  "auth/user-signed-out": "",
  "auth/weak-password": "The password must be 6 characters long or more.",
  "auth/web-storage-unsupported":
    "This browser does not support web storage or if the user has disabled it.",
  "auth/already-initialized": "The Firebase app is already initialized.",
  "auth/recaptcha-not-enabled":
    "ReCAPTCHA is not enabled but is required for this operation. Enable it in the Firebase console.",
  "auth/missing-recaptcha-token": "No ReCAPTCHA token provided.",
  "auth/invalid-recaptcha-token": "Invalid ReCAPTCHA token.",
  "auth/invalid-recaptcha-action":
    "The ReCAPTCHA action being checked is invalid or misformed.",
  "auth/missing-client-type": "Client type is missing from the request.",
  "auth/missing-recaptcha-version":
    "ReCAPTCHA version is missing from the request.",
  "auth/invalid-recaptcha-version":
    "The ReCAPTCHA version specified is not supported.",
  "auth/invalid-req-type": "The request type is invalid or not supported.",
  default: "An unexpected error occurred. Please try again.",
};

export function getErrorMessage(errorCode: string): string {
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES["default"];
}
