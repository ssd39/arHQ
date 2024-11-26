import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import {
  connectWallet as connectWalletAction,
  registerWorkspace,
  retriveWorkspaces,
  spawnWorkspace,
} from "../store/walletSlice";
import { useNavigate } from "react-router";

const SpinnerList = ({ listItems, currentStep }) => (
  <>
    {listItems.map((step, index) => (
      <div key={index} className="flex items-center space-x-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            index === currentStep
              ? "bg-gray-300 animate-spin"
              : index < currentStep
              ? "bg-green-400"
              : "bg-gray-100"
          }`}
        >
          {index < currentStep ? (
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
          ) : index === currentStep ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : null}
        </div>
        <p className="text-gray-700 text-lg font-medium">{step}</p>
      </div>
    ))}
  </>
);

const ConnectWallet = () => {
  const currentStep = useSelector((state) => state.wallet.currentState);
  const isNewAcc = useSelector((state) => state.wallet.isNewAcc);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const steps0 = ["Connecting wallet", "Retrieving workspaces"];
  const steps1 = ["Connecting wallet", "Retrieving workspaces", "Connecting Workspace Process"];
  const steps = [
    "Connecting wallet",
    "Retrieving workspaces",
    "Spawning Workspace Process",
    "Registering the Workspace",
  ];

  useEffect(() => {
    if (currentStep === 1) {
      dispatch(retriveWorkspaces());
    } else if (currentStep === 2) {
      if (isNewAcc) {
        dispatch(spawnWorkspace());
      } else {
        navigate("/manage-workspaces");
      }
    } else if (currentStep === 3) {
      if (isNewAcc) {
        dispatch(registerWorkspace());
      }
    } else if (currentStep === 4) {
      navigate("/manage-workspaces");
    }
  }, [currentStep, dispatch, isNewAcc, navigate]);

  const handleClick = () => {
    dispatch(connectWalletAction());
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex flex-col items-center justify-center">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          Welcome to <span className="text-blue-600">arHQ</span>
        </h1>
        <p className="text-lg text-gray-600">
          Decentralized workspaces powered by Arweave. Secure, fast, and AI-ready.
        </p>
      </motion.div>

 

      {/* Button */}
      {currentStep === -1 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
          className="px-6 py-3 bg-blue-600 text-white font-semibold text-lg rounded-lg shadow-md hover:bg-blue-700 focus:outline-none transition-all"
        >
          Connect Wallet
        </motion.button>
      )}

      {/* Loader */}
      {currentStep >= 0 && (
        <div className="flex items-center mt-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col space-y-6"
          >
            {currentStep <= 1 && <SpinnerList listItems={steps0} currentStep={currentStep} />}
            {currentStep > 1 && isNewAcc && <SpinnerList listItems={steps} currentStep={currentStep} />}
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-gray-500 text-sm">
          Built for the future. <span className="font-medium text-gray-700">Decentralized & Secure.</span>
        </p>
      </motion.div>
    </div>
  );
};

export default ConnectWallet;
