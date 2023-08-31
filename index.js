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

    if (username !== ":username") {
        await WaitersApp.insertWaiter(username);
        await WaitersApp.setWaiterName(username);
    };

    res.render("waiters", {
        waiterName: username,
    });
});

app.post("/waiters/:username", async (req, res) => {
    const { weekDay } = req.body;
    if (weekDay) await WaitersApp.selectWorkDay(weekDay);

    res.redirect("/waiters/:username");
});

app.get("/days", async (req, res) => {
    const namesOfWaiters = [[], [], [], [], [], [], []];
    const selectedDaysByWaiters = await WaitersApp.waitersNameLst();

    selectedDaysByWaiters.forEach(waiterDetails => {
        if (waiterDetails.selected_day === "monday") namesOfWaiters[0].push(waiterDetails.waiters_name);
        else if (waiterDetails.selected_day === "tuesday") namesOfWaiters[1].push(waiterDetails.waiters_name);
        else if (waiterDetails.selected_day === "wednesday") namesOfWaiters[2].push(waiterDetails.waiters_name);
        else if (waiterDetails.selected_day === "thursday") namesOfWaiters[3].push(waiterDetails.waiters_name);
        else if (waiterDetails.selected_day === "friday") namesOfWaiters[4].push(waiterDetails.waiters_name);
        else if (waiterDetails.selected_day === "saturday") namesOfWaiters[5].push(waiterDetails.waiters_name);
        else namesOfWaiters[6].push(waiterDetails.waiters_name);
    });
    
    console.log(namesOfWaiters);
    
    res.render("admin", {
        waiterNames: namesOfWaiters,
    });
});

app.post("/reset", async (req, res) => {
    await WaitersApp.deleteWaiters();
    res.redirect("/days");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("app started at PORT:", PORT);
});