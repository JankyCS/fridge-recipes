var User = require ('../models/user');
var async = require('async');
var passport = require('passport');
var session = require("express-session")
const LocalStrategy = require("passport-local").Strategy;;
const validator = require('express-validator');
const bcrypt = require('bcryptjs')
var flash = require('connect-flash');


passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      };
      if (!user) {
          console.log("wrong username");

        return done(null, false, { msg: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
            // passwords match! log user in
            console.log("yep");
            return done(null, user)
        } else {
            // passwords do not match!
            console.log("wrong");
            return done(null, false, {msg: "Incorrect password"})
        }
        });
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

const validateSanitizeSignUp =
[
    validator.body('firstName').trim().isLength({min:1}).withMessage('Must Specify A First Name')
    .isAlpha().withMessage('No numbers or symbols allowed in first name.'),
    validator.body('lastName').optional({ checkFalsy: true }).trim().isAlpha().withMessage('No numbers or symbols allowed in first name.'),
    validator.body('username').trim().isLength({min:4}).withMessage("Username must be at least 4 characters long")
    .custom(function(value, {req})
    {   
        var t=true;
        console.log("here1");
        User.findOne({username: value},function(err,match)
        {
            console.log(!match);
            t = !match;
        });
        return t;
        
    }),
    
    validator.body('password', 'Password must be 6 or more characters').isLength({	min: 6 }),
    validator.body('confirmPass', 'Passwords do not match, try again').custom(function(value, {req})
    {  
        if( value===req.body.password)
        {
            return true;
        }
        else
        {
            throw new Error("Passwords Do Not Match!");
        }
       
    }),
    validator.sanitizeBody(['username', 'firstName', 'lastName', 'password', 'confirmPass']).escape()
]


module.exports.sign_up_get=function(req,res,next)
{
    res.render("sign-up-form");
}

module.exports.sign_up_post =[
    
    validateSanitizeSignUp,
    
    function(req,res,next)
    {
    const errors = validator.validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        // There are errors. Render form again with sanitized values/errors messages.
        res.render('sign-up-form', { first_name: req.body.firstName, last_name: req.body.lastName, user_name:req.body.username, errors: errors.array() });
        return;
    }
    bcrypt.hash(req.body.password,10,function(err,hashedPassword)
    {
        if(err)
        {
            return next(err);
        }

        console.log(hashedPassword);
        var user = new User({
        firstname: req.body.firstName,
        lastname: req.body.lastName,
        username: req.body.username,
        password: hashedPassword,
        fridge: []
        });

        user.save(function(err)
        {
            if (err) { 
                console.log(err);
            return next(err);
            };
            res.redirect("/");
        });
    });

 
    }]

module.exports.login_post =
    passport.authenticate("local", {
    successRedirect: "/fridge",
    failureRedirect: "/",
    
  });

module.exports.logout_get=function(req,res)
{
    req.logout();
    res.redirect("/");
};

module.exports.fridge_add_get=function(req,res)
{
   res.render("edit-fridge",{user:req.user});
};

module.exports.fridge_view_post=function(req,res,next)
{
    if(!req.user)
    {
        res.redirect('/');
    }
    console.log("reach");
    var strFood = req.body.food.replace(/\s/g,'');
    strFood=strFood.toLowerCase();
    strFood=strFood.replace(/[^,a-z]/gi, '');
    strFood=strFood.replace(/^,|,$|(,)+/g, '$1');
    strFood = strFood.replace(/^[\,]+|[\,]+$/g, "");
   // var newFridge = new Array(strFood);
    var newFridge = strFood.split(',');
    console.log(newFridge);
    console.log(req.user);
    var newUser =
    {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        username: req.user.username,
        password: req.user.password,
        fridge: newFridge
    }

    console.log("2");
    User.findByIdAndUpdate(req.user._id, newUser,{},function (err,thebook) {
                if (err) { return next(err); }
                   res.redirect('/fridge');
                });
}

