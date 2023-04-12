import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Col, Form, Modal, Row } from "antd";
import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from "firebase/firestore";
import { useState } from "react";
import {
  AiOutlineCalendar,
  AiOutlineDelete
} from "react-icons/ai";
import { db } from "../../firebaseConfig";
import { subtractTime } from "../../modules/time";
import AeshPlanning from "../Plannings/AeshPlanning";
function Aesh({planning,onSave, idAesh, firstName, level, teacher, hours,schoolId, hoursReels }) {
  const [form] = Form.useForm();
  const { confirm } = Modal;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const showDeleteConfirm = () => {
    confirm({
      title: 'Voulez vous vraiment supprimer cet enfant ?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Oui',
      okType: 'danger',
      cancelText: 'Non',
      onOk() {
        deleteAesh()        
      },
      onCancel() {
        return    
      },
    });
  };

    const deleteAesh = async () => {
    try {
    const cellPlanningsRef = collection(db, `schools/${schoolId}/cellPlanning`);
    const q = query(cellPlanningsRef, where("idAesh", "==", idAesh));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
      // Obtenir une référence au document que vous souhaitez supprimer
  const aeshDocRef = doc(db, `schools/${schoolId}/aesh`, idAesh);
  // Supprimer le document
  await deleteDoc(aeshDocRef);  
  onSave()
    } catch (error) {
      console.error(error);
    }
  };
  
  const showModal = async () => {
    setIsModalOpen(true);
  }; 

  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

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

  function convertToMinutes(hoursReels) {
    const [hours, minutes] = hoursReels.split(":");
    return parseInt(hours) * 60 + parseInt(minutes);
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
          <Col
            span={5}
            className="flex items-center text-center px-2 border-r pl-2"
          >
            {hours}
          </Col>
          <Col
            span={5}
            className="flex items-center text-center px-2 border-r pl-2"
          >
           {hoursReels}
          </Col>
          <Col
            span={5}
            className="flex items-center text-center px-2 border-r pl-2"
          >
           {subtractTime(hoursReels,hours)}
          </Col>
          <Col span={5} className="flex-row text-center text-3xl ">
            <AiOutlineCalendar
              onClick={showModal}
              className="inline hover:text-black text-gray-600 cursor-pointer mr-2"
            />
            <AiOutlineDelete onClick={()=> {showDeleteConfirm()}} className="inline hover:text-black text-gray-600 cursor-pointer" />
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
      
          <AeshPlanning         
            {...{planning ,onSave, hoursReels, firstName, idAesh, level, teacher, hours, schoolId }}
          />

      </Modal>
    </>
  );
}

export default Aesh;
