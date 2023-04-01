import React, { useState } from 'react';
import { ProgressBar, Step } from 'react-step-progress-bar';
import 'react-step-progress-bar/styles.css';
import AeshInfo from './AeshInfo';
import ChildrenInfo from './ChildrenInfo';
import GeneralInfo from './GeneralInfo';

const InscriptionForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
      generalInfo: {},
      childrenInfo: {},
      aeshInfo: {},
    });
    const nextStep = () => {
      if (step < 3) {
        setStep(step + 1);
      }
    };
    const prevStep = () => {
      if (step > 1) {
        setStep(step - 1);
      }
    };
    const saveData = (data) => {
      setFormData({ ...formData, ...data });
    };
  
    return (
 
<div className="min-h-screen bg-white flex flex-col justify-center items-center shadow rounded-lg">
<div className="w-full shadow flex flex-col justify-center items-center">
  <div className="w-full max-w-3xl mt-8 mb-8">
    <ProgressBar
      percent={(step / 3) * 100}
      filledBackground="linear-gradient(to right, #F6DDDF,#FAD4D8)"
      className="h-2"
    >
      <Step>
        {({ accomplished }) => (
          <div
            className={`w-8 h-8 bg-white border border-gray-400 rounded-full flex items-center justify-center text-sm font-bold ${
              accomplished ? 'text-black' : 'text-gray-500'
            }`}
          >
            1
          </div>
        )}
      </Step>
      <Step>
        {({ accomplished }) => (
          <div
            className={`w-8 h-8 bg-white border border-gray-400 rounded-full flex items-center justify-center text-sm font-bold ${
              accomplished ? 'text-black' : 'text-gray-500'
            }`}
          >
            2
          </div>
        )}
      </Step>
      <Step>
        {({ accomplished }) => (
          <div
            className={`w-8 h-8 bg-white border border-gray-400 rounded-full flex items-center justify-center text-sm font-bold ${
              accomplished ? 'text-black' : 'text-gray-500'
            }`}
          >
            3
          </div>
        )}
      </Step>
    </ProgressBar>
  </div>
</div>
      
<main className="w-full sm:w-3/4 md:w-1/2 lg:w-1/2 flex-grow p-4 flex flex-col items-center space-y-4">
          {step === 1 && (
            <>
              <GeneralInfo saveData={saveData} nextStep={nextStep} />
            </>
          )}
          {step === 2 && (
            <>
              <ChildrenInfo saveData={saveData} prevStep={prevStep} nextStep={nextStep} />
            </>
          )}
          {step === 3 && (
            <>
              <AeshInfo saveData={saveData} prevStep={prevStep} />
            </>
          )}
        </main> 
      
        </div>
      )
 }

 export default InscriptionForm