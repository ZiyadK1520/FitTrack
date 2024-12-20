const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const bcrypt = require('bcrypt')
const passport = require('passport');
const Workout = require("../models/workouts");
const { ensureAuthenticated } = require("../auth");

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) return done(null, false, { message: 'Email not registered' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return done(null, false, { message: 'Invalid password' });

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);  // Using await here
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (err) {
        return done(err);
    }
});

// Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './backend/uploads'),
    filename: (req, file, cb) => cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
});
const upload = multer({ storage }).single("image");

// Routes
router.get('/signup', (req, res) => res.render('signup', { title: 'Sign Up' }));

router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Email already in use');
            return res.redirect('/signup');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        req.flash('success', 'Registration successful');
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error during registration');
        res.redirect('/signup');
    }
});

router.get('/login', (req, res) => res.render('login', { title: 'Login Page', messages: req.flash() }));

router.get('/about', (req, res) => res.render('about', { title: 'About Page', messages: req.flash() }));


router.post('/login', passport.authenticate('local', {
    successRedirect: '/user_dashboard',
    failureRedirect: '/login',
    failureFlash: true,
}));

// Example route to render the dashboard
router.get('/user_dashboard', async (req, res) => {
    try {
        // Fetch users or workouts as needed
        const users = await Workout.find({ userId: req.user._id }); // Fetch workouts associated with the logged-in user
        
        // Set the title for the page
        const title = "User Dashboard"; // or whatever dynamic title you want

        res.render('user_dashboard', { users, title, message: req.session.message }); // Pass title to the view
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) console.error(err);
        res.redirect('/login');
    });
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

const authenticateUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        console.log("User authenticated");
        return next();  // User is authenticated, proceed with the next middleware/route
    } else {
        console.log("User not authenticated, redirecting...");
        res.redirect('/login');  // Redirect to login if the user is not authenticated
    }
};
//insert a user into database route
router.post('/add', authenticateUser, async (req, res) => {
    console.log("Inside /add route!");  // Check if this log appears
    try {
        // Logs form data to make sure it is coming through
        console.log("POST request received!"); // Check if the route is being hit
        console.log("req.body")
        console.log(req.body);
        console.log("req.file");
        console.log(req.file);

        // Create a new workout associated with the current user
        const workout = new Workout({
            userId: req.user._id, // Store the logged-in user's ID
            Workout: req.body.Workout,
            Sets: parseInt(req.body.Sets),
            Reps: parseInt(req.body.Reps),
            Target: req.body.Target,
            Weight: parseInt(req.body.Weight),
        });

        // Save the workout to the database
        await workout.save();

        // On success, set the session message
        req.session.message = {
            type: 'success',
            message: 'Workout added successfully!',
        };
        res.redirect("/user_dashboard");
    } catch (err) {
        // Handle any errors
        res.json({ message: err.message, type: 'danger' });
    }
});

router.get("/add", (req,res) => {
    res.render("add_workout", {title:"Add Workout"});
})

// Edit workout route
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    try {
        const workout = await Workout.findOne({ _id: req.params.id, userId: req.user._id });
        if (!workout) {
            req.flash('error', 'Workout not found or unauthorized access');
            return res.redirect('/user_dashboard');
        }
        res.render('edit', { title: 'Edit Workout', workout });
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred');
        res.redirect('/user_dashboard');
    }
});



// Update workout route
router.post('/update/:id', ensureAuthenticated, async (req, res) => {
    try {
        const updatedWorkout = await Workout.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            {
                Workout: req.body.Workout,
                Sets: parseInt(req.body.Sets),
                Reps: parseInt(req.body.Reps),
                Target: req.body.Target,
                Weight: parseInt(req.body.Weight),
            },
            { new: true }
        );

        if (!updatedWorkout) {
            req.flash('error', 'Workout not found or unauthorized access');
            return res.redirect('/user_dashboard');
        }

        req.flash('success', 'Workout updated successfully!');
        res.redirect('/user_dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred while updating the workout');
        res.redirect('/user_dashboard');
    }
});



// Delete workout route
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;

    try {
        const result = await Workout.findByIdAndDelete(id); // Delete the workout by ID

        if (!result) {
            req.flash('error', 'No workout found with that ID');
            return res.redirect('/user_dashboard');
        }

        req.flash('success', 'Workout deleted successfully');
        res.redirect('/user_dashboard'); // Redirect to dashboard
    } catch (err) {
        console.error(err);
        req.flash('error', 'Error deleting workout');
        res.redirect('/user_dashboard');
    }
});


//javascript for button function
function goHome() {
    window.location.href = '/';
}

router.post("/workouts", ensureAuthenticated, async (req,res) => {
    const { Workout, Sets, Reps, Target, Weight } = req.body;
    try { 
        
        const newWorkout = new Workout({
            userId: req.user._id,
            Workout,
            Sets: parseInt(Sets),
            Reps: parseInt(Reps),
            Target,
            Weight: parseInt(Weight),
        });
        await newWorkout.save();
        req.flash("success", "Workout added successfully!");
        res.redirect("/user_dashboard");
    } catch (error) {
        // res.status(500).send("Error saving workout.");
        console.error(error);
        req.flash("error", "Failed to save workout. Please try again.");
        res.redirect("/user_dashboard");
    }
});


module.exports = router;