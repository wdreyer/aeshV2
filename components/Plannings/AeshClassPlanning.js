import React, { useState, useEffect } from "react";
import { Row, Col, Input, Select, Form, InputNumber } from "antd";
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

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../firebaseConfig";
import { AiOutlineEdit, AiOutlineSave } from "react-icons/ai";
import { subtractTime } from "../../modules/time";

const { Option } = Select;

function AeshClassPlanning({
  firstName,
  level,
  teacher,
  hours,
  hoursReels,
  schoolId,
  idAesh,
  planning,
  onSave,
}) {
  const [form] = Form.useForm();
  const [planningActual, setPlanningActual] = useState({});

  const [childList, setChildList] = useState([]);
  const [user, loading, error] = useAuthState(auth);
  const [isEditing, setIsEditing] = useState(false);
  const [startHours, startMinutes] = hours
    .split(":")
    .map((value) => parseInt(value, 10));
  const [aeshData, setAeshData] = useState({
    firstName,
    level,
    teacher,
    hours,
    hoursReels,
    planning,
  });

  useEffect(() => {
    setPlanningActual(planning);
    setAeshData({ firstName, hours, hoursReels, planning });
  }, [planning]);


  const fetchChildList = async () => {
    const aeshRef = collection(db, `schools/${schoolId}/children`);
    const querySnapshot = await getDocs(aeshRef);
    const fetchedChilList = querySnapshot.docs.map((doc) => ({
      id: doc.id, // ajout de l'ID
      firstName: doc.data().firstName,
    }));
    setChildList(fetchedChilList);
  };

 

  useEffect(() => {
    fetchChildList();
  }, [schoolId, idAesh]);

  const handleLevelChange = (value) => {
    setLevelSelected(value);
  };
  const handleButtonClick = async () => {
    if (isEditing) {
      await onFinish();
    } else {
      setIsEditing(!isEditing);
    }
  };


  const deleteOldPlanning = async (idAesh) => {
    console.log('deleteOldPlanning called with idAesh:', idAesh);
    
    const cellPlanningsRef = collection(db, `schools/${schoolId}/cellPlanning`);
    const q = query(cellPlanningsRef, where("idAesh", "==", idAesh));
    const querySnapshot = await getDocs(q);
  
    console.log('querySnapshot size:', querySnapshot.size);
  
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      console.log('Deleting document with ID:', doc.id);
      batch.delete(doc.ref);
    });
  
    await batch.commit();
    console.log('Batch commit complete');
  };

  const deleteChildFromNewPlanning = async (newPlanning) => {
    
    const batch = writeBatch(db);
    console.log("New planning inside deleteChildFromNewPlanning: ", newPlanning);



    for (const weekday in newPlanning) {
      for (const timeslot in newPlanning[weekday]) {
        const { childId } = newPlanning[weekday][timeslot];

        const querySnapshot = await getDocs(
          query(
            collection(db, `schools/${schoolId}/cellPlanning`),
            where("weekday", "==", weekday),
            where("timeslot", "==", timeslot),
            where("childId", "==", childId)
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

  const updateDatabase = async (newPlanning, nameAesh) => {
    await deleteOldPlanning(idAesh);
    await deleteChildFromNewPlanning(newPlanning);
    const batch = writeBatch(db);
    for (const weekday in newPlanning) {
      for (const timeslot in newPlanning[weekday]) {
        const { childId, nameChild } = newPlanning[weekday][timeslot];
        const docRef = doc(
          db,
          `schools/${schoolId}/cellPlanning`,
          `${weekday}_${timeslot}_${idAesh}_${childId}`
        );
        batch.set(docRef, {
          childId:childId,
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

  const updateAesh = async (idAesh, updatedAeshData) => {
    try {
      const aeshRef = doc(db, `schools/${schoolId}/aesh`, idAesh);
      await updateDoc(aeshRef, updatedAeshData);
      setAeshData(updatedAeshData);
    } catch (error) {
      console.error("Failed to update aesh: ", error);
    }
  };

  const onFinish = async () => {
    try {
      const formValues = await form.validateFields();
      const nameAesh = aeshData.firstName;
      console.log("name de laeshici ?", formValues)
      // Process form values
      await updateDatabase(planningActual, nameAesh);
      await updateAesh(idAesh, {
        firstName: formValues.firstName,
        hours: `${formValues.startHours}:${String(
          formValues.startMinutes
        ).padStart(2, "0")}`,
      });

      // Clear old values
      weekDays.forEach((weekday) => {
        timeSlots.forEach((timeslot) => {
          if (!planningActual[weekday] || !planningActual[weekday][timeslot]) {
            form.setFieldsValue({ [`${weekday}_${timeslot}`]: undefined });
          }
        });
      });

      // Update the form values
      for (const weekday in planningActual) {
        for (const timeslot in planningActual[weekday]) {
          form.setFieldsValue({
            [`${weekday}_${timeslot}`]: {
              value: planningActual[weekday][timeslot].idAesh,
              label: planningActual[weekday][timeslot].nameAesh,
            },
          });
        }
      }
      onSave();
      setPlanningActual(planningActual);
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

  const timeSlots = ["Matin 1", "Matin 2","Après-midi 1", "Après-midi 2"];
  const weekDays = ["Lundi", "Mardi", "Jeudi", "Vendredi"];

  useEffect(() => {
    weekDays.forEach((weekday) => {
      timeSlots.forEach((timeslot) => {
        form.setFieldsValue({
          [`${weekday}_${timeslot}`]: {
            value: planningActual[weekday]?.[timeslot]?.nameAesh || "",
            label: planningActual[weekday]?.[timeslot]?.nameChild || "",
          },
        });
      });
    });
  }, [planningActual]);


  return (
    <>
    <div  className="w-[380px] m-1 mb-8 backdrop-blur-md rounded-lg shadow-lg">
    <div className="flex justify-between" >  

    <span className="mt-1 ml-1">{aeshData.firstName}</span>
    <span className="mt-1 mr-1">{isEditing ? (
      <AiOutlineSave
        onClick={handleButtonClick}
        className="text-xl cursor-pointer"
      />
    ) : (
      <AiOutlineEdit
        onClick={handleButtonClick}
        className="text-xl cursor-pointer"
      />
    )}</span>
        </div>  
      <Form
        onFinish={onFinish}
        initialValues={{
          startHours,
          startMinutes,
        }}
        layout="vertical"
        className="w-full flex flex-col lg:flex-row p-0 lg:p-1"
        form={form}
      >
        <div className="w-full  h-full flex-col lg:flex-shrink-0 border bg-gray-100 backdrop-blur-md rounded shadow-md  text-l font-semibold">
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
              <Col className="border py-1" span={4}>
                {timeSlot}
              </Col>
              {weekDays.map((day) => (
                <Col key={day} span={5} className="p-1 border">
                  {isEditing ? (
                    <Form.Item
                      name={`${day}_${timeSlot}`}
                      className="m-0"
                      initialValue={{
                        value: planningActual[day]?.[timeSlot]?.childId || "",
                        label: planningActual[day]?.[timeSlot]?.nameChild || "",
                      }}
                    >
                      <Select
                      labelInValue
                      dropdownMatchSelectWidth={false}
                        allowClear
                        style={{ width: "100%" }}
                        value={
                          planningActual[day]?.[timeSlot]?.childId
                            ? {
                                value: planningActual[day]?.[timeSlot]?.childId || "",
                                label: planningActual[day]?.[timeSlot]?.nameChild || "",
                              }
                            : undefined
                        }
                        onChange={(value, option) => {
                          if (value) {
                            const { value: childId, children: nameChild } = option;
                            setPlanningActual((prevState) => {
                              return {
                                ...prevState,
                                [day]: {
                                  ...prevState[day],
                                  [timeSlot]: {
                                    ...prevState[day]?.[timeSlot],
                                    nameChild,
                                    childId,
                                  },
                                },
                              };
                            });
                          } else {
                            // Handle the case when the value is cleared
                            setPlanningActual((prevState) => {
                              const updatedDay = { ...prevState[day] };
                              delete updatedDay[timeSlot];
                              return {
                                ...prevState,
                                [day]: updatedDay,
                              };
                            });
                          }
                        }}
                      >
                        {childList.map((child) => (
                          <Option key={child.id} value={child.id}>
                            {child.firstName}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  ) : (
                    planningActual[day]?.[timeSlot]?.nameChild || ""
                  )}
                </Col>
              ))}
            </Row>
          ))}
        </div>

      </Form>
      </div>
    </>
  );
}

export default AeshClassPlanning;
