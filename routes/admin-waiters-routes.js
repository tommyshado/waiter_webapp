const adminWaitersRoutes = waitersAppLogic => {
    const waitersRoute = async (req, res) => {
        const { username } = req.params;
        const lowerLetterName = username.toLowerCase();

        const validateWaiterName = name => {
            const regexPattern = /^[a-zA-Z]+$/;
            const regexPatternTest = regexPattern.test(name);
            return regexPatternTest ? regexPatternTest : false; // req.flash("error", "Invalid waiter name. Please enter abcdeABCDE.");
        };

        if (username !== ":username" && validateWaiterName(username)) {
            await waitersAppLogic.insertWaiter(lowerLetterName);
            await waitersAppLogic.setWaiterId(lowerLetterName);
        }

        res.render("waiters", {
            waiterName: lowerLetterName,
        });
    };

    const selectWorkDayRoute = async (req, res) => {
        const { weekDay } = req.body;
        const { username } = req.params;
        if (weekDay) await waitersAppLogic.selectShift(weekDay);
        res.redirect(`/waiters/${username}`);
    };

    const daysRoute = async (req, res) => {
        const selectedDaysByWaiters = await waitersAppLogic.availableWaiters();
        const availableWaiters = [
            {
                day: "monday",
                waiters: [],
            },
            {
                day: "tuesday",
                waiters: [],
            },
            {
                day: "wednesday",
                waiters: [],
            },
            {
                day: "thursday",
                waiters: [],
            },
            {
                day: "friday",
                waiters: [],
            },
            {
                day: "saturday",
                waiters: [],
            },
            {
                day: "sunday",
                waiters: [],
            },
        ];

        selectedDaysByWaiters.forEach(waiterDetails => {
            const selectedDay = waiterDetails.selected_day;
            availableWaiters.forEach(waiter => {
                waiter.day === selectedDay ? waiter.waiters.push(waiterDetails.waiters_name) : null;
            });
        });

        res.render("admin", {
            waiterNames: availableWaiters,
        });
    };

    const resetRoute = async (req, res) => {
        await waitersAppLogic.deleteWaiters();
        res.redirect("/days");
    };

    return {
        waitersRoute,
        selectWorkDayRoute,
        daysRoute,
        resetRoute,
    };
};

export default adminWaitersRoutes;
