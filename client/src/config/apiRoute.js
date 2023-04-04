import env from "./env.js";

const authHost = env.SERVER_AUTH_URL;
export const loginRoute = `${authHost}/auth/login`;
export const loginGoogle = `${authHost}/auth/google`;
export const loginFacebook = `${authHost}/auth/facebook`;
export const registerRoute = `${authHost}/auth/register`;
export const loginSuccess = `${authHost}/auth/success`;
export const checkEmail = `${authHost}/auth/get_userExists`;
