import { Button, Modal, Col, Row } from "antd";
import { collection, getDocs, query, updateDoc, where, doc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Child from "../components/Lists/Child";
import { auth, db } from "../firebaseConfig";
import {subtractTime} from '../modules/time'
import { calculHours } from "../modules/calculHours";
import AddChild from "../components/Lists/AddChild";

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':');
  return parseInt(hours) * 60 + parseInt(minutes);
};

const minutesToTime = (minutes) => {
  const isNegative = minutes < 0;
  if (isNegative) {
    minutes = Math.abs(minutes);
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const formattedTime = `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;

  return isNegative ? `-${formattedTime}` : formattedTime;
};


function Home() {
  const [user, loading, error] = useAuthState(auth);
  const [childrenData, setChildrenData] = useState({ total: 0, hours: "00:00", hoursReels: "00:00", difference: "00:00" });
  const [aeshData, setAeshData] = useState({ total: 0, hours: "00:00", hoursReels: "00:00", difference: "00:00" });

  const getSchoolDoc = async () => {
    const q = query(collection(db, "schools"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
  };


  const fetchData = async (schoolDocId, type, setData) => {
    const dataRef = collection(db, "schools", schoolDocId, type);
    const dataSnapshot = await getDocs(dataRef);

    // Total
    const total = dataSnapshot.size;

    let totalMinutes = 0;
    let totalMinutesReels = 0;

    dataSnapshot.forEach((item) => {
      const itemData = item.data();
      const itemHours = itemData.hours;
      const itemHoursReels = itemData.hoursReels;

      totalMinutes += timeToMinutes(itemHours);
      totalMinutesReels += timeToMinutes(itemHoursReels);
    });

    // Heures totales
    const hours = minutesToTime(totalMinutes);

    // Heures réelles totales
    const hoursReels = minutesToTime(totalMinutesReels);

    // Différence totale
    const difference = minutesToTime(totalMinutesReels - totalMinutes);

    setData({ total, hours, hoursReels, difference });
  };

  useEffect(() => {
    if (user) {
      getSchoolDoc().then((schoolDoc) => {
        if (schoolDoc) {
          const schoolDocId = schoolDoc.id;
          fetchData(schoolDocId, "children", setChildrenData);
          fetchData(schoolDocId, "aesh", setAeshData);
        }
      });
    }
  }, [user]);
  return (
    <div className=" flex-col lg:flex-row flex  items-center justify-evenly gap-4 flex-wrap" >
    <div className="border w-full lg:w-2/5 flex flex-col rounded py-2  justify-center text-lg font-semibold  shadow-md">
    <span className="text-center text-xl mb-2" > Statistiques Enfants : </span>
    <div className=" rounded mb-2 text-m  font-semibold  flex flex-col" >
    <div className="flex flex-row border font-semibold p-2 justify-between"><span >Nbre d/enfants :</span><span>{childrenData.total}</span></div>
    <div className="flex flex-row border  font-semibold p-2 justify-between" > <span  >Heures Accordées :</span><span>{childrenData.hours}</span></div>
    <div className="flex flex-row border font-semibold p-2 justify-between"><span  >Heures Réelles :</span><span>{childrenData.hoursReels}</span></div>
    <div className="flex flex-row border   font-semibold p-2 justify-between" ><span >Différence :</span><span>{childrenData.difference}</span></div>
    </div>
    </div>
    <div className="border w-full lg:w-2/5 flex flex-col rounded py-2  justify-center text-lg font-semibold  shadow-md">
    <span className="text-center text-xl mb-2" > Statistiques Aesh : </span>
    <div className=" rounded mb-2 text-m  font-semibold  flex flex-col" >
    <div className="flex flex-row border   font-semibold p-2 justify-between"><span >Nbre d/enfants :</span><span>{aeshData.total}</span></div>
    <div className="flex flex-row border  font-semibold p-2 justify-between" > <span  >Heures Accordés :</span><span>{aeshData.hours}</span></div>
    <div className="flex flex-row border font-semibold p-2 justify-between"><span  >Heures Réelles :</span><span>{aeshData.hoursReels}</span></div>
    <div className="flex flex-row border   font-semibold p-2 justify-between" ><span >Différence :</span><span>{aeshData.difference}</span></div>
    </div>
    </div>
    <div className="border w-full lg:w-2/5 flex flex-col rounded py-2  justify-center text-lg font-semibold  shadow-md">
    <span className="text-center text-xl mb-2" > Enfants avec la diff les plus importantes : </span>
    <div className=" rounded mb-2 text-m  font-semibold  flex flex-col" >
    <div className="flex flex-row border   font-semibold p-2 justify-between"><span >Nbre d/enfants :</span><span>{childrenData.total}</span></div>
    <div className="flex flex-row border  font-semibold p-2 justify-between" > <span  >Heures Accordés :</span><span>{childrenData.total}</span></div>
    <div className="flex flex-row border font-semibold p-2 justify-between"><span  >Heures Réelles :</span><span>{childrenData.total}</span></div>
    <div className="flex flex-row border   font-semibold p-2 justify-between" ><span >Différence :</span><span>{childrenData.total}</span></div>
    </div>
    </div>
    <div className="border w-full lg:w-2/5 flex flex-col rounded py-2  justify-center text-lg font-semibold  shadow-md">
    <span className="text-center text-xl mb-2" > Aesh avec la diff les plus importantes : </span>
    <div className=" rounded mb-2 text-m  font-semibold  flex flex-col" >
    <div className="flex flex-row border   font-semibold p-2 justify-between"><span >Nbre d/enfants :</span><span>{childrenData.total}</span></div>
    <div className="flex flex-row border  font-semibold p-2 justify-between" > <span  >Heures Accordés :</span><span>{childrenData.total}</span></div>
    <div className="flex flex-row border font-semibold p-2 justify-between"><span  >Heures Réelles :</span><span>{childrenData.total}</span></div>
    <div className="flex flex-row border   font-semibold p-2 justify-between" ><span >Différence :</span><span>{childrenData.total}</span></div>
    </div>
    </div>
  </div>
  )
}

export default Home;