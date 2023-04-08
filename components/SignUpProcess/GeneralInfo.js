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
import  { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {getFirestore, collection, addDoc, doc, setDoc } from "firebase/firestore";
import {db} from '../../firebaseConfig'
const auth = getAuth()

function GeneralInfo ({ saveData, nextStep }) {
  const [form] = Form.useForm();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [levels, setLevels] = useState([]);
  const [levelCount, setLevelCount] = useState(0);

  

  const handleLevelCount = (value) => {
    setLevelCount(value);
    setLevels(
      Array.from({ length: value }, () => ({ classCount: 0, teachers: [] }))
    );
  };

  const handleClassCount = (levelIndex, value) => {
    setLevels((prevLevels) => {
      const newLevels = [...prevLevels];
      newLevels[levelIndex] = {
        ...newLevels[levelIndex],
        classCount: value,
        teachers: Array(value).fill(""),
      };
      return newLevels;
    });
  };

  const handleTeacherName = (levelIndex, classIndex, value) => {
    setLevels((prevLevels) => {
      const newLevels = [...prevLevels];
      newLevels[levelIndex].teachers[classIndex] = value;
      return newLevels;
    });
  };



  const handleSubmit = async (values) => {
    console.log("values before", values)
    try {
      const timeObj = {};
      const levelsData = [];
      const labels = ["Matin 1", "Matin 2", "Après-midi 1", "Après-midi 2"];

      const userCredential = await createUserWithEmailAndPassword(auth, form.getFieldValue('email'), password);
      const userId = userCredential.user.uid;


      labels.forEach((label, index) => {
        const startHour = values[`time${index}.startHour`];
        const startMinute = values[`time${index}.startMinute`];
        const endHour = values[`time${index}.endHour`];
        const endMinute = values[`time${index}.endMinute`];    

        if (startHour && startMinute && endHour && endMinute) {
          timeObj[`${label}.Start`] = `${startHour}:${startMinute}`;
          timeObj[`${label}.End`] = `${endHour}:${endMinute}`;
        }
      });     

      for (const key in values) {
        if (key.startsWith("level") && key.endsWith("name")) {
          const levelName = values[key];
          const levelIndex = key.match(/\d+/)[0];
          const teachers = [];
      
          for (const teacherKey in values) {
            if (teacherKey.startsWith(`level${levelIndex}class`)) {
              teachers.push(values[teacherKey]);
            }
          }
      
          levelsData.push({ name: levelName, teachers });
        }
      }

      const schoolRef = await addDoc(collection(db, "schools"), {
                userId,
                schoolName: form.getFieldValue("schoolName"),
                timeObj,
                levelsData,
              });

      const schoolId = schoolRef.id;

         await setDoc(doc(db, "users", userId), {
                schoolId,
                userId,
                email : form.getFieldValue('email'),
              });


  nextStep() 
  } catch (error) {
    console.error('Erreur lors de la création du compte :', error.message);
  }
};


    
          
  

  const handleLevelName = (levelIndex, value) => {
    setLevels((prevLevels) => {
      const newLevels = [...prevLevels];
      newLevels[levelIndex] = { ...newLevels[levelIndex], name: value };
      return newLevels;
    });
  };

  const onPasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordMatch(e.target.value === passwordConfirm);
  };

  const onPasswordConfirmChange = (e) => {
    setPasswordConfirm(e.target.value);
    setPasswordMatch(e.target.value === password);
  };

  return (
    <div className="container mx-auto my-8">
      <Form onFinish={handleSubmit}
       form={form}  
       initialValues={{
        "time0.startHour": 8,
        "time0.startMinute": 15,
        "time0.endHour": 10,
        "time0.endMinute": '00',
        "time1.startHour": 10,
        "time1.startMinute": '00',
        "time1.endHour": 11,
        "time1.endMinute": 45,
        "time2.startHour": 13,
        "time2.startMinute": 45,
        "time2.endHour": 15,
        "time2.endMinute": '00',
        "time3.startHour": 15,
        "time3.startMinute": '00',
        "time3.endHour": 16,
        "time3.endMinute": 15,
      }}>
      
        <div className="shadow-md p-6 bg-white rounded-lg">
        <h2 className="text-xl font-bold mb-4">Information de l’utilisateur</h2>
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
            <Input />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Mot de passe"
            name="password"
            rules={[
              {
                required: true,
                message: "Veuillez saisir un mot de passe.",
              },
            ]}
          
          >
            <Input.Password onChange={onPasswordChange} />
          </Form.Item>

          {/* Password confirmation */}
          <Form.Item
            label="Confirmer le mot de passe"
            name="passwordConfirm"
            rules={[
              {
                required: true,
                message: "Veuillez confirmer le mot de passe.",
              },
              () => ({
                validator(_, value) {
                  if (value === password) {
                    setPasswordMatch(true);
                    return Promise.resolve();
                  }
                  setPasswordMatch(false);
                  return Promise.reject(
                    new Error("Les mots de passe ne correspondent pas.")
                  );
                },
              }),
            ]}
       
          >
            <Input.Password onChange={onPasswordConfirmChange} />
          </Form.Item>

          {/* Nom de l'école */}
          <Form.Item
            label="Nom de l'école"
            name="schoolName"
            rules={[
              {
                required: true,
                message: "Veuillez saisir le nom de l'école.",
              },
            ]}

          >
            <Input />
          </Form.Item>

          <h2 className="text-xl font-bold mb-4">Plages Horaires</h2>
          <Form.Item className="text-xl w-full">
          <Row gutter={16}>
            {["Matin 1", "Matin 2", "Après-midi 1", "Après-midi 2"].map(
              (label, index) => (
                <Col key={index} xs={24} sm={18} md={18} lg={6} className="flex flex-col">
                  <span className="text-sm font-bold mb-2">{`${label} - début`}</span>
                  <Space>
                    <Form.Item name={`time${index}.startHour`}>
                      <InputNumber
                        min={7}
                        max={23}
                        placeholder="Heures"
                        className="w-15"
                      />
                    </Form.Item>
                    <Form.Item name={`time${index}.startMinute`}>
                      <InputNumber
                        min={0}
                        max={59}
                        step={5}
                        placeholder="Minutes"
                        className="w-15"
                      />
                    </Form.Item>
                  </Space>
                  <span className="text-sm font-bold mt-4 mb-2">{`${label} - fin`}</span>
                  <Space>
                    <Form.Item name={`time${index}.endHour`}>
                      <InputNumber
                        min={7}
                        max={23}
                        placeholder="Heures"
                        className="w-15"
                      />
                    </Form.Item>
                    <Form.Item name={`time${index}.endMinute`}>
                      <InputNumber
                        min={0}
                        max={59}
                        step={5}
                        placeholder="Minutes"
                        className="w-15"
                      />
                    </Form.Item>
                  </Space>
                </Col>
              )
            )}
          </Row>
        </Form.Item>
          {/* Liste sélectionnable pour le nombre de niveaux */}
          <h2 className="text-xl font-bold mb-4">Classes</h2>
          <Form.Item
          label="Nombre de niveaux"
        >
          <InputNumber min={0} max={10} onChange={handleLevelCount} />
        </Form.Item>
          {/* Niveaux */}
          {levels.map((level, levelIndex) => (
            <div key={levelIndex} className="mb-4 p-4 border border-gray-300 rounded-lg shadow-md">
              <Form.Item label={`Nom du niveau ${levelIndex + 1}`} name={`level${levelIndex}name`}>
                <Input className="w-full" onChange={(e) => handleLevelName(levelIndex, e.target.value)} />
              </Form.Item>
              <Form.Item label={`Nombre de classes ${level.name || `Niveau ${levelIndex + 1}`}`}>
                <InputNumber min={1} max={10} onChange={(value) => handleClassCount(levelIndex, value)} />
              </Form.Item>
              <div className="bg-gray-100 p-4 rounded-lg">
                {level.teachers.map((teacher, classIndex) => (
                  <Form.Item
                    key={classIndex}
                    label={`${level.name || `Niveau ${levelIndex + 1}`} ${classIndex + 1}`}
                    name={`level${levelIndex}class${classIndex}`}
                    
                  >
                    <Input
                      placeholder="Prénom du/de la Professeur.e"
                      onChange={(e) => handleTeacherName(levelIndex, classIndex, e.target.value)}
                    />
                  </Form.Item>
                ))}
              </div>
            </div>
          ))}
          
          {/* Bouton de soumission */}

          <div className="w-full  justify-between flex  mb-4 mt-4">
            <div>
            
              
            </div>
            <button
              className="drop-shadow-md bg-[#FAD4D8]  hover:text-black hover:bg-[#FAD4E8] text-gray-700 font-bold pt-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Suivant
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default GeneralInfo;
