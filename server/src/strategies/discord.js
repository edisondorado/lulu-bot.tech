const DiscordStrategy = require("passport-discord").Strategy;
const passport = require("passport");
const refresh = require('passport-oauth2-refresh');
const { UserSchema } = require("../models/DiscordUser");

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    const user = await UserSchema.findById(id);
    if (user) done(null, user);
})

const discordStrat = new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CLIENT_REDIRECT,
    scope: ["identify", "guilds"]
}, async (accessToken, refreshToken, profile, done) => {
    profile.refreshToken = refreshToken;
    const user = await UserSchema.findOne({ userId: profile.id })
    if (!user){
        done(null, null)
    } else {
        user.avatar = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`
        user.username = profile.username;
        await user.save()
        done(null, user)
    }
})

passport.use(discordStrat);
refresh.use(discordStrat);