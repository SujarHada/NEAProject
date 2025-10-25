import { createBrowserRouter, Navigate } from "react-router";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { createElement } from "react";
import Login from "../components/pages/auth/Login";
import Home from "../components/pages/Home";
import HomeScreen from "../components/pages/HomeScreen";
import Letters from "../components/pages/letters/Letters";
import CreateLetter from "../components/pages/letters/CreateLetter";
import AllLetters from "../components/pages/letters/AllLetters";
import LettersBin from "../components/pages/letters/LettersBin";

import Product from "../components/pages/products/Product";
import CreateProducts from "../components/pages/products/CreateProducts";
import ActiveProducts from "../components/pages/products/ActiveProducts";
import ProductsBin from "../components/pages/products/ProductsBin";
import EditProduct from "../components/pages/products/EditProduct";

import Offices from "../components/pages/offices/Offices";
import CreateOffice from "../components/pages/offices/CreateOffice";
import OfficeList from "../components/pages/offices/OfficeList";
import EditOffice from "../components/pages/offices/EditOffice";

import Receiver from "../components/pages/receiver/Receiver";
import CreateReceiver from "../components/pages/receiver/CreateReceiver";
import ReceiverList from "../components/pages/receiver/ReceiverList";
import EditReceiver from "../components/pages/receiver/EditReceiver";

import Branches from "../components/pages/branches/Branches";
import AllBranches from "../components/pages/branches/AllBranches";
import CreateBranches from "../components/pages/branches/CreateBranches";
import EditBranch from "../components/pages/branches/EditBranch";

import Employee from "../components/pages/employee/Employee";
import CreateEmployee from "../components/pages/employee/CreateEmployee";
import AllEmployees from "../components/pages/employee/AllEmployees";
import EditEmployee from "../components/pages/employee/EditEmployee";

import Profile from "../components/pages/Profile";
import AuthCheck from "../components/auth/AuthCheck";
import NotFoundPage from "../components/pages/NotFoundPage";
const router = createBrowserRouter([
    {
        path: "/login",
        element: createElement(Login),
    },
    {
        path: "/",
        element: createElement(AuthCheck, null, createElement(Home)),
        children: [
            { index: true, element: createElement(Navigate, { to: "/home", replace: true }) },
            { path: "home", element: createElement(HomeScreen) },

            {
                path: "letters",
                element: createElement(Letters),
                children: [
                    { path: "all-letters", element: createElement(AllLetters) },
                    { path: "letter-bin", element: createElement(LettersBin) },
                    {
                        element: createElement(ProtectedRoute, { allowedRoles: ["admin"] }),
                        children: [{ path: "create-letter", element: createElement(CreateLetter) }],
                    },
                ],
            },

            {
                path: "products",
                element: createElement(Product),
                children: [
                    { path: "active-products", element: createElement(ActiveProducts) },
                    { path: "bin-product", element: createElement(ProductsBin) },
                    {
                        element: createElement(ProtectedRoute, { allowedRoles: ["admin"] }),
                        children: [
                            { path: "create-product", element: createElement(CreateProducts) },
                            { path: "edit/:id", element: createElement(EditProduct) },
                        ],
                    },
                ],
            },

            {
                path: "offices",
                element: createElement(Offices),
                children: [
                    { path: "office-list", element: createElement(OfficeList) },
                    {
                        element: createElement(ProtectedRoute, { allowedRoles: ["admin"] }),
                        children: [
                            { path: "create-office", element: createElement(CreateOffice) },
                            { path: "edit/:id", element: createElement(EditOffice) },
                        ],
                    },
                ],
            },

            {
                path: "receiver",
                element: createElement(Receiver),
                children: [
                    { path: "receiver-list", element: createElement(ReceiverList) },
                    {
                        element: createElement(ProtectedRoute, { allowedRoles: ["admin"] }),
                        children: [
                            { path: "create-receiver", element: createElement(CreateReceiver) },
                            { path: "edit/:id", element: createElement(EditReceiver) },
                        ],
                    },
                ],
            },

            {
                path: "branches",
                element: createElement(Branches),
                children: [
                    { path: "all-branches", element: createElement(AllBranches) },
                    {
                        element: createElement(ProtectedRoute, { allowedRoles: ["admin"] }),
                        children: [
                            { path: "create-branch", element: createElement(CreateBranches) },
                            { path: ":id/edit", element: createElement(EditBranch) },
                            { path: ":id/employee/create-employee", element: createElement(CreateEmployee) },
                        ],
                    },
                    { path: ":id/employee/all-employees", element: createElement(AllEmployees) },
                ],
            },

            {
                path: "employees",
                element: createElement(Employee),
                children: [
                    { path: "manage", element: createElement(AllEmployees) },
                    {
                        element: createElement(ProtectedRoute, { allowedRoles: ["admin"] }),
                        children: [
                            { path: "create", element: createElement(CreateEmployee) },
                            { path: "edit/:id", element: createElement(EditEmployee) },
                        ],
                    },
                ],
            },

            { path: "profile", element: createElement(Profile) },
        ],
    },
    {
        path: "*",
        element: createElement(NotFoundPage),
    }
]);

export default router;
