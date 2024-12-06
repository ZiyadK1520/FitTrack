//imports
require('dotenv').config({ path: './backend/.env'});
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path'); //imports path module, without this we cannot locate views file
const passport = require('passport');
const flash = require('connect-flash');

const app = express();
const PORT = process.env.PORT || 4000;

//database connection

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to the database!"));

//middlewares
app.use(express.urlencoded({extended: false}));

app.use(session({
    secret: 'Mali',
    saveUninitialized: true,
    resave: false,
})
);

//Serve static files form the assets folder
app.use('/Assets', express.static(path.join(__dirname, 'Assets')));

app.use((req,res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();

})

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
res.locals.error_msg = req.flash('error_msg');
res.locals.error = req.flash('error');
next();
});

app.use(express.static("uploads"));

//set the location of the views file
app.set("views", path.join(__dirname, "../frontend", "views"));

//set template engine
app.set("view engine","ejs");

app.use(express.json());

// route prefix
app.use("", require("../backend/routes/routes"));

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
})
