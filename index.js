import express from "express";
import exphbs from "express-handlebars";
import bodyParser from "body-parser";
import "dotenv/config";
import pgPromise from "pg-promise";

// services imports
import waitersApp from "./services/waiter-app.js";

// routes imports
import adminWaitersRoutes from "./routes/admin-waiters-routes.js";
import loginRoute from "./routes/login.js";

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

// routes instances
const adminWaiterRoutesIns = adminWaitersRoutes(WaitersApp);
const login = loginRoute();

// ROUTES:

app.get("/", login.homeRoute);

app.get("/waiters/:username", adminWaiterRoutesIns.waitersRoute);

app.post("/waiters/:username", adminWaiterRoutesIns.selectWorkDayRoute);

app.get("/days", adminWaiterRoutesIns.daysRoute);

app.post("/reset", adminWaiterRoutesIns.resetRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("app started at PORT:", PORT);
});