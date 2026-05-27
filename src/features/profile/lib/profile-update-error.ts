import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import type { TFunction } from "i18next";

const USERNAME_TAKEN = "Пользователь с таким именем уже существует";
const USERNAME_REQUIRED = "Имя пользователя обязательно";
const USERNAME_LENGTH = "Имя пользователя должно содержать от 3 до 30 символов";
const USERNAME_PATTERN =
    "Имя пользователя может содержать только буквы, цифры и подчеркивание";

export function mapProfileUpdateError(
    error: unknown,
    t: TFunction,
): Record<string, string> {
    const message = getApiErrorMessage(error, "");
    if (message === USERNAME_TAKEN) {
        return { username: t("validation.usernameTaken") };
    }
    if (message === USERNAME_REQUIRED) {
        return { username: t("validation.usernameRequired") };
    }
    if (message === USERNAME_LENGTH) {
        return { username: t("validation.usernameMinLength") };
    }
    if (message === USERNAME_PATTERN) {
        return { username: t("validation.usernamePattern") };
    }
    return { submit: message || t("profile.updateError") };
}
