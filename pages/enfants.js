import { useEffect, useState } from "react";
import Child from "../components/Lists/Child";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";
import { Row, Col } from "antd";

function childrenPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("");
  const [childrenData, setChildrenData] = useState([]);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!loading && user) {
        const schoolDoc = await getSchoolDoc();
        const childrenSnapshot = await getDocs(collection(schoolDoc.ref, "children"));
        setChildrenData(childrenSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };

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
        firstName={data.firstName}
        level={data.level}
        teacher={data.teacher}
        hours={data.hours}
      />
    );
  });

  return (
    <div className="w-3/5 border rounded mb-2 text-lg font-semibold">
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