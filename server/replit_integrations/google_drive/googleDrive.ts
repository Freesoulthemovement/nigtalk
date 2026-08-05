import { ReplitConnectors } from "@replit/connectors-sdk";

/**
 * Google Drive connector for NigTalk.
 *
 * Used to sync Living Dictionary, Charter, Constitution, and other
 * governance documents from a designated Google Drive folder.
 *
 * IMPORTANT: Do not cache the connectors instance — tokens expire.
 * Always call getUncachableGoogleDriveClient() fresh per request.
 */

export function getUncachableGoogleDriveClient() {
  return new ReplitConnectors();
}

/** List files in a Drive folder by folder ID */
export async function listDriveFiles(folderId: string) {
  const connectors = getUncachableGoogleDriveClient();
  const response = await connectors.proxy(
    "google-drive",
    `/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,modifiedTime)&orderBy=name`,
    { method: "GET" }
  );
  return response.json();
}

/** Get the plain-text content of a Google Doc by file ID */
export async function getDriveDocContent(fileId: string): Promise<string> {
  const connectors = getUncachableGoogleDriveClient();
  const response = await connectors.proxy(
    "google-drive",
    `/drive/v3/files/${fileId}/export?mimeType=text/plain`,
    { method: "GET" }
  );
  return response.text();
}

/** Get raw file metadata */
export async function getDriveFileMetadata(fileId: string) {
  const connectors = getUncachableGoogleDriveClient();
  const response = await connectors.proxy(
    "google-drive",
    `/drive/v3/files/${fileId}?fields=id,name,mimeType,modifiedTime`,
    { method: "GET" }
  );
  return response.json();
}
