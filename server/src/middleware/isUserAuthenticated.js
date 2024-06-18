require('dotenv').config();
const refresh = require('passport-oauth2-refresh');

async function isLeader(req, res, next){
    if (req.user && ((req.user.leader && req.user.leader.active) || (req.user.admin)) ){
        next();
    } else {
        res.status(404).json({
            message: "Not Authorized"
        })
    }
}

async function isAdmin(req, res, next){
    if (req.user && req.user.admin && req.user.admin.active){
        next();
    } else {
        res.status(404).json({
            message: "Not Authorized"
        })
    }
}

async function isAuthenticated(req, res, next){
    if (req.user && (req.user.admin && req.user.admin.active || req.user.leader && req.user.leader.active)){
        next();
    } else {
        res.status(404).json({
            message: "Not Authorized"
        })
    }
}

async function isGuest(req, res, next){
    if (req.user){
        next();
    } else {
        res.status(404).json({
            message: "Not Authorized"
        })
    }
}

module.exports = { isLeader, isAdmin, isGuest, isAuthenticated };