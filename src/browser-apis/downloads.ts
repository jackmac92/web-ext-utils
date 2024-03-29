import browser from 'webextension-polyfill';
import { oneShotEventHandler } from "../helpers/misc";


/**
 * @category downloads
 */
export const waitForDownload = async () =>
  oneShotEventHandler(browser.downloads.onCreated);

// export const suggestDownloadPath = async (
//   filterDownloadEvents: (a: Downloads.DownloadItem) => boolean,
//   handleSuggestName
// ) =>
//   oneShotEventHandlerSyncCheck(
//     browser.downloads.onCreated,
//     filterDownloadEvents
//   ).then((downloadItem, suggest) => handleSuggestName(suggest, downloadItem));

// #### Types
// FilenameConflictAction
// InterruptReason
// DangerType
// State
// DownloadItem
// StringDelta
// DoubleDelta
// BooleanDelta

// #### Methods
// download − chrome.downloads.download(object options, function callback)
// search − chrome.downloads.search(object query, function callback)
// pause − chrome.downloads.pause(integer downloadId, function callback)
// resume − chrome.downloads.resume(integer downloadId, function callback)
// cancel − chrome.downloads.cancel(integer downloadId, function callback)
// getFileIcon − chrome.downloads.getFileIcon(integer downloadId, object options, function callback)
// open − chrome.downloads.open(integer downloadId)
// show − chrome.downloads.show(integer downloadId)
// showDefaultFolder − chrome.downloads.showDefaultFolder()
// erase − chrome.downloads.erase(object query, function callback)
// removeFile − chrome.downloads.removeFile(integer downloadId, function callback)
// acceptDanger − chrome.downloads.acceptDanger(integer downloadId, function callback)
// setShelfEnabled − chrome.downloads.setShelfEnabled(boolean enabled)

// #### Events
// onCreated
// onErased
// onChanged
// onDeterminingFilename
