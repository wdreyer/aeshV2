import { Row, Col, Modal, Form } from "antd";
import {
  AiOutlineSave,
  AiOutlineUser,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineCalendar,
} from "react-icons/ai";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { collection, query, where, getDocs, writeBatch,doc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import ChildPlanning from "../Plannings/ChildPlanning";
import { useEffect, useState } from "react";
import { calculHours } from "../../modules/calculHours";
import { subtractTime } from "../../modules/time";
function Child({planning,onSave, childID, firstName, level, teacher, hours,schoolId, hoursReels }) {
  const [form] = Form.useForm();
  const { confirm } = Modal;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);


  
  const showModal = async () => {
    setIsModalOpen(true);
  }; 

  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

 const showDeleteConfirm = () => {
    confirm({
      title: 'Voulez vous vraiment supprimer cet enfant ?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        deleteChild()        
      },
      onCancel() {
        return    
      },
    });
  };

    const deleteChild = async () => {
    try {
    const cellPlanningsRef = collection(db, `schools/${schoolId}/cellPlanning`);
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
  onSave()
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
      return "bg-red-500";
    } else if (minutes >= -120 && minutes < 0) {
      return "bg-yellow-500";
    } else if (minutes === 0) {
      return "bg-green-500";
    } else if (minutes > 0 && minutes <= 120) {
      return "bg-blue-500";
    } else {
      return "bg-purple-500";
    }
  }


  return (
    <>
      <div
      className={`border p-2 shadow-md text-l font-semibold bg-opacity-40 backdrop-blur-md ${getBgClass(subtractTime(hoursReels,hours))}`}
    
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
           {subtractTime(hoursReels,hours)}
          </Col>
          <Col span={3} className="flex-row text-center text-3xl ">
            <AiOutlineCalendar
              onClick={showModal}
              className="inline hover:text-black text-gray-600 cursor-pointer mr-2"
            />
            <AiOutlineDelete onClick={()=> {showDeleteConfirm()}}  className="inline hover:text-black text-gray-600 cursor-pointer" />
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
            {...{planning ,onSave, hoursReels, firstName, childID, level, teacher, hours, schoolId }}
          />

      </Modal>
    </>
  );
}

export default Child;
