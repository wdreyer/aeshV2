import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { db } from '../../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';


function InvitForm () {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false); 

    const fadeInDown = {
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0 },
      };
    
      const controls = useAnimation();
      const { ref, inView } = useInView({
        threshold: 0.1,
      });

      React.useEffect(() => {
        if (inView) {
          controls.start('visible');
        } else {
          controls.start('hidden');
        }
      }, [controls, inView]);



    const onFinish = async (values) => {
        setLoading(true);
        try {
          await addDoc(collection(db, 'invitations'), values);
          message.success('Votre demande a été enregistrée.');
          form.resetFields();
        } catch (error) {
          console.error('Erreur lors de l\'enregistrement de la demande :', error);
          message.error("Une erreur s'est produite lors de l'enregistrement de votre demande.");
        } finally {
          setLoading(false);
        }
      };   
    
  
    return (
        <motion.div
        ref={ref}
        className="flex flex-col space-y-4 w-80 mx-auto"
        initial="hidden"
        animate={controls}
        transition={{ duration: 1 }}
        variants={fadeInDown}
      >
      <Form form={form} name="invitation" onFinish={onFinish} className='flex mt-2 flex-col justify-center' layout="horizontal">
        <Form.Item
        className='mb-1'
          label="Nom"
          name="lastName"
          rules={[{ required: true, message: 'Veuillez saisir votre nom!' }]}
        >
          <Input />
        </Form.Item>
  
        <Form.Item
        className='mb-1'
          label="Prénom"
          name="firstName"
          rules={[{ required: true, message: 'Veuillez saisir votre prénom!' }]}
        >
          <Input />
        </Form.Item>
  
        <Form.Item
        className='mb-1'
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Veuillez saisir votre adresse e-mail!' },
            { type: 'email', message: "L'adresse e-mail est invalide." },
          ]}
        >
          <Input />
        </Form.Item>
  
        <Form.Item
        className='mb-4'
          label="Message"
          name="message"
          rules={[{ required: true, message: 'Veuillez saisir un message!' }]}
        >
          <Input.TextArea />
        </Form.Item>

          <Button className="drop-shadow-md bg-[#D4FAE3] hover:text-black hover:bg-[#D8FAD4] text-gray-700 font-bold rounded-3xl border focus:outline-none focus:shadow-outline" htmlType="submit" loading={loading}>
            Demander une invitation
          </Button>

      </Form>
      </motion.div>
    );
  };

  export default InvitForm
  