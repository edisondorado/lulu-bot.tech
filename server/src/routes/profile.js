const router = require("express").Router();
const { isAuthenticated, isAdmin } = require("../middleware/isUserAuthenticated");
const { UserSchema, LogUsers } = require("../models/DiscordUser");

router.get("/", isAuthenticated, async (req, res) => {
  const userType = req.user.leader?.active
    ? "leader"
    : req.user.admin?.active
    ? "admin"
    : "undefined";
  const logs = await LogUsers.find({ "targetUser.id": req.user.userId });

  res.status(200).json({
    id: req.user.userId,
    nickname: req.user.nickname,
    type: userType,
    data: req.user,
    full_access: req.user.full_access,
    log: logs.filter((log) => !log.hidden.status ),
  });
});

router.get("/id:uid", isAuthenticated, async (req, res) => {
  try {
    const uid = req.params.uid;
    const user = await UserSchema.findOne({ userId: uid }).lean();

    if (!user)
      return res.status(404).json({
        message: "Not found",
      });

    const userType = user.leader.active
      ? "leader"
      : user.admin.active
      ? "admin"
      : "undefined";
    const logs = await LogUsers.find({ "targetUser.id": uid });

    res.status(200).json({
      id: req.user.userId,
      nickname: req.user.nickname,
      type: userType,
      data: user,
      full_access: req.user.full_access,
      log: logs.filter((log) => !log.hidden.status && log.status === userType),
    });
    
  } catch (err) {
    console.warn("Error fetchin user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/exchange", isAdmin, async (req, res) => {

    const { days, remainingReputation} = req.body.selectedDays;
    const { reputation, remainingDays} = req.body.selectedReputation;


    const user = await UserSchema.findOne({ userId: req.user.userId });

    const changes = [];

    if (days !== 0){
        user.admin.day = user.admin.day + days;
        user.admin.reputation = remainingReputation;
        changes.push({ timestamp: new Date(), issuedBy: { id: req.user.userId, nickname: req.user.nickname }, targetUser: { id: user.userId, nickname: user.nickname }, status: user.admin.active? "admin" : user.leader.active ? "leader" : "error_status", action: 'exchange_reputation', previousValue: `Репутация - ${user.admin.reputation} | Дни - ${user.admin.day}`, new_value: `Репутация - ${remainingReputation} | Дни - ${user.admin.day + days}` });
        await user.save();
    } else if (reputation !== 0){
        user.admin.reputation += reputation;
        user.admin.day = remainingDays;
        changes.push({ timestamp: new Date(), issuedBy: { id: req.user.userId, nickname: req.user.nickname }, targetUser: { id: user.userId, nickname: user.nickname }, status: user.admin.active? "admin" : user.leader.active ? "leader" : "error_status", action: 'exchange_days', previousValue: `Репутация - ${user.admin.reputation} | Дни - ${user.admin.day}`, new_value: `Репутация - ${user.admin.reputation + reputation} | Дни - ${remainingDays}` });
        await user.save()
    } else {
        return res.status(404).json({ message: "Not right arguments passed" });
    }

    await LogUsers.create(changes);

    res.status(200).json({
        message: "Success",
    })
})

router.post("/edit", async (req, res) => {
    if (!req.user.full_access) {
        return res.status(403).json({
            message: "No access",
        });
    }
    
    const { active_id, ...updates } = req.body;
    
    const user = await UserSchema.findOne({ userId: active_id });
    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }
    
    const changes = [];
    
    const isAdmin = user.admin.active;
    const isLeader = user.leader.active;
    
    const addActionToChanges = (action, previousValue, newValue, reason) => {
        changes.push({
            timestamp: new Date(),
            issuedBy: { id: req.user.userId, nickname: req.user.nickname },
            targetUser: { id: user.userId, nickname: user.nickname },
            status: isAdmin ? "admin" : isLeader ? "leader" : "error_status",
            action,
            previousValue,
            new_value: newValue,
            reason
        });
    };

    const addNotion = (value) => {
        changes.push({
            timestamp: new Date(),
            issuedBy: { id: req.user.userId, nickname: req.user.nickname },
            targetUser: { id: user.userId, nickname: user.nickname },
            status: isAdmin ? "admin" : isLeader ? "leader" : "error_status",
            action: "notion",
            additionalInfo: value
        });
    }

    const dismissUser = (reason) => {
        changes.push({
            timestamp: new Date(),
            issuedBy: { id: req.user.userId, nickname: req.user.nickname },
            targetUser: { id: user.userId, nickname: user.nickname },
            status: isAdmin ? "admin" : isLeader ? "leader" : "error_status",
            action: "dismiss_reason",
            reason
        });
    }
    
    const updateUserField = (field, value) => {
        if (user.admin.hasOwnProperty(field) || user.leader.hasOwnProperty(field)) {
            if (isAdmin && user.admin[field] !== value) {
                addActionToChanges(field, user.admin[field], value);
                user.admin[field] = value;
            } else if (isLeader && user.leader[field] !== value) {
                addActionToChanges(field, user.leader[field], value);
                user.leader[field] = value;
            }
        }
    };

    const updateJobTitle = (newJobTitle) => {
        const currentJobTitle = isAdmin ? user.admin.job_title : isLeader ? user.leader.job_title : "";
        if (newJobTitle !== currentJobTitle) {
            addActionToChanges("job_title", currentJobTitle, newJobTitle);
            if (isAdmin) {
                user.admin.job_title = newJobTitle;
            } else if (isLeader) {
                user.leader.job_title = newJobTitle;
            }
        }
    };
    
    const updateWarns = (field, type, reason) => {
        if (field && reason !== "") {
            if (isAdmin) {
                addActionToChanges(field, user.admin[field], type === "plus" ? user.admin[field] + 1 : user.admin[field] - 1, reason);
                user.admin[field] = type === "plus" ? user.admin[field] + 1 : user.admin[field] - 1;
            } else if (isLeader) {
                addActionToChanges(field, user.leader[field], type === "plus" ? user.leader[field] + 1 : user.leader[field] - 1, reason);
                user.leader[field] = type === "plus" ? user.leader[field] + 1 : user.leader[field] -1;
            }
        }
    };
    
    if (isAdmin) {
        updateUserField("additional_job_title", updates.additional_job_title);
        updateUserField("lvl", updates.lvl);
        updateWarns("active_warns", updates.warn.type, updates.warn.reason);
        updateUserField("free_days", user.admin.free_days + (updates.free_days.type === "plus" ? updates.free_days.amount : -updates.free_days.amount));
        updateUserField("day", user.admin.day + (updates.days.type === "plus" ? updates.days.amount : -updates.days.amount));
        updateUserField("reputation", user.admin.reputation + (updates.reputation.type === "plus" ? updates.reputation.amount : -updates.reputation.amount));
        updateUserField("reason", updates.reason);
        updateJobTitle(updates.job_title);
    } else if (isLeader) {
        updateWarns("hard_warn", updates.hardwarn.type, updates.hardwarn.reason);
        updateWarns("easy_warn", updates.easywarn.type, updates.easywarn.reason);
        updateUserField("fraction", updates.fraction);
        updateUserField("reason", updates.reason);
        updateJobTitle(updates.job_title);
    }
    
    if (updates.inactive.start && updates.inactive.end) {
        const inactiveReason = `${new Date(updates.inactive.start).toISOString().split('T')[0]} по ${new Date(updates.inactive.end).toISOString().split('T')[0]}`;
        addActionToChanges("inactive", "", inactiveReason);
        if (isAdmin) {
            user.admin.inactives.push({ from: updates.inactive.start, to: updates.inactive.end, lvl: user.admin.lvl });
        } else if (isLeader) {
            user.leader.inactives.push({ from: updates.inactive.start, to: updates.inactive.end });
        }
    }
    
    const fieldsToUpdate = ["nickname", "full_access"];
    fieldsToUpdate.forEach(field => {
        if (updates[field] !== undefined && user[field] && updates[field] !== user[field]) {
            console.log(field, user[field], updates[field])
            addActionToChanges(field, user[field], updates[field]);
            user[field] = updates[field];
        }
    });

    if (updates['dissmiss_reason'] !== "") {
        dismissUser(updates['dissmiss_reason'])
        if (isAdmin){
            user.admin.active = false;
            user.admin.dismissal.reason = updates['dissmiss_reason'];
            user.admin.dismissal.time = new Date();
        } else if (isLeader) {
            user.leader.active = false;
            user.leader.dismissal.reason = updates['dissmiss_reason'];
            user.leader.dismissal.time = new Date();
        }
    }

    if (updates['id_discord'] !== user.userId) {
        addActionToChanges("id_discord", user.userId, updates["id_discord"]);
        user.userId = updates["id_discord"];
    }

    if (updates["notion"] !== ""){
        addNotion(updates["notion"]);
    }
    if (updates["forum"] !== user.url.forum) {
        addActionToChanges("forum", user.url.forum, updates["forum"]);
        user.url.forum = updates["forum"];
    } 
    if (updates["vkontakte"] !== user.url.vk){
        addActionToChanges("vkontakte", user.url.vk, updates["vkontakte"]);
        user.url.vk = updates["vkontakte"];
    }
    
    await user.save();
    await LogUsers.create(changes);
    
    res.status(200).json({
        message: "Success",
    });    
});

router.post("/inactive", isAuthenticated, async (req, res) => {
    console.log(req.body)
    const { id_discord, start, end, reason } = req.body;
    const user = await UserSchema.findOne({ userId: id_discord });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isAdmin = user.admin.active;
    const isLeader = user.leader.active;
    
    if (isAdmin){
        user.admin.inactiveRequest.sent = false;
        user.admin.inactiveRequest.time = new Date();
        user.admin.inactiveRequest.dates.from = start;
        user.admin.inactiveRequest.dates.to = end;
        user.admin.inactiveRequest.reason = reason;
    } else {
        user.leader.inactiveRequest.sent = false;
        user.leader.inactiveRequest.time = new Date();
        user.leader.inactiveRequest.dates.from = start;
        user.leader.inactiveRequest.dates.to = end;
        user.leader.inactiveRequest.reason = reason;
    }

    await user.save();
    res.status(200).json({ message: "Success" });
});

module.exports = router;
