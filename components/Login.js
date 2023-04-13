import { useState } from "react";
import Link from "next/link";
import { AiOutlineCalendar } from "react-icons/ai";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../firebaseConfig";
import Modal from "react-modal";

const auth = getAuth(app);

Modal.setAppElement("#__next");

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleForm = () => {
    event.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Utilisateur connecté:", userCredential.user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setConnectionError("Mauvais mail ou/et mdp");
        return;
      });
  };

  return (
    <>
    <div >
      <title>AeshManager</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <header className="bg-white shadow-md border">
        <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-600 font-semibold my-1 text-4xl">
              <span className="inline-flex items-center">
                <AiOutlineCalendar />
                <span className="ml-2">AeshManager</span>
              </span>
            </h2>
            <div className="flex items-center">
              <button
              className="drop-shadow-md bg-[#D4FAE3] hover:text-black hover:bg-[#D8FAD4] text-gray-700 font-bold pt-2 py-2 px-4 rounded-3xl border focus:outline-none focus:shadow-outline"
              onClick={() => setModalIsOpen(true)}
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="h-[28rem] bg-gradient-to-r from-[#FAD4E8] via-pink-custom to-pink-custom flex flex-row items-center justify-center px-4 sm:px-6 lg:px-8 ">
        <div className="w-[38rem] text-center flex flex-col justify-center items-center h-full  m-4 p-4">
          <h2 className="text-2xl  mb-6">
          Simplifier vous la création  <strong>des plannings </strong> pour les <strong>Aesh</strong> et <strong>les enfants</strong> qui en ont besoin.
          </h2>
          <p className="text-lg mb-8">
            AeshManager est une solution en ligne pour les directeurs d'école et les responsables de l'éducation. En quelques clics, vous pouvez assigner des AESH aux élèves et inversement, vous pouvez calculer leurs heures réelles ainsi que la différence avec leurs contratsou leurs heures accordées.
          </p>
          <button
          className="drop-shadow-md bg-[#D4FAE3] hover:text-black hover:bg-[#D8FAD4] text-gray-700 font-bold pt-2 py-2 px-4 rounded-3xl border focus:outline-none focus:shadow-outline"
          onClick={() => setModalIsOpen(true)}
        >
          Essayer Gratuitement
        </button>
        </div>
        <div className="w-[38rem] h-full  m-4 flex justify-center items-center" >
        <img
              src="MockupAeshM.png"
              alt="Capture d'écran 1"
              className="rounded-lg w-full"
              style={{ width: '300px', height: '200px', textAlign: 'center' }}
              
            />
        </div>
      </main>

      <section className="mt-16 px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-semibold mb-6 text-center">
          Découvrez AeshManager en images
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-200 rounded-lg p-4">
            <img
              src="https://via.placeholder.com/300x200"
              alt="Capture d'écran 1"
              className="rounded-lg w-full"
            />
          </div>
          <div className="bg-gray-200 rounded-lg p-4">
            <img
              src="https://via.placeholder.com/300x200"
              alt="Capture d'écran 2"
              className="rounded-lg w-full"
            />
          </div>
          <div className="bg-gray-200 rounded-lg p-4">
            <img
              src="https://via.placeholder.com/300x200"
              alt="Capture d'écran 3"
              className="rounded-lg w-full"
            />
          </div>
        </div>
      </section>
    </div>
    
    <Modal
    isOpen={modalIsOpen}
    onRequestClose={() => setModalIsOpen(false)}
    className="bg-white shadow-md rounded  px-8 pt-6 pb-8 mb-4 w-80 mx-auto mt-12"
    overlayClassName="fixed inset-0 bg-gray-700 bg-opacity-50 flex items-center justify-center"
  >
    <h2 className="text-gray-600 font-semibold mb-4 text-4xl text-center">
      <span className="inline-flex items-center">
        <AiOutlineCalendar />
        <span className="ml-2">Connexion</span>
      </span>
    </h2>
    <form>
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
      {connectionError && (
        <span className="text-red-600">{connectionError} </span>
      )}
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
    <div className="pt-4 flex flex-col items-center justify-between text-sm">
      <Link href="/signUp">
        <a className="text-grey-500 hover:text-grey-900">
          Pas de compte ? Inscrivez-vous
        </a>
      </Link>
    </div>
  </Modal>
</>
  )}

    export default Login;