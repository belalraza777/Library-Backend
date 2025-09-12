const User = require("../models/usersModel");

module.exports = async function isAdmin(req, res, next) {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                error: "Not Found"
            });
        }
        if (user.role === "admin") {
            return next();
        } else {
            return res.status(403).json({
                success: false,
                message: "Only Admin Can Access!",
                error: "Forbidden"
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};
