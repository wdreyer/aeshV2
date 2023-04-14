import { useState } from "react";
import Link from "next/link";
import { AiOutlineCalendar } from "react-icons/ai";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../firebaseConfig";
import Modal from "react-modal";
import { Link as ScrollLink } from 'react-scroll';
import { motion } from 'framer-motion';
import { animateScroll } from 'react-scroll';
import { useInView } from 'react-intersection-observer';
import Feature from "./Landing/Feature";



const auth = getAuth(app);

Modal.setAppElement("#__next");

function Landing() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const scrollToTop = () => {
    animateScroll.scrollToTop({ duration: 500 }); // Changez la durée (en ms) pour ajuster la vitesse de défilement
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  
  const Section = ({ id, title }) => (
    <motion.div
      id={id}
      className="..."
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5 }}
      variants={fadeIn}
    >
      <h2>{title}</h2>
    </motion.div>
  );

  const testForm = () => {
    event.preventDefault();
    signInWithEmailAndPassword(auth,"test@test.com", "azerty")
  }

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

  const fadeInWithDelay = index => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: index * 0.3 } },
  });
  
  const SectionImage = ({ src, alt, index }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });
  
    return (
      <motion.div
        ref={ref}
        className="bg-gray-200 rounded-lg p-4"
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={fadeInWithDelay(index)}
      >
        <img src={src} alt={alt} className="rounded-lg w-full" />
      </motion.div>
    );
  };

  return (
    <>
    <div >
    <div id="top"></div>
      <title>AeshManager</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <header className="bg-white shadow-md border fixed w-full z-50 h-[70px]  top-0">
        <div className="max-w-7xl mx-auto py-2 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row items-center justify-between">
            <h2 onClick={scrollToTop} className="text-gray-600 cursor-pointer hover:text-black flex flex-row items-center justify-between font-semibold my-1 text-4xl">
                <AiOutlineCalendar />
                <span className="ml-2">AeshManager</span>
            </h2>
            <div className="flex flex-row gap-20">
            <ul className="flex flex-row justify-center items-center ">
            <li>
              <ScrollLink
                to="section1"
                smooth={true}
                duration={500}
                offset={-70}
                className="block cursor-pointer px-8 py-2 rounded-md text-gray-700 uppercase transition-all duration-300 ease-in-out relative overflow-hidden group"
                activeClass="text-fad4d8"
              >
                Fonctionnalités
                <span className="absolute h-0.5 w-full bg-fad4d8 bottom-0 left-0 transform scale-x-0 transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
              </ScrollLink>
            </li>
            <li>
              <ScrollLink
                to="section2"
                smooth={true}
                duration={500}
                offset={-70}
                className="block cursor-pointer px-8 py-2 rounded-md text-gray-700 uppercase transition-all duration-300 ease-in-out relative overflow-hidden group"
                activeClass="text-fad4d8"
              >
                Tarifs
                <span className="absolute h-0.5 w-full bg-fad4d8 bottom-0 left-0 transform scale-x-0 transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
              </ScrollLink>
            </li>
            <li>
              <ScrollLink
                to="section3"
                smooth={true}
                duration={500}
                offset={-70}
                className="block cursor-pointer px-8 py-2 rounded-md text-gray-700 uppercase transition-all duration-300 ease-in-out relative overflow-hidden group"
                activeClass="text-fad4d8"
              >
                A propos
                <span className="absolute h-0.5 w-full bg-fad4d8 bottom-0 left-0 transform scale-x-0 transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
              </ScrollLink>
            </li>
          </ul>
        </div>    
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

      <main className="h-[35rem] pt-[70px] bg-gradient-to-r from-[#FAD4E8] via-pink-custom to-pink-custom flex flex-row items-center justify-center px-4 sm:px-6 lg:px-8 ">
        <div className="w-[38rem] text-center flex flex-col justify-center items-center h-full  m-4 p-4">
          <h2 className="text-2xl  mb-6">
          Simplifier vous la création  <strong>des plannings </strong> pour les <strong>Aesh</strong> et <strong>les enfants</strong>.
          </h2>
          <p className="text-lg mb-8">
            AeshManager est une solution en ligne pour les directeurs d'école et les responsables de l'éducation. En quelques clics, vous pouvez assigner des AESH aux élèves et inversement, vous pouvez calculer leurs heures réelles ainsi que la différence avec leurs contrats ou leurs heures accordées.
          </p>
          <button
          className="drop-shadow-md bg-[#D4FAE3] hover:text-black hover:bg-[#D8FAD4] text-gray-700 font-bold pt-2 py-2 px-4 rounded-3xl border focus:outline-none focus:shadow-outline"
          onClick={() => testForm()}
        >
          Essayer Gratuitement
        </button>
        </div>
        <div className="w-[38rem] h-full  m-4 flex justify-center items-center" >
        <img
              src="MockupAeshM.png"
              alt="Capture d'écran 1"
              className="rounded-lg w-full"
            />
        </div>
      </main>


      <Section id="section1" />
      <div className="bg-slate-100 h-[35rem]  justify-start items-center flex flex-col p-4">     
         <h3 className="text-2xl font-semibold w-80 mb-6 text-center">
          Toutes les fonctionnalités dont vous avez besoin
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> 
          <Feature
            icon="build"
            title="Création d'école et des classes"
            content="Créer de zéro votre école, les paramètres des créneaux horaires, les niveaux et les classes."
            color="blue"
          />

          <Feature
            icon="usergroup"
            title="Ajout d'enfants et d'Aesh"
            content="Ajouter un nombre illimité d'enfants et d'Aeshs et accordez-leur les heures qu'ils ont besoin ou les heures de leurs contrats."
            color="green"
          />

          <Feature
            icon="edit"
            title="Edition des plannings"
            content="Assigner des Aesh ou Enfants à chaque créneau horaire et voyez l'évolution en temps réel des plannings dépendants."
            color="blue"
          />

          <Feature
            icon="dashboard"
            title="Suivi des temps"
            content="Depuis le dashboard et à tout moment suivez le temps de chaque enfant et de chaque aesh afin que leurs plannings correspondent bien à leurs heures."
            color="green"
          />
        </div>
      </div>
      <Section />
      <Section id="section2" />
      <div className=" bg-white h-[30rem] flex flex-col p-4 ">
      <h3 className="text-2xl font-semibold mb-6 text-center">
      Tarifs :
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    <SectionImage
    src="https://via.placeholder.com/300x200"
    alt="Capture d'écran 1"
    index={1}
  />
  <SectionImage
    src="https://via.placeholder.com/300x200"
    alt="Capture d'écran 2"
    index={0}
  />
  <SectionImage
    src="https://via.placeholder.com/300x200"
    alt="Capture d'écran 3"
    index={1}
  />
    </div>
    </div>
    <Section/>

      <section  id="section3" className="py-4 bg-slate-100 px-4 sm:px-6 lg:px-8">
      <h3 className="text-2xl font-semibold mb-6 text-center">
      A propos :
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

    export default Landing;