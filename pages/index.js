import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import Login from '../components/Login';
import Home from '../components/Home'

function Index() {
  const [user, loading, error] = useAuthState(auth);
  console.log(user);

  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (user) {
    return (
      <Home/>
    );
  } else {
    return <Login />;
  }
}

export default Index;