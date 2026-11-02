import { useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { MdArrowBack, MdClose, MdPersonAddAlt1 } from "react-icons/md";
import Stepper from "./components/Stepper";
import { EmployeeFormProvider } from "./context/EmployeeFormContext";

import BasicDetails from "./steps/BasicDetails";
import SalaryDetails from "./steps/SalaryDetails";
import PersonalDetails from "./steps/PersonalDetails";
import PaymentDetails from "./steps/PaymentDetails";

const AddEmployee = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const handleCancel = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("operation");
    params.delete("id");
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handleBack = () => {
    if (step === 0) {
      handleCancel();
    } else {
      setStep((prev) => prev - 1);
    }
  };

  const steps = [
    <BasicDetails onNext={() => setStep(1)} />,
    <SalaryDetails onNext={() => setStep(2)} onBack={handleBack} />,
    <PersonalDetails onNext={() => setStep(3) } onBack={handleBack}/>,
    <PaymentDetails onBack={handleBack}/>
  ];

  return (
    <EmployeeFormProvider>
      <div className="max-w-5xl mx-auto space-y-4">
        {/* --- MAIN CONTAINER --- */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* --- TOP HEADER --- */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-muted sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-primary rounded-lg border border-blue-100">
                <MdPersonAddAlt1 size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary">
                  Employee Onboarding Wizard
                </h2>
                <p className="text-xs text-text-muted">
                  Step {step + 1} of {steps.length} • {step === 3 ? 'Finalizing' : 'Profile Information'}
                </p>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs font-semibold text-danger hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 border border-rose-200"
            >
              <MdClose size={16} />
              <span>Cancel</span>
            </button>
          </div>

          {/* --- STEPPER PROGRESS --- */}
          <div className="bg-white py-5 border-b border-gray-200 px-6 md:px-10">
            <Stepper currentStep={step} onBack={handleBack} />
          </div>

          {/* --- FORM CONTENT --- */}
          <div className="flex-1 p-6 md:p-8 transition-all duration-300">
             <div className="max-w-3xl mx-auto h-full">
                {steps[step]}
             </div>
          </div>

        </div>

        {/* --- FOOTER INFO --- */}
        <div className="text-center">
          <p className="text-xs text-text-muted">
            Data is validated and saved as you progress through each step
          </p>
        </div>
      </div>
    </EmployeeFormProvider>
  );
};

export default AddEmployee;