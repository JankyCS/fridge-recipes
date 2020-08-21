var User = require ('../models/user');
var async = require('async');
var passport = require('passport');
var session = require("express-session")
const LocalStrategy = require("passport-local").Strategy;;
const validator = require('express-validator');
const bcrypt = require('bcryptjs')
var flash = require('connect-flash');

//Facilitate user login with PassportJS
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) { 
        return done(err);
      };
       //Wrong Username
      if (!user) {
        return done(null, false, { msg: "Incorrect username" });
      }
      //Compare login password with PW stored in database, taking encryption into account
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

//Keep user logged in with cookies
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


//Validation and sanitization for user registration
const validateSanitizeSignUp =
[
    validator.body('firstName').trim().isLength({min:1}).withMessage('Must Specify A First Name')
    .isAlpha().withMessage('No numbers or symbols allowed in first name.'),
    validator.body('lastName').optional({ checkFalsy: true }).trim().isAlpha().withMessage('No numbers or symbols allowed in first name.'),
    
    //Username cannot already be in use
    validator.body('username').trim().isLength({min:4}).withMessage("Username must be at least 4 characters long")
    .custom((value, {req}) => {
            return new Promise((resolve, reject) => {
              User.findOne({username:req.body.username}, function(err, user){
                if(err) {
                  reject(new Error('Server Error'))
                }
                if(Boolean(user)) {
                  reject(new Error('Username already in use'))
                }
                resolve(true)
              });
            });
    }),
    
    //Password must be at least 6 chars, and confirmPass must match
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

//Display signup form if not yet logged in.
module.exports.sign_up_get=function(req,res,next)
{
    if(req.user)
    {
        res.redirect('/');
    }
    res.render("sign-up-form");
}

//POST request to facilitate user registration 
module.exports.sign_up_post =[
    
    validateSanitizeSignUp,
    
    function(req,res,next)
        {
        const errors = validator.validationResult(req);

        //Redisplay signup form if errors
        if (!errors.isEmpty()) {
            res.render('sign-up-form', { first_name: req.body.firstName, last_name: req.body.lastName, user_name:req.body.username, errors: errors.array() });
            return;
        }

        //Encrypt the password before storing new user in database
        bcrypt.hash(req.body.password,10,function(err,hashedPassword)
        {
            if(err)
            {
                return next(err);
            }

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

//Success/failure in logins
module.exports.login_post =
    passport.authenticate("local", {
    successRedirect: "/fridge",
    failureRedirect: "/login",  
  });

//Log out use
module.exports.logout_get=function(req,res)
{
    req.logout();
    res.redirect("/");
};

//Render form to edit the fridge
module.exports.fridge_add_get=function(req,res)
{
   res.render("edit-fridge",{user:req.user});
};

//Update the contents of fridge to user if logged in
module.exports.fridge_view_post=function(req,res,next)
{
    if(!req.user)
    {
        res.redirect('/');
    }

    //String manipulation to make the user's input valid json format
    var strFood = req.body.food.replace(/\s/g,'');
    strFood=strFood.toLowerCase();
    strFood=strFood.replace(/[^,a-z]/gi, '');
    strFood=strFood.replace(/^,|,$|(,)+/g, '$1');
    strFood = strFood.replace(/^[\,]+|[\,]+$/g, "");
   
    //Update the user
    var newFridge = strFood.split(',');
    var newUser =
    {
        firstname: req.user.firstname,
        lastname: req.user.lastname,
        username: req.user.username,
        password: req.user.password,
        fridge: newFridge
    }
    User.findByIdAndUpdate(req.user._id, newUser,{},function (err,thebook) {
        if (err) { return next(err); }
            res.redirect('/fridge');
        });
}

