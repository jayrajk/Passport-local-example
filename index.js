
const express = require('express');
const app = express();
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect('mongodb://localhost:27017/MyDB');

const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String
});
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

app.get('/', (req, res) => res.sendFile('html/auth.html', { root : __dirname}));

app.get('/success', (req, res) => res.send("Welcome "+req.query.username+"!!"));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    User.findById(id, function(err, user) {
        cb(err, user);
    });
});

/* PASSPORT LOCAL AUTHENTICATION */

passport.use(new LocalStrategy(
    function(username, password, done) {
        UserDetails.findOne({
            username: username
        }, function(err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false);
            }

            if (user.password != password) {
                return done(null, false);
            }
            return done(null, user);
        });
    }
));

app.post('/',
    passport.authenticate('local', { failureRedirect: '/error' }),
    function(req, res) {
        res.redirect('/success?username='+req.user.username);
    });

const port = process.env.PORT || 4004;
app.listen(port , () => console.log('App listening on port ' + port));