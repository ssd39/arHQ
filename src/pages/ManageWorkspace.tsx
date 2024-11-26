// @ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { spawnWorkspace } from "../store/walletSlice";
import { toast } from "react-toastify";
import { uploadJson } from "../utils/turbo";
import  { useConnection } from "arweave-wallet-kit";
import { setActiveWorkspace } from "../store/walletSlice";
import Header from "../components/Header";
function App() {
  const retrivedWorkspaces = useSelector(
    (state: any) => state?.wallet?.workspaces
  );
  const [workspaces, setWorkspaces] = useState(retrivedWorkspaces);
  const myProcessId = useSelector((state: any) => state?.wallet?.myProcessId);

  const steps = [
    "Spawning Workspace Process",
    //  "Connecting AO",
    "Creating arFs directory structure",
  ];

  const [showDropdown, setShowDropdown] = useState(null);
  const [modal, setModal] = useState({ visible: false, type: "", id: null });
  const [workspaceName, setWorkspaceName] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const spawnState = useSelector((state: any) => state?.wallet?.spawnState);
  const dispatch = useDispatch();
  const [newWpName, setNewWpName] = useState("");
  const { connected, connect, disconnect } = useConnection();
  const wallet = useSelector((state: any) => state.wallet.walletInstance);
  useEffect(() => {
    if (!wallet?.connected) {
      navigate("/connect-wallet");
    }
  }, [wallet]);

  // Open Modal for Adding or Renaming Workspace
  const openModal = (type: any, id = null) => {
    setWorkspaceName(""); // Reset input field
    setModal({ visible: true, type, id });
  };

  const dropdownRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // @ts-expect-error
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // @ts-expect-error
  const handleDropdownClick = (e, workspaceId) => {
    e.stopPropagation();
    setDropdownPosition({ x: e.clientX, y: e.clientY });
    setShowDropdown((prev) => (prev === workspaceId ? null : workspaceId));
  };

  // Handle Modal Submit
  const handleModalSubmit = () => {
    if (workspaceName.trim() === "") return;

    if (modal.type === "add") {
      const newWorkspace = {
        id: Date.now(),
        name: workspaceName,
      };
      //setWorkspaces([...workspaces, newWorkspace]);
      setNewWpName(workspaceName);
      // @ts-expect-error
      dispatch(spawnWorkspace({ name: workspaceName }));
    } else if (modal.type === "rename") {
      const selected_workspace = workspaces.filter(
        (v: any) => v.id === modal.id
      )[0];
      toast
        .promise(
          uploadJson(
            {
              version: selected_workspace.workspace_info.version + 1,
              name: workspaceName,
            },
            [{ name: "processId", value: myProcessId }]
          ),
          {
            pending: "Updating the workspace",
            success: "Workspace renamed. It will reflect in ui after sometime!",
            error: "Failed to rename workspace!",
          }
        )
        .then(() => {
          setWorkspaces(
            workspaces.map((workspace) =>
              workspace.id === modal.id
                ? { ...workspace, name: workspaceName }
                : workspace
            )
          );
        });
    }
    closeModal();
  };

  // Close Modal
  const closeModal = () => {
    setModal({ visible: false, type: "", id: null });
  };

  // Handle Delete Workspace
  const handleDeleteWorkspace = (id: any) => {
    setWorkspaces(workspaces.filter((workspace) => workspace.id !== id));
    setShowDropdown(null);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex flex-col items-center p-8">
      <Header />
      {spawnState == -1 ? (
        <>
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-2xl font-bold text-gray-700 mb-6 mt-12"
          >
            Select Workspace
          </motion.h1>

          {/* Create Workspace Button */}
          {false && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-8 flex flex-col items-center"
            >
              <button
                onClick={() => openModal("add")}
                className="w-16 h-16 border-2 border-gray-400 rounded-lg flex items-center justify-center group hover:bg-white hover:shadow-lg transition-all"
              >
                <motion.span
                  whileHover={{ scale: 1.2 }}
                  className="text-gray-400 text-3xl group-hover:text-gray-600 transition-all"
                >
                  +
                </motion.span>
              </button>
              <p className="text-center text-gray-600 mt-4 font-medium">
                Create Workspace
              </p>
            </motion.div>
          )}

          {/* Workspace List */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden"
          >
            {workspaces.map((workspace, index) => (
              <li
                key={workspace.id}
                className="flex items-center justify-between px-6 py-4 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer transition-all relative"
                onClick={() => {
                  dispatch(setActiveWorkspace({ processId: workspace.processId, name: workspace.workspace_info.name, id: workspace.id }))
                  navigate("/hq")
                }}
              >
                {/* Workspace Name */}
                <div className="flex items-center">
                  <span className="text-gray-700 font-medium">
                    {workspace.workspace_info.name}
                  </span>
                  {workspace.owner.address == window?.wallet?.address && (
                    <span className="ml-4 text-xs px-2 py-0.5 bg-gray-600 text-white rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                {/* Three Dots Dropdown */}
          
                {workspace.owner.address == window?.wallet?.address && (<div
                  className="relative"
                  onClick={(e) => handleDropdownClick(e, workspace.id)}
                  ref={dropdownRef}
                >
                  <button className="text-gray-500 hover:text-gray-700 p-1 rounded-lg py-0.5 hover:bg-gray-200">
                    •••
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {showDropdown === workspace.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-50 w-32"
                        style={{
                          position: "fixed",
                          top: dropdownPosition.y,
                          left: dropdownPosition.x,
                          transform: "translate(-50%, 0)", // Adjust position for better alignment
                        }}
                      >
                        <button
                          onClick={() => openModal("rename", workspace.id)}
                          className="w-full px-4 py-2 text-left text-sm text-blue-500 hover:bg-gray-100 rounded-md transition-all"
                        >
                          Rename
                        </button>
                        {false && (
                          <button
                            onClick={() => handleDeleteWorkspace(workspace.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100 rounded-md transition-all"
                          >
                            Delete
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>)}
              </li>
            ))}
          </motion.ul>

          {/* Modal for Adding or Renaming */}
          <AnimatePresence>
            {modal.visible && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-lg p-6 w-96"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    {modal.type === "add"
                      ? "Create Workspace"
                      : "Rename Workspace"}
                  </h2>
                  <input
                    type="text"
                    placeholder="Enter workspace name"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleModalSubmit}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="h-full flex flex-col justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className=" top-16 text-4xl font-bold text-gray-700 mb-8"
          >
            Creating a workspace `{newWpName}`
          </motion.div>
          <div className="flex items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col space-y-6"
            >
              {steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === spawnState
                        ? "bg-gray-300 animate-spin"
                        : index < spawnState
                        ? "bg-green-400"
                        : "bg-gray-100"
                    }`}
                  >
                    {index < spawnState ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : index === spawnState ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : null}
                  </div>
                  <p className="text-gray-700 text-lg">{step}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
