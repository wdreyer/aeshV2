import { Button, Modal,Col, Row } from "antd";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Aesh from "../components/Lists/Aesh";
import { auth, db } from "../firebaseConfig";
import {subtractTime} from '../modules/time'
import { calculHours } from "../modules/calculHours";
import AddAesh from "../components/Lists/AddAesh";


function aeshPage() {
  const [user, loading, error] = useAuthState(auth);
  const [aeshData, setAeshData] = useState([]);
  const [schoolId, setSchoolId] = useState(null);
  const [schoolRates, setSchoolRates] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false);

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
     
      setAeshData(updatedAeshData);
    }
  };

    useEffect(() => {
    fetchAesh();
  }, [user, loading]);

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

  const aesh = aeshData.map((data, i) => {
    return (
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
    
      />
    );
  });

  return (
    <>
    <div className=" border rounded mb-2 text-lg font-semibold">
    <Row className=" p-2 shadow-md  text-lg font-bold">
      <Col span={4}><div className="flex items-center border-r pl-2"><strong>Prénom</strong></div></Col>
      <Col span={5}><div className="flex items-center border-r pl-2"><strong>Heures accordés</strong></div></Col>
      <Col span={5}><div className="flex items-center border-r pl-2"><strong>Heures Réelles</strong></div></Col>
      <Col span={5}><div className="flex items-center border-r pl-2"><strong>Différence</strong></div></Col>
      <Col span={5}  className=" pl-2"><strong>Planning et Options</strong></Col>
    </Row>
    {aesh}
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