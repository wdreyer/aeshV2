import { Row, Col } from "antd";

function Child({
    firstName,
    level,
    teacher,
    hours,
  }) {
    return (
      <div
        className={` border p-2 shadow-md  text-lg font-semibold  ${
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
      <Col span={4} className="flex items-center border-r pl-2">{firstName}</Col>
      <Col span={3} className="flex items-center border-r pl-2">{level}</Col>
      <Col span={4} className="flex items-center border-r pl-2"><div >{teacher}</div></Col>
      <Col span={3} className="flex items-center border-r pl-2"><div className="text-center px-2">{hours}</div></Col>
      <Col span={3} className="flex items-center border-r pl-2" ><div className="text-center px-2">00:00</div></Col>
      <Col span={3} className="flex items-center border-r pl-2" ><div className="text-center px-2">00:00</div></Col>
      <Col span={4} className="flex items-center pl-2" ><div className="text-center px-2">Icons</div></Col>
    </Row>
      </div>
    );
  }
  
  export default Child;