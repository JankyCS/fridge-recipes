var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');
var request = require('request');
/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  res.render('index', { title: 'Fridge Recipes',user:req.user });
});

router.post('/', function(req, res, next) {
  console.log(req.user);
  res.render('index', { title: 'Fridge Recipes',user:req.user });
});

router.post("/log-in",userController.login_post);
router.get("/sign-up",userController.sign_up_get);
router.post("/sign-up",userController.sign_up_post);
router.get("/log-out", userController.logout_get);
router.get("/fridge", function(req,res,next)
{
  res.render('fridge',{title: 'Fridge', user:req.user})
});

router.get("/add-fridge", function(req,res,next)
{
  res.render('edit-fridge',{title: 'Fridge', user:req.user})
});

router.post("/add-fridge", userController.fridge_view_post);

router.get("/recipes", function(req,res,next)
{
  //console.log(req.user.fridge.toString());
  if(req.user)
  {

  const options = { 
    url: 'https://recipe-puppy.p.rapidapi.com/?i='+req.user.fridge.toString(),
    method: 'GET',
    headers: {
        "x-rapidapi-host": "recipe-puppy.p.rapidapi.com",
	      "x-rapidapi-key": "a5016f829dmsh6c6784b70f382b5p1b8d94jsn10dea62d3ced"
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
      res.render('recipes',{title:'Recipes',user:req.user,recipes:json})
    }
    else
    {
      console.log("adding chicken");
      options.url='https://recipe-puppy.p.rapidapi.com/?i='+req.user.fridge.toString()+',salt';
      request(options, function(err,res3,body2)
      {
        console.log('request2')
        json=JSON.parse(body2);
       // console.log(json);
        res.render('recipes',{title:'Recipes',user:req.user,recipes:json});
      });
    }
  });
  }
  else
  {
    res.redirect('/')
  }

  

});
module.exports = router;
