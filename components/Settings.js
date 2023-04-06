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
  Rate
} from "antd";
import  { useState, useEffect } from "react";
import { getAuth, updatePassword } from "firebase/auth";
import {getFirestore, collection, addDoc, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
const auth = getAuth()

function Settings() {
  const [form] = Form.useForm();
  const [levels, setLevels] = useState([]);
  const [levelCount, setLevelCount] = useState(0);
  const [schoolId, setSchoolId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchSchoolData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        const schoolDoc = await getSchoolDoc(user.uid);
        if (schoolDoc) {
          const data = schoolDoc.data();
          setSchoolId(schoolDoc.id);
          form.setFieldsValue({
            schoolName: data.schoolName,
            email: user.email,
          });
          // Remplir les autres champs du formulaire avec les données de l'école
        }
      }
    };

    fetchSchoolData();
  }, []);

  const getSchoolDoc = async (userId) => {
    const q = query(collection(db, "schools"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
  };

  const handleSubmit = async (values) => {
    // Mettre à jour les informations de l'école dans la base de données
  };

  const handleChangePassword = async (newPassword) => {
    const user = auth.currentUser;
    if (user) {
      await updatePassword(user, newPassword);
    }
  };

  return (
    <div className="container mx-auto my-8">
      <Form onFinish={handleSubmit}
       form={form}>
      
        <div className="shadow-md p-6 bg-white rounded-lg">
        <h2 className="text-xl font-bold mb-4">Informations de lécole</h2>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                type: "email",
                message: "L'adresse e-mail est invalide.",
              },
              {
                required: true,
                message: "Veuillez saisir une adresse e-mail.",
              },
            ]}
        
          >
            <Input disabled />
          </Form.Item>

          {/* Changer le mot de passe */}
          <Form.Item
            label="Nouveau mot de passe"
            name="newPassword"
            rules={[
              {
                required: false,
                message: "Veuillez saisir un nouveau mot de passe.",
              },
            ]}
          
          >
            <Input.Password />
          </Form.Item>

          {/* Nom de l'école */}
          <Form.Item
            label="Nom de lécole"
            name="schoolName"
            rules={[
              {
                required: true,
                message: "Veuillez saisir le nom de lécole.",
              },
            ]}

          >
            <Input />
          </Form.Item>

          {/* Modifier les autres champs du formulaire selon les besoins */}
          
          {/* Bouton de soumission */}
          <div className="w-full justify-between">
            <Space>
              <Button
                
                htmlType="submit"
              >
                Sauvegarder les modifications
              </Button>
              <Button
                onClick={() => {
                  const newPassword = form.getFieldValue("newPassword");
                  if (newPassword) {
                    handleChangePassword(newPassword);
                  }
                }}
              >
                Changer le mot de passe
              </Button>
            </Space>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default Settings;
