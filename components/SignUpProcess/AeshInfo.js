import { Col, Form, Input, InputNumber, Row } from "antd";
import { useState } from "react";
import { useRouter } from 'next/router';
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

function AeshInfo({ prevStep, nextStep }) {
  const [user, loading, error] = useAuthState(auth);
  const [numaesh, setNumaesh] = useState(0);
  const [aeshForms, setAeshForms] = useState([]);
  const router = useRouter();
  const handleNumaeshChange = (value) => {
    const diff = value - numaesh;
    if (diff > 0) {
      const newaeshForms = [...aeshForms];
      for (let i = 0; i < diff; i++) {
        newaeshForms.push({
          firstName: "",
        });
      }
      setAeshForms(newaeshForms);
    } else {
      setAeshForms(aeshForms.slice(0, value));
    }
    setNumaesh(value);
  };

  const handleaeshFormChange = (index, field, value) => {
    const newaeshForms = [...aeshForms];
    newaeshForms[index][field] = value;
    setAeshForms(newaeshForms);
  };
  const getSchoolDoc = async () => {
    const q = query(
      collection(db, "schools"),
      where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
  };

  const [form] = Form.useForm();

  const handleSubmit = async () => {

    const schoolDoc = await getSchoolDoc();

    const aeshData = aeshForms.map((aesh, index) => {
      return {
        firstName: aesh.firstName,
        hours: `${String(form.getFieldValue(`time${index}.startHour`)).padStart(
          2,
          "0"
        )}:${String(form.getFieldValue(`time${index}.startMinute`) || '00').padStart(
          2,
          "0"
        )}`,
      };
    });

    try {
      aeshData.forEach(async (aesh) => {
        await addDoc(collection(db, `schools/${schoolDoc.id}/aesh`), aesh);
      });

      router.push('/')
    } catch (error) {
      console.error("Erreur lors de lajout des aeshs :", error.message);
    }
  };

  return (
    <div className="container mx-auto my-8">
      <div className="shadow-md p-6 bg-white rounded-lg">
        <h2 className="text-xl font-bold mb-4">Ajout des aeshs :</h2>

        <Form onFinish={handleSubmit} form={form}>
          <Form.Item label="Nombre d'aeshs :">
            <InputNumber
              min={0}
              value={numaesh}
              onChange={handleNumaeshChange}
            />
          </Form.Item>
          {aeshForms.map((aesh, index) => (
            <div key={index} className="bg-gray-100 p-0.5 rounded-md mb-1">
              <Row align="top">
                <Col className="mb-0" span={6}>
                  <Form.Item
                    label={"Prénom :"}
                    name={`aeshForms[${index}].firstName`}
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
                      value={aesh.firstName}
                      onChange={(e) =>
                        handleaeshFormChange(index, "firstName", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>

                <Col className="mb-0" span={6}>
                  <Form.Item
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    label="Contrat"
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
              Enregistrer
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default AeshInfo;
