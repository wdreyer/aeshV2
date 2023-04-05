import { Row, Col, Modal, Form } from "antd";
import {
  AiOutlineSave,
  AiOutlineUser,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineCalendar,
} from "react-icons/ai";
import { collection, query, where, getDocs, writeBatch,doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import ChildPlanning from "../Plannings/ChildPlanning";

import { useState } from "react";
import { useStepContext } from "@mui/material";
function Child({onSave, childID, firstName, level, teacher, hours, hoursReels,schoolID }) {
  const [form] = Form.useForm();
  const { confirm } = Modal;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [fetchedPlanning, setFetchedPlanning]= useState({})

  
  const fetchPlanning = async () => {
    return new Promise(async (resolve) => {
      if (schoolID && childID) {
        const cellPlanningsRef = collection(
          db,
          `schools/${schoolID}/cellPlanning`
        );
        const q = query(cellPlanningsRef, where("idChild", "==", childID));
        const querySnapshot = await getDocs(q);
        const fetchedPlann = querySnapshot.docs.reduce((acc, doc) => {
          const { weekday, timeslot, nameAesh, idAesh  } = doc.data();
          return {
            ...acc,
            [weekday]: {
              ...acc[weekday],
              [timeslot]: {  nameAesh, idAesh },
            },
          };
        }, {});
        resolve(fetchedPlann);
      } else {
        console.warn(`Cannot fetch planning data for undefined child or school`);
        resolve();
      }
    });
  };

  const showModal = async () => {
   setFetchedPlanning(await fetchPlanning());
    
    console.log("ici ?",fetchedPlanning);
    setIsModalOpen(true);
  };


  const handleOk = () => {

    setIsModalOpen(false);
  };
  const handleCancel = () => {

    setIsModalOpen(false);
  };


  return (
    <>
      <div
        className={` border p-2 shadow-md  text-l font-semibold  ${
          level === "CP"
            ? "bg-opacity-40 backdrop-blur-md bg-green-400"
            : level === "CE1"
            ? "bg-opacity-40 backdrop-blur-md bg-green-500"
            : level === "CE2"
            ? "bg-opacity-40 backdrop-blur-md bg-green-400"
            : level === "CM1"
            ? "bg-opacity-40 backdrop-blur-md bg-green-700"
            : level === "CM2"
            ? "bg-opacity-40 backdrop-blur-md bg-green-800"
            : "bg-opacity-40 backdrop-blur-md bg-green-900"
        }`}
      >
        <Row>
          <Col span={4} className="flex items-center border-r pl-2">
            {firstName}
          </Col>
          <Col span={3} className="flex items-center border-r pl-2">
            {level}
          </Col>
          <Col span={4} className="flex items-center border-r pl-2">
            <div>{teacher}</div>
          </Col>
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
           {hoursReels}
          </Col>
          <Col
            span={3}
            className="flex items-center text-center px-2 border-r pl-2"
          >
            00:00
          </Col>
          <Col span={3} className="flex-row text-center text-3xl ">
            <AiOutlineCalendar
              onClick={showModal}
              className="inline hover:text-black text-gray-600 cursor-pointer mr-2"
            />
            <AiOutlineDelete className="inline hover:text-black text-gray-600 cursor-pointer" />
          </Col>
        </Row>
      </div>
      <Modal
        title={"Planning de " + firstName}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        width={900}
        open={isModalOpen}
      >
      
          <ChildPlanning
            {...{fetchedPlanning ,onSave, hoursReels, firstName, childID, level, teacher, hours, schoolID }}
          />

      </Modal>
    </>
  );
}

export default Child;
