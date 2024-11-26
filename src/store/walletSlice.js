import { ArweaveWebWallet } from "arweave-wallet-connector";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toastSucess, toastError } from "../utils/toast-helper";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import {
  generatePrivateKey,
  getPublicKey,
  getSharedSecret,
} from "noble-secp256k1";
import { spawn, createDataItemSigner } from "@permaweb/aoconnect";
import { uploadJson } from "../utils/turbo";

const state = { url: "arweave.app" };
const wallet = new ArweaveWebWallet(
  {
    name: "arHQ",
    logo: "https://jfbeats.github.io/ArweaveWalletConnector/placeholder.svg",
  },
  { state }
);
const gqlClient = new ApolloClient({
  uri: "https://arweave-search.goldsky.com/graphql",
  cache: new InMemoryCache(),
});

export const connectWallet = createAsyncThunk(
  "wallet/connect",
  async (thunkAPI) => {
    await wallet.connect(); // on user gesture to avoid blocked popup
    return wallet;
  }
);

export const connectAo = createAsyncThunk(
  "wallet/connectAo",
  async (thunkAPI) => {}
);

const getWorkSpaceByPid = async (pid) => {
  const result1 = await gqlClient.query({
    query: gql`
      query {
        transactions(tags: [{
          name: "App-Name",
          values: ["arHQ"]
        },
        {
          name: "docType",
          values: ["workspace"]
        },
        {
          name: "processId",
          values: ["${pid}"]
        }
      ]), 
        {
          edges {
            node {
              block {
                height
              }
              data {
                type
              }
              id
              owner {
                address
              }
              tags {
                name
                value
              }
            }
          }
        }
      }        
      `,
  });
  const spaces = result1.data.transactions.edges;
  const myWokrspaces = [...spaces];

  myWokrspaces.sort((a, b) => b.node.block.height - a.node.block.height);

  return myWokrspaces;
};

export const retriveWorkspaces = createAsyncThunk(
  "wallet/retriveWorkspaces",
  async (thunkAPI) => {
    const result = await gqlClient.query({
      query: gql`
        query {
          transactions(tags: [{
            name: "App-Name",
            values: ["arHQ"]
          },
          {
            name: "docType",
            values: ["workspace"]
          }
        ], owners: ["${window.wallet.address}"]) 
          {
            edges {
              node {
                block {
                  height
                }
                data {
                  type
                }
                id
                owner {
                  address
                }
                tags {
                  name
                  value
                }
              }
            }
          }
        }        
        `,
    });
    const workspaces_ = [];
    const myWokrspaces = [...result.data.transactions.edges];
    console.log("myWokrspaces", myWokrspaces);
    if (myWokrspaces.length > 0) {
      myWokrspaces.sort((a, b) => b.node.block.height - a.node.block.height);
      const wp = myWokrspaces[0];
      const latest_workspace = { ...wp.node };

      const data_id = wp.node.id;
      const res = await (await fetch(`https://arweave.net/${data_id}`)).json();

      latest_workspace["workspace_info"] = res;
      latest_workspace["processId"] = wp.node.tags.filter(
        (v) => v["name"] == "processId"
      )[0]["value"];

      workspaces_.push(latest_workspace);
    }

    const result1 = await gqlClient.query({
      query: gql`
        query {
          transactions(tags: [{
            name: "App-Name",
            values: ["arHQ"]
          },
          {
            name: "docType",
            values: ["invite"]
          },
          {
            name: "user",
            values: ["${window.wallet.address}"]
          }
        ]), 
          {
            edges {
              node {
                block {
                  height
                }
                data {
                  type
                }
                id
                owner {
                  address
                }
                tags {
                  name
                  value
                }
              }
            }
          }
        }        
        `,
    });
    const invites = [...result1.data.transactions.edges];
    for (let inv of invites) {
      const wp = inv;
      const latest_workspace = { ...wp.node };

      latest_workspace["processId"] = wp.node.tags.filter(
        (v) => v["name"] == "processId"
      )[0]["value"];
      const workspace = (
        await getWorkSpaceByPid(latest_workspace["processId"])
      )[0];
      const data_id = workspace.node.id;
      const res = await (await fetch(`https://arweave.net/${data_id}`)).json();
      latest_workspace["workspace_info"] = res;

      workspaces_.push(latest_workspace);
    }
    return workspaces_;
  }
);

