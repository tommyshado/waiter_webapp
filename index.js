import express from "express";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import "dotenv/config";

// services imports
import login from "./services/login.js";

// routes imports
import loginRoute from "./routes/loginRoute.js";

const app = express();

const databaseURL = process.env.DATABASE_URL;

const config = {
    connectionString: databaseURL
};

if (process.env.NODE_ENV === "production") {
    config.ssl = {
        rejectUnauthorized: false
    };
};

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

// services instances
const LoginService = login();

// routes imports
const LoginRoute = loginRoute();

// ROUTES:
app.get("/", (req, res) => {
    res.render("index", {
        loginPage: LoginService.showLoginPage(),
        waitersPage: LoginService.showWaitersPage(),
    });
});

app.post("/sendLoginDetails", (req, res) => {
    LoginService.setEmailOrName(req.body.emailOrName);
    res.redirect("/");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("app started at PORT:", PORT);
});