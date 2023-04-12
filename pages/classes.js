import { Checkbox } from "antd";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
  doc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import ChildClassPlanning from "../components/Plannings/ChildClassPlanning";
import { auth, db } from "../firebaseConfig";
import { subtractTime } from "../modules/time";
import { calculHours } from "../modules/calculHours";
import { BeatLoader } from 'react-spinners';


function classePage() {
  const [user, loading, error] = useAuthState(auth);
  const [childrenData, setChildrenData] = useState([]);
  const [schoolId, setSchoolId] = useState(null);
  const [schoolRates, setSchoolRates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
const [levels, setLevels] = useState([]);
const [teachers, setTeachers] = useState([]);
  const [levelsData, setLevelsData] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState(levels);
  const [selectedTeachers, setSelectedTeachers] = useState(teachers);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    fetchLevelsData();
  }, [user, loading]);

  useEffect(() => {
    setSelectedLevels(levels);
    setSelectedTeachers(teachers);
  }, [levels, teachers]);


  useEffect(() => {
    if (selectedLevels.length > 0) {
      const newSelectedTeachers = selectedLevels
        .map((level) =>
          levelsData.find((l) => l.name === level) || { teachers: [] }
        )
        .map((levelData) => levelData.teachers)
        .flat();
      if (newSelectedTeachers.length > 0) {
        setSelectedTeachers(newSelectedTeachers);
      } else {
        setSelectedTeachers([]);
      }
    } else {
      setSelectedTeachers([]);
    }
  }, [selectedLevels, levelsData]);

  const fetchLevelsData = async () => {
    const schoolDoc = await getSchoolDoc();
    const levelsData = schoolDoc.data().levelsData;
    setLevelsData(levelsData);

    // Create a list of distinct levels and teachers
    const levels = levelsData.map((l) => l.name);
    const teachers = [...new Set(levelsData.flatMap((l) => l.teachers))];
  
    setLevels(levels);
    setTeachers(teachers);
  }

  const filteredChildren = () => {
    if (selectedTeachers.length === 0){
      return filtered = [];
    }


    let filtered = childrenData;
    if (selectedLevels.length > 0) {
      filtered = filtered.filter((child) => selectedLevels.includes(child.level));
    } else {
      filtered = [];
    }
    if (selectedTeachers.length > 0) {
      filtered = filtered.filter((child) =>
        selectedTeachers.includes(child.teacher)
      );
    }
    return filtered;
  };

  const levelCheckboxes = levels.map((level) => (
    <Checkbox key={level} value={level}>
      {level}
    </Checkbox>
  ));

  const teacherCheckboxes = selectedLevels
  .flatMap((level) => levelsData.find((l) => l.name === level) || { teachers: [] })
  .map((levelData) => levelData.teachers)
  .flat()
  .map((teacher) => (
    <Checkbox key={teacher} value={teacher}>
      {teacher}
    </Checkbox>
  ));


const selectAllLevels = () => {
    setSelectedLevels(levels);
  };
  
  const deselectAllLevels = () => {
    setSelectedLevels([]);
  };
  
  const selectAllTeachers = () => {
    setSelectedTeachers(teachers);
  };
  
  const deselectAllTeachers = () => {
    setSelectedTeachers([]);
  };
  
  const handleLevelChange = (level, checked) => {
    let newSelectedLevels = [...selectedLevels];
    if (checked) {
      newSelectedLevels.push(level);
    } else {
      newSelectedLevels = newSelectedLevels.filter((l) => l !== level);
    }
    setSelectedLevels(newSelectedLevels);
  
    const teachersForSelectedLevels = newSelectedLevels
      .flatMap((lvl) => levelsData[lvl]);
    setSelectedTeachers(teachersForSelectedLevels);
  };


  const showModal = async () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    fetchChildren();
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

  const fetchChildPlanning = async (childID, schoolId, schoolTime) => {
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

        const hoursReels = calculHours(fetchedPlann, schoolTime);
        const docRef = doc(db, `/schools/${schoolId}/children/${childID}`);
        await updateDoc(docRef, { hoursReels: hoursReels });
        return {
          childID,
          hoursReels: hoursReels,
          planning: fetchedPlann,
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
      setSchoolId(schoolDoc.id);

      const childrenSnapshot = await getDocs(
        collection(schoolDoc.ref, "children")
      );
      const children = childrenSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const childrenPlannings = await Promise.all(
        children.map((child) =>
          fetchChildPlanning(child.id, schoolDoc.id, schoolTime)
        )
      );

      // Combine children data with their respective planning data
      const updatedChildrenData = children.map((child, index) => {
        const planningData = childrenPlannings[index];
        return {
          ...child,
          planning: planningData ? planningData.planning : {},
          hoursReels: planningData ? planningData.hoursReels : "00:00",
        };
      });

      setChildrenData(updatedChildrenData);
      setIsLoading(false);
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
          duration: subtractTime(time, timeObj[`${slotName}.Start`]),
        };
      }
    });

    return durations.filter((duration) => duration !== undefined);
  };

  const filteredChildrenList = filteredChildren().map((data, i) => {
    return (
      <ChildClassPlanning
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
    <>
      <div className="w-auto border mb-2 p-1 flex flex-col items-center justify-between">
        Tri par classe :
      </div>
      <div className="my-3 text-center">
      <Checkbox.Group
        className="w-auto border mb-1 p-1 flex flex-row items-center flex-wrap justify-center"
        onChange={(checkedValues) => setSelectedLevels(checkedValues)}
        value={selectedLevels}
      >
        {levelCheckboxes}
      </Checkbox.Group>

      <Checkbox.Group
      className="w-auto border mt-1 mb-2 p-1 flex flex-row items-center flex-wrap justify-center"
      onChange={(checkedValues) => setSelectedTeachers(checkedValues)}
      value={selectedTeachers}
    >
      {teacherCheckboxes}
    </Checkbox.Group>
    </div>
      <div className="flex flex-wrap justify-center flex-row mb-2 text-lg font-semibold">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <BeatLoader color="#38B2AC" size={15} margin={2} />
        </div>
      ) : (
        filteredChildrenList
      )}   
     
      </div>
    </>
  );
}

export default classePage;
