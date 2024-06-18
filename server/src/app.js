require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3005;
const session = require('express-session');
const MongoStore = require("connect-mongo");

const passport = require("passport");
const discordStrategy = require("./strategies/discord");
const db = require("./database/db");

db
    .then(() => {
        console.log("Connected to MongoDB.");
    })
    .catch((err) => {
        console.warn("Error while connecting to MongoDB:", err);
    })

// Routes
const authRoute = require('./routes/auth');
const profileRouter = require("./routes/profile");
const logRouter = require("./routes/log");
const adminRouter = require("./routes/admins");
const leaderRouter = require("./routes/leaders");
const createRouter = require('./routes/create');

app.use(session({
    secret: "secret-code",
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    },
    saveUninitialized: false,
    resave: false,
    name: "lulu-oauth",
    store: MongoStore.create({ mongoUrl: process.env.DB_URL, ttl: 14 * 24 * 60 * 60 })
}));

app.use(cors({
    origin: process.env.DOMAIN_CLIENT,
    credentials: true
}))

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json())

// Middleware Routes
app.use("/api/auth", authRoute)
app.use("/api/profile", profileRouter)
app.use("/api/log", logRouter)
app.use("/api/admins", adminRouter)
app.use("/api/leaders", leaderRouter)
app.use("/api/create", createRouter)

app.listen(PORT, () => {
    console.log(`Now listening on port: ${PORT}`);
});