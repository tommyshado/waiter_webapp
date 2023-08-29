import express from "express";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import "dotenv/config";
import pgPromise from "pg-promise";
import waitersApp from "./services/waiter-app.js";

// services imports

// routes imports

const app = express();
const pgp = pgPromise();

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

const db = pgp(config);
// services instances
const WaitersApp = waitersApp(db);

// routes imports

// ROUTES:

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/waiters/:username", async (req, res) => {
    const { username } = req.params;
    await WaitersApp.insertWaiter(username);
    await WaitersApp.getInsertedWaiter(username);

    res.render("waiters", {
        waiterName: WaitersApp.getUsername(username)
    });
});

app.post("/waiters/:username", (req, res) => {
    const { weekDay } = req.body;
    if (weekDay) WaitersApp.selectWorkDay(weekDay);
    res.redirect("/waiters/:username");
});

app.get("/days", (req, res) => {
    res.render("admin");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("app started at PORT:", PORT);
});