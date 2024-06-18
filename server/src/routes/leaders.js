const { isLeader } = require("../middleware/isUserAuthenticated");
const { UserSchema } = require("../models/DiscordUser");

const router = require("express").Router();

router.get("/", isLeader, async (req, res) => {
    const users = await UserSchema.find({ "leader.active": true });

    res.status(200).json({
        message: "Success",
        data: users,
    });
})

module.exports = router;