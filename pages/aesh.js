import { useEffect, useState } from "react";
import Aesh from "../components/Lists/Aesh";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/router";
import { Row, Col } from "antd";

function aeshPage() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const [aeshData, setAeshData] = useState([]);
  const [schoolId, setSchoolId] = useState(null);

  useEffect(() => {
    const fetchAesh = async () => {
      if (!loading && user) {
        const schoolDoc = await getSchoolDoc();
        setSchoolId(schoolDoc.id);
        const aeshSnapshot = await getDocs(collection(schoolDoc.ref, "aesh"));
        setAeshData(aeshSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };

    fetchAesh();
  }, [user, loading]);

  console.log("schoolID",schoolId)

  const getSchoolDoc = async () => {
    const q = query(collection(db, "schools"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs[0];
  };

  const aesh = aeshData.map((data, i) => {
    return (
      <Aesh
        key={data.id}
        aeshID={data.id}
        firstName={data.firstName}
        hours={data.hours}
        schoolID={schoolId}
      />
    );
  });

  return (
    <div className=" border rounded mb-2 text-lg font-semibold">
    <Row className=" p-2 shadow-md  text-lg font-bold">
      <Col span={4}><div className="flex items-center border-r pl-2"><strong>Prénom</strong></div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2"><strong>Contrat</strong></div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2"><strong>Heures Réelles</strong></div></Col>
      <Col span={3}><div className="flex items-center border-r pl-2"><strong>Différence</strong></div></Col>
      <Col span={4}  className=" pl-2"><strong>Planning et Options</strong></Col>
    </Row>
    {aesh}
  </div>
  );
}

export default aeshPage;