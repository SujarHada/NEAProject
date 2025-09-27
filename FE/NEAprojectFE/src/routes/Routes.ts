import { createBrowserRouter } from "react-router";
import { createElement } from "react";
import Home from "../components/pages/Home";
import HomeScreen from "../components/pages/HomeScreen";
import Letters from "../components/pages/Letters";
import Product from "../components/pages/Product";
import Offices from "../components/pages/Offices";
import Receiver from "../components/pages/Receiver";
import Branches from "../components/pages/Branches";
import Employee from "../components/pages/Employee";
import Profile from "../components/pages/Profile";

const router = createBrowserRouter([
    {
        path: "/",
        element: createElement(Home),
        children: [
            {
                path: "/home",
                element: createElement(HomeScreen),
            },
            {
                path: "/letters",
                element: createElement(Letters),
            },
            {
                path: "/product",
                element: createElement(Product),
            },
            {
                path: "/offices",
                element: createElement(Offices),
            },
            {
                path: "/receiver",
                element: createElement(Receiver),
            },
            {
                path: "/branches",
                element: createElement(Branches),
            },
            {
                path: "/employee",
                element: createElement(Employee),
            },
            {
                path: "/profile",
                element: createElement(Profile),
            }
        ]
    }
]);

console.log(router)
export default router;