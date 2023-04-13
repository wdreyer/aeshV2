import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Child from "./Child";
import { auth, db } from "../../firebaseConfig";
import { calculHours } from "../../modules/calculHours";
import { subtractTime } from '../../modules/time';
import { Button, Col, Modal, Row } from "antd";
import { BeatLoader } from 'react-spinners';


function ChildDashboard() {

    const [user, loading, error] = useAuthState(auth);
    const [childrenData, setChildrenData] = useState([]);
    const [schoolId, setSchoolId] = useState(null);
    const [schoolRates, setSchoolRates] = useState({})
    const [isLoading, setIsLoading] = useState(true);
    function convertToMinutes(hoursReels) {
      const [hours, minutes] = hoursReels.split(":");
      return parseInt(hours) * 60 + parseInt(minutes);
    }



    useEffect(() => {
        fetchChildren();
      }, []);

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

    const fetchChildren = async () => {

        if (!loading && user) {
          const schoolDoc = await getSchoolDoc();
          const schoolTime = await getSchoolTimeObj();
          setSchoolId(schoolDoc.id)
             
          const childrenSnapshot = await getDocs(collection(schoolDoc.ref, "children"));
          const children = childrenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
          const childrenPlannings = await Promise.all(children.map(child => fetchChildPlanning(child.id,schoolDoc.id,schoolTime)));
      
          // Combine children data with their respective planning data
          const updatedChildrenData = children.map((child, index) => {
            const planningData = childrenPlannings[index];
            return {
              ...child,
              planning: planningData ? planningData.planning : {},
              hoursReels: planningData ? planningData.hoursReels : '00:00',
            };
          });
          const sortedChildrenData = updatedChildrenData
          .sort((a, b) => convertToMinutes(subtractTime(a.hoursReels,a.hours)) - convertToMinutes(subtractTime(b.hoursReels,b.hours)))
          .slice(0, 5);
          setIsLoading(false);
          setChildrenData(sortedChildrenData);
        }
      };

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

  const getSchoolDoc = async () => {
    const q = query(collection(db, "schools"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
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
        option="dashboard"
      />
    );
  });

  return (
    <>
    <Row className=" p-2 shadow-md  text-lg font-bold">
    <Col span={4}><div className="flex items-center border-r pl-2">Prénom</div></Col>
    <Col span={4}><div className="flex items-center border-r pl-2">Niveau</div></Col>
    <Col span={4}><div className="flex items-center border-r pl-2">Prof</div></Col>
    <Col span={5}><div className="flex items-center border-r pl-2">Différence</div></Col>
    <Col span={7}  className=" pl-2">Planning et Options</Col>
  </Row>
  {isLoading ? (
    <div className="flex justify-center items-center"
      style={{ minHeight: "10rem" }}>
      <BeatLoader color="#B8336A" size={15} margin={2} />
    </div>
  ) : (
    children
  )} 

    </>
  )
  

}

export default ChildDashboard ;



