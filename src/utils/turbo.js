import { TurboFactory } from "@ardrive/turbo-sdk/web";
import {  createDataItemSigner } from "@permaweb/aoconnect";

TurboFactory.setLogLevel("debug");

export const uploadJson = async (jsonData, tags) => {
  const jsonString = JSON.stringify(jsonData);
  const customTags = [
    { name: "Content-Type", value: "application/json" },
    { name: "App-Name", value: "arHQ" },
    { name: "App-Version", value: "1.0.0" },
    ...tags, // Spread additional tags if provided
  ];

  const signer = createDataItemSigner(window.wallet);
  const dataItem = await signer({ data: jsonString, tags: customTags });
  const turbo = TurboFactory.unauthenticated();

  const { id, owner } = await turbo.uploadSignedDataItem({
    dataItemStreamFactory: () => dataItem.raw,
    dataItemSizeFactory: () => dataItem.raw.length,
    signal: AbortSignal.timeout(10_000), // Optional: cancel the upload after 10 seconds
  });

  console.log("Successfully uploaded JSON object!", { id, owner });
  return { id, owner };
};
