import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local"
import {Strategy as JWTStrategy} from "passport-jwt"
import {ExtractJwt} from "passport-jwt";
import {User} from "./entities/account.mjs";
import {compare} from "bcrypt";

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
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey : 'secret'
    },
    function (jwtPayload, cb) {

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
