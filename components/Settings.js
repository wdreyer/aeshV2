import { Button, Col, Form, Input, InputNumber, Modal, Row, Space } from "antd";
import { getAuth, updatePassword } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
const auth = getAuth();

function Settings() {
  const [form] = Form.useForm();
  const [levelCount, setLevelCount] = useState(0);
  const [schoolId, setSchoolId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [levelsData, setLevelsData] = useState([]);

  const handleLevelCount = (value) => {
    setLevelCount(value);
    setLevelsData((prevLevelsData) => {
      const newLevelsData = [...prevLevelsData];
      while (newLevelsData.length < value) {
        newLevelsData.push({ name: "", teachers: Array(1).fill("") });
      }
      while (newLevelsData.length > value) {
        newLevelsData.pop();
      }
      return newLevelsData;
    });
  };
  const handleClassCount = (levelIndex, value) => {
    setLevelsData((prevLevelsData) => {
      const newLevelsData = [...prevLevelsData];
      newLevelsData[levelIndex] = {
        ...newLevelsData[levelIndex],
        teachers: Array(value).fill(""),
      };
      return newLevelsData;
    });
  };

  const handleLevelName = (levelIndex, value) => {
    setLevelsData((prevLevelsData) => {
      const newLevelsData = [...prevLevelsData];
      newLevelsData[levelIndex] = { ...newLevelsData[levelIndex], name: value };
      return newLevelsData;
    });
  };
  const handleTeacherName = (levelIndex, teacherIndex, value) => {
    setLevelsData((prevLevelsData) => {
      const newLevelsData = [...prevLevelsData];
      newLevelsData[levelIndex].teachers[teacherIndex] = value;
      return newLevelsData;
    });
  };

  useEffect(() => {
    const fetchSchedules = async () => {
      const fetchedSchedules = await getSchedules(schoolId);
      setSchedules(fetchedSchedules);
    };
    if (schoolId) {
      fetchSchedules();
    }
  }, [schoolId]);

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    console.log("lafonction");
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      const schoolDoc = await getSchoolDoc(user.uid);
      if (schoolDoc) {
        const data = schoolDoc.data();
        setSchoolId(schoolDoc.id);
        setLevelsData(data.levelsData.map((level) => ({ ...level })));
        form.setFieldsValue({
          schoolName: data.schoolName,
          email: user.email,
        });
      }
    }
  };

  console.log(levelsData);

  const getSchedules = async (schoolId) => {
    const schoolRef = doc(db, "schools", schoolId);
    const schoolSnapshot = await getDoc(schoolRef);
    const timeObj = schoolSnapshot.data().timeObj;
    const schedules = {};

    Object.keys(timeObj).forEach((key) => {
      const periodMatch = key.match(/(Matin|Après-midi)\s(\d+)\.(Start|End)/);
      if (periodMatch) {
        const periodType = periodMatch[1];
        const periodIndex = parseInt(periodMatch[2], 10) - 1;
        const startOrEnd = periodMatch[3];
        const fieldName = `${periodType}${periodIndex}.${startOrEnd}`;
        const [hour, minute] = timeObj[key].split(":");

        // Modification ici pour ajouter ".Hour" et ".Minute" aux clés
        schedules[`${fieldName}Hour`] = parseInt(hour, 10); // Enlevez le point entre ${fieldName} et Hour
        schedules[`${fieldName}Minute`] = parseInt(minute, 10); // Enlevez le point entre ${fieldName} et Minute
      }
    });

    return schedules;
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

  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        if (newPassword !== confirmNewPassword) {
          setErrorMessage("Les mots de passe ne correspondent pas.");
          return;
        }
        if (newPassword.length < 6) {
          setErrorMessage(
            "Le nouveau mot de passe doit contenir au moins 6 caractères."
          );
          return;
        }
        await updatePassword(user, newPassword);
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setIsModalOpen(false);
      } catch (error) {
        setErrorMessage(
          "Une erreur s'est produite lors de la mise à jour du mot de passe. Veuillez réessayer."
        );
      }
    }
  };

  useEffect(() => {
    if (schoolId) {
      fetchSchedules();
    }
  }, [schoolId]);

  const fetchSchedules = async () => {
    const fetchedSchedules = await getSchedules(schoolId);
    console.log("Fetched schedules:", fetchedSchedules);

    form.setFieldsValue({
      "Matin0.Start.hour": fetchedSchedules["Matin0.StartHour"],
    });
    form.setFieldsValue({
      "Matin0.Start.minute": fetchedSchedules["Matin0.StartMinute"],
    });

    form.setFieldsValue({
      "Matin0.End.hour": fetchedSchedules["Matin0.EndHour"],
    });
    form.setFieldsValue({
      "Matin0.End.minute": fetchedSchedules["Matin0.EndMinute"],
    });

    form.setFieldsValue({
      "Matin1.Start.hour": fetchedSchedules["Matin1.StartHour"],
    });
    form.setFieldsValue({
      "Matin1.Start.minute": fetchedSchedules["Matin1.StartMinute"],
    });

    form.setFieldsValue({
      "Matin1.End.hour": fetchedSchedules["Matin1.EndHour"],
    });
    form.setFieldsValue({
      "Matin1.End.minute": fetchedSchedules["Matin1.EndMinute"],
    });

    form.setFieldsValue({
      "Après-midi0.Start.hour": fetchedSchedules["Après-midi0.StartHour"],
    });
    form.setFieldsValue({
      "Après-midi0.Start.minute": fetchedSchedules["Après-midi0.StartMinute"],
    });

    form.setFieldsValue({
      "Après-midi0.End.hour": fetchedSchedules["Après-midi0.EndHour"],
    });
    form.setFieldsValue({
      "Après-midi0.End.minute": fetchedSchedules["Après-midi0.EndMinute"],
    });

    form.setFieldsValue({
      "Après-midi1.Start.hour": fetchedSchedules["Après-midi1.StartHour"],
    });
    form.setFieldsValue({
      "Après-midi1.Start.minute": fetchedSchedules["Après-midi1.StartMinute"],
    });

    form.setFieldsValue({
      "Après-midi1.End.hour": fetchedSchedules["Après-midi1.EndHour"],
    });
    form.setFieldsValue({
      "Après-midi1.End.minute": fetchedSchedules["Après-midi1.EndMinute"],
    });
  };

  useEffect(() => {
    console.log("Form values:", form.getFieldsValue());
  }, [schedules]);

  const getSchoolDoc = async (userId) => {
    const q = query(collection(db, "schools"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
  };

  const handleSubmit = async (values) => {
    console.log(values);
  
    try {
      const labels = ["Matin 1", "Matin 2", "Après-midi 1", "Après-midi 2"];
  
      // Vérifiez que l'utilisateur est connecté et obtenez son ID utilisateur.
      const userId = auth.currentUser.uid;
  
      // Récupérez le schoolId pour cet utilisateur
      const userDoc = await getDoc(doc(db, "users", userId));
      const schoolId = userDoc.data().schoolId;
  
      // Récupérez les données actuelles de l'école
      const schoolDoc = await getDoc(doc(db, "schools", schoolId));
      const schoolData = schoolDoc.data();
  
      // Mettez à jour les horaires
      labels.forEach((label, index) => {
        const startHour = values[`${label}.Start.hour`] || form.getFieldValue(`${label}.Start.hour`);
        const startMinute = values[`${label}.Start.minute`] || form.getFieldValue(`${label}.Start.minute`);
        const endHour = values[`${label}.End.hour`] || form.getFieldValue(`${label}.End.hour`);
        const endMinute = values[`${label}.End.minute`] || form.getFieldValue(`${label}.End.minute`);
  
        if (startHour !== undefined && startMinute !== undefined) {
          schoolData.timeObj[`${label}.Start`] = `${startHour}:${startMinute}`;
        }
        if (endHour !== undefined && endMinute !== undefined) {
          schoolData.timeObj[`${label}.End`] = `${endHour}:${endMinute}`;
        }
      });
  
      // Mettez à jour les niveaux et les enseignants
      for (const key in values) {
        if (key.startsWith("level") && key.endsWith("name")) {
          const levelName = values[key] || form.getFieldValue(key);
          const levelIndex = key.match(/\d+/)[0];
          const teachers = [];
  
          for (const teacherKey in values) {
            if (teacherKey.startsWith(`level${levelIndex}class`)) {
              const teacherName = values[teacherKey] || form.getFieldValue(teacherKey);
              if (teacherName !== undefined) {
                teachers.push(teacherName);
              }
            }
          }
  
          if (levelName !== undefined) {
            schoolData.levelsData[levelIndex] = { name: levelName, teachers };
          }
        }
      }
  
      // Mettez à jour le nom de l'école si nécessaire
      if (values.schoolName !== undefined) {
        schoolData.schoolName = values.schoolName;
      }

      console.log(schoolData)
  
      // Mettez à jour les informations de l'école
      // await updateDoc(doc(db, "schools", schoolId), schoolData);
  
    } catch (error) {
      console.error('Erreur lors de la mise à jour des informations :', error.message);
    }
  };

  const labelsMap = [
    { label: "Matin 1", field: "Matin0" },
    { label: "Matin 2", field: "Matin1" },
    { label: "Après-midi 1", field: "Après-midi0" },
    { label: "Après-midi 2", field: "Après-midi1" },
  ];

  return (
    <div className=" flex flex-col  items-center container mx-auto my-8">
      <Form
        onFinish={handleSubmit}
        className="w-settings shadow-md p-6 flex flex-col  items-left bg-white rounded-lg"
        form={form}
      >
        <div className="-md p-6 ">
          <h2 className="text-xl font-bold mb-4">
            Informations de l’utilisateur
          </h2>
          <Form.Item className="mb-0 w-80" label="Email" name="email">
            <Input disabled />
          </Form.Item>

          <div
            className="mx-1 my-1 text-blue-400 text-left cursor-pointer underline hover:text-blue-600"
            onClick={showModal}
          >
            Changer le mot de passe
          </div>

          <Form.Item
            label="Nom de l'école"
            name="schoolName"
            className="mt-2 w-80"
            rules={[
              {
                required: true,
                message: "Veuillez saisir le nom de lécole.",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <h2 className="text-xl font-bold mb-4">Informations de l’école</h2>
          <Row gutter={16}>
            {labelsMap.map(({ label, field }, index) => (
              <Col
                key={index}
                xs={24}
                sm={18}
                md={18}
                lg={6}
                className="flex flex-col"
              >
                <span className="text-sm font-bold mb-2">{`${label} - début`}</span>
                <Space>
                  <Form.Item name={`${field}.Start.hour`}>
                    <InputNumber
                      min={7}
                      max={23}
                      placeholder="Heures"
                      className="w-15"
                    />
                  </Form.Item>
                  <Form.Item name={`${field}.Start.minute`}>
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
                  <Form.Item name={`${field}.End.hour`}>
                    <InputNumber
                      min={7}
                      max={23}
                      placeholder="Heures"
                      className="w-15"
                    />
                  </Form.Item>
                  <Form.Item name={`${field}.End.minute`}>
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
            ))}
          </Row>
          <h2 className="text-xl font-bold mb-4">Classes :</h2>
          <div>
            {levelsData.map((level, levelIndex) => {
              const { name: levelName, teachers } = level;
              if (!teachers) {
                return null;
              }
              return (
                <>
                  {levelIndex === 0 && (
                    <Form.Item label="Nombre de niveaux">
                      <InputNumber
                        min={1}
                        max={10}
                        onChange={(value) => handleLevelCount(value)}
                        defaultValue={Object.keys(levelsData).length}
                      />
                    </Form.Item>
                  )}
                  <div
                    key={levelIndex}
                    className="mb-4 p-4 border border-gray-300 rounded-lg shadow-md"
                  >
                    <Form.Item
                      label={`Nom du niveau ${levelIndex + 1}`}
                      name={`level${levelIndex}name`}
                    >
                      <Input
                        className="w-full"
                        onChange={(e) =>
                          handleLevelName(levelIndex, e.target.value)
                        }
                        defaultValue={levelName}
                      />
                    </Form.Item>
                    <Form.Item
                      label={`Nombre de classes ${
                        levelName || `Niveau ${levelIndex + 1}`
                      }`}
                    >
                      <InputNumber
                        min={1}
                        max={10}
                        onChange={(value) =>
                          handleClassCount(levelIndex, value)
                        }
                        defaultValue={teachers.length}
                      />
                    </Form.Item>
                    <div className="bg-gray-100 p-4 rounded-lg">
                      {teachers.map((teacher, teacherIndex) => (
                        <Form.Item
                          key={teacherIndex}
                          label={`${levelName || `Niveau ${levelIndex + 1}`} ${
                            teacherIndex + 1
                          }`}
                        >
                          <Input
                            placeholder="Prénom du/de la Professeur.e"
                            onChange={(e) =>
                              handleTeacherName(
                                levelIndex,
                                teacherIndex,
                                e.target.value
                              )
                            }
                            defaultValue={teacher}
                          />
                        </Form.Item>
                      ))}
                    </div>
                  </div>
                </>
              );
            })}
          </div>
          <div className="w-full justify-between">
            <Space>
              <Button htmlType="submit">Sauvegarder les modifications</Button>
            </Space>
          </div>
        </div>
      </Form>
      <Modal
        title="Changer de mot de passe"
        onOk={handleChangePassword}
        onCancel={handleCancel}
        width={900}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Annuler
          </Button>,
          <Button key="submit" onClick={handleChangePassword}>
            Changer le mot de passe
          </Button>,
        ]}
        open={isModalOpen}
      >
        <Form layout="vertical">
          {errorMessage && (
            <div className="text-red-500 mb-4">{errorMessage}</div>
          )}
          <Form.Item
            label="Ancien mot de passe"
            name="oldPassword"
            rules={[
              {
                required: true,
                message: "Veuillez saisir votre ancien mot de passe.",
              },
            ]}
          >
            <Input.Password
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Nouveau mot de passe"
            name="newPassword"
            rules={[
              {
                required: true,
                message: "Veuillez saisir un nouveau mot de passe.",
              },
            ]}
          >
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Confirmez le nouveau mot de passe"
            name="confirmNewPassword"
            rules={[
              {
                required: true,
                message: "Veuillez confirmer le nouveau mot de passe.",
              },
            ]}
          >
            <Input.Password
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Settings;
