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
            : "bg-opacity-40 backdrop-blur-md bg-green-400"
        }`}
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
