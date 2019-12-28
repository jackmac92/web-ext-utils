export const readNetReqResponseBodyquestsByHostname = (
  targetDomain: string,
  filterNetworkEvents: (p: object) => Promise<boolean>,
  processResponseBody: (res: string, p: object) => void
) => {
  const monitoredTabs: any = {}
  const allEventHandler = (currentTabId: number) => async (
    debuggeeId,
    message,
    params
  ) => {
    if (currentTabId !== debuggeeId.tabId) {
      return
    }
    monitoredTabs[currentTabId] = debuggeeId
    if (message !== 'Network.responseReceived') {
      return
    }
    if (!params.response.url.includes(targetDomain)) {
      return
    }
    if (!(await filterNetworkEvents(params))) {
      return
    }

    chrome.debugger.sendCommand(
      {
        tabId: debuggeeId.tabId
      },
      'Network.getResponseBody',
      {
        requestId: params.requestId
      },
      (response: any) => {
        // you get the response body here!
        // you can close the debugger tips by:
        // chrome.debugger.detach(debuggeeId)
        const {
          base64Encoded,
          body
        }: { base64Encoded: boolean; body: string } = response
        const respBody = (() => {
          if (!base64Encoded) {
            return body
          }
          return atob(body)
        })()
        processResponseBody(respBody, params)
      }
    )
  }

  const networkMonitor = (tabId, changeInfo: any = {}, tab) => {
    if (monitoredTabs[tabId]) {
      return
    }
    const { url = '' } = changeInfo
    if (url.includes(targetDomain)) {
      chrome.debugger.attach({ tabId: tab.id }, '1.0', () => {
        chrome.debugger.sendCommand(
          {
            //first enable the Network
            tabId
          },
          'Network.enable'
        )

        chrome.debugger.onEvent.addListener(allEventHandler(tabId))
      })
    }
  }

  chrome.tabs.onUpdated.addListener(networkMonitor)

  return function disableSelf() {
    chrome.tabs.onUpdated.removeListener(networkMonitor)
  }
}
