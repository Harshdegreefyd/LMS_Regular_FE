import React, { useState } from 'react';
import { Search, MoreVertical, ListFilter } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ChatListSidebar = ({
    user,
    isConnected,
    searchQuery,
    setSearchQuery,
    activeChats,
    selectedChat,
    setSelectedChat
}) => {
    const [filter, setFilter] = useState('all'); 

    const filteredChats = activeChats.filter(chat => {
        const matchesSearch = chat.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.studentPhone?.includes(searchQuery);

        if (!matchesSearch) return false;

        if (filter === 'unread') {
            return chat.unreadCountCounsellor > 0;
        }

        return true;
    });

    return (
        <div className="w-[400px] flex flex-col border-r border-gray-200 bg-white z-20 h-full shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
            <div className="h-16 flex items-center justify-between px-4 bg-[#f0f2f5] shrink-0 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden cursor-pointer border border-gray-300">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold bg-gray-200 text-sm">
                                    {user?.name?.[0] || 'Me'}
                                </div>
                            )}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#f0f2f5] ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} title={isConnected ? "Online" : "Offline"}></div>
                    </div>
                    {/* User Info */}
                    <div className="flex flex-col justify-center">
                        <span className="text-sm font-semibold text-gray-800 leading-tight">
                            {user?.name || 'Counsellor'}
                        </span>
                    </div>
                </div>
                
            </div>

            <div className="px-3 py-2 bg-white border-b border-gray-100 flex flex-col gap-3">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search or start new chat"
                        className="w-full bg-[#f0f2f5] border-none text-gray-900 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#00a884] transition-all placeholder-gray-500"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 px-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === 'all' ? 'bg-[#e7fce3] text-[#008069]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === 'unread' ? 'bg-[#e7fce3] text-[#008069]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Unread
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                {filteredChats.map(chat => (
                    <div
                        key={chat.id}
                        onClick={() => setSelectedChat(chat)}
                        className={`group flex items-center p-3 cursor-pointer border-b border-gray-50 transition-all hover:bg-[#f5f6f6] ${selectedChat?.id === chat.id ? 'bg-[#f0f2f5]' : ''}`}
                    >
                        <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mr-3 shrink-0 border border-indigo-50">
                            {chat.studentName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className="text-gray-900 font-medium truncate text-[15px]">{chat.studentName}</h4>
                                <span className={`text-[11px] ${chat.unreadCountCounsellor > 0 ? 'text-[#1fa855] font-semibold' : 'text-gray-400'}`}>
                                    {chat.lastMessageAt ? dayjs(chat.lastMessageAt).format(dayjs(chat.lastMessageAt).isSame(dayjs(), 'day') ? 'HH:mm' : 'DD/MM/YY') : ''}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5 overflow-hidden pr-2">
                                    <p className={`text-sm truncate max-w-[200px] ${chat.unreadCountCounsellor > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                        {chat.lastMessage || 'Click to start chatting'}
                                    </p>
                                </div>
                                {(chat.unreadCountCounsellor > 0) && (
                                    <span className="bg-[#25D366] text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm">
                                        {chat.unreadCountCounsellor}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredChats.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                        <span className="text-gray-300 mb-2"><ListFilter size={32} /></span>
                        <p className="text-sm text-gray-400 font-medium">No chats found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatListSidebar;
