const { isAdmin } = require("../middleware/isUserAuthenticated");
const { UserSchema } = require("../models/DiscordUser");

const router = require("express").Router();

router.get("/", isAdmin, async (req, res) => {
    const users = await UserSchema.find({ "admin.active": true });

    res.status(200).json({
        message: "Success",
        data: users,
    });
})

module.exports = router;