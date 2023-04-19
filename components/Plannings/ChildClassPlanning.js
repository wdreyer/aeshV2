import { Col, Form, Input, InputNumber, Row, Select } from "antd";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { AiOutlineEdit, AiOutlineSave } from "react-icons/ai";
import { auth, db } from "../../firebaseConfig";
import { subtractTime } from "../../modules/time";
import { calculHours } from "../../modules/calculHours";

const { Option } = Select;
function ChildClassPlanning({
  firstName,
  level,
  teacher,
  hours,
  hoursReels,
  schoolId,
  childID,
  planning,
  onSave,
  schoolTime
}) {

  const [form] = Form.useForm();
  const [planningActual, setPlanningActual] = useState({});
  const [levelsData, setLevelsData] = useState([]);
  const [aeshList, setAeshList] = useState([]);
  const [user, loading, error] = useAuthState(auth);
  const [isEditing, setIsEditing] = useState(false);
  const [levelSelected, setLevelSelected] = useState(level);
  const [teacherSelected, setTeacherSelected] = useState(teacher);
  const [teacherList, setTeacherList] = useState([]);
  const [startHours, startMinutes] = hours
    .split(":")
    .map((value) => parseInt(value, 10));
  const [childData, setChildData] = useState({
    firstName,
    level,
    teacher,
    hours,
    hoursReels,
    planning,
  });
  useEffect(() => {
    setPlanningActual(planning);
    setChildData({ firstName, level, teacher, hours, hoursReels, planning });
  }, [planning]);

 const fetchLevelsData = async () => {
    const schoolDoc = await getSchoolDoc();
    setLevelsData(schoolDoc.data().levelsData);
  };
  

  const fetchAeshList = async () => {
    const aeshRef = collection(db, `schools/${schoolId}/aesh`);
    const querySnapshot = await getDocs(aeshRef);
    const fetchedAeshList = querySnapshot.docs.map((doc) => ({
      id: doc.id, // ajout de l'ID
      firstName: doc.data().firstName,
    }));
    console.log(fetchedAeshList);
    setAeshList(fetchedAeshList);
  };
  useEffect(() => {
    if (levelSelected !== "" && levelsData) {
      const level = levelsData.find(levelData => levelData.name === levelSelected);
      if (level) {
        const teachers = level.teachers;
        setTeacherList(teachers);
        form.setFieldsValue({ teacher: "" });
      }
    }
  }, [levelSelected]);

  useEffect(() => {
    fetchLevelsData();
    fetchAeshList();
  }, [schoolId, childID]);

  const handleLevelChange = (value) => {
    setLevelSelected(value);
  };
  const handleButtonClick = async () => {
    if (isEditing) {
      await onFinish();
    } else {
      form.setFieldsValue({ teacher: childData.teacher })
      setIsEditing(!isEditing);
    }
  };
  const deleteOldPlanning = async (childID) => {
    const cellPlanningsRef = collection(db, `schools/${schoolId}/cellPlanning`);
    const q = query(cellPlanningsRef, where("childId", "==", childID));
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  };

  const deleteAeshFromNewPlanning = async (newPlanning) => {
    const batch = writeBatch(db);

    for (const weekday in newPlanning) {
      for (const timeslot in newPlanning[weekday]) {
        const { idAesh } = newPlanning[weekday][timeslot];

        const querySnapshot = await getDocs(
          query(
            collection(db, `schools/${schoolId}/cellPlanning`),
            where("weekday", "==", weekday),
            where("timeslot", "==", timeslot),
            where("idAesh", "==", idAesh)
          )
        );

        console.log(
          `querySnapshot for ${weekday}-${timeslot}-${idAesh}`,
          querySnapshot
        );

        querySnapshot.forEach((doc) => {
          console.log(`Deleting doc ${doc.id}`);
          const docRef = doc.ref;
          batch.delete(docRef);
        });
      }
    }

    await batch.commit();
  };

  const updateDatabase = async (newPlanning, nameChild) => {
    await deleteOldPlanning(childID);
    await deleteAeshFromNewPlanning(newPlanning);
    const batch = writeBatch(db);
    for (const weekday in newPlanning) {
      for (const timeslot in newPlanning[weekday]) {
        const { idAesh, nameAesh } = newPlanning[weekday][timeslot];
        const docRef = doc(
          db,
          `schools/${schoolId}/cellPlanning`,
          `${weekday}_${timeslot}_${childID}_${idAesh}`
        );
        batch.set(docRef, {
          childId: childID,
          nameChild: nameChild,
          idAesh,
          nameAesh,
          weekday,
          timeslot,
        });
      }
    }

    await batch.commit();
  };

  const updateChild = async (childID, updatedChildData) => {
    try {
      const childRef = doc(db, `schools/${schoolId}/children`, childID);
      await updateDoc(childRef, updatedChildData);
    } catch (error) {
      console.error("Failed to update child: ", error);
    }
  };

  const onFinish = async () => {
    try {
      await form.validateFields();
    } catch (error) {
      return;
      console.error("Failed to get form values: ", error);
    }
    try {
      const formValues = await form.validateFields();
      console.log("formulaire", formValues);
      const result = {};
      const nameChild = formValues.firstName;
      // Process form values
      for (const key in formValues) {
        if (formValues.hasOwnProperty(key)) {
          const [weekday, timeslot] = key.split("_");
          const valueObj = formValues[key];

          if (valueObj?.value && valueObj?.label) {
            const { value: idAesh, label: nameAesh } = valueObj;
            if (!result[weekday]) result[weekday] = {};
            result[weekday][timeslot] = { idAesh, nameAesh };
          }
        }
      }
      const hoursReels = calculHours(result, schoolTime)
      setPlanningActual(result);
      setChildData({
        hoursReels : hoursReels,
        firstName: formValues.firstName,
        level: formValues.level,
        teacher: formValues.teacher,
        hours: `${formValues.startHours}:${String(formValues.startMinutes).padStart(2, '0')}`
      });
      setIsEditing(false);
      await updateDatabase(result, nameChild);
      await updateChild(childID, {
        firstName: formValues.firstName,
        level: formValues.level,
        teacher: formValues.teacher,
        hours: `${formValues.startHours.padStart(2, "0")}:${String(
          formValues.startMinutes
        ).padStart(2, "0")}`,
      });

      // Clear old values
      weekDays.forEach((weekday) => {
        timeSlots.forEach((timeslot) => {
          if (!result[weekday] || !result[weekday][timeslot]) {
            form.setFieldsValue({ [`${weekday}_${timeslot}`]: undefined });
          }
        });
      });

      // Update the form values
      for (const weekday in result) {
        for (const timeslot in result[weekday]) {
          form.setFieldsValue({
            [`${weekday}_${timeslot}`]: {
              value: result[weekday][timeslot].idAesh,
              label: result[weekday][timeslot].nameAesh,
            },
          });
        }
      }
      onSave();
   
     
    } catch (error) {
      console.error("Failed to get form values: ", error);
    }
  };

  const getSchoolDoc = async () => {
    const q = query(collection(db, "schools"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
  };

  const timeSlots = ["Matin 1", "Matin 2", "Après-midi 1", "Après-midi 2"];
  const weekDays = ["Lundi", "Mardi", "Jeudi", "Vendredi"];

  useEffect(() => {
    weekDays.forEach((weekday) => {
      timeSlots.forEach((timeslot) => {
        form.setFieldsValue({
          [`${weekday}_${timeslot}`]: {
            value: planningActual[weekday]?.[timeslot]?.idAesh || "",
            label: planningActual[weekday]?.[timeslot]?.nameAesh || "",
          },
        });
      });
    });
  }, [planningActual]);

  function getBgClass(hoursReels) {
    const minutes = convertToMinutes(hoursReels);
    console.log(minutes)
    if (minutes < -120) {
      return "bg-red-300";
    } else if (minutes >= -120 && minutes < 0) {
      return "bg-yellow-300";
    } else if (minutes === 0) {
      return "bg-green-300";
    } else if (minutes > 0 && minutes <= 120) {
      return "bg-blue-300";
    } else {
      return "bg-purple-300";
    }
  }

  function convertToMinutes(hoursReels) {
    const [hours, minutes] = hoursReels.split(":");
    return parseInt(hours) * 60 + parseInt(minutes);
  }


  return (
    <div  className="w-planning m-2  backdrop-blur-md rounded-lg shadow-lg">
    <Form
    onFinish={onFinish}
    initialValues={{
      level: levelSelected,
      teacher: teacherSelected,
      startHours,
      startMinutes,
    }}
    layout="vertical"
    form={form}
  >
  <Row className={`p-0.5 mb-2 border rounded-t-lg  text-l font-semibold ${getBgClass(subtractTime(hoursReels, hours))}`}>
  <Col span={4}>
    <div className="p-0.5 border-r border-gray-300 flex flex-col justify-between">
      <span>Prénom : </span>
      {isEditing ? (
        <Form.Item
          initialValue={childData.firstName}
          className="mb-0"
          name="firstName"
          rules={[{ required: true, message: "Champ obligatoire" }]}
        >
          <Input />
        </Form.Item>
      ) : (
        <span>{childData.firstName}</span>
      )}
    </div>
  </Col>
  <Col span={4}>
    <div className="p-0.5 border-r border-gray-300 flex flex-col">
    <span>Classe : </span>
          {isEditing ? (
            <Form.Item
              rules={[{ required: true, message: "Champ obligatoire" }]}
              className="mb-0" name="level">
              <Select value={levelSelected} onChange={handleLevelChange}>
                {levelsData.map(level => (
                  <Option key={level.name} value={level.name}>{level.name}</Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <span>{childData.level}</span>
          )}
    </div>
  </Col>
  <Col span={4}>
    <div className="p-0.5 border-r border-gray-300 flex flex-col">
    <span>Prof : </span>
          {isEditing ? (
            <Form.Item
            defaultValue={childData.teacher}
              rules={[{ required: true, message: "Champ obligatoire" }]}
              className="mb-0" name="teacher">
              <Select
                value={teacherSelected}
                style={{ width: "100%" }}
                dropdownMatchSelectWidth={false}
                onChange={(value) => setTeacherSelected(value)}
              >
                {teacherList.map(teacher => (
                  <Option key={teacher} value={teacher}>{teacher}</Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <span>{childData.teacher}</span>
          )}
    </div>
  </Col>
  <Col span={5}>
    <div className="p-0.5 border-r border-gray-300 flex flex-col">
      <span>Heures acc. :</span>
      {isEditing ? (
        <>
          <div className="mb-0 flex flex-row items-center ">
            <Form.Item  className="mb-0" name="startHours">
              <InputNumber  className="w-11" min={0} max={59} placeholder="HH" />
            </Form.Item>
            <Form.Item className="mb-0" name="startMinutes">
              <InputNumber className="w-11" min={0} max={45} step={15} placeholder="MM" />
            </Form.Item>
          </div>
        </>
      ) : (
        <>         
          <span>{childData.hours}</span>
        </>
      )}
    </div>
  </Col>
  <Col span={3}>
    <div className="p-0.5 border-r border-gray-300 flex flex-col">
      <span>H. Rée: </span>
      <span>{childData.hoursReels}</span>
    </div>
  </Col>
  <Col span={3}>
    <div  className="p-0.5 border-r border-gray-300 flex flex-col">
      <span>Diff. : </span>
      <span >{subtractTime(hoursReels, hours)}</span>
      </div>
      
        </Col>
        <Col span={1}>
          <div className=" h-full p-1 flex flex-col items-center justify-center text-gray-500 hover:text-black ">
            {isEditing ? (
              <AiOutlineSave
                onClick={handleButtonClick}
                className="text-2xl cursor-pointer"
              />
            ) : (
              <AiOutlineEdit
                onClick={handleButtonClick}
                className="text-2xl cursor-pointer"
              />
            )}
          </div>
        </Col>
      </Row>
        <div className="h-full flex-shrink-0 p-1  text-l font-semibold">
          <Row>
            <Col span={4}></Col>
            {weekDays.map((day) => (
              <Col className="border p-1" key={day} span={5}>
                {day}
              </Col>
            ))}
          </Row>
          {timeSlots.map((timeSlot) => (
            <Row key={timeSlot}>
              <Col className="border p-1" span={4}>
              {timeSlot === "Matin 1" ? "Matin 1" :
              timeSlot === "Matin 2" ? "Matin 2" :
              timeSlot === "Après-midi 1" ? "A-Midi 1" :
              timeSlot === "Après-midi 2" ? "A-Midi 2" : ""}
              </Col>
              {weekDays.map((day) => (
                <Col key={day} span={5} className="p-1 border">
                  {isEditing ? (
                    <Form.Item
                      name={`${day}_${timeSlot}`}
                      className="m-0"
                      initialValue={{
                        value: planningActual[day]?.[timeSlot]?.idAesh || "",
                        label: planningActual[day]?.[timeSlot]?.nameAesh || "",
                      }}
                    >
                      <Select
                        allowClear
                        style={{ width: "100%" }}
                        labelInValue
                        value={
                          planningActual[day]?.[timeSlot]
                            ? {
                                value:
                                  planningActual[day]?.[timeSlot]?.idAesh || "",
                                label:
                                  planningActual[day]?.[timeSlot]?.nameAesh ||
                                  "",
                              }
                            : undefined
                        }
                        onChange={(value) => {
                          if (!value) return;
                          const { key, label } = value;
                          setPlanningActual((prevState) => {
                            return {
                              ...prevState,
                              [day]: {
                                ...prevState[day],
                                [timeSlot]: {
                                  ...prevState[day]?.[timeSlot],
                                  nameAesh: label,
                                  idAesh: key, // Add this line to update the idAesh
                                },
                              },
                            };
                          });
                        }}
                      >
                        {aeshList.map((aesh) => (
                          <Option key={aesh.id} value={aesh.id}>
                            {aesh.firstName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : (
                    planningActual[day]?.[timeSlot]?.nameAesh || ""
                  )}
                </Col>
              ))}
            </Row>
          ))}
        </div>        
      </Form>
    </div>
  );
}

export default React.memo(ChildClassPlanning);
