import { useState } from "react";
import Link from 'next/link';
import { AiOutlineCalendar } from "react-icons/ai";
import { getAuth,signInWithEmailAndPassword } from "firebase/auth";
import app from '../firebaseConfig'
const auth = getAuth(app)

function Login () {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [connectionError,setConnectionError] = useState('');

  const handleForm = () => {
    event.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // La connexion a réussi, vous pouvez ajouter du code ici si nécessaire
      console.log('Utilisateur connecté:', userCredential.user);
    })  
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setConnectionError("Mauvais mail ou/et mdp");
        return;
      });
  };

 
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
  
    <title>AeshManager </title>
    <meta name="viewport" content="initial-scale=1.0, width=device-width" />
  <div className="bg-white shadow-md rounded mt-4 px-8 pt-6 pb-8 mb-4 w-80">
  <h2 className="text-gray-600 font-semibold mb-4 text-4xl text-center">
        <span className="inline-flex items-center">
          <AiOutlineCalendar />
          <span className="ml-2">AeshManager</span>
        </span>
      </h2>    <form>
      <div className="mb-4">
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="email"
          placeholder="Votre e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="password"
        placeholder="Votre mot de passe"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      </div>
      {connectionError && <span  className="text-red-600">{connectionError} </span>}
      <div className="flex items-center justify-between">
        <button
          className="drop-shadow-md bg-[#FAD4D8] w-full hover:text-black hover:bg-[#FAD4E8] text-gray-700 font-bold pt-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
          onClick={handleForm}
        >
          Connection
        </button>       
      </div>
    </form>
    <div className="pt-4 flex flex-col items-center justify-between text-sm" >
    <Link href="/signUp">
    <a className="text-grey-500 hover:text-grey-900">Pas de compte ? Inscrivez-vous</a>
  </Link>
        </div>
  </div>
</div>
  );
}

export default Login;
