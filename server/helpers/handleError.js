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
        // case ... other
        default:
            return res.status(500).json({
                code: 500,
                status: "error",
                message: "Internal Server Error",
            });
    }
};
