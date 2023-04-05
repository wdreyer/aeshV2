import { Col, Row } from "antd";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Child from "../components/Lists/Child";
import { auth, db } from "../firebaseConfig";

function childrenPage() {
  const [user, loading, error] = useAuthState(auth);
  const [childrenData, setChildrenData] = useState([]);
  const [schoolId, setSchoolId] = useState(null);


    const fetchChildren = async () => {
      if (!loading && user) {
        const schoolDoc = await getSchoolDoc();
        setSchoolId(schoolDoc.id);
        const childrenSnapshot = await getDocs(collection(schoolDoc.ref, "children"));
        setChildrenData(childrenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };

    useEffect(() => {
    fetchChildren();
  }, [user, loading]);


  const getSchoolDoc = async () => {
    const q = query(collection(db, "schools"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
  };

  const children = childrenData.map((data, i) => {
    return (
      <Child
        key={data.id}
        childID={data.id}
        firstName={data.firstName}
        level={data.level}
        teacher={data.teacher}
        hoursReels={data.hoursReels}
        hours={data.hours}
        schoolID={schoolId}
        onSave={fetchChildren}
      />
    );
  });

  return (
    <div className=" border rounded mb-2 text-lg font-semibold">
    <Row className=" p-2 shadow-md  text-lg font-bold">
      <Col span={4}><div className="flex items-center border-r pl-2"><strong>Prénom</strong></div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2"><strong>Niveau</strong></div></Col>
      <Col span={4}><div className="flex items-center border-r pl-2"><strong>Prof</strong></div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2"><strong>Heures accordés</strong></div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2"><strong>Heures Réelles</strong></div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2"><strong>Différence</strong></div></Col>
      <Col span={4}  className=" pl-2"><strong>Planning et Options</strong></Col>
    </Row>
    {children}
  </div>
  );
}

export default childrenPage;