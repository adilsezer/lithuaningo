export class AuthErrorMessages {
  static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case "auth/user-not-found":
        return "Sign-in failed. Please check your credentials.";
      case "auth/wrong-password":
        return "Wrong password. Please try again.";
      case "auth/invalid-email":
        return "Invalid email address format. Please check your email.";
      case "auth/invalid-credential":
        return "Invalid credential. Please verify your inputs.";
      case "auth/too-many-requests":
        return "Too many requests. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }
}
