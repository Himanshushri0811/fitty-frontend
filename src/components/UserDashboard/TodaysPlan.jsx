import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, MessageSquareQuote } from 'lucide-react';
import axios from 'axios';

const TodaysPlan = ({ plan, onStatusChange }) => {

    const handleToggle = async (itemId, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

        // Optimistic update
        onStatusChange(itemId, newStatus);

        try {
            const token = localStorage.getItem('access_token');
            await axios.patch('http://127.0.0.1:8000/api/fitness/daily-plan/',
                { item_id: itemId, status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("Failed to update status", err);
            // Revert on error would be ideal here
        }
    };

    if (!plan) return <div className="p-4 text-center text-gray-400">Loading plan...</div>;

    const { items, coach_message } = plan;

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Coach Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-900/30 border border-indigo-500/30 rounded-xl p-4 flex items-start gap-3 backdrop-blur-sm"
            >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                    <span className="text-xl">🤖</span>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-indigo-300 mb-1">Fitty Coach</h4>
                    <p className="text-sm text-gray-200 italic">"{coach_message}"</p>
                </div>
            </motion.div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`relative pl-8 group cursor-pointer ${item.status === 'completed' ? 'opacity-60' : ''}`}
                        onClick={() => handleToggle(item.id, item.status)}
                    >
                        {/* Timeline Line */}
                        {index !== items.length - 1 && (
                            <div className="absolute left-[11px] top-7 bottom-[-16px] w-[2px] bg-gray-700/50 group-hover:bg-indigo-500/30 transition-colors" />
                        )}

                        {/* Status Dot */}
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${item.status === 'completed'
                                ? 'bg-green-500/20 text-green-400 scale-110'
                                : 'bg-gray-800 text-gray-500 group-hover:text-indigo-400 group-hover:scale-110'
                            }`}>
                            {item.status === 'completed' ? <CheckCircle size={16} fill="currentColor" className="text-green-500" /> : <Circle size={16} />}
                        </div>

                        {/* Content Card */}
                        <div className={`p-3 rounded-lg border transition-all duration-300 ${item.status === 'completed'
                                ? 'bg-gray-900/30 border-gray-800'
                                : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60 hover:border-indigo-500/30'
                            }`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{item.time}</span>
                                <span className={`text-[10px] uppercase tracking-wider font-bold ${item.type === 'workout' ? 'text-orange-400' :
                                        item.type === 'diet' ? 'text-green-400' :
                                            item.type === 'yoga' ? 'text-purple-400' : 'text-blue-400'
                                    }`}>{item.type}</span>
                            </div>
                            <h3 className={`font-semibold text-gray-100 ${item.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                                {item.title}
                            </h3>
                            {item.coach_note && (
                                <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 bg-black/20 p-1.5 rounded">
                                    <MessageSquareQuote size={12} className="text-indigo-400" />
                                    <span>{item.coach_note}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default TodaysPlan;
