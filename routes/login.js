const loginRoute = (signUpLogic, waitersAppLogic, regexPattern, bcrypt) => {
    const homeRoute = (req, res) => {
        res.render("index");
    };

    const sendLogin = async (req, res) => {
        const { emailOrName, password } = req.body;

        if (emailOrName && regexPattern(emailOrName)) {
            const details = {
                emailOrName,
                password,
            };

            const hashPassword = await signUpLogic.retrieveHash(details.emailOrName);

            if (hashPassword) {
                // Load hash from your password DB.
                bcrypt.compare(
                    details.password,
                    hashPassword.password,
                    async (error, result) => {
                        // result == true
                        if (error) {
                            console.error(error);
                            res.redirect("/");
                        } else if (result) {
                            // case : hashed password matches the entered password from the user
                            const adminOrWaiter = await waitersAppLogic.getRole(details);
                            await waitersAppLogic.setWaiterId(details.emailOrName);

                            // when the waiter is found redirect to the waiters page
                            if (adminOrWaiter === "waiter") {
                                // create a new session for a user
                                req.session.user = { username: details.emailOrName }
                                req.flash("success", "Logged in successfully.");
                                res.redirect(`/waiters/${emailOrName}`);

                            } else if (adminOrWaiter === "admin") {
                                // create a new session for a user
                                req.session.user = { username: details.emailOrName };
                                req.flash("success", "Logged in successfully.");
                                // otherwise, redirect to the admins page
                                res.redirect("/days");

                            } else if (adminOrWaiter === null) {
                                // show a message
                                req.flash("error", "Not registered in the roster register.");
                                res.redirect("/");
                            }
                        } else {
                            // case: where username forget password
                            req.flash("error", "Incorrect password.");
                            res.redirect("/");
                        }
                    }
                );

                // case: where there is no hashed password which means a user is not registered
            } else {
                // show a message
                req.flash("error", "Not registered in the roster register.");
                res.redirect("/");
            }
        } else {
            req.flash(
                "error",
                "Invalid waiter or admin name. Please enter name. abcdeABCDE."
            );
            res.redirect("/");
        }
    };

    return {
        homeRoute,
        sendLogin,
    };
};

export default loginRoute;
