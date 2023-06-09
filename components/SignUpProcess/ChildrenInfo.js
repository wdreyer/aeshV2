import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Row,
  Col,
  Divider,
  Space,
  Rate,
} from "antd";
import { useState, useEffect } from "react";

import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
const auth = getAuth();
const firestore = getFirestore();


function ChildrenInfo({ prevStep, nextStep }) {
  const [user, loading, error] = useAuthState(auth);
  const [numChildren, setNumChildren] = useState(0);
  const [childForms, setChildForms] = useState([]);
  const [levelsData, setLevelsData] = useState({});
  const [form] = Form.useForm();

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
    if (field === "level") {
      const level = levelsData.find(level => level.name === value);
      newChildForms[index][field] = level.name;
    } else {
      newChildForms[index][field] = value;
    }
    setChildForms(newChildForms);
  };

  const handleSubmit = async () => {
    // Récupérer le document de l'école de l'utilisateur
    const schoolDoc = await getSchoolDoc();

    const childrenData = childForms.map((child, index) => {
      const level = levelsData.find(level => level.name === child.level);
      return {
        firstName: child.firstName,
        level: child.level,
        teacher: child.teacher,
        hours: `${String(form.getFieldValue(`time${index}.startHour`)).padStart(
          2,
          "0"
        )}:${String(form.getFieldValue(`time${index}.startMinute`) || '00' ).padStart(
          2,
          "0"
        )}`,
      };
    });
    try {
      childrenData.forEach(async (child) => {
        await addDoc(collection(db, `schools/${schoolDoc.id}/children`), child);
      });
      nextStep() 

    } catch (error) {
      console.error("Erreur lors de l`ajout des enfants :", error.message);
    }
  };

  return (
    <div className="container mx-auto my-8">
      <div className="shadow-md p-6 bg-white rounded-lg">
        <h2 className="text-xl font-bold mb-4">Ajout des enfants :</h2>

        <Form onFinish={handleSubmit} form={form}>
          <Form.Item label="Nombre d'enfants :">
            <InputNumber
              min={0}
              value={numChildren}
              onChange={handleNumChildrenChange}
            />
          </Form.Item>
          {childForms.map((child, index) => (
            <div key={index} className="bg-gray-100 p-0.5 rounded-md mb-1">
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
                        handleChildFormChange(
                          index,
                          "firstName",
                          e.target.value
                        )
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
                      style={{ width: "90%" }}
                      onChange={(value) =>
                        handleChildFormChange(index, "level", value)
                      }
                    >
                      {levelsData.map((level) => (
                        <Select.Option key={level.name} value={level.name}>
                          {level.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col className="mb-0" span={4}>
                <Form.Item
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 24 }}
                className="mb-2"
                label="Professeur.e" 
                name={`childForms[${index}].teacher`}
              >
                <Select
                  style={{ width: "90%" }}
                  onChange={(value) => handleChildFormChange(index, "teacher", value)}
                  disabled={!childForms[index].level}
                >
                  {childForms[index].level &&
                    levelsData
                      .find(level => level.name === childForms[index].level)
                      .teachers.map(teacher => (
                        <Select.Option key={teacher} value={teacher}>
                          {teacher}
                        </Select.Option>
                      ))}
                </Select>
              </Form.Item>
              
                </Col>
                <Col className="mb-0" span={10}>
                  <Form.Item
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
                      <InputNumber min={0} max={23} placeholder="HH" />
                    </Form.Item>
                    <span className="mx-1">:</span>
                    <Form.Item name={`time${index}.startMinute`} noStyle>
                      <InputNumber min={0} max={59} step={5} defaultValue={0} placeholder="MM" />
                    </Form.Item>
                  </Form.Item>
                </Col>
              </Row>
            </div>
          ))}
          <div className="w-full  justify-between flex  mb-4 mt-4">
            <button
              className="drop-shadow-md bg-[#FAD4D8]  hover:text-black hover:bg-[#FAD4E8] text-gray-700 font-bold pt-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={(e) => prevStep()}
            >
              Précedent
            </button>
          
            <button
              className="drop-shadow-md bg-[#FAD4D8]  hover:text-black hover:bg-[#FAD4E8] text-gray-700 font-bold pt-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Suivant
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default ChildrenInfo;
