import express from "express";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import "dotenv/config";
import pgPromise from "pg-promise";
import flash from "express-flash";
import session from "express-session";

// bcrypt.js import
import bcrypt from "bcrypt";

// services imports
import waitersApp from "./services/waiterApp.js";
import WaiterRegistration from "./services/waiterRegistration.js";

// routes imports
import adminWaitersRoutes from "./routes/adminWaiterRoutes.js";
import loginRoute from "./routes/login.js";
import RegisterWaiterRoute from "./routes/registerWaiterRoute.js";
import logoutRoute from "./routes/logoutRoute.js";

// regex pattern module import
import regexPatternTest from "./regexPattern.js";

// generate password service
import generatePassword from "./routes/generatePasswordRoute.js";

// route for generate password
import generateNewPassword from "./services/generatePassword.js";

const app = express();
const pgp = pgPromise();

// initialise session middleware - flash-express depends on it
app.use(session({
    secret: "codeXer",
    resave: false,
    saveUninitialized: true
}));

// initialise the flash middleware
app.use(flash());

const databaseURL = process.env.DATABASE_URL;

const config = {
    connectionString: databaseURL
};

if (process.env.NODE_ENV === "production") {
    config.ssl = {
        rejectUnauthorized: false
    };
};

app.use(express.static("public"));

const handlebarSetup = exphbs.engine({
    partialsDir: "./views/partials",
    viewPath: "./views",
    layoutsDir: "./views/layouts",
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.engine("handlebars", handlebarSetup);
app.set("view engine", "handlebars");
app.set("views", "./views");

const db = pgp(config);

// services instances
const WaitersApp = waitersApp(db);
const WaiterRosterRegistration = WaiterRegistration(db);
const GeneratePassword = generateNewPassword(db, bcrypt);

// routes instances
const adminWaiterRoutesIns = adminWaitersRoutes(WaitersApp, WaiterRosterRegistration, regexPatternTest);
const login = loginRoute(WaiterRosterRegistration, WaitersApp, regexPatternTest, bcrypt);
const rosterRegister = RegisterWaiterRoute(WaiterRosterRegistration, regexPatternTest, bcrypt);
const passwordRoute = generatePassword(GeneratePassword, bcrypt);
const LogoutRoute = logoutRoute();

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    };
    res.redirect('/');
};

// ROUTES:

app.get("/", login.homeRoute);

// create a get route for the registration of waiters in the roster
app.get("/signUp", rosterRegister.signUp);

// create a post route for the registration of waiters in the roster
app.post("/registerwaiter", rosterRegister.registerWiater);

// route for generating password
app.get("/generatePassword", passwordRoute.passwordRoute);
app.post("/updatePassword", passwordRoute.updatePassword);

app.post("/sendLoginDetails", login.sendLogin);

app.get("/waiters/:username", isAuthenticated, adminWaiterRoutesIns.waitersRoute);

app.post("/waiters/:username", adminWaiterRoutesIns.selectWorkDayRoute);

app.get("/days", isAuthenticated, adminWaiterRoutesIns.daysRoute);

app.post("/days/:waiterId/:day", adminWaiterRoutesIns.waiterRoute);

app.post("/reset", adminWaiterRoutesIns.resetRoute);

app.post("/logout", LogoutRoute.logout);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("app started at PORT:", PORT);
});