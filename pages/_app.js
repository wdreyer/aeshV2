import '../styles/globals.css';
import Head from 'next/head';
import React from "react" 
React.useLayoutEffect = React.useEffect 

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Aesh Manager</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default App;
