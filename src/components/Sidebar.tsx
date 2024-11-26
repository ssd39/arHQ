// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import { Doc } from "@blocksuite/store";
import { useEditor } from "../editor/context";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { generateRandomString } from "../utils/strings";
import { useNavigate } from "react-router";
import { toastSucess } from "../utils/toast-helper";
import { FiCopy } from "react-icons/fi"; // Import the Copy icon
import { syncRequired, setCurrrentDoc } from "../store/walletSlice";
import { toast } from "react-toastify";
import { uploadJson } from "../utils/turbo";
import { Job } from "@blocksuite/store";
import cloneDeep from "lodash/cloneDeep";
import { fetchChatCompletion } from "../utils/llm";
import {  Text } from '@blocksuite/store';
import { WebrtcProvider } from "../y-aos";

const Shimmer = ({ className }) => (
  <div className={`animate-pulse bg-gray-300 ${className}`}></div>
);

const Sidebar = () => {
  const { collection, editor } = useEditor()!;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [webrtcProvider, setWebrtcProvider] = useState(null);
  const invitedUsers_ = useSelector((state) => state.wallet.workspaceUsers);
  const [invitedUsers, setInvitedUsers] = useState(invitedUsers_);
  const [newUserName, setNewUserName] = useState("");
  const dropdownRef = useRef(null);
  const activeWorkspace = useSelector((state) => state.wallet.activeWorkspace);
  const isWorkSpaceLoading = useSelector(
    (state: any) => state.wallet.loadingWorkspace
  );
  const docsMeta = useSelector((state: any) => state.wallet.docsmeta);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    setInvitedUsers(invitedUsers_);
  }, [invitedUsers_]);
  useEffect(() => {
    if (!collection || !editor) return;
    const updateDocs = () => {
      const docs = [...collection.docs.values()].map((blocks) =>
        blocks.getDoc()
      );
      setDocs(docs);
    };
    updateDocs();

    const disposable = [
      collection.slots.docUpdated.on(updateDocs),
      editor.slots.docLinkClicked.on(updateDocs),
    ];

    return () => disposable.forEach((d) => d.dispose());
  }, [collection, editor]);

  useEffect(() => {
    if (editor?.doc) {
      dispatch(setCurrrentDoc(editor.doc.id));
      const updateListen = () => {
        dispatch(syncRequired(true));
      };
      editor?.doc.spaceDoc.on("update", updateListen);
      return () => editor?.doc.spaceDoc.off("update", updateListen);
    }
  }, [editor?.doc]);

  const wallet = useSelector((state: any) => state.wallet.walletInstance);
  useEffect(() => {
    if (!activeWorkspace.processId) {
      navigate("/manage-workspace");
    }
  }, [activeWorkspace]);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInviteClick = () => {
    setModalVisible(true);
    setShowDropdown(false);
  };

  const addUserToInviteList = async () => {
    if (newUserName.trim() !== "") {
      const sendInvite = async () => {
        await uploadJson({}, [
          { name: "processId", value: activeWorkspace.processId },
          { name: "docType", value: "invite" },
          { name: "user", value: newUserName },
        ]);
      };

      await toast.promise(sendInvite(), {
        pending: "Sending the invite!",
        success: "Invite sent successfully!",
        error: "Failed to send invite!",
      });
      setInvitedUsers([...invitedUsers, newUserName]);

      setNewUserName("");
      setModalVisible(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeWorkspace.processId);
    toastSucess("Process ID copied to clipboard!");
  };

  useEffect(() => {
    const x = setInterval(() => {
      try {
        const document = window.document;
        const shadow =
          document.getElementsByTagName("affine-slash-menu")[0].shadowRoot
            .children[1].shadowRoot;
        if (shadow?.children?.length > 0) {
          const el = shadow?.getElementById("arHQAI");
          if (!el) {
            const div = document.createElement("div");

            div.id = "arHQAI";

            div.style =
              "margin: 5px 0px; border-radius: 5px; background-color: transparent; cursor: pointer; transition: background-color 0.3s, transform 0.2s;background: gray;padding: 5px;margin-left: 19;font-weight: bold;color: white;";
            div.innerHTML = "<span>✨ Ask AI</span>";
            div.addEventListener("click", async (e) => {
              let prmopt = prompt("Enter your prmopt here:");

              const llmresult = await toast.promise(
                fetchChatCompletion([{ content: prmopt, role: "user" }]),
                {
                  pending: "LLM thinking!",
                  success: "Added the llm response!",
                  error: "Failed to get llm response!",
                }
              );
              console.log(editor.doc.blocks);
              /*for(let block of editor.doc.blocks){
                if(block[1].flavour =="affine:page"){
                  const doc = editor.doc
                  const pageBlockId = block[0]
                  doc.addBlock("affine:surface", {}, pageBlockId);
                  const noteId = doc.addBlock("affine:note", {}, pageBlockId);
                
                  doc.addBlock(
                    'affine:paragraph',
                    { text: new Text(llmresult) },
                    noteId
                  );
                }
              
              }*/
         
              document.getElementsByTagName(
                "affine-paragraph"
              )[0].children[0].children[0].children[0].children[0].children[0].children[0].children[0].innerText =
                llmresult;
            });
            shadow?.children[0].prepend(div);
          }
        }
      } catch (e) {}
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isWorkSpaceLoading) {
      if (docsMeta.length <= 0) {
        const doc = collection.createDoc({ id: generateRandomString(6) });
        //new WebrtcProvider('test', doc.spaceDoc)
        doc.load(() => {
          const pageBlockId = doc.addBlock("affine:page", {});
          doc.addBlock("affine:surface", {}, pageBlockId);
          const noteId = doc.addBlock("affine:note", {}, pageBlockId);
          doc.addBlock("affine:paragraph", {}, noteId);
        });
        editor.doc = doc;
        const provider = new WebrtcProvider(doc.id, doc.spaceDoc);
        provider.on('synced', () => doc.load());
        setWebrtcProvider(provider);
      } else {
        (async () => {
          let i = 0;
          for (let dc of docsMeta) {
            const job = new Job({ collection });
            console.log(dc.doc);
            const newDoc = await job.snapshotToDoc(cloneDeep(dc.doc));

            console.log("mydoc meta", newDoc.meta);

            if (i == 0) {
              editor.doc = newDoc;             
              const provider = new WebrtcProvider(newDoc.id, newDoc.spaceDoc);
              provider.on('synced', () =>{
                console.log("data synced!!!")
                newDoc.load()
              } );
              setWebrtcProvider(provider);
              console.log("ikigai", newDoc.spaceDoc)

            }
            i += 1;
            console.log("we already have docs!!!");
          }
        })();
      }
    }
  }, [isWorkSpaceLoading]);

  if (!activeWorkspace) {
    return <></>;
  }
  return (
    <div className="sidebar">
      <div className="flex items-start justify-between header">
        <div className="flex flex-col">
          <h1 className="text-lg font-bold text-gray-800 ">
            {activeWorkspace.name}
          </h1>
          <div className="flex items-center">
            <span className="text-xs bg-green-400 px-1 py-0.5 text-white rounded-full">
              {activeWorkspace.processId.slice(0, 10)}...
              {activeWorkspace.processId.slice(
                activeWorkspace.processId.length - 10,
                activeWorkspace.processId.length
              )}
            </span>
            <button
              onClick={copyToClipboard}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-200"
              title="Copy Process ID"
            >
              <FiCopy size={16} />
            </button>
          </div>
        </div>
        <div ref={dropdownRef} className="relative">
          <button
            className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-200"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            •••
          </button>
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 w-32"
              >
                <button
                  onClick={handleInviteClick}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                >
                  Invite
                </button>
                <button
                  onClick={() => {
                    const doc = collection.createDoc({
                      id: generateRandomString(8),
                    });
                    doc.load(() => {
                      const pageBlockId = doc.addBlock("affine:page", {});
                      doc.addBlock("affine:surface", {}, pageBlockId);
                      const noteId = doc.addBlock(
                        "affine:note",
                        {},
                        pageBlockId
                      );
                      doc.addBlock("affine:paragraph", {}, noteId);
                    });
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                >
                  Add Doc
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="doc-list mt-4">
        {isWorkSpaceLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <Shimmer key={index} className="h-6 w-full mb-4 rounded" />
            ))
          : docs.map((doc) => (
              <div
                className={`doc-item rounded-lg ${
                  editor?.doc === doc ? "active" : ""
                }`}
                key={doc.id}
                onClick={() => {
                  if (webrtcProvider) {
                    webrtcProvider.disconnect();
                  }
                  if (editor) {
                    editor.doc = doc;
                    const provider = new WebrtcProvider(doc.id, doc.spaceDoc);
                    provider.on('synced', () => doc.load());

                    setWebrtcProvider(provider);
                   
                  }
                  const docs = [...collection.docs.values()].map((blocks) =>
                    blocks.getDoc()
                  );
                  setDocs(docs);
                }}
              >
                {doc.meta?.title || "Untitled"}
              </div>
            ))}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {modalVisible && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg p-6 w-[500px]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Invite Users
              </h2>
              <ul className="mb-4 space-y-2">
                {invitedUsers.map((user, index) => (
                  <li
                    key={index}
                    className="text-gray-700 bg-gray-100 px-2 py-1 rounded-md"
                  >
                    {user}
                  </li>
                ))}
              </ul>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter User Address"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                />
                <button
                  onClick={addUserToInviteList}
                  className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                >
                  Add
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setModalVisible(false)}
                  className="px-4 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;
