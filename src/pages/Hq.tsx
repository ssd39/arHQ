// @ts-nocheck
import { EditorProvider } from "../components/EditorProvider";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import EditorContainer from "../components/EditorContainer";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Header from "../components/HeaderHqScreen";
import {
  getWorkspaceDocMeta,
  getWorkspaceInvitedUser,
} from "../store/walletSlice";

const Shimmer = ({ className }) => (
  <div className={`animate-pulse bg-gray-300 ${className}`}></div>
);

function App() {
  const wallet = useSelector((state: any) => state.wallet.walletInstance);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isWorkSpaceLoading = useSelector(
    (state: any) => state.wallet.loadingWorkspace
  );

  useEffect(() => {
    if (!wallet?.connected) {
      navigate("/connect-wallet");
    } else {
      dispatch(getWorkspaceDocMeta());
      dispatch(getWorkspaceInvitedUser());
    }
  }, [wallet]);


  return (
    <EditorProvider>
      <div className="mb-4 my-1">
        <Header />
      </div>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          {isWorkSpaceLoading ? (
            <>
              <Shimmer className="h-6 w-full mb-4 rounded" />
              <Shimmer className="h-12 w-full mb-4 rounded" />
              <Shimmer className="h-16 w-full mb-4 rounded" />
            </>
          ) : (
            <EditorContainer />
          )}
        </div>
      </div>
    </EditorProvider>
  );
}

export default App;
