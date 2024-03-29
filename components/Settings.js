import { Button, Col, Form, Input, InputNumber, Modal, Row, Space } from "antd";
import { getAuth, updatePassword } from "firebase/auth";
import { BeatLoader } from "react-spinners";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
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
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
      const existingTeachers = newLevelsData[levelIndex].teachers;
      const newTeachers = existingTeachers.slice(0, value);

      while (newTeachers.length < value) {
        newTeachers.push("");
      }

      newLevelsData[levelIndex] = {
        ...newLevelsData[levelIndex],
        teachers: newTeachers,
      };

      updateLevels();
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

  useEffect(() => {
    updateLevels();
  }, [levelsData]);

  const fetchSchoolData = async () => {
    const user = auth.currentUser;
    if (user) {
      setUserId(user.uid);
      const schoolDoc = await getSchoolDoc(user.uid);
      if (schoolDoc) {
        const data = schoolDoc.data();
        console.log("ladatadelecole", data);
        setSchoolId(schoolDoc.id);
        setLevelsData(data.levelsData.map((level) => ({ ...level })));
        form.setFieldsValue({
          schoolName: data.schoolName,
          email: user.email,
        });
      }
      setIsLoading(false);     
    }
  };

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
  form.setFieldsValue({
    Levels: levelsData.length,
  });

  const getSchoolDoc = async (userId) => {
    const q = query(collection(db, "schools"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
  };

  const updateLevels = () => {
    for (let levelIndex = 0; levelIndex < levelsData.length; levelIndex++) {
      const level = levelsData[levelIndex];

      // Définir la valeur du champ pour le nom du niveau
      form.setFieldsValue({
        [`level${levelIndex}name`]: level.name,
      });

      // Parcourir les enseignants
      for (
        let teacherIndex = 0;
        teacherIndex < level.teachers.length;
        teacherIndex++
      ) {
        const teacher = level.teachers[teacherIndex];

        // Définir la valeur du champ pour le nom de l'enseignant
        form.setFieldsValue({
          [`${levelIndex}${teacherIndex}`]: teacher,
        });
      }
      form.setFieldsValue({
        [`Nombre de classes ${level.name || `Niveau ${levelIndex + 1}`}`]:
          level.teachers.length,
      });
    }

    form.setFieldsValue({
      Levels: levelsData.length,
    });
  };

  function formatData(data) {
    const formattedData = {
      userId: userId, // Ici, vous pouvez remplacer la valeur fixe par une fonction ou une variable qui génère un userId unique
      schoolName: data.schoolName,
      timeObj: {
        "Après-midi 2.Start": `${String(
          data["Après-midi1.Start.hour"]
        ).padStart(2, "0")}:${String(data["Après-midi1.Start.minute"]).padStart(
          2,
          "0"
        )}`,
        "Matin 2.Start": `${String(data["Matin1.Start.hour"]).padStart(
          2,
          "0"
        )}:${String(data["Matin1.Start.minute"]).padStart(2, "0")}`,
        "Après-midi 2.End": `${String(data["Après-midi1.End.hour"]).padStart(
          2,
          "0"
        )}:${String(data["Après-midi1.End.minute"]).padStart(2, "0")}`,
        "Après-midi 1.End": `${String(data["Après-midi0.End.hour"]).padStart(
          2,
          "0"
        )}:${String(data["Après-midi0.End.minute"]).padStart(2, "0")}`,
        "Après-midi 1.Start": `${String(
          data["Après-midi0.Start.hour"]
        ).padStart(2, "0")}:${String(data["Après-midi0.Start.minute"]).padStart(
          2,
          "0"
        )}`,
        "Matin 1.Start": `${String(data["Matin0.Start.hour"]).padStart(
          2,
          "0"
        )}:${String(data["Matin0.Start.minute"]).padStart(2, "0")}`,
        "Matin 2.End": `${String(data["Matin1.End.hour"]).padStart(
          2,
          "0"
        )}:${String(data["Matin1.End.minute"]).padStart(2, "0")}`,
        "Matin 1.End": `${String(data["Matin0.End.hour"]).padStart(
          2,
          "0"
        )}:${String(data["Matin0.End.minute"]).padStart(2, "0")}`,
      },

      levelsData: [],
    };

    for (let i = 0; i < data.Levels; i++) {
      const levelName = data[`level${i}name`];
      const teacherCount = data[`Nombre de classes ${levelName}`];
      const teachers = [];

      for (let j = 0; j < teacherCount; j++) {
        const teacherName = data[`${i}${j}`];
        if (teacherName.trim() !== "") {
          teachers.push(teacherName);
        }
      }

      formattedData.levelsData.push({
        name: levelName,
        teachers: teachers,
      });
    }
    return formattedData;
  }

  const handleSubmit = async (values) => {
    const schoolData = formatData(values);

    console.log("maj", schoolData);

    try {
      await updateDoc(doc(db, "schools", schoolId), schoolData);
      setMessage("La mise à jour a bien été effectuée");
    } catch (error) {
      setMessage("Erreur lors de la mise à jour des informations :");
      console.error(
        "Erreur lors de la mise à jour des informations :",
        error.message
      );
    }
  };

  const labelsMap = [
    { label: "Matin 1", field: "Matin0" },
    { label: "Matin 2", field: "Matin1" },
    { label: "Après-midi 1", field: "Après-midi0" },
    { label: "Après-midi 2", field: "Après-midi1" },
  ];

  return (
    <>
      {isLoading ? (
        <div
          className="flex justify-center items-center"
          style={{ minHeight: "10rem" }}
        >
          <BeatLoader color="#B8336A" size={15} margin={2} />
        </div>
      ) : (
        <div className=" flex flex-col  items-center container mx-auto">
          <Form
            onFinish={handleSubmit}
            className=" border shadow-md px-2  flex flex-col  items-left bg-white rounded-lg"
            form={form}
          >
            <div className="-md p-6 ">
              <h2 className="text-xl font-bold mb-4">
                Informations de l’utilisateur
              </h2>
              <Form.Item className="mb-0 w-80" label="Email" name="email">
                <Input disabled />
              </Form.Item>

              {userId == !"2lgNK2mgG2Z9aWldezuv823kVSl1" ? (
                <div
                  className="mx-1 my-1 text-blue-400 text-left cursor-pointer underline hover:text-blue-600"
                  onClick={showModal}
                >
                  Changer le mot de passe
                </div>
              ) : (
                ""
              )}

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
              <h2 className="text-xl font-bold mb-4">
                Informations de l’école
              </h2>
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
                        <Form.Item name="Levels" label="Nombre de niveaux">
                          <InputNumber
                            min={0}
                            max={10}
                            onChange={(value) => handleLevelCount(value)}
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
                          />
                        </Form.Item>
                        <Form.Item
                          name={`Nombre de classes ${
                            level.name || `Niveau ${levelIndex + 1}`
                          }`}
                          label={`Nombre de classes ${
                            levelName || `Niveau ${levelIndex + 1}`
                          }`}
                        >
                          <InputNumber
                            min={0}
                            max={10}
                            onChange={(value) =>
                              handleClassCount(levelIndex, value)
                            }
                          />
                        </Form.Item>
                        <div className="bg-gray-100 p-4 rounded-lg">
                          {teachers.map((teacher, teacherIndex) => (
                            <Form.Item
                              key={teacherIndex}
                              name={`${levelIndex}${teacherIndex}`}
                              label={`${
                                levelName || `Niveau ${levelIndex + 1}`
                              } ${teacherIndex + 1}`}
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
                              />
                            </Form.Item>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })}
              </div>
              <span className="text-green-800 ">{message}</span>
              <div className="mt-2 w-full justify-between">
                <Space>
                  <Button htmlType="submit">
                    Sauvegarder les modifications
                  </Button>
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
      )}
    </>
  );
}

export default Settings;
