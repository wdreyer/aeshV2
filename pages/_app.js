import "../styles/globals.css";
import Head from "next/head";
import React from "react";
import Layout from "../components/Layout/Layout";
import { auth } from "../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import Login from "../components/Login";
import InscriptionForm from "../components/SignUpProcess/InscriptionForm";
import { useRouter } from "next/router";

React.useLayoutEffect = React.useEffect;

function App({ Component, pageProps }) {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const isLoginPage = router.pathname === "/login";
  const isSignUpPage = router.pathname === "/signUp";


  if (loading) {
    return <div>Loading...</div>;
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
