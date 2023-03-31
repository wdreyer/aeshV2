import { AiOutlineCalendar } from "react-icons/ai";
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';


function Header () {

    const handleSignOut = () => {
        signOut(auth)
          .then(() => {
            console.log('Utilisateur déconnecté');
          })
          .catch((error) => {
            console.error('Erreur lors de la déconnexion:', error);
          });
      };

    return (
        <div className="flex flex-row justify-between">
        <h2 className="text-gray-800 font-semibold ml-4 my-4 text-4xl  ">
        <span className="inline-flex items-center">
          <AiOutlineCalendar />
          <span className="ml-2">AeshManager</span>
        </span>
        
      </h2>  
      <button onClick={handleSignOut}>Se déconnecter</button>
        </div>
    )
}

export default Header