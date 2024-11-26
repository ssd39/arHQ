      // @ts-nocheck
import { AffineEditorContainer } from '@blocksuite/presets';
import { DocCollection } from '@blocksuite/store';
import { createContext, useContext } from 'react';
import { ArweaveWebWallet } from 'arweave-wallet-connector'

export const EditorContext = createContext<{
  editor: AffineEditorContainer;
  collection: DocCollection;
  wallet: typeof ArweaveWebWallet;
} | null>(null);

export function useEditor() {
  return useContext(EditorContext);
}
