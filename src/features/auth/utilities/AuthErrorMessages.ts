export class AuthErrorMessages {
  // Example of expanding error coverage and including actionable suggestions
  static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case "auth/user-not-found":
        return "No account found with this email. Please check your email or sign up.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again or reset your password if you've forgotten it.";
      case "auth/email-already-in-use":
        return "This email is already in use. Please use a different email or sign in.";
      case "auth/weak-password":
        return "The password is too weak. Please choose a stronger password.";
      case "auth/invalid-email":
        return "Invalid email address format. Please check your email.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with the same email address but different sign-in credentials. Please use a different sign-in method.";
      case "auth/too-many-requests":
        return "We have detected too many requests from your device. Please wait a while then try again.";
      case "auth/requires-recent-login":
        return "This operation is sensitive and requires recent authentication. Log in again before retrying this request.";
      // Add more cases as needed for your application
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }
}
