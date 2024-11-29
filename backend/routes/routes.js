const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');

//image upload
var storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, './backend/uploads')
    },
    filename: function(req,file,cb) {
        cb(null, file.fieldname + " " + Date.now() + " " + file.originalname);
    },
})

var upload = multer({
    storage: storage,
}) .single("image");

//insert a user into database route
router.post('/add', upload, (req,res) => {
    const workout = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    user.save((err) => {
        if(err){
            res.json({message: err.message, type: 'danger'});
        } else {
            req.session.message = {
                type: 'success',
                message: 'Workout added succesfully!'
            };
            res.redirect("/")
        }
    })
})

router.get("/",(req,res) => {
    res.render('index', {title:"Home Page"});
});

router.get("/add", (req,res) => {
    res.render("add_workout", {title:"Add Workout"});
})

module.exports = router;