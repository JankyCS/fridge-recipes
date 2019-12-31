var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');
var request = require('request');
require('dotenv').config();
/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  if(req.user)
  {
    res.redirect('/fridge');
  }
  res.render('index', { title: 'Fridge Recipes',user:req.user });
});

router.post('/', function(req, res, next) {
  console.log(req.user);
  res.render('index', { title: 'Fridge Recipes',user:req.user });
});

router.get("/log-in",
  function(req,res,next)
  {
    res.redirect('/');
  }

);
router.post("/log-in",userController.login_post);
router.get("/sign-up",userController.sign_up_get);
router.post("/sign-up",userController.sign_up_post);
router.get("/log-out", userController.logout_get);

router.get("/fridge", function(req,res,next)
{
  if(req.user)
  {
  res.render('fridge',{title: 'Fridge', user:req.user});
  }
  else
  {
    res.redirect('/');
  }
});

router.get("/add-fridge", function(req,res,next)
{
  if(req.user)
  {
    res.render('edit-fridge',{title: 'Fridge', user:req.user})
  }
  else
  {
    res.redirect('/');
  }
});

router.post("/add-fridge", 
  
    userController.fridge_view_post
  

);

router.get("/recipes", function(req,res,next)
{
  //console.log(req.user.fridge.toString());
  if(req.user)
  {

  const options = { 
    url: 'https://recipe-puppy.p.rapidapi.com/?i='+req.user.fridge.toString()+'&p='+((Math.random()*5)+1),
    method: 'GET',
    headers: {
        "x-rapidapi-host": "recipe-puppy.p.rapidapi.com",
	      "x-rapidapi-key": process.env.rcatKey
    }
  };

  request(options, function(err,res2,body)
  {
    if(err)
    {
      
    }
  
    if(body[0]!=='<')
    {
        var json=JSON.parse(body);
      console.log("wrong");
     
     // console.log(json);
     options.url=options.url+'&p='+((Math.random()*5)+6);
       request(options, function(err,res3,body2)
      {
        console.log('request2')
        json2=JSON.parse(body2);
        //var final =json.concat(json2);
       // console.log(json);
        res.render('recipes',{title:'Recipes',user:req.user,recipes1:json,recipes2:json2});
      });
    //  res.render('recipes',{title:'Recipes',user:req.user,recipes:json})
    }
    else
    {
      console.log("adding chicken");
      options.url='https://recipe-puppy.p.rapidapi.com/?i='+req.user.fridge.toString()+',chicken';
      request(options, function(err,res3,body2)
      {
        console.log('request2')
        json=JSON.parse(body2);
       // console.log(json);
        res.render('recipes',{title:'Recipes',user:req.user,recipes1:json});
      });
    }
  });
  }
  else
  {
    res.redirect('/')
  }
});

router.get('*',
    function(req,res)
    {
        res.redirect('/fridge');
    }
);
module.exports = router;
