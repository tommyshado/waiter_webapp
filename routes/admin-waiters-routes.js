const adminWaitersRoutes = waitersAppLogic => {

    const waitersRoute = async (req, res) => {
        const { username } = req.params;
        const lowerLetterName = username.toLowerCase();

        const validateWaiterName = name => {
            const regexPattern = /^[a-zA-Z]+$/;
            const regexPatternTest = regexPattern.test(name);
            return regexPatternTest ? regexPatternTest : req.flash("error", "Invalid waiter name. Please enter name. abcdeABCDE.");
        };

        if (username !== ":username" && validateWaiterName(username)) {
            await waitersAppLogic.insertWaiter(lowerLetterName);
            await waitersAppLogic.setWaiterId(lowerLetterName);
        };

        const isChecked = async () => {
            const dailyWaiters = await waitersAppLogic.availableWaiters();
            const shifts = await waitersAppLogic.shifts();

            for (let i = 0; i < dailyWaiters.length; i++) {
                const dailyShift = dailyWaiters[i].day;
                shifts.forEach(shift => {
                    dailyShift === shift.waiter_shift 
                    ? shift.isChecked = true 
                    :null;
                });
            };
            return shifts;
        };

        res.render("waiters", {
            waiterName: lowerLetterName,
            errorMessage: req.flash("error")[0],
            successMessage: req.flash("success")[0],
            checked: await isChecked(),
        });
    };

    const selectWorkDayRoute = async (req, res) => {
        const { weekDay } = req.body;
        const { username } = req.params;
        if (weekDay) {
            await waitersAppLogic.selectShift(weekDay);
            req.flash("success", "successfully selected available days.");
        };
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

                if (waiter.waiters.length > 3) {
                    waiter.className = "warning";
                } else if (waiter.waiters.length === 3) {
                    waiter.className = "success";
                } else {
                    waiter.className = "danger";
                };
            });
        });

        res.render("admin", {
            waiterNames: availableWaiters,
            successMessage: req.flash("success")[0],
        });
    };

    const resetRoute = async (req, res) => {
        await waitersAppLogic.deleteWaiters();
        req.flash("success", "successfully reseted the roster.");
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
