const adminWaitersRoutes = waitersAppLogic => {

    const waitersRoute = async (req, res) => {
        const { username } = req.params;
    
        if (username !== ":username") {
            await waitersAppLogic.insertWaiter(username);
            await waitersAppLogic.setWaiterName(username);
        };
    
        res.render("waiters", {
            waiterName: username,
        });
    };

    const selectWorkDayRoute = async (req, res) => {
        const { weekDay } = req.body;
        const {username} = req.params;
        if (weekDay) await waitersAppLogic.selectWorkDay(weekDay);
        res.redirect(`/waiters/${username}`);
    };

    const daysRoute = async (req, res) => {
        const namesOfWaiters = [[], [], [], [], [], [], []];
        const selectedDaysByWaiters = await waitersAppLogic.waitersNameLst();
    
        const dayIndexMapping = {
            "monday": 0,
            "tuesday": 1,
            "wednesday": 2,
            "thursday": 3,
            "friday": 4,
            "saturday": 5,
            "sunday": 6
        };
    
        selectedDaysByWaiters.forEach(waiterDetails => {
            const selectedDay = waiterDetails.selected_day;
            const storeDayIndex = dayIndexMapping[selectedDay];
            namesOfWaiters[storeDayIndex].push(waiterDetails.waiters_name);
        });
    
        res.render("admin", {
            waiterNames: namesOfWaiters,
        });
    };

    const resetRoute = async (req, res) => {
        await waitersAppLogic.deleteWaiters();
        res.redirect("/days");
    }

    return {
        waitersRoute,
        selectWorkDayRoute,
        daysRoute,
        resetRoute
    };
};


export default adminWaitersRoutes;