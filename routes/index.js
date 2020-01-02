var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');
var request = require('request');

//GET Home/Login Page
router.get('/', function(req, res, next) {
  
  //Redirect if already logged in
  if(req.user)
  {
    res.redirect('/fridge');
  }
  res.render('index', { title: 'Fridge Recipes',user:req.user });
});

//POST Home/Login Page
router.post('/', function(req, res, next) {
  console.log(req.user);
  res.render('index', { title: 'Fridge Recipes',user:req.user });
});

//GET request to log in
//Redirect back to home - only provides functionality as a POST request
router.get("/log-in",
  function(req,res,next)
  {
    res.redirect('/');
  }
);

//POST request to manage log in
router.post("/log-in",userController.login_post);

//GET and POST requests to signup page
router.get("/sign-up",userController.sign_up_get);
router.post("/sign-up",userController.sign_up_post);

//Log User Out
router.get("/log-out", userController.logout_get);

//GET request to view user fridge
router.get("/fridge", function(req,res,next)
{
  //If user logged in display fridge, else redirect to log in
  if(req.user)
  {
  res.render('fridge',{title: 'Fridge', user:req.user});
  }
  else
  {
    res.redirect('/');
  }
});

//GET request to view form to update the fridge
router.get("/add-fridge", function(req,res,next)
{
  //If logged in render the page, else redirect to log in
  if(req.user)
  {
    res.render('edit-fridge',{title: 'Fridge', user:req.user})
  }
  else
  {
    res.redirect('/');
  }
});

//POST to update users fridge
router.post("/add-fridge", userController.fridge_view_post);

router.get("/recipes", function(req,res,next)
{
  //If logged in, display recipes. Else redirect to log in.
  if(req.user)
  {

  //Options for API call from recipe puppy
  const options = { 
    url: 'https://recipe-puppy.p.rapidapi.com/?i='+req.user.fridge.toString()+'&p='+((Math.random()*5)+1),
    method: 'GET',
    headers: {
        "x-rapidapi-host": "recipe-puppy.p.rapidapi.com",
	      "x-rapidapi-key": process.env.rcatKey
    }
  };

  //Make request to recipe puppy based on user's fridge
  request(options, function(err,res2,body)
  {
    if(err)
    {
      res.redirect("/recipes");
    }

    //Check if request is formatted in JSON
    if(/^[\],:{}\s]*$/.test(body.replace(/\\["\\\/bfnrtu]/g, '@').
      replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
      replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
    {
      //Parse the request to a JSON object
      var json=JSON.parse(body);
      
      //Make a second API call to get more recipes (20 in total)
      options.url=options.url+'&p='+((Math.random()*5)+6);
      request(options, function(err,res3,body2)
      {
         if(/^[\],:{}\s]*$/.test(body2.replace(/\\["\\\/bfnrtu]/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
          {
              json2=JSON.parse(body2);
          }
          else
          {
            res.redirect('/recipes');
          }
          res.render('recipes',{title:'Recipes',user:req.user,recipes1:json,recipes2:json2});
      });
    }
    else
    {
      //Adding chicken to the fridge

      //Certain combinations of ingredients will cause errors in the recipe puppy API for unknown reasons
      //Adding chicken is a workaround to this, as the new ingredient combination has been tested to always be valid
      options.url='https://recipe-puppy.p.rapidapi.com/?i='+req.user.fridge.toString()+',chicken';
      request(options, function(err,res3,body2)
      {
         if(/^[\],:{}\s]*$/.test(body2.replace(/\\["\\\/bfnrtu]/g, '@').
        replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
        replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
        {
          json=JSON.parse(body2);
          res.render('recipes',{title:'Recipes',user:req.user,recipes1:json});
        }
        else
        {
          res.redirect("/recipes");
        }
      });
    }
  });
  }
  else
  {
    res.redirect('/')
  }
});

//Nonexistent pages
router.get('*',
    function(req,res)
    {
        res.redirect('/fridge');
    }
);

module.exports = router;
