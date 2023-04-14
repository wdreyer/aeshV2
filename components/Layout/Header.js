import { AiOutlineCalendar, AiOutlineHome,AiOutlineSetting, AiOutlinePoweroff } from "react-icons/ai";
import { FaUserCog } from "react-icons/fa";
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { db } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import Link from "next/link";

import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { useRouter } from 'next/router';
import { useState, useEffect } from "react";


function Header() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [schoolName, setSchoolName] = useState('');
  
  const getSchoolDoc = async () => {
    const q = query(
      collection(db, "schools"),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
  };

  useEffect(() => {
    const fetchSchoolDoc = async () => {
      const schoolDoc = await getSchoolDoc();
      if (schoolDoc) {
        setSchoolName(schoolDoc.data().schoolName);
      }
    };
    fetchSchoolDoc();
  }, []);



  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        router.push('/')
        console.log('Utilisateur déconnecté');

      })
      .catch((error) => {
        console.error('Erreur lors de la déconnexion:', error);
      });
  };


  return (
    < >
    <header className=" flex justify-between items-center p-2 bg-opacity-60 bg-[#FAD4D8]">
    <div className="flex mt-auto ">  
    <h2 className="text-gray-800 font-semibold text-4xl cursor-pointer">
    <Link href="/">
        <span className="inline-flex items-center">
          <AiOutlineCalendar />
          <span className="ml-2">AeshManager</span>
        </span>
        </Link>
      </h2>
      <span className="flex ml-2 items-end ">
      <span className="ml-2">{schoolName}</span>
    </span>
    </div>
    

      <div className="flex items-center">
       
        <Link href="/reglages">

        <a className="text-gray-600 font-semibold hover:text-gray-900 py-2 px-4 rounded inline-flex items-center">
      < AiOutlineSetting className="mr-2"/> Réglages
        </a>
      </Link>
        <button
          onClick={handleSignOut}
          className=" text-gray-600 font-semibold hover:text-gray-900 py-2 px-4 rounded inline-flex items-center"
        >
          <AiOutlinePoweroff className="mr-2" />
          Déconnexion
        </button>
      </div>
      
    </header>
    <nav className="  w-100 min-h-0 border  border-gray-100">
    <ul className="flex flex-row justify-center border items-center shadow-2xl">
      <li>
        <Link href="/enfants">
          <a className="block px-8 py-2  rounded-md bg-white text-gray-700 uppercase transition-all duration-300 ease-in-out relative overflow-hidden group">
            Enfants
            <span className="absolute h-0.5 w-full bg-fad4d8 bottom-0 left-0 transform scale-x-0 transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
          </a>
        </Link>
      </li>
      <li>
        <Link href="/aesh">
          <a className="block px-8 py-2  rounded-md bg-white text-gray-700 uppercase transition-all duration-300 ease-in-out relative overflow-hidden group">
            Aesh
            <span className="absolute h-0.5 w-full bg-fad4d8 bottom-0 left-0 transform scale-x-0 transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
          </a>
        </Link>
      </li>
      <li>
        <Link href="/classes">
          <a className="block px-8 py-2  rounded-md bg-white text-gray-700 uppercase transition-all duration-300 ease-in-out relative overflow-hidden group">
            Classes
            <span className="absolute h-0.5 w-full bg-fad4d8 bottom-0 left-0 transform scale-x-0 transition-transform duration-300 ease-in-out group-hover:scale-x-100"></span>
          </a>
        </Link>
      </li>
    </ul>
  </nav>
  </>
  )
}

export default Header;