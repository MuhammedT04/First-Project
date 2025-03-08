const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./model/user");
require('dotenv').config();

const generatecode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code+= characters.charAt(randomIndex);
    }
    return code;
};

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENTID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "https://first-project-alfr.onrender.com/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
               
         
                const { id: googleId, email, displayName: name } = profile;

                let user = await User.findOne({ email: profile._json.email });
                if (!user) {
                  
                    user = await User.create({
                        googleId,
                        email: profile._json.email,
                        name,
                        password:googleId,
                        refferalId:generatecode(),
                        phone:'08958093553'
                    });
                }

               
                return done(null, user);
            } catch (error) {
                console.error("Error during Google authentication:", error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = {
    googleAuth: passport.authenticate("google", { scope: ["profile", "email"] }),

    googleCallback: passport.authenticate("google", {
        failureRedirect: "/login",
      
    }),

    setupSession: (req, res, next) => {
 
        if (req.isAuthenticated()) {
         
            req.session.user_id = req.user._id;
        } 
        console.log(req.session.user_id);

        res.redirect("/");
    },
};