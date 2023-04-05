import { Row, Col, Modal, Form } from "antd";
import {
  AiOutlineSave,
  AiOutlineUser,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineCalendar,
} from "react-icons/ai";
import { useState } from "react";
function Aesh({ aeshID, firstName, hours, schoolID }) {
  const { confirm } = Modal;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };
  const handleSaveClick = () => {

    setIsEditing(false);
  };

  const handleButtonClick = async () => {
    setIsEditing(!isEditing)
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  console.log("in the aesh",schoolID)


  return (
    <>
    
      <div
        className='border p-2 shadow-md  text-l font-semibold bg-opacity-40 backdrop-blur-md bg-green-400 '
      >
        <Row>
          <Col span={4} className="flex items-center border-r pl-2">
            {firstName}
          </Col>
          <Col span={3} className="flex items-center border-r pl-2">
          {hours}
          </Col>
          <Col
            span={3}
            className="flex items-center text-center px-2 border-r pl-2"
          >
           00:00
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
      visible={isModalOpen}
    >
      <div className="flex items-center justify-between">
      </div>
      <div className="absolute p-1 rounded text-gray-500 hover:text-black hover:bg-gray-100 top-5 right-10">
    </div>
    </Modal>

    
    </>
  );
}

export default Aesh;
