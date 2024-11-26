      // @ts-nocheck
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiLogOut, FiRefreshCw } from "react-icons/fi"; // Icons for logout and sync
import { useLocation, useNavigate } from "react-router";
import {useSelector, useDispatch} from "react-redux"
import {syncRequired} from "../store/walletSlice"
import { useEditor } from "../editor/context";
import { Job } from '@blocksuite/store';
import { toast } from 'react-toastify'
import { uploadJson } from "../utils/turbo";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const docsSyncState = useSelector((state) => state.wallet.docState)
  const currentDoc = useSelector((state) => state.wallet.currentDoc)
  const activeWorkspace = useSelector((state) => state.wallet.activeWorkspace);
  const [isSyncEnabled, setSyncEnabled] = useState(false)
  const dispatch = useDispatch()
  
    
  const { collection, editor } = useEditor()!;
  const handleLogout = () => {
    if (location.pathname === "/manage-workspaces") {
      window.location.replace("/connect-wallet");
    } else {
      navigate("/manage-workspaces");
    }
    console.log("Logout clicked");
  };

  useEffect(() => {
    if(Object.hasOwn(docsSyncState, currentDoc)){
      setSyncEnabled(docsSyncState[currentDoc])
    } else {
      dispatch(syncRequired(false))
    }
  }, [currentDoc, docsSyncState])

  const handleSync = async () => {
    dispatch(syncRequired(false))
    console.log("Sync initiated");
    const syncLogic = async () => {
      const job = new Job({ collection });
      const json = await job.docToSnapshot(editor.doc);
      console.log("synced doc", JSON.stringify(json))
      const result = await uploadJson(json, [
        { name: "processId", value: activeWorkspace.processId },
        { name: "docType", value: "doc"},
        { name: "docId", value: editor.doc.id}
      ]);
    }
    toast.promise(
      syncLogic(),
      {
        pending: 'Syncing the doc!',
        success: 'Doc synced successfully!',
        error: 'Failed to sync doc!'
      }
    )
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full bg-white shadow-md py-2 px-8 flex items-center rounded-lg justify-between"
    >
      {/* Logo/Title */}
      <div>
        <div className="text-2xl font-bold text-gray-700 flex items-center">
          <span className="bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 bg-clip-text text-transparent">
            arHQ
          </span>
        </div>
      </div>

      {/* User Info and Actions */}
      <div className="flex items-center space-x-4">
        {/* Sync Button */}
       {location.pathname =="/hq" && ( <button
          onClick={handleSync}
          disabled={!isSyncEnabled} // Button disabled by default
          className={`flex items-center justify-center bg-gray-100 rounded-lg px-3 py-1 text-sm font-medium ${
            isSyncEnabled
              ? "text-gray-600 hover:bg-gray-200 hover:text-gray-800 cursor-pointer"
              : "text-gray-400 cursor-not-allowed"
          } transition-all active:scale-90`}
          aria-label="Sync"
        >
          <FiRefreshCw size={16} className="mr-1" />
          Sync
        </button>)}

        {/* Greeting */}
        <span className="bg-gray-500 text-white rounded-lg px-2 py-0.5">
          Hi, {window?.wallet?.address?.slice(0, 14)}...
          {window?.wallet?.address?.slice(30, 43)}
        </span>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-lg p-2 transition-all"
          aria-label="Logout"
        >
          <FiLogOut size={20} />
        </button>
      </div>
    </motion.header>
  );
}
