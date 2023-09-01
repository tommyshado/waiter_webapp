
const loginRoute = () => {
    const homeRoute = (req, res) => {
        res.render("index");
    };
    return {
        homeRoute
    };
};

export default loginRoute;