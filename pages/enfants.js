import { Col, Row } from "antd";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Child from "../components/Lists/Child";
import { auth, db } from "../firebaseConfig";
import {subtractTime} from '../modules/time'
import { calculHours } from "../modules/calculHours";
import ChildPlanning from "../components/Plannings/ChildPlanning";

function childrenPage() {
  const [user, loading, error] = useAuthState(auth);
  const [childrenData, setChildrenData] = useState([]);
  const [schoolId, setSchoolId] = useState(null);
  const [schoolRates, setSchoolRates] = useState({})

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
        const q = query(cellPlanningsRef, where("idChild", "==", childID));
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
        return {
          childID,
          hoursReels: calculHours(fetchedPlann, schoolTime),
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
     
      setChildrenData(updatedChildrenData);
    }
  };

    useEffect(() => {
    fetchChildren();
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
    
      />
    );
  });

  return (
    <div className=" border rounded mb-2 text-lg font-semibold">
    <Row className=" p-2 shadow-md  text-lg font-bold">
      <Col span={4}><div className="flex items-center border-r pl-2"><strong>Prénom</strong></div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2"><strong>Niveau</strong></div></Col>
      <Col span={4}><div className="flex items-center border-r pl-2"><strong>Prof</strong></div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2"><strong>Heures accordés</strong></div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2"><strong>Heures Réelles</strong></div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2"><strong>Différence</strong></div></Col>
      <Col span={4}  className=" pl-2"><strong>Planning et Options</strong></Col>
    </Row>
    {children}
  </div>
  );
}

export default childrenPage;