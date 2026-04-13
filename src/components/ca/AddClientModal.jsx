import React, { useState } from 'react';
import { X, Building2, FileText, CheckCircle2, UserPlus } from 'lucide-react';
import axios from 'axios';
import Button from '../ui/Button';

const INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// GST State Code mapping (First 2 digits of GSTIN -> Indian State)
const GST_STATE_CODES = {
    '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', '04': 'Chandigarh',
    '05': 'Uttarakhand', '06': 'Haryana', '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
    '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh', '13': 'Nagaland', '14': 'Manipur',
    '15': 'Mizoram', '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam', '19': 'West Bengal',
    '20': 'Jharkhand', '21': 'Odisha', '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
    '26': 'Dadra and Nagar Haveli and Daman and Diu', '27': 'Maharashtra', '29': 'Karnataka',
    '30': 'Goa', '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
    '35': 'Andaman and Nicobar Islands', '36': 'Telangana', '37': 'Andhra Pradesh', '38': 'Ladakh'
};

const AddClientModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [teamLoading, setTeamLoading] = useState(false);
    const [team, setTeam] = useState([]);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        business_name: '',
        email: '',
        primary_mobile: '',
        whatsapp_mobile: '',
        same_as_primary: false,
        business_type: 'prop',
        gst_registered: false,
        gstin: '',
        filing_type: 'monthly',
        state: '',
        assigned_to: ''
    });

    React.useEffect(() => {
        if (isOpen) {
            const fetchTeam = async () => {
                setTeamLoading(true);
                try {
                    const res = await axios.get('/ca/team');
                    setTeam(res.data);
                } catch (err) {
                    console.error("Failed to fetch team for assignment dropdown", err);
                } finally {
                    setTeamLoading(false);
                }
            };
            fetchTeam();
            // Reset form
            setFormData({
                business_name: '',
                email: '',
                primary_mobile: '',
                whatsapp_mobile: '',
                same_as_primary: false,
                pan: '',
                business_type: 'prop',
                gst_registered: false,
                gstin: '',
                filing_type: 'monthly',
                state: '',
                assigned_to: ''
            });
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        let finalValue = type === 'checkbox' ? checked : value;
        let updates = { [name]: finalValue };

        if (name === 'same_as_primary') {
            if (checked) {
                updates.whatsapp_mobile = formData.primary_mobile;
            } else {
                updates.whatsapp_mobile = '';
            }
        }

        if (name === 'primary_mobile' && formData.same_as_primary) {
            updates.whatsapp_mobile = finalValue;
        }

        // Intelligence: PAN Auto-Detection
        if (name === 'pan') {
            finalValue = finalValue.toUpperCase();
            updates.pan = finalValue;

            if (finalValue.length >= 4) {
                const fourthChar = finalValue.charAt(3);
                if (fourthChar === 'P') updates.business_type = 'prop';
                else if (fourthChar === 'C') updates.business_type = 'pvt_ltd';
                else if (fourthChar === 'F') updates.business_type = 'partnership';
                // Note: Other typings like 'H' (HUF) or 'T' (Trust) can be added later if needed
            }
        }

        // Intelligence: GST Auto-Detection
        if (name === 'gstin') {
            finalValue = finalValue.toUpperCase();
            updates.gstin = finalValue;

            if (finalValue.length >= 2) {
                const stateCode = finalValue.substring(0, 2);
                if (GST_STATE_CODES[stateCode]) {
                    updates.state = GST_STATE_CODES[stateCode];
                }
            }
        }

        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await axios.post('/ca/clients', formData);
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add client. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 hidden">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-display">
                        <Building2 className="w-5 h-5 text-[#0A2C4B]" />
                        Add New Client
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Header visible */}
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-[#0A2C4B] to-[#0A2C4B]/90">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                        <Building2 className="w-5 h-5 text-white/80" />
                        Add New Client
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                            <span className="shrink-0 mt-0.5"><X className="w-4 h-4" /></span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form id="add-client-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Business Name and Assignment */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Business Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="business_name"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Acme Corp"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="contact@acme.com"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Primary Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    name="primary_mobile"
                                    value={formData.primary_mobile}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                    maxLength={15}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-semibold text-slate-700">
                                        WhatsApp Number
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500 font-medium">
                                        <input
                                            type="checkbox"
                                            name="same_as_primary"
                                            checked={formData.same_as_primary}
                                            onChange={handleChange}
                                            className="w-3.5 h-3.5 rounded-sm border-slate-300 text-[#0A2C4B] focus:ring-[#0A2C4B]"
                                        />
                                        Same as Primary
                                    </label>
                                </div>
                                <input
                                    type="tel"
                                    name="whatsapp_mobile"
                                    value={formData.whatsapp_mobile}
                                    onChange={handleChange}
                                    disabled={formData.same_as_primary}
                                    placeholder="9876543210"
                                    maxLength={15}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Assign to Team Member */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                                    <UserPlus className="w-4 h-4 text-slate-400" />
                                    Assign to Team Member
                                </label>
                                <select
                                    name="assigned_to"
                                    value={formData.assigned_to}
                                    onChange={handleChange}
                                    disabled={teamLoading}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all appearance-none bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                                >
                                    <option value="">Unassigned (Me)</option>
                                    {team.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.role === 'ca_staff' ? 'Staff' : 'Article'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Client PAN */}
                        <div>
                            <label className="flex items-center text-sm font-semibold text-slate-700 mb-1">
                                Client PAN
                                {/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan) && (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-1.5" />
                                )}
                            </label>
                            <input
                                type="text"
                                name="pan"
                                value={formData.pan}
                                onChange={handleChange}
                                placeholder="ABCDE1234F"
                                maxLength={10}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all uppercase"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Business Type */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Business Type
                                </label>
                                <select
                                    name="business_type"
                                    value={formData.business_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all appearance-none bg-white"
                                >
                                    <option value="prop">Proprietorship</option>
                                    <option value="partnership">Partnership</option>
                                    <option value="llp">LLP</option>
                                    <option value="pvt_ltd">Private Limited</option>
                                    <option value="opc">OPC</option>
                                </select>
                            </div>

                            {/* State */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all appearance-none bg-white cursor-pointer"
                                >
                                    <option value="" disabled>Select a state</option>
                                    {INDIAN_STATES.map((state) => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            {/* GST Registered Toggle */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700">GST Registered</label>
                                    <p className="text-xs text-slate-500 mt-0.5">Is this business registered under GST?</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="gst_registered"
                                        checked={formData.gst_registered}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0A2C4B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A2C4B]"></div>
                                </label>
                            </div>

                            {/* Conditional GST Items */}
                            {formData.gst_registered && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* GSTIN */}
                                    <div className="sm:col-span-2">
                                        <label className="flex items-center text-sm font-semibold text-slate-700 mb-1">
                                            GSTIN <span className="text-red-500 ml-1">*</span>
                                            {/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin) && (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-1.5" />
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            name="gstin"
                                            value={formData.gstin}
                                            onChange={handleChange}
                                            required={formData.gst_registered}
                                            placeholder="22AAAAA0000A1Z5"
                                            maxLength={15}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all uppercase"
                                        />
                                    </div>

                                    {/* Filing Type */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            Return Filing Frequency
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className={`cursor-pointer rounded-xl border p-3 flex flex-col gap-1 transition-all ${formData.filing_type === 'monthly' ? 'border-[#0A2C4B] bg-[#0A2C4B]/5 ring-1 ring-[#0A2C4B]' : 'border-slate-200 hover:border-slate-300'}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-sm text-slate-800">Monthly</span>
                                                    {formData.filing_type === 'monthly' && <CheckCircle2 className="w-4 h-4 text-[#0A2C4B]" />}
                                                </div>
                                                <span className="text-xs text-slate-500">File GSTR-1 & 3B every month</span>
                                                <input
                                                    type="radio"
                                                    name="filing_type"
                                                    value="monthly"
                                                    checked={formData.filing_type === 'monthly'}
                                                    onChange={handleChange}
                                                    className="sr-only"
                                                />
                                            </label>

                                            <label className={`cursor-pointer rounded-xl border p-3 flex flex-col gap-1 transition-all ${formData.filing_type === 'qrmp' ? 'border-[#0A2C4B] bg-[#0A2C4B]/5 ring-1 ring-[#0A2C4B]' : 'border-slate-200 hover:border-slate-300'}`}>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-sm text-slate-800">QRMP</span>
                                                    {formData.filing_type === 'qrmp' && <CheckCircle2 className="w-4 h-4 text-[#0A2C4B]" />}
                                                </div>
                                                <span className="text-xs text-slate-500">Quarterly Return, Monthly Payment</span>
                                                <input
                                                    type="radio"
                                                    name="filing_type"
                                                    value="qrmp"
                                                    checked={formData.filing_type === 'qrmp'}
                                                    onChange={handleChange}
                                                    className="sr-only"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>

                    {/* Pro Tip */}
                    <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-indigo-600 font-bold text-xs font-display">💡</span>
                        </div>
                        <p className="text-sm text-indigo-900/80 leading-relaxed font-medium">
                            <span className="font-bold text-indigo-900">Pro-tip:</span> Adding the client's WhatsApp number ensures documents are automatically sorted into the vault.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="add-client-form"
                        disabled={loading}
                        className="min-w-[120px]"
                    >
                        {loading ? 'Adding...' : 'Save Client'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddClientModal;
