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
function Aesh({planning,onSave, idAesh, firstName, level, teacher, hours,schoolId, hoursReels, option }) {
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

  function convertToMinutes(hoursReels) {
    const [hours, minutes] = hoursReels.split(":");
    return parseInt(hours) * 60 + parseInt(minutes);
  }


  return (
    <>
      <div
      className={`border p-1 lg:p-2 shadow-md text-l font-semibold bg-opacity-30 backdrop-blur-md ${getBgClass(subtractTime(hoursReels,hours))}`}
      >
        <Row>
          <Col span={option === "aesh" ? 4 : 5} className="flex items-center border-r pl-1 lg:pl-2">
                  <span className="w-full break-words"> 
          {firstName}
          </span>
          </Col>
          <Col
            span={option === "aesh" ? 5 : 4}
            className="flex items-center border-r pl-1 lg:pl-2"
          >
                  <span className="w-full break-words">
            {hours}
            </span>
          </Col>
          <Col
            span={option === "aesh" ? 5 : 4}
            className="flex items-center pl-1 lg:pl-2  px-1 border-r"
          >
                  <span className="w-full break-words">
           {hoursReels}
           </span>
          </Col>
          <Col
            span={option === "aesh" ? 5 : 4}
            className="flex items-center pl-1 lg:pl-2 px-1 border-r"
          >
                  <span className="w-full break-words">
           {subtractTime(hoursReels,hours)}
           </span>
          </Col>
          <Col span={option === "aesh" ? 5 : 7} className="flex-row pl-1 lg:pl-2 text-3xl ">
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
