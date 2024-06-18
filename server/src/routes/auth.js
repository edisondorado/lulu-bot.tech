const router = require("express").Router();
const passport = require('passport');

function checkAuth(req, res, next){
    if (req.isAuthenticated()){
        return res.redirect(`${process.env.DOMAIN_CLIENT}/profile`)
    }

    next();
}

router.get("/", checkAuth, passport.authenticate("discord"));
router.get("/redirect", passport.authenticate("discord", {
    failureRedirect: `${process.env.DOMAIN_CLIENT}`,
    successRedirect: `${process.env.DOMAIN_CLIENT}/profile`
}), (req, res) =>{
    res.send(200);
})

router.get('/logout', (req, res) => {
    if (req.user){
        req.logout(() => {
            res.redirect(`${process.env.DOMAIN_CLIENT}`)
        });
    } else {
        res.redirect(`${process.env.DOMAIN_CLIENT}`)
    }
})

module.exports = router;