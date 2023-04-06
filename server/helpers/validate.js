import Joi from "joi";

export const credential_validate_register = Joi.object({
    password: Joi.string().min(3).max(9).alphanum().required(),
    repeat_password: Joi.ref("password"),
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "net"] },
        })
        .required(),
})
    .with("email", "password")
    .with("password", "repeat_password");
export const credential_validate_login = Joi.object({
    password: Joi.string().min(3).max(9).alphanum().required(),
    email: Joi.string()
        .email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "net"] },
        })
        .required(),
}).with("email", "password");
