export const handleError = (err, res) => {
    switch (err.message) {
        case "Unauthorized":
            return res.status(403).json({
                code: 403,
                status: "error",
                message: "Unauthorized",
            });
        case "Invalid email":
            return res.status(403).json({
                code: 403,
                status: "error",
                message: "Invalid email",
            });
        case "Invalid password":
            return res.status(403).json({
                code: 403,
                status: "error",
                message: "Invalid password",
            });
        case "Passowrd is incorrect":
            return res.status(403).json({
                code: 403,
                status: "error",
                message: "Password is incorrect",
            });
        case "jwt expired":
            return res.status(403).json({
                code: 403,
                status: "error",
                message: "jwt expired",
            });
        case "Only admins have this permission":
            return res.status(403).json({
                code: 403,
                status: "error",
                message: "Only admins have this permission",
            });
        case "Only members have this permission":
            return res.status(403).json({
                code: 403,
                status: "error",
                message: "Only members have this permission",
            });
        case `"password" is required`:
            return res.status(400).json({
                code: 400,
                status: "error",
                message: `"password" is required`,
            });

        case `"email" is required`:
            return res.status(400).json({
                code: 400,
                status: "error",
                message: `"email" is required`,
            });
        case `"password" length must be at least 3 characters long`:
            return res.status(400).json({
                code: 400,
                status: "error",
                message: `"password" length must be at least 3 characters long`,
            });
        case `"password" must only contain alpha-numeric characters`:
            return res.status(400).json({
                code: 400,
                status: "error",
                message: `"password" must only contain alpha-numeric characters`,
            });
        case `"password" length must be less than or equal to 9 characters long`:
            return res.status(400).json({
                code: 400,
                status: "error",
                message: `"password" length must be less than or equal to 9 characters long`,
            });
        case `"email" is not allowed to be empty`:
            return res.status(400).json({
                code: 400,
                status: "error",
                message: `"email" is not allowed to be empty`,
            });
        case `"email" must be a valid email`:
            return res.status(400).json({
                code: 400,
                status: "error",
                message: `"email" must be a valid email`,
            });
        case `"password" missing required peer "repeat_password"`:
            return res.status(400).json({
                code: 400,
                status: "error",
                message: `missing confirm password`,
            });
        case `"repeat_password" must be [ref:password]`:
            return res.status(400).json({
                code: 400,
                status: "error",
                message: `password and confirm password is not same`,
            });
        case `"password" is not allowed to be empty`:
            return res.status(400).json({
                code: 400,
                status: "error",
                message: `"password" is not allowed to be empty`,
            });
        case `"password" must be a string`:
            return res.status(400).json({
                code: 400,
                status: "error",
                message: `"password" must be a string`,
            });
        case `"email" must be a string`:
            return res.status(400).json({
                code: 400,
                status: "error",
                message: `"email" must be a string`,
            });

        // case ... other
        default:
            return res.status(500).json({
                code: 500,
                status: "error",
                message: "Internal Server Error",
            });
    }
};
