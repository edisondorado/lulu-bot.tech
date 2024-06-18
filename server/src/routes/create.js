const { isAdmin } = require("../middleware/isUserAuthenticated");
const { UserSchema, LogUsers } = require("../models/DiscordUser");

const router = require("express").Router();

router.post("/leader", isAdmin, async (req, res) => {
    const { id_discord, nickname, job_title, fraction, appointment_date, forum, vkontakte, reason } = req.body;

    if (!id_discord || !nickname || !job_title || !fraction || !appointment_date || !forum || !vkontakte || !reason) {
        return res.sendStatus(400);
    }

    try {
        const user = await UserSchema.findOne({ userId: id_discord });
        if (user) {
            if (user.admin.active) {
                return res.status(400).json({ message: "Already admin" });
            }
            user.nickname = nickname;
            user.leader.job_title = job_title;
            user.leader.fraction = fraction;
            user.leader.appointment_date = appointment_date;
            user.leader.active = true;
            user.leader.reason = reason;
            user.url.forum = `https://forum.arizona-rp.com/members/${forum}`;
            user.url.vk = `https://vk.com/id${vkontakte}`;
            await user.save();
            await LogUsers.create({
                timestamp: new Date(),
                action: "register",
                issuedBy: {
                    id: req.user.userId,
                    nickname: req.user.nickname,
                },
                targetUser: {
                    id: id_discord,
                    nickname: nickname,
                },
                status: "leader",
                additionalInfo: `Фракция: ${fraction}. Должность: ${job_title}`
            })
            return res.status(200).json({ message: "Updated" });
        } else {
            await UserSchema.create({
                nickname: nickname,
                userId: id_discord,
                leader: {
                    active: true,
                    job_title: job_title,
                    fraction: fraction,
                    reason: reason,
                    appointment_date: appointment_date,
                },
                url: {
                    forum: `https://forum.arizona-rp.com/members/${forum}`,
                    vk: `https://vk.com/id${vkontakte}`,
                },
            });
            await LogUsers.create({
                timestamp: new Date(),
                action: "register",
                issuedBy: {
                    id: req.user.userId,
                    nickname: req.user.nickname,
                },
                targetUser: {
                    id: id_discord,
                    nickname: nickname,
                },
                status: "leader",
                additionalInfo: `Фракция: ${fraction}. Должность: ${job_title}`
            })
            return res.status(201).json({ message: "Created" });
        }
    } catch (error) {
        console.warn(error);
        return res.sendStatus(500);
    }
});


router.post("/admin", isAdmin, async (req, res) => {
    const { id_discord, nickname, job_title, lvl, appointment_date, forum, vkontakte, reason } = req.body;

    if (!id_discord || !nickname || !job_title || !lvl || !appointment_date || !forum || !vkontakte || !reason) {
        return res.sendStatus(400);
    }

    try {
        const user = await UserSchema.findOne({ userId: id_discord });
        if (user) {
            if (user.leader.active) {
                return res.status(400).json({ message: "Already leader" });
            }
            user.nickname = nickname;
            user.admin.job_title = job_title;
            user.admin.appointment_date = appointment_date;
            user.admin.active = true;
            user.admin.lvl = extractLvl(lvl)
            user.admin.reason = reason;
            user.url.forum = `https://forum.arizona-rp.com/members/${forum}`;
            user.url.vk = `https://vk.com/id${vkontakte}`;
            await user.save();
            await LogUsers.create({
                timestamp: new Date(),
                action: "register",
                issuedBy: {
                    id: req.user.userId,
                    nickname: req.user.nickname,
                },
                targetUser: {
                    id: id_discord,
                    nickname: nickname,
                },
                status: "admin",
                additionalInfo: `Уровень: ${lvl}. Должность: ${job_title}`
            })
            return res.status(200).json({ message: "Updated" });
        } else {
            await UserSchema.create({
                nickname: nickname,
                userId: id_discord,
                admin: {
                    active: true,
                    job_title: job_title,
                    lvl: extractLvl(lvl),
                    reason: reason,
                    appointment_date: appointment_date,
                },
                url: {
                    forum: `https://forum.arizona-rp.com/members/${forum}`,
                    vk: `https://vk.com/id${vkontakte}`,
                },
            });
            await LogUsers.create({
                timestamp: new Date(),
                action: "register",
                issuedBy: {
                    id: req.user.userId,
                    nickname: req.user.nickname,
                },
                targetUser: {
                    id: id_discord,
                    nickname: nickname,
                },
                status: "admin",
                additionalInfo: `Уровень: ${lvl}. Должность: ${job_title}`
            })
            return res.status(201).json({ message: "Created" });
        }
    } catch (error) {
        console.warn(error);
        return res.sendStatus(500);
    }
});

function extractLvl(variable) {
    const match = variable.match(/\[(\d+)\]/);
    if (match) {
        return parseInt(match[1], 10);
    }
    return null;
}


module.exports = router;