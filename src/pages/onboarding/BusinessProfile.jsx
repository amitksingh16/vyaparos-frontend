import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../src/context/AuthContext';
import { Building2, FileText, CheckCircle2, ArrowRight, ArrowLeft, Building, MapPin } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

const IndianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

const BusinessProfile = () => {
    const navigate = useNavigate();
    const { fetchUser, user } = useAuth();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        business_name: '',
        pan: '',
        gstin: '',
        gst_registered: false,
        business_type: 'prop',
        state: 'Maharashtra',
        turnover: '',
        filing_type: 'monthly',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleNext = () => {
        if (step === 1 && !formData.business_name) {
            setToast({ message: "Business Name is required", type: "error" });
            return;
        }

        // Skip step 2 if not GST registered
        if (step === 1 && !formData.gst_registered) {
            setStep(3);
        } else {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step === 3 && !formData.gst_registered) {
            setStep(1);
        } else {
            setStep(step - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Clean up payload based on GST registration
            const payload = { ...formData };
            if (!payload.gst_registered) {
                payload.gstin = null;
                payload.filing_type = 'monthly';
            }

            await axios.post('/businesses', payload);

            // Re-fetch user to get updated setup_completed status in token/state
            await fetchUser();

            setToast({ message: "Setup completed successfully!", type: "success" });
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (error) {
            console.error('Error creating business', error);
            setToast({ message: "Failed to create business profile", type: "error" });
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, title: 'Basics', icon: <Building2 className="w-4 h-4" /> },
        { num: 2, title: 'Tax Details', icon: <FileText className="w-4 h-4" /> },
        { num: 3, title: 'Review', icon: <CheckCircle2 className="w-4 h-4" /> }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            {/* Background design */}
            <div className="absolute top-0 left-0 w-full h-96 bg-[#0A2C4B] -skew-y-3 origin-top-left -z-10"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-2xl z-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white font-display tracking-tight">
                        Complete your Business Setup
                    </h2>
                    <p className="mt-2 text-blue-100">
                        Let's get VyaparOS personalized for {user?.name || 'you'}.
                    </p>
                </div>

                <div className="bg-white rounded-[20px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">

                    {/* Progress Indicator */}
                    <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-5 flex justify-between items-center">
                        {steps.map((s, i) => (
                            <div key={s.num} className="flex flex-col items-center relative z-10 flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${step >= s.num
                                        ? 'bg-[#0A2C4B] border-[#0A2C4B] text-white'
                                        : 'bg-white border-slate-200 text-slate-400'
                                    }`}>
                                    {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                                </div>
                                <span className={`text-xs mt-2 font-medium transition-colors duration-300 ${step >= s.num ? 'text-[#0A2C4B]' : 'text-slate-400'
                                    }`}>{s.title}</span>

                                {/* Connector Line */}
                                {i < steps.length - 1 && (
                                    <div className={`absolute top-5 left-[50%] w-full h-[2px] -z-10 transition-colors duration-300 ${step > s.num ? 'bg-[#0A2C4B]' : 'bg-slate-200'
                                        }`}></div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-8 sm:p-10">
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

                            {/* STEP 1: Basics */}
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xl font-bold text-slate-800 mb-6">Business Information</h3>

                                    <Input
                                        id="business_name"
                                        name="business_name"
                                        label="Legal Business Name"
                                        placeholder="e.g. Sharma Enterprises"
                                        value={formData.business_name}
                                        onChange={handleChange}
                                        icon={<Building className="w-5 h-5" />}
                                        required
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Business Type
                                        </label>
                                        <select
                                            name="business_type"
                                            value={formData.business_type}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A2C4B] focus:border-transparent transition-all cursor-pointer"
                                        >
                                            <option value="prop">Proprietorship</option>
                                            <option value="partnership">Partnership Firm</option>
                                            <option value="llp">Limited Liability Partnership (LLP)</option>
                                            <option value="pvt_ltd">Private Limited Company</option>
                                            <option value="opc">One Person Company (OPC)</option>
                                        </select>
                                    </div>

                                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-slate-800">GST Registration</h4>
                                            <p className="text-sm text-slate-500">Is your business registered for GST?</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="gst_registered"
                                                className="sr-only peer"
                                                checked={formData.gst_registered}
                                                onChange={handleChange}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0A2C4B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A2C4B]"></div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: GST Details */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xl font-bold text-slate-800 mb-6">Tax Details</h3>

                                    <Input
                                        id="gstin"
                                        name="gstin"
                                        label="GSTIN"
                                        placeholder="e.g. 27AAAAA0000A1Z5"
                                        value={formData.gstin}
                                        onChange={handleChange}
                                        required={formData.gst_registered}
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            State
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                                            <select
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A2C4B] focus:border-transparent transition-all cursor-pointer"
                                            >
                                                {IndianStates.map(state => (
                                                    <option key={state} value={state}>{state}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Filing Scheme
                                        </label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div
                                                onClick={() => setFormData({ ...formData, filing_type: 'monthly' })}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.filing_type === 'monthly' ? 'border-[#0A2C4B] bg-[#0A2C4B]/5' : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`font-semibold ${formData.filing_type === 'monthly' ? 'text-[#0A2C4B]' : 'text-slate-700'}`}>Monthly</span>
                                                    {formData.filing_type === 'monthly' && <CheckCircle2 className="w-4 h-4 text-[#0A2C4B]" />}
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed">Standard monthly GSTR-1 and GSTR-3B filings.</p>
                                            </div>

                                            <div
                                                onClick={() => setFormData({ ...formData, filing_type: 'qrmp' })}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.filing_type === 'qrmp' ? 'border-[#0A2C4B] bg-[#0A2C4B]/5' : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className={`font-semibold ${formData.filing_type === 'qrmp' ? 'text-[#0A2C4B]' : 'text-slate-700'}`}>QRMP</span>
                                                    {formData.filing_type === 'qrmp' && <CheckCircle2 className="w-4 h-4 text-[#0A2C4B]" />}
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed">Quarterly Return, Monthly Payment scheme.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Review */}
                            {step === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Review & Confirm</h3>
                                    <p className="text-sm text-slate-500 mb-6">Please verify your details before finalizing.</p>

                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 space-y-4">
                                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Business Name</p>
                                                <p className="font-semibold text-slate-800">{formData.business_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">Business Type</p>
                                                <p className="font-semibold text-slate-800 capitalize">{formData.business_type.replace('_', ' ')}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500 mb-1">GST Registered</p>
                                                <p className={`font-semibold ${formData.gst_registered ? 'text-green-600' : 'text-slate-800'}`}>
                                                    {formData.gst_registered ? 'Yes' : 'No'}
                                                </p>
                                            </div>
                                            {formData.gst_registered && (
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">GSTIN</p>
                                                    <p className="font-semibold text-slate-800">{formData.gstin || 'N/A'}</p>
                                                </div>
                                            )}
                                        </div>

                                        {formData.gst_registered && (
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Filing Scheme</p>
                                                    <p className="font-semibold text-slate-800 uppercase">{formData.filing_type}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">State</p>
                                                    <p className="font-semibold text-slate-800">{formData.state}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
                                {step > 1 ? (
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-2 transition-colors px-4 py-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </button>
                                ) : (
                                    <div></div> // Empty div to maintain flex spacing
                                )}

                                {step < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        className="bg-[#0A2C4B] hover:bg-[#1E3A8A] text-white px-8 py-2.5 rounded-xl transition-all flex items-center justify-center shadow-md shadow-[#0A2C4B]/20"
                                        rightIcon={<ArrowRight className="w-4 h-4" />}
                                    >
                                        Continue
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        isLoading={loading}
                                        className="bg-[#0F5C4A] hover:bg-[#0A4134] text-white px-8 py-2.5 rounded-xl transition-all flex items-center justify-center shadow-md shadow-[#0F5C4A]/20"
                                    >
                                        Confirm & Save Profile
                                    </Button>
                                )}
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessProfile;
