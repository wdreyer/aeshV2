import { Button, Modal,Col, Row } from "antd";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Aesh from "../components/Lists/Aesh";
import AeshClassPlanning from "../components/Plannings/AeshClassPlanning";
import { auth, db } from "../firebaseConfig";
import {subtractTime} from '../modules/time'
import { calculHours } from "../modules/calculHours";
import AddAesh from "../components/Lists/AddAesh";
import { BeatLoader } from 'react-spinners';

function aeshPage() {
  const [user, loading, error] = useAuthState(auth);
  const [aeshData, setAeshData] = useState([]);
  const [schoolId, setSchoolId] = useState(null);
  const [schoolRates, setSchoolRates] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [displayList, setDisplayList] = useState(true);

  function convertToMinutes(hoursReels) {
    const [hours, minutes] = hoursReels.split(":");
    return parseInt(hours) * 60 + parseInt(minutes);
  }



  const showModal = async () => {
    setIsModalOpen(true);
  }; 

  const handleOk = () => {
    fetchAesh()
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

   const getSchoolDoc = async () => {
    const q = query(collection(db, "schools"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
  };

  const fetchAeshPlanning = async (idAesh, schoolId,schoolTime) => {
   
    
    if (schoolId && idAesh) {
      try {
        const cellPlanningsRef = collection(
          db,
          `schools/${schoolId}/cellPlanning`
        );
        const q = query(cellPlanningsRef, where("idAesh", "==", idAesh));
        const querySnapshot = await getDocs(q);
        const fetchedPlann = querySnapshot.docs.reduce((acc, doc) => {
          const { weekday, timeslot, nameChild, childId } = doc.data();
          return {
            ...acc,
            [weekday]: {
              ...acc[weekday],
              [timeslot]: { nameChild, childId },
            },
          };
        }, {});

        const hoursReels = calculHours(fetchedPlann, schoolTime)
        const docRef = doc(db,`/schools/${schoolId}/aesh/${idAesh}`)
        await updateDoc (
          docRef, {hoursReels:hoursReels}
        )  

        return {
          idAesh,
          hoursReels: hoursReels,
          planning: fetchedPlann
        };
      } catch (error) {
        console.error("Error fetching planning data:", error);
        return null;
      }
    } else {
      console.warn("Cannot fetch planning data for undefined aesh or school");
      return null;
    }
  };

  const fetchAesh = async () => {
    if (!loading && user) {
      const schoolDoc = await getSchoolDoc();
      const schoolTime = await getSchoolTimeObj();
      setSchoolId(schoolDoc.id)
         
      const aeshSnapshot = await getDocs(collection(schoolDoc.ref, "aesh"));
      const aesh = aeshSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      const aeshPlannings = await Promise.all(aesh.map(aesh => fetchAeshPlanning(aesh.id,schoolDoc.id,schoolTime)));
  
      // Combine aesh data with their respective planning data
      const updatedAeshData = aesh.map((aesh, index) => {
        const planningData = aeshPlannings[index];
        return {
          ...aesh,
          planning: planningData ? planningData.planning : {},
          hoursReels: planningData ? planningData.hoursReels : '00:00',
        };
      });
      const sortedChildrenData = updatedAeshData.sort((a, b) => convertToMinutes(subtractTime(a.hoursReels,a.hours)) - convertToMinutes(subtractTime(b.hoursReels,b.hours)))
      setAeshData(sortedChildrenData);
      setIsLoading(false);
    }
  };

    useEffect(() => {
    fetchAesh();
  }, []);

  const getSchoolTimeObj = async () => {
    const schoolDoc = await getSchoolDoc();
      const { timeObj } = schoolDoc.data();
      const durations = Object.entries(timeObj).map(([slot, time]) => {
        // Check if this is a start or end time
        const isStart = slot.includes("Start");
        const slotName = slot.split(".")[0];
        if (!isStart) {
          return {
            slot: slotName,
            duration: subtractTime(time, timeObj[`${slotName}.Start`])
          };
        }
      });
    
      return durations.filter(duration => duration !== undefined);
  };

  const aesh = aeshData.map((data, i) => (
    displayList ? (
      <Aesh
        key={data.id}
        idAesh={data.id}
        firstName={data.firstName}
        level={data.level}
        teacher={data.teacher}
        hoursReels={data.hoursReels}
        hours={data.hours}
        schoolId={schoolId}
        onSave={fetchAesh}
        schoolRates={schoolRates}
        planning={data.planning}
        option="aesh"
      />
    ) : (
      <AeshClassPlanning
        key={data.id}
        idAesh={data.id}
        firstName={data.firstName}
        level={data.level}
        teacher={data.teacher}
        hoursReels={data.hoursReels}
        hours={data.hours}
        schoolId={schoolId}
        onSave={fetchAesh}
        schoolRates={schoolRates}
        planning={data.planning}
        option="aesh"
        // Ajoutez les props spécifiques à AeshClassPlanning ici
      />
    )
  ));
  

  return (
    <>
      <buttons
      className=" cursor-pointer text-black font-bold py-1 px-4 rounded"
      onClick={() => setDisplayList(!displayList)}
    >
      Basculer la Vue
    </buttons>
    <div className={`${displayList ? '' : 'flex flex-wrap '} border rounded mb-2 text-lg font-semibold`}>
  
    <Row className={`p-2 shadow-md text-lg font-bold ${displayList ? '' : 'hidden'}`}>
      <Col span={4}><div className="flex items-center border-r pl-2">Prénom</div></Col>
      <Col span={5}><div className="flex items-center border-r pl-2">Heures accordés</div></Col>
      <Col span={5}><div className="flex items-center border-r pl-2">Heures Réelles</div></Col>
      <Col span={5}><div className="flex items-center border-r pl-2">Différence</div></Col>
      <Col span={5}  className=" pl-2">Planning et Options</Col>
    </Row>
    {isLoading ? (
      <div className="flex  justify-center items-center "
      style={{ minHeight: "30rem" }}>
        <BeatLoader color="#B8336A" size={15} margin={2} />
      </div>
    ) : (
      aesh
    )}  
  </div>
  <div className="flex flex-row justify-center" >
  <Button  onClick={showModal}>Ajouter un ou plusieurs Aesh</Button>
  </div>
  <Modal
  onOk={handleOk}
  onCancel={handleCancel}
  footer={null}
  width={900}
  open={isModalOpen}
>
<AddAesh onSave={handleOk}/>
</Modal>
</>
  );
}

export default aeshPage;