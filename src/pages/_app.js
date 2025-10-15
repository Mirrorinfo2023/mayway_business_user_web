import '@/styles/globals.css'
import { Provider } from 'react-redux'
import store from '../../store'
//import DisableCopyPasteRightClick from "../components/UI/DisableCopyPasteRightClick";

export default function App({ Component, pageProps }) {

  return (
    <Provider store={store} >
      {/* <DisableCopyPasteRightClick /> */}
      <Component {...pageProps} />
    </Provider>
  )

}
