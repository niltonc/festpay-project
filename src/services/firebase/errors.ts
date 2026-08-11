import { FirebaseError } from "firebase/app";

// Translates raw Firebase error codes into friendly, user-facing PT-BR
// messages so components never surface technical Firebase errors directly.
const MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "Este e-mail já está cadastrado.",
  "auth/invalid-email": "E-mail inválido.",
  "auth/weak-password": "A senha deve ter pelo menos 6 caracteres.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/invalid-login-credentials": "E-mail ou senha incorretos.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
  "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
  "auth/operation-not-allowed":
    "Login por e-mail/senha desativado no Firebase. Ative em Authentication → Sign-in method → E-mail/senha.",
  "auth/configuration-not-found":
    "Login por e-mail/senha desativado no Firebase. Ative em Authentication → Sign-in method → E-mail/senha.",
  "auth/admin-restricted-operation":
    "Login por e-mail/senha desativado no Firebase. Ative em Authentication → Sign-in method → E-mail/senha.",
  "permission-denied": "Você não tem permissão para acessar este recurso.",
  "not-found": "O recurso solicitado não foi encontrado.",
  unavailable: "Serviço indisponível no momento. Tente novamente.",
};

export function toFriendlyMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return (
      MESSAGES[error.code] ?? "Ocorreu um erro inesperado. Tente novamente."
    );
  }
  if (error instanceof Error) {
    return error.message || "Ocorreu um erro inesperado. Tente novamente.";
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}

export class AppError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function wrapError(error: unknown): AppError {
  return new AppError(toFriendlyMessage(error), error);
}
