const router = require('express').Router();
const { isAuthenticated } = require("../middleware/isUserAuthenticated");
const { LogUsers } = require('../models/DiscordUser');

router.post("/delete", isAuthenticated, async (req, res) => {
    const { logId, id, nickname } = req.body;
    if (!logId || !id ||!nickname) return res.status(400).json({ 
        message: "Request not authenticated"
    })

    if (!req.user.full_access) return res.status(404).json({
        message: "Not authorized"
    })

    
    const logs = await LogUsers.findOne({ _id: logId });
    if (!logs) return res.status(400).json({
        message: "Not found"
    })

    logs.hidden.status = true;
    logs.hidden.author.nickname = nickname;
    logs.hidden.author.id = id;

    await logs.save();

    res.status(200).json({
        message: "Message successfully deleted"
    })
});

module.exports = router;