export const getWorkspaceInvitedUser = createAsyncThunk(
  "wallet/getWorkspaceInvitedUser",
  async (data, thunkAPI) => {
    const state = thunkAPI.getState();
    const result = await gqlClient.query({
      query: gql`
        query {
          transactions(tags: [
            {
              name: "App-Name",
              values: ["arHQ"]
            }, 
            {
              name: "docType",
              values: ["invite"]
            },
              {
              name: "processId",
              values: ["${state.wallet.activeWorkspace.processId}"]
            }
          ]) 
          {
            edges {
              node {
                block { 
                height
                }
                data {
                  type
                }
                id
                owner {
                  address
                }
                tags {
                  name
                  value
                }
              }
            }
          }
        }        
        `,
    });
    const invites = result.data.transactions.edges;
    const users = [];
    for (let invite of invites) {
      let usr = invite.node.tags.filter((v) => v["name"] == "user")[0]["value"];
      users.push(usr);
    }
    return users;
  }
);

export const getWorkspaceDocMeta = createAsyncThunk(
  "wallet/getWorkspaceDocMeta",
  async (data, thunkAPI) => {
    const state = thunkAPI.getState();
    const result = await gqlClient.query({
      query: gql`
        query {
          transactions(tags: [
            {
              name: "App-Name",
              values: ["arHQ"]
            }, 
            {
              name: "docType",
              values: ["doc"]
            },
              {
              name: "processId",
              values: ["${state.wallet.activeWorkspace.processId}"]
            }
          ]) 
          {
            edges {
              node {
                block { 
                height
                }
                data {
                  type
                }
                id
                owner {
                  address
                }
                tags {
                  name
                  value
                }
              }
            }
          }
        }        
        `,
    });
    const workspaceDocs = result.data.transactions.edges;
    const final_docsmeta = [];
    const wpd_lk = {};

    for (let wpd of workspaceDocs) {
      const tags = wpd.node.tags;
      const processId = tags.filter((v) => v["name"] == "processId")[0][
        "value"
      ];
      const docId = tags.filter((v) => v["name"] == "docId")[0]["value"];
      if (Object.hasOwn(wpd_lk, docId)) {
        const old_wpd = wpd_lk[docId];
        if (wpd.node.block.height > old_wpd.height) {
          wpd_lk[docId] = {
            height: wpd.node.block.height,
            processId,
            docId,
            ...wpd.node,
          };
        }
      } else {
        wpd_lk[docId] = {
          height: wpd.node.block.height,
          processId,
          docId,
          ...wpd.node,
        };
      }
    }
    for (let okc of Object.keys(wpd_lk)) {
      const tdid = wpd_lk[okc].id;
      const res = await (await fetch(`https://arweave.net/${tdid}`)).json();
      wpd_lk[okc]["doc"] = res;
      final_docsmeta.push(wpd_lk[okc]);
    }
    return final_docsmeta;
  }
);

export const registerWorkspace = createAsyncThunk(
  "wallet/registerWorkspace",
  async (data, thunkAPI) => {
    const state = thunkAPI.getState();
    console.log("my state", state);
    const jsonData = {
      name: "My Workspace",
      version: 1,
    };
    const result = await uploadJson(jsonData, [
      { name: "processId", value: state.wallet.myProcessId },
      { name: "docType", value: "workspace" },
    ]);
    // creating a profile

    return result;
  }
);

export const spawnWorkspace = createAsyncThunk(
  "wallet/spawnWorkspace",
  async (thunkAPI) => {
    //const state = thunkAPI.getState();

    //wallet.setState(state.walletInstance)
    const processId = await spawn({
      // The Arweave TXID of the ao Module
      module: "bkjb55i07GUCUSWROtKK4HU1mBS_X0TyH3M5jMV6aPg",
      // The Arweave wallet address of a Scheduler Unit
      scheduler: "_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA",
      // A signer function containing your wallet
      signer: createDataItemSigner(window.wallet),

      tags: [
        {
          name: "Authority",
          value: "fcoN_xJeisVsPXA-trzVAuIiqO3ydLQxM-L4XbrQKzY",
        },
      ],
    });
    console.log("ProcessID: " + processId);
    return processId;
  }
);

export const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    walletInstance: null,
    currentState: -1,
    isNewAcc: true,
    spawnState: -1,
    activeWorkspace: "",
    myProcessId: "",
    myWorkspaceId: "",
    workspaces: [],
    currentDoc: "",
    docState: {},
    docsmeta: [],
    docData: null,
    loadingWorkspace: false,
    loadingDoc: false,
    workspaceUsers: [],
  },
  reducers: {
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setActiveWorkspace: (state, action) => {
      state.activeWorkspace = action.payload;
      console.log(action.payload);
    },
    setCurrrentDoc: (state, action) => {
      state.currentDoc = action.payload;
    },
    syncRequired: (state, action) => {
      state.docState[state.currentDoc] = action.payload;
    },
    disconnect: (state) => {
      state = {
        walletInstance: null,
        currentState: -1,
        isNewAcc: true,
        spawnState: -1,
        activeWorkspace: "",
        myProcessId: "",
        myWorkspaceId: "",
        workspaces: [],
      };
    },
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(getWorkspaceInvitedUser.fulfilled, (state, action) => {
      console.log("workspaceUsers", action.payload);
      state.workspaceUsers = action.payload;
    });

    builder.addCase(getWorkspaceInvitedUser.rejected, (state, action) => {
      toastError("Failed to retrive workspace invited users!");
    });

    builder.addCase(getWorkspaceDocMeta.pending, (state, action) => {
      state.loadingWorkspace = true;
    });
    builder.addCase(getWorkspaceDocMeta.fulfilled, (state, action) => {
      console.log("docsmeta", action.payload);
      state.docsmeta = action.payload;
      state.loadingWorkspace = false;
    });

    builder.addCase(getWorkspaceDocMeta.rejected, (state, action) => {
      toastError("Failed to retrive docs for the workspace!");
      console.error(action.error);
      state.loadingWorkspace = false;
    });

    builder.addCase(connectWallet.pending, (state) => {
      state.currentState = 0;
    });
    builder.addCase(spawnWorkspace.pending, (state) => {
      //state.spawnState = 0;
    });
    builder.addCase(spawnWorkspace.rejected, (state, action) => {
      state = {
        spawnState: -1,
        activeWorkspace: "",
      };
      console.error(action.error);
    });
    builder.addCase(connectWallet.rejected, (state, action) => {
      state = {
        walletInstance: null,
        currentState: -1,
        spawnState: -1,
        activeWorkspace: "",
      };
      console.error(action.error);
    });

    builder.addCase(spawnWorkspace.fulfilled, (state, action) => {
      // Add user to the state array
      state.myProcessId = action.payload;
      state.currentState = 3;
    });

    builder.addCase(registerWorkspace.fulfilled, (state, action) => {
      state.currentState = 4;
      state.isNewAcc = false;
      state.workspaces = [
        {
          id: action.payload.id,
          processId: state.myProcessId,
          workspace_info: {
            name: "My Workspace",
            version: 1,
          },
          owner: {
            address: action.payload.owner,
          },
        },
      ];
    });
    builder.addCase(registerWorkspace.rejected, (state, action) => {
      state.currentState = -1;
      console.error(action.error);
      toastError("Error while registering the workspace!");
    });

    builder.addCase(connectWallet.fulfilled, (state, action) => {
      // Add user to the state array
      const wallet = action.payload;
      if (wallet.connected) {
        window.wallet = wallet;
        state.walletInstance = {
          connected: true,
        };
        state.currentState = 1;
        toastSucess("Wallet connected!");
      } else {
        state.currentState = -1;
        toastError("Failed to connect a wallet!");
      }
    });

    builder.addCase(retriveWorkspaces.rejected, (state, action) => {
      console.error(action.error);
      toastError("Error while retriving the workspaces!");
      state.currentState = -1;
    });
    builder.addCase(retriveWorkspaces.fulfilled, (state, action) => {
      console.log("retrivedWorkspaces:", action.payload);
      const workspaces = action.payload;
      if (!workspaces || workspaces?.length <= 0) {
        state.isNewAcc = true;
      } else {
        state.isNewAcc = false;
        let myProcessId = null;
        for (let wps of workspaces) {
          if (wps.owner.address == window.wallet.address) {
            myProcessId = wps.tags.filter((v) => v["name"] == "processId")[0][
              "value"
            ];
          }
        }
        if (!myProcessId) {
          state.isNewAcc = true;
        } else {
          state.myProcessId = myProcessId;
          console.log("vola:", state.myProcessId);
        }
        state.workspaces = workspaces || [];
      }
      state.currentState = 2;
    });
  },
});

// Action creators are generated for each case reducer function
export const {
  setCurrentState,
  disconnect,
  setActiveWorkspace,
  syncRequired,
  setCurrrentDoc,
} = walletSlice.actions;

export default walletSlice.reducer;
