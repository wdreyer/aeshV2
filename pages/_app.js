import "../styles/globals.css";
import Head from "next/head";
import React from "react";
import Layout from "../components/Layout/Layout";
import { auth } from "../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import Login from "../components/Login";
import InscriptionForm from "../components/SignUpProcess/InscriptionForm";
import { useRouter } from "next/router";
import { BeatLoader } from 'react-spinners';

React.useLayoutEffect = React.useEffect;

function App({ Component, pageProps }) {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const isLoginPage = router.pathname === "/login";
  const isSignUpPage = router.pathname === "/signUp";


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
    <BeatLoader color="#B8336A" size={15} margin={2} />
  </div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
    <Head>
      <title>Aesh Manager</title>
    </Head>
    {user && !isSignUpPage ? (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    ) : isLoginPage ? (
      <Login />
    ) : isSignUpPage ? (
      <InscriptionForm />
    ) : (
      <Login />
    )}
  </>
);
}

export default App;
