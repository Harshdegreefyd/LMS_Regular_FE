import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useOperatorSocket } from '../../hooks/useOperatorSocket';
import chatApi from '../../services/chat.api';
import ChatListSidebar from './ChatListSidebar';
import ChatWindowArea from './ChatWindowArea';
import UnifiedCallModal from '../UnifiedCallModel';
import { PhoneOff } from 'lucide-react';

const WebsiteChatDashboard = () => {
    const { user, role } = useSelector((state) => state.auth);
    const location = useLocation();
    const operatorId = user?.counsellor_id || user?.id || user?._id;
    const operatorName = user?.name || user?.full_name || user?.username;
    const { isConnected, activeChats, setActiveChats, currentChatMessages, setCurrentChatMessages, sendMessage, joinChatRoom, sendTyping, typingUsers, markRead, studentStatus,selectedChat, setSelectedChat } = useOperatorSocket(operatorId, role,operatorName);
   const isAllowedToChat = ['admin', 'supervisor']
  .includes(role?.toLowerCase());
    
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCallModal, setShowCallModal] = useState(false);
    const [isCallConnected, setIsCallConnected] = useState(false);

    const handleCallAction = (connected) => {
        setIsCallConnected(connected);
        setShowCallModal(true);
    };

    const handleModalSuccess = async () => {
        setShowCallModal(false);
        if (selectedChat) {
            try {
                await chatApi.closeChat(selectedChat.id, operatorId, role);
                setSelectedChat(null);
            } catch (error) {
                console.error('Failed to close chat', error);
                alert('Failed to close chat');
            }
        }
    };

    useEffect(() => {
        if (location.state?.selectedChatId && activeChats.length > 0) {
            const chatToSelect = activeChats.find(c => c.id === location.state.selectedChatId);
            if (chatToSelect) {
                setSelectedChat(chatToSelect);
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, activeChats]);

    useEffect(() => {
        if (selectedChat?.id) {
            const updatedChat = activeChats.find(c => c.id === selectedChat.id);
            if (updatedChat && (updatedChat.status !== selectedChat.status || updatedChat.lastMessageAt !== selectedChat.lastMessageAt)) {
                setSelectedChat(updatedChat);
            }
        }
    }, [activeChats, selectedChat]);

    useEffect(() => {
        if (selectedChat?.id) {
            joinChatRoom(selectedChat.id);
            markRead(selectedChat.id);

            chatApi.getHistory(selectedChat.id, { aggregated: true })
                .then(res => {
                    if (res.success) {
                        setCurrentChatMessages(prev => ({
                            ...prev,
                            [selectedChat.id]: res.data
                        }));
                    }
                })
                .catch(err => console.error('Failed to load history', err));
        }
    }, [selectedChat?.id]);



    const handleSendMessage = (e, overrideText) => {
        if (e) e.preventDefault();
        const textToSend = overrideText || inputText;

        if (!selectedChat || !textToSend?.trim()) return;

        sendMessage(selectedChat.id, textToSend.trim());
        if (!overrideText) setInputText('');
    };

    const handleCloseChat = async () => {
        if (!selectedChat) return;
        if (window.confirm('Are you sure you want to close this chat?')) {
            try {
                await chatApi.closeChat(selectedChat.id, operatorId, role);
            } catch (error) {
                console.error('Failed to close chat', error);
                alert('Failed to close chat');
            }
        }
    };

    const messages = selectedChat ? (currentChatMessages[selectedChat.id] || []) : [];

    return (
        <div className="flex bg-gray-100 h-[90vh] w-full max-w-[1600px] mx-auto overflow-hidden rounded-xl shadow-sm mt-1 border border-gray-200 font-sans relative">

            <div className="absolute top-0 w-full h-32 bg-[#00a884] z-0"></div>

            <div className="flex w-full h-full z-10 bg-white">
                <ChatListSidebar
                    user={user}
                    isConnected={isConnected}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeChats={activeChats}
                    selectedChat={selectedChat}
                    setSelectedChat={setSelectedChat}
                />

                <div className="flex-1 bg-[#efeae2]">
                    <ChatWindowArea
                        selectedChat={selectedChat}
                        messages={messages}
                        inputText={inputText}
                        setInputText={setInputText}
                        handleSendMessage={handleSendMessage}
                        handleCloseChat={handleCloseChat}
                        sendTyping={sendTyping}
                        isTyping={selectedChat && typingUsers ? typingUsers[selectedChat.id] : false}
                        onCallAction={handleCallAction}
                        isStudentOnline={selectedChat && studentStatus ? (studentStatus[selectedChat.id] === 'online') : false}
                        isAllowedToChat={isAllowedToChat}
                    />
                </div>
            </div>

            {showCallModal && selectedChat && (
                <UnifiedCallModal
                    isOpen={showCallModal}
                    onClose={() => setShowCallModal(false)}
                    selectedStudent={{
                        student_id: selectedChat.studentId,
                        student_name: selectedChat.studentName,
                        student_phone: selectedChat.studentPhone,
                        ...selectedChat
                    }}
                    isConnectedCall={isCallConnected}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    );
};

export default WebsiteChatDashboard;
