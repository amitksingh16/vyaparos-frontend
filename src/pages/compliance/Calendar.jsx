import { useState, useEffect } from 'react';
import axios from 'axios';

const Calendar = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [businessId, setBusinessId] = useState(null);

    useEffect(() => {
        fetchBusinessAndCalendar();
    }, []);

    const fetchBusinessAndCalendar = async () => {
        try {
            // 1. Get Business ID (Assumes single business for now)
            const busRes = await axios.get('/businesses');
            if (busRes.data.length > 0) {
                const bid = busRes.data[0].id;
                setBusinessId(bid);

                // 2. Get Calendar
                const calRes = await axios.get(`/compliance/calendar?business_id=${bid}`);
                setItems(calRes.data);
            }
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!businessId) return;
        try {
            setLoading(true);
            await axios.post('/compliance/generate', { business_id: businessId });
            await fetchBusinessAndCalendar();
        } catch {
            alert('Failed to generate calendar');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Compliance Calendar</h1>
                    <button
                        onClick={handleGenerate}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Generate / Refresh
                    </button>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <li className="p-4 text-center text-gray-500">No compliance items found. Click Generate.</li>
                        ) : (
                            items.map((item) => (
                                <li key={item.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-indigo-600 truncate uppercase">
                                                {item.compliance_type}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {item.notes}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                {item.status}
                                            </span>
                                            <span className="text-sm text-gray-500 mt-1">
                                                Due: {item.due_date}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
