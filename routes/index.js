var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController');
/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.user);
  res.render('index', { title: 'Fridge Recipes!',user:req.user });
});

router.post('/', function(req, res, next) {
  console.log(req.user);
  res.render('index', { title: 'Fridge Recipes!',user:req.user });
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
module.exports = router;
