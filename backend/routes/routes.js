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
            Weight: parseInt(req.body.Weight),
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

//route to display the db data on index, this may change to a different page later
router.get("/", async (req, res) => {
    try {
        // Use async/await to fetch users from the database
        const users = await User.find();

        // Render the users on the page
        res.render("index", {
            title: "Home Page",
            users: users,
        });
    } catch (err) {
        // Handle errors and send the message back to the client
        res.json({ message: err.message });
    }
});

//Route to display the main page, may change later
router.get("/",(req,res) => {
    res.render('index', {title:"Home Page"});
});

router.get("/add", (req,res) => {
    res.render("add_workout", {title:"Add Workout"});
})

// Edit workout route
router.get('/edit/:id', async (req, res) => {
    try {
        let id = req.params.id; // fix: remove the unnecessary '-'
        const user = await User.findById(id);

        if (!user) {
            // If no user is found, redirect to home
            return res.redirect('/');
        }

        res.render("edit", {
            title: "Edit Workout",
            user: user,
        });
    } catch (err) {
        // If an error occurs, redirect to home
        console.error(err);
        res.redirect('/');
    }
});


// Update user route
router.post('/update/:id', upload, async (req, res) => {
    let id = req.params.id; // Get the id from the route parameter

    try {
        // Update the user in the database
        const result = await User.findByIdAndUpdate(id, {
            Workout: req.body.Workout,
            Sets: parseInt(req.body.Sets),
            Reps: parseInt(req.body.Reps),
            Target: req.body.Target,
            Weight: parseInt(req.body.Weight),
        });

        // If the update is successful, set a success message in the session
        req.session.message = {
            type: "success",
            message: "Workout updated!",
        };
        res.redirect("/"); // Redirect to the home page or a different page
    } catch (err) {
        res.json({ message: err.message, type: 'danger' }); // If there's an error
    }
});


// Delete workout route
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;

    try {
        // Use async/await with findByIdAndDelete
        const result = await User.findByIdAndDelete(id);

        if (!result) {
            return res.json({ message: 'No workout found with that ID' }); // Handle case where no workout is found
        }

        req.session.message = {
            type: 'info',
            message: 'Workout deleted',
        };
        res.redirect("/"); // Redirect to the home page
    } catch (err) {
        res.json({ message: err.message }); // If there's an error
    }
});




module.exports = router;