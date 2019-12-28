import fromAsyncIter from 'callbag-from-async-iter'
import { oneShotEventHandler } from '../helpers/misc'

async function* allTabChanges() {
  while (true) {
    yield oneShotEventHandler(chrome.tabs.onUpdated)
  }
}

export default () => fromAsyncIter(allTabChanges())
