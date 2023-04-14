import { Button, Col, Modal, Row } from "antd";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BeatLoader } from 'react-spinners';
import AddChild from "../components/Lists/AddChild";
import Child from "../components/Lists/Child";
import { auth, db } from "../firebaseConfig";
import { calculHours } from "../modules/calculHours";
import { subtractTime } from '../modules/time';


function childrenPage() {
  const [user, loading, error] = useAuthState(auth);
  const [childrenData, setChildrenData] = useState([]);
  const [schoolId, setSchoolId] = useState(null);
  const [schoolRates, setSchoolRates] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  function convertToMinutes(hoursReels) {
    const [hours, minutes] = hoursReels.split(":");
    return parseInt(hours) * 60 + parseInt(minutes);
  }


    

  const showModal = async () => {
    setIsModalOpen(true);
  }; 

  const handleOk = () => {
    fetchChildren()
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

  const fetchChildPlanning = async (childID, schoolId,schoolTime) => {
    if (schoolId && childID) {
      try {
        const cellPlanningsRef = collection(
          db,
          `schools/${schoolId}/cellPlanning`
        );
        const q = query(cellPlanningsRef, where("childId", "==", childID));
        const querySnapshot = await getDocs(q);
        const fetchedPlann = querySnapshot.docs.reduce((acc, doc) => {
          const { weekday, timeslot, nameAesh, idAesh } = doc.data();
          return {
            ...acc,
            [weekday]: {
              ...acc[weekday],
              [timeslot]: { nameAesh, idAesh },
            },
          };
        }, {});
        
          const hoursReels = calculHours(fetchedPlann, schoolTime)
          const docRef = doc(db,`/schools/${schoolId}/children/${childID}`)
          await updateDoc (
            docRef, {hoursReels:hoursReels}
          )            
        return {
          childID,
          hoursReels : hoursReels,         
          planning: fetchedPlann
        };         

      } catch (error) {
        console.error("Error fetching planning data:", error);
        return null;
      }
    } else {
      console.warn("Cannot fetch planning data for undefined child or school");
      return null;
    }
  };

  const fetchChildren = async (updateall) => {
    console.log("functionsallchildren",updateall)
    
    if (!loading && user) {
      const schoolDoc = await getSchoolDoc();
      const schoolTime = await getSchoolTimeObj();
      setSchoolId(schoolDoc.id)
         
      const childrenSnapshot = await getDocs(collection(schoolDoc.ref, "children"));
      const children = childrenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      if(updateall){
      const childrenPlannings = await Promise.all(children.map(child => fetchChildPlanning(child.id,schoolDoc.id,schoolTime)));
  
      const updatedChildrenData = children.map((child, index) => {
        const planningData = childrenPlannings[index];
        return {
          ...child,
          planning: planningData ? planningData.planning : {},
          hoursReels: planningData ? planningData.hoursReels : '00:00',
        };
      });

      setChildrenData(updatedChildrenData.sort((a, b) => convertToMinutes(subtractTime(a.hoursReels,a.hours)) - convertToMinutes(subtractTime(b.hoursReels,b.hours)))
      );
    }
    else {

      const sortedChildrenData = children
          .sort((a, b) => convertToMinutes(subtractTime(a.hoursReels,a.hours)) - convertToMinutes(subtractTime(b.hoursReels,b.hours)))
         

      setIsLoading(false);
      setChildrenData(sortedChildrenData);
    }
  }
  };

    useEffect(() => {
    fetchChildren();
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

  const children = childrenData.map((data, i) => {
    return (
      <Child
        key={data.id}
        childID={data.id}
        firstName={data.firstName}
        level={data.level}
        teacher={data.teacher}
        hoursReels={data.hoursReels}
        hours={data.hours}
        schoolId={schoolId}
        onSave={fetchChildren}
        schoolRates={schoolRates}
        planning={data.planning}
        option="children"
    
      />
    );
  });

  return (
    <>
    <div className=" border rounded mb-2 text-lg font-semibold">
    <Row className=" p-2 shadow-md  text-lg font-bold">
      <Col span={4}><div className="flex items-center border-r pl-2">Prénom</div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2">Niveau</div></Col>
      <Col span={4}><div className="flex items-center border-r pl-2">Prof</div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2">Heures accordées</div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2">Heures Réelles</div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2">Différence</div></Col>
      <Col span={4}  className=" pl-2">Planning et Options</Col>
    </Row>
    {isLoading ? (
      <div className="flex justify-center items-center "
      style={{ minHeight: "10rem" }}>
        <BeatLoader color="#B8336A" size={15} margin={2} />
      </div>
    ) : (
      children
    )}  
  </div>
  <div className="flex flex-row justify-center" >
  <Button  onClick={showModal}>Ajouter un ou plusieurs enfants</Button>
  </div>
  <Modal
  onOk={handleOk}
  onCancel={handleCancel}
  footer={null}
  width={900}
  open={isModalOpen}

>
<AddChild onSave={handleOk}/>

 

</Modal>
</>
  );
}

export default childrenPage;