import { createBrowserRouter } from "react-router";
import { createElement } from "react";
import Home from "../components/pages/Home";
import HomeScreen from "../components/pages/HomeScreen";
import Letters from "../components/pages/letters/Letters";
import Product from "../components/pages/products/Product";
import Offices from "../components/pages/offices/Offices";
import Receiver from "../components/pages/receiver/Receiver";
import Branches from "../components/pages/branches/Branches";
import Employee from "../components/pages/employee/Employee";
import Profile from "../components/pages/Profile";
import CreateLetter from "../components/pages/letters/CreateLetter";
import AllLetters from "../components/pages/letters/AllLetters";
import LettersBin from "../components/pages/letters/LettersBin";
import CreateProducts from "../components/pages/products/CreateProducts";
import ActiveProducts from "../components/pages/products/ActiveProducts";
import ProductsBin from "../components/pages/products/ProductsBin";
import CreateOffice from "../components/pages/offices/CreateOffice";
import OfficeList from "../components/pages/offices/OfficeList";
import CreateReceiver from "../components/pages/receiver/CreateReceiver";
import ReceiverList from "../components/pages/receiver/ReceiverList";
import AllBranches from "../components/pages/branches/AllBranches";
import CreateBranches from "../components/pages/branches/CreateBranches";
import CreateEmployee from "../components/pages/employee/CreateEmployee";
import ManageEmployees from "../components/pages/employee/EditEmployee";
import AllEmployees from "../components/pages/employee/AllEmployees";
import EditBranch from "../components/pages/branches/EditBranch";
import EditProduct from "../components/pages/products/EditProduct";
import EditEmployee from "../components/pages/employee/EditEmployee";
import EditOffice from "../components/pages/offices/EditOffice";

const router = createBrowserRouter([
    {
        path: "/",
        element: createElement(Home),
        children: [
            {
                path: "home",
                element: createElement(HomeScreen),
            },
            {
                path: "letters",
                element: createElement(Letters),
                children:[
                    {
                        path:"create-letter",
                        element: createElement(CreateLetter)
                    },
                    {
                        path:"all-letters",
                        element: createElement(AllLetters)
                    },
                    {
                        path:"letter-bin",
                        element: createElement(LettersBin)
                    }
                ]
            },
            {
                path: "products",
                element: createElement(Product),
                children:[
                    {
                        path:"create-product",
                        element: createElement(CreateProducts)
                    },
                    {
                        path:"active-products",
                        element: createElement(ActiveProducts)
                    },
                    {
                        path:"bin-product",
                        element: createElement(ProductsBin)
                    },
                    {
                        path:'edit/:id',
                        element:createElement(EditProduct)
                    }
                ]

            },
            {
                path: "offices",
                element: createElement(Offices),
                children:[
                    {
                        path:"create-office",
                        element: createElement(CreateOffice)
                    },
                    {
                        path:"office-list",
                        element: createElement(OfficeList)
                    },
                    {
                        path:"edit/:id",
                        element: createElement(EditOffice)
                    }
                ]
            },
            {
                path: "receiver",
                element: createElement(Receiver),
                children:[
                    {
                        path:"create-receiver",
                        element: createElement(CreateReceiver)
                    },
                    {
                        path:"receiver-list",
                        element: createElement(ReceiverList)
                    }
                ]
            },
            {
                path: "branches",
                element: createElement(Branches),
                children:[
                    {
                        path:"all-branches",
                        element: createElement(AllBranches)
                    },
                    {
                        path:"create-branch",
                        element: createElement(CreateBranches)
                    },
                    {
                        path:":id/employee/create-employee",
                        element: createElement(CreateEmployee)
                    },
                    {
                        path:":id/employee/all-employees",
                        element: createElement(AllEmployees)
                    },
                    {
                        path:":id/edit",
                        element: createElement(EditBranch)
                    }
                ]
            },
            {
                path: "employees",
                element: createElement(Employee),
                children:[
                    {
                        path:"create",
                        element: createElement(CreateEmployee)
                    },
                    {
                        path:"manage",
                        element: createElement(AllEmployees)
                    },
                    {
                        path:"edit/:id",
                        element: createElement(EditEmployee)
                    }
                ]
            },
            {
                path: "profile",
                element: createElement(Profile),
            }
        ]
    }
]);

export default router;