
const RegisterWaiterRoute = (waiterRegistration, regexPattern, bcrypt) => {
    const signUp = (req, res) => {
        res.render("signUp");
    };

    const registerWiater = async (req, res) => {
        const { password } = req.body;
        const name = req.body.name.toLowerCase();
        
        if (regexPattern(name)) {
            if (password.length >= 3) {
                if (name !== password) {
                    // code below
                    const saltRounds = 10;
                    
                    bcrypt.hash(password, saltRounds, async (err, hash) => {
                        if (err) {
                            console.error(err);
                            // Handle the error appropriately (e.g., send an error response)
                        } else {
                            // Store the 'hash' in your password database or use it as needed
                            const waiterSignUp = {
                                name,
                                hash
                            };
                            await waiterRegistration.registerWaiter(waiterSignUp);
                            req.flash("success", "successfully registered a waiter.");
                            res.redirect("/");
                        };
                    });

                } else {
                    req.flash("error", "Password must not be the username.");
                    res.redirect("/signUp");
                };

            } else {
                req.flash("error", "Password must be 3 or more characters");
                res.redirect("/signUp");
            };

        } else {
            req.flash("error", "Please enter alphabets only.");
            res.redirect("/signUp");
        };
    };


    return {
        signUp,
        registerWiater,
    }
};

export default RegisterWaiterRoute;