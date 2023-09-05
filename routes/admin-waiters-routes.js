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
        };

        const checkedCheckbox = async () => {
            const waiters = await waitersAppLogic.availabilityData();
            const dailyWaiters = await waitersAppLogic.availableWaiters();

            for (let i = 0; i < waiters.length; i++) {
                const shift = waiters[i].waiter_shift;
                for (let j = 0; j < dailyWaiters.length; j++) {
                    const dailyShift = dailyWaiters[j].day;
                    if (shift === dailyShift) return "checked";
                };
            };
            return "not checked";
        };

        res.render("waiters", {
            waiterName: lowerLetterName,
            checkbox: await checkedCheckbox(),
        });
    };

    const selectWorkDayRoute = async (req, res) => {
        const { weekDay } = req.body;
        const { username } = req.params;
        if (weekDay) await waitersAppLogic.selectShift(weekDay);
        res.redirect(`/waiters/${username}`);
    };

    const daysRoute = async (req, res) => {
        const dailyWaiters = await waitersAppLogic.availableWaiters();
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

        dailyWaiters.forEach(waiter_ => {
            const selectedDay = waiter_.day;
            availableWaiters.forEach(waiter => {
                waiter.day === selectedDay ? waiter.waiters.push(waiter_.waiter_name) : null;
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
