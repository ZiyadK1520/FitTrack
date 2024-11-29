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
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({
    storage: storage,
}) .single("image");

//insert a user into database route
router.post('/add', upload, async (req, res) => {
    try {

        //logs form data to make sure it is coming through
        console.log(req.body);
        console.log(req.file);

        
        const user = new User({
            Workout: req.body.Workout,
            Sets: parseInt(req.body.Sets),
            Reps: parseInt(req.body.Reps),
            Target: req.body.Target,
            'prog-pic': req.file ? req.file.filename: "",
        });

        // Save the user to the database
        await user.save();

        // On success, set the session message
        req.session.message = {
            type: 'success',
            message: 'Workout added successfully!',
        };
        res.redirect("/");
    } catch (err) {
        // Handle any errors
        res.json({ message: err.message, type: 'danger' });
    }
});



router.get("/",(req,res) => {
    res.render('index', {title:"Home Page"});
});

router.get("/add", (req,res) => {
    res.render("add_workout", {title:"Add Workout"});
})

module.exports = router;