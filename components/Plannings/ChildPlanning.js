import React, { useState, useEffect } from "react";
import { Row, Col, Input, Select, Form, InputNumber, } from "antd";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  deleteDoc,
  updateDoc, 
} from "firebase/firestore";
import { ExclamationCircleOutlined } from '@ant-design/icons';


import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebaseConfig";
import { AiOutlineEdit, AiOutlineSave } from "react-icons/ai";
import { subtractTime } from "../../modules/time";

const { Option } = Select;

function ChildPlanning({
  firstName,
  level,
  teacher,
  hours,
  hoursReels,
  schoolId,
  childID,
  planning,
  onSave,
}) {
  const [form] = Form.useForm();
  const [planningActual, setPlanningActual] = useState({});
  const [levelsData, setLevelsData] = useState({});
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
    })

  useEffect(() => {
    setPlanningActual(planning);
    setChildData({firstName,
      level,
      teacher,
      hours,
      hoursReels,
      planning,})
  }, [planning]);

  const fetchLevelsData = async () => {
    const schoolDoc = await getSchoolDoc();
    setLevelsData(schoolDoc.data().levelsData);
  };
  useEffect(() => {
    setTeacherList(levelsData[levelSelected]), [levelsData];
  });

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
    if (levelSelected in levelsData) {
      const teachers = levelsData[levelSelected];
      setTeacherList(teachers);
      form.setFieldsValue({ teacher: "" });
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
    }
    else {
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
      setChildData(updatedChildData);
      
    } catch (error) {
      console.error("Failed to update child: ", error);
    }
  };

  const onFinish = async () => {
    try{
    await form.validateFields();
    }
    catch (error) {
      return
      console.error("Failed to get form values: ", error);
    }
   
    try {
      const formValues = await form.validateFields();
      console.log("formulaire", formValues )
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
      console.log(result)
      await updateDatabase(result, nameChild);
      await updateChild(childID, {
        firstName: formValues.firstName,
        level: formValues.level,
        teacher: formValues.teacher,
        hours: `${formValues.startHours}:${String(formValues.startMinutes).padStart(2, '0')}`

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
      onSave()
      setPlanningActual(result);
      setIsEditing(false);
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

  

  return (
    <>
      <div className="absolute top-5 rounded p-1 text-gray-500 hover:text-black hover:bg-gray-200  right-9">
        {isEditing ? (
          <AiOutlineSave
            onClick={handleButtonClick}
            className="text-xl cursor-pointer"
          />
        ) : (
          <AiOutlineEdit
            onClick={handleButtonClick}
            className="text-xl cursor-pointer"
          />
        )}
      </div>
      <Form
        onFinish={onFinish}
        initialValues={{
          level: levelSelected,
          teacher: teacherSelected,
          startHours,
          startMinutes,
        }}
        layout="vertical"
        className="w-full flex p-3"
        form={form}
      >
        <div className="w-3/4 h-full flex-shrink-0 border bg-gray-100 backdrop-blur-md rounded shadow-md  text-l font-semibold">
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
                {timeSlot}
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
                                value: planningActual[day]?.[timeSlot]?.idAesh || "",
                                label:
                                planningActual[day]?.[timeSlot]?.nameAesh || "",
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

        <div className="w-1/4 mx-2 bg-gray-100 backdrop-blur-md rounded shadow-md text-l font-semibold flex flex-col">
          <div className="border p-1 flex flex-row justify-between">
            <span>Prénom : </span>
            {isEditing ? (
              <Form.Item
                initialValue={childData.firstName}
                className="mb-0 w-1/2"
                name="firstName"
                rules={[{ required: true, message: "Champ obligatoire" }]}

              >
                <Input />
              </Form.Item>
            ) : (
              <span>{childData.firstName}</span>
            )}
          </div>
          <div className="border p-1 flex flex-row justify-between">
            <span>Classe : </span>
            {isEditing ? (
              <Form.Item                 rules={[{ required: true, message: "Champ obligatoire" }]}
               className="mb-0" name="level">
                <Select value={levelSelected} onChange={handleLevelChange}>
                  {Object.keys(levelsData).map((level) => (
                    <Option key={level}>{level}</Option>
                  ))}
                </Select>
              </Form.Item>
            ) : (
              <span>{childData.level}</span>
            )}
          </div>
          <div className="border p-1 flex flex-row justify-between">
            
            <span>Prof : </span>
            {isEditing ? (
              <Form.Item                 rules={[{ required: true, message: "Champ obligatoire" }]}
              className="mb-0 " name="teacher">
                <Select
                  value={teacherSelected}
                  style={{ width: "100px" }}
                  dropdownMatchSelectWidth={false}
                >
                  {teacherList.map((teacher) => (
                    <Option key={teacher}>{teacher}</Option>
                  ))}
                </Select>
              </Form.Item>
            ) : (
              <span>{childData.teacher}</span>
            )}
          </div>

          {isEditing ? (
            <>
              <span>Heures accordées :</span>
              <div className="mb-0 flex flex-row">
                <Form.Item className="mb-0" name="startHours">
                  <InputNumber min={0} max={59} placeholder="HH" />
                </Form.Item>
                <Form.Item className="mb-0" name="startMinutes">
                  <InputNumber min={0} max={45} step={15} placeholder="MM" />
                </Form.Item>
              </div>
            </>
          ) : (
            <div className="border p-1 flex flex-row justify-between">
              
              <span>Heures accordées : </span>
              <span>{childData.hours}</span>
            </div>
          )}

          <div className="border p-1 flex flex-row justify-between">
            
            <span>Heures Réelles : </span>
            <span>{childData.hoursReels}</span>
          </div>

          <div className="border p-1 flex flex-row justify-between">
            <span>Différence : </span>
            <span>{subtractTime(hoursReels,hours)}</span>
          </div>
        </div>
      </Form>
    </>
  );
}

export default ChildPlanning;