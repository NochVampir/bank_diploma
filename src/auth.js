const passport = require('passport');
const {User} = require("./entities/account")
const passportJWT = require("passport-jwt");
const {compare} = require("bcrypt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
    usernameField: "nickname",
    passwordField: "password"
}, async (login, password, cb) => {
    try{
        const user = await User.findOne({
            where: {
                nickname: login
            }

        })

        const isValidPass = await compare(password, user.password);

        if(!user || !isValidPass) return cb(null, false, {message: "incorrect login or password"})

        return cb(null, user, {message: "success"})
    }catch (e) {
        return cb(e)
    }
}))

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey : 'secret'
    },
    function (jwtPayload, cb) {

        //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
        return User.findOne({
            where: {
                id: jwtPayload.id
            }
        })
            .then(user => {
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
))