const adminWaitersRoutes = waitersAppLogic => {

    const waitersRoute = async (req, res) => {
        const { username } = req.params;
        const emailOrName = username.toLowerCase();

        const validateWaiterName = name => {
            const regexPattern = /^[a-zA-Z]+$/;
            const regexPatternTest = regexPattern.test(name);
            return regexPatternTest ? regexPatternTest : req.flash("error", "Invalid waiter name. Please enter name. abcdeABCDE.");
        };

        if (username !== ":username" && validateWaiterName(emailOrName)) {
            await waitersAppLogic.insertWaiter({emailOrName});
            await waitersAppLogic.setWaiterId(emailOrName);
        };
        
        const isChecked = async () => {
            const shifts = await waitersAppLogic.weekDays(); 
            const waiterShifts = await waitersAppLogic.shifts();

            for (let i = 0; i < shifts.length; i++) {
                const dailyShift = shifts[i];
                const dayShift = dailyShift.day;
                waiterShifts.forEach(shift => {
                    dayShift === shift.waiter_shift 
                    ? dailyShift.isChecked = true
                    :null;
                });

                if (!dailyShift.isChecked) {
                    dailyShift.isChecked = false;
                };
            };
            return shifts;
        };

        res.render("waiters", {
            waiterName: emailOrName,
            errorMessage: req.flash("error")[0],
            successMessage: req.flash("success")[0],
            shift: await isChecked(),
        });
    };

    const selectWorkDayRoute = async (req, res) => {
        const { weekDay } = req.body;
        const { username } = req.params;
        const shifts = await waitersAppLogic.selectShift(weekDay);
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

        for (const day of days) {
            if (!weekDay.includes(day)) await waitersAppLogic.updateSelectedDay(day);
        };

        if (weekDay) {
            shifts ? shifts 
            : shifts === null 
            ? req.flash("error", "Select at least 3 days")
            : shifts === false 
            ? req.flash("error", "Select 5 days to work in a week")
            : req.flash("success", "successfully selected available days.");

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
                if (waiter.day === selectedDay) {
                    waiter.waiters.push({ 
                        name: waiter_.waiter_name,
                        id: waiter_.waiter_id,
                        day: waiter.day,
                    });
                };

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

    const waiterRoute = async (req, res) => {
        const { waiterId, day } = req.params;
        await waitersAppLogic.deleteWaiter(waiterId, day);
        req.flash("success", `successfully removed waiter.`);
        res.redirect("/days");
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
        waiterRoute,
        resetRoute,
    };
};

export default adminWaitersRoutes;
