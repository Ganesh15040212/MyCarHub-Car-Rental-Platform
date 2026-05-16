import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "cars", Component: Cars },
      { path: "contact", Component: Contact },
      { path: "*", Component: NotFound },
    ],
  },
]);
