
const loginRoute = (waitersAppLogic, regexPattern) => {
    const homeRoute = (req, res) => {
        res.render("index", {
            errorMessage: req.flash("error")[0]
        });
    };

    const sendLogin = async (req, res) => {
        const { emailOrName, password } = req.body;

        if (emailOrName && regexPattern(emailOrName)) {
            const details = {
                emailOrName,
                password
            };

            const adminOrWaiter = await waitersAppLogic.insertWaiter(details);
            await waitersAppLogic.setWaiterId(details.emailOrName);

            // when the waiter is found redirect to the waiters page
            if (adminOrWaiter === "waiter") res.redirect(`/waiters/${emailOrName}`);
            // otherwise, redirect to the admins page
            else res.redirect("/days");

        } else {
            req.flash("error", "Invalid waiter name. Please enter name. abcdeABCDE.");
            res.redirect("/");
        };
        
    };

    return {
        homeRoute,
        sendLogin
    };
};

export default loginRoute;