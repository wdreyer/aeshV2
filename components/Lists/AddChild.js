import { Col, Form, Input, InputNumber, Row, Select } from "antd";
import { useEffect, useState } from "react";

import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { db } from "../../firebaseConfig";
const auth = getAuth();
const firestore = getFirestore();

function AddChild({ onSave }) {
  const [user, loading, error] = useAuthState(auth);
  const [numChildren, setNumChildren] = useState(0);
  const [childForms, setChildForms] = useState([]);
  const [levelsData, setLevelsData] = useState({});

  const getSchoolDoc = async () => {
    const q = query(collection(db, "schools"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      const schoolDoc = await getSchoolDoc();
      setLevelsData(schoolDoc.data().levelsData);
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleNumChildrenChange = (value) => {
    const diff = value - numChildren;
    if (diff > 0) {
      const newChildForms = [...childForms];
      for (let i = 0; i < diff; i++) {
        newChildForms.push({
          firstName: "",
        });
      }
      setChildForms(newChildForms);
    } else {
      setChildForms(childForms.slice(0, value));
    }
    setNumChildren(value);
  };

  const handleChildFormChange = (index, field, value) => {
    const newChildForms = [...childForms];
    newChildForms[index][field] = value;
    setChildForms(newChildForms);
  };
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    // Récupérer le document de l'école de l'utilisateur
    const schoolDoc = await getSchoolDoc();

    const childrenData = childForms.map((child, index) => {
      return {
        firstName: child.firstName,
        level: child.level || "",
        teacher: child.teacher || "",
        hoursReels: "00:00",
        hours: `${String(
          form.getFieldValue(`time${index}.startHour`) || "00"
        ).padStart(2, "0")}:${String(
          form.getFieldValue(`time${index}.startMinute`) || "00"
        ).padStart(2, "0")}`,
      };
    });
    try {
      childrenData.forEach(async (child) => {
        await addDoc(collection(db, `schools/${schoolDoc.id}/children`), child);
      });
      setChildForms([]);
      setNumChildren(0);
      form.resetFields();
      onSave();
    } catch (error) {
      console.error("Erreur lors de lajout des enfants :", error.message);
    }
  };

  return (
    <div >
      <h2 className="text-xl font-bold mb-4">Ajout des enfants :</h2>

      <Form onFinish={handleSubmit} form={form} layout="horizontal">
      <div className="flex flex-nowrap ">
      <span className="mr-4 mt-1">Nombre dʼenfants :</span>
      <Form.Item className="flex-shrink-0">
        <InputNumber
          min={0}
          value={numChildren}
          onChange={handleNumChildrenChange}
        />
      </Form.Item>
    </div>
        {childForms.map((child, index) => (
          <div key={index} className="bg-gray-100 p-0.5 rounded-md mb-1 border shadow">
            <Row align="top">
              <Col className="mb-0" span={6}>
                <Form.Item
                  label={"Prénom :"}
                  name={`childForms[${index}].firstName`}
                  rules={[
                    { required: true, message: "Veuillez saisir le prénom" },
                  ]}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  className="mb-2"
                >
                  <Input
                    className="w-full border border-gray-300 mx-1 p-1 rounded-md"
                    style={{ width: "90%" }}
                    value={child.firstName}
                    onChange={(e) =>
                      handleChildFormChange(index, "firstName", e.target.value)
                    }
                  />
                </Form.Item>
              </Col>
              <Col className="mb-0" span={4}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Niveau"
                  name={`childForms[${index}].level`}
                  className="mb-2"
                >
                  <Select
                    dropdownMatchSelectWidth={false}
                    style={{ width: "90%" }}
                    onChange={(value) =>
                      handleChildFormChange(index, "level", value)
                    }
                  >
                    {levelsData.map((level, levelIndex) => (
                      <Select.Option key={levelIndex} value={level.name}>
                        {level.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col className="mb-0" span={6}>
                <Form.Item
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  className="mb-2"
                  label="Professeur.e"
                  name={`childForms[${index}].teacher`}
                >
                  <Select
                    dropdownMatchSelectWidth={false}
                    style={{ width: "90%" }}
                    onChange={(value) =>
                      handleChildFormChange(index, "teacher", value)
                    }
                    disabled={!childForms[index].level}
                  >
                    {childForms[index].level &&
                      levelsData
                        .find((level) => level.name === childForms[index].level)
                        .teachers.map((teacher, teacherIndex) => (
                          <Select.Option key={teacherIndex} value={teacher}>
                            {teacher}
                          </Select.Option>
                        ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col className="mb-0" span={8}>
                <Form.Item
                  initialValue={0}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label="Heures"
                  className="flex items-center mb-2"
                >
                  <Form.Item
                    className="mb-2"
                    name={`time${index}.startHour`}
                    noStyle
                  >
                    <InputNumber className="w-2/5" min={0} max={50} placeholder="HH" />
                  </Form.Item>
                  <span className="mx-1">:</span>
                  <Form.Item
                    initialValue={0}
                    name={`time${index}.startMinute`}
                    noStyle
                  >
                    <InputNumber className="w-2/5" min={0} max={59} step={5} placeholder="MM" />
                  </Form.Item>
                </Form.Item>
              </Col>
            </Row>
          </div>
        ))}
        <button
          className="drop-shadow-md bg-[#FAD4D8]  hover:text-black hover:bg-[#FAD4E8] text-gray-700 font-bold pt-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Enregistrer
        </button>
      </Form>
    </div>
  );
}

export default AddChild;
