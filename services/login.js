
const login = () => {
    let usernameOrEmail = "";
    let loginPage = true;

    const setEmailOrName = emailOrName => {
        loginPage = false;
        usernameOrEmail = emailOrName;
    };

    // const validateEmailOrName = () => {
        
    // };

    const getEmailOrName = () => {
        return usernameOrEmail;
    };

    const showLoginPage = () => {
        return loginPage;
    };

    const showWaitersPage = () => {
        if (!loginPage) return true;
    };

    return {
        setEmailOrName,
        // validateEmailOrName,
        getEmailOrName,
        showLoginPage,
        showWaitersPage,
    };
};

export default login;