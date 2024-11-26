import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import store from "./store";
import { BrowserRouter, Route, Routes } from "react-router";
import Hq from "./pages/Hq.tsx";
import ConnectWallet from "./pages/ConnectWallet.jsx";
import ManageWorkspace from "./pages/ManageWorkspace.tsx";
import Home from "./pages/Home"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastContainer />
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/hq" element={<Hq />} />
            <Route path="/connect-wallet" element={<ConnectWallet />} />
            <Route path="/manage-workspaces" element={<ManageWorkspace />} />
            <Route path="/" element={<Home />} />

          </Routes>
        </BrowserRouter>
      </Provider>
  </React.StrictMode>
);
