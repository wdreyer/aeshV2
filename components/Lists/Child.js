import { Row, Col, Modal, Form } from "antd";
import {
  AiOutlineSave,
  AiOutlineUser,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineCalendar,
} from "react-icons/ai";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

import ChildPlanning from "../Plannings/ChildPlanning";
import { useEffect, useState } from "react";
import { calculHours } from "../../modules/calculHours";
import { subtractTime } from "../../modules/time";
import { BeatLoader } from 'react-spinners';

function Child({
  onSave,
  childID,
  firstName,
  level,
  teacher,
  hours,
  schoolId,
  hoursReels,
  option,
}) {
  const [form] = Form.useForm();
  const { confirm } = Modal;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [planning, setPlanning] = useState({});
  const [user, loading, error] = useAuthState(auth);
  const [schoolTime, setSchoolTime] = useState()
    const [isLoading, setIsLoading] = useState(false);


  const fetchData = async () => {
    setIsLoading(true);
    const durations = await getSchoolTimeObj();
    console.log(durations)
    setSchoolTime(durations);
    const planning = await fetchChildPlanning(childID, schoolId, durations);
    setPlanning(planning.planning);
    setIsLoading(false)
  };

  const getSchoolTimeObj = async () => {
    const schoolDoc = await getSchoolDoc();
    const { timeObj } = schoolDoc.data();
    const durations = Object.entries(timeObj)
      .map(([slot, time]) => {
        const isStart = slot.includes("Start");
        const slotName = slot.split(".")[0];
        if (!isStart) {
          return {
            slot: slotName,
            duration: subtractTime(time, timeObj[`${slotName}.Start`]),
          };
        }
      })
      .filter((duration) => duration !== undefined);

    return durations;
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

  const showModal = () => {
    setIsModalOpen(true);
    fetchData();
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showDeleteConfirm = () => {
    confirm({
      title: "Voulez vous vraiment supprimer cet enfant ?",
      icon: <ExclamationCircleOutlined />,
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk() {
        deleteChild();
      },
      onCancel() {
        return;
      },
    });
  };

  const deleteChild = async () => {
    try {
      const cellPlanningsRef = collection(
        db,
        `schools/${schoolId}/cellPlanning`
      );
      const q = query(cellPlanningsRef, where("childId", "==", childID));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      // Obtenir une référence au document que vous souhaitez supprimer
      const childDocRef = doc(db, `schools/${schoolId}/children`, childID);
      // Supprimer le document
      await deleteDoc(childDocRef);
      onSave();
    } catch (error) {
      console.error(error);
    }
  };

  function convertToMinutes(hoursReels) {
    const [hours, minutes] = hoursReels.split(":");
    return parseInt(hours) * 60 + parseInt(minutes);
  }

  function getBgClass(hoursReels) {
    const minutes = convertToMinutes(hoursReels);

    if (minutes < -120) {
      return "bg-red-300";
    } else if (minutes >= -120 && minutes < 0) {
      return "bg-yellow-300";
    } else if (minutes === 0) {
      return "bg-green-300";
    } else if (minutes > 0 && minutes <= 120) {
      return "bg-blue-300";
    } else {
      return "bg-purple-300";
    }
  }

  return (
    <>
      <div
        className={`border p-1 lg:p-2 shadow-md text-l font-semibold bg-opacity-30 backdrop-blur-md ${getBgClass(
          subtractTime(hoursReels, hours)
        )}`}
      >
        <Row>
        <Col span={option === "children" ? 4 : 5} className="flex items-center pr-1 border-r lg:pl-2">
        <span className="w-full break-words">
    {firstName}
  </span>
</Col>
          <Col
            span={option === "children" ? 3 : 4}
            className="flex items-center border-r pl-2"
          >
          <span className="w-full break-words">
            {level}
            </span>
          </Col>
          <Col span={4} className="flex items-center border-r pl-2">
          <span className="w-full break-words">
          {teacher}</span>
          </Col>

          {option === "children" && (
            <>
              <Col
                span={3}
                className="flex items-center text-center px-2 border-r pl-2"
              >
                {hours}
              </Col>
              <Col
                span={3}
                className="flex items-center text-center px-2 border-r pl-2"
              >
              <span className="w-full break-words">
                {hoursReels}
                </span>
              </Col>
            </>
          )}

          <Col
            span={option === "children" ? 3 : 4}
            className="flex items-center border-r pl-2"
          >
          <span className="w-full break-words">
            {subtractTime(hoursReels, hours)}
            </span>
          </Col>
          <Col
            span={option === "children" ? 3 : 7}
            className="flex-row  text-3xl pl-2 "
          >
            <AiOutlineCalendar
              onClick={showModal}
              className="inline hover:text-black text-gray-600 cursor-pointer mr-2"
            />
            <AiOutlineDelete
              onClick={() => {
                showDeleteConfirm();
              }}
              className="inline hover:text-black text-gray-600 cursor-pointer"
            />
          </Col>
        </Row>
      </div>
      <Modal
        title={'Planning de ' + firstName}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={900}
        open={isModalOpen}     
        wrapClassName={{
          padding: '1rem',
          '@media (min-width: 1024px)': {
            padding: '2rem',
          },
        }}
        
      >
        {isLoading ? (
          <div
            className="flex justify-center items-center"
            style={{ minHeight: '10rem' }}
          >
            <BeatLoader color="#B8336A" size={15} margin={2} />
          </div>
        ) : (
          <ChildPlanning
          
            {...{
              onSave,
              hoursReels,
              firstName,
              childID,
              level,
              teacher,
              hours,
              schoolId,
              planning,
              schoolTime,
            }}
          />
        )}
      </Modal>
    </>
  );
}

export default Child;
