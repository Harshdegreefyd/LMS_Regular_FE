import React, { useRef, useEffect, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import {
  Send,
  Smile,
  Phone,
  Check,
  CheckCheck,
  Zap
} from 'lucide-react';
import { PhoneOff } from 'lucide-react';
import dayjs from 'dayjs';

const QUICK_REPLIES = [
  "Hi, how can I help you today?",
  "Hello! Welcome to Degreefyd.",
  "Are you interested in any specific course?",
  "Could you please share your educational background?",
  "Let me connect you with a senior counsellor.",
  "Thank you for contacting us."
];

const ChatWindowArea = ({
  selectedChat,
  messages,
  inputText,
  handleSendMessage,
  handleCloseChat,
  sendTyping,
  isTyping,
  setInputText,
  onCallAction,
  isStudentOnline = false,
  isAllowedToChat = true
}) => {
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isLocalTyping = useRef(false);

  const emojiPickerRef = useRef(null);
  const quickRepliesRef = useRef(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  /* ✅ ONLY ADDITION */
  const isChatDisabled = isClosed || !isAllowedToChat;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat, isTyping]);

  useEffect(() => {
    if (selectedChat) {
      setIsClosed(
        selectedChat.status === 'CLOSED_BY_COUNSELLOR' ||
        selectedChat.status === 'CLOSED_BY_STUDENT'
      );
    }
  }, [selectedChat]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (quickRepliesRef.current && !quickRepliesRef.current.contains(event.target)) {
        setShowQuickReplies(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTyping = (e) => {
    setInputText(e.target.value);
    if (!selectedChat || !sendTyping || isChatDisabled) return;

    if (!isLocalTyping.current) {
      sendTyping(selectedChat.id, true);
      isLocalTyping.current = true;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(selectedChat.id, false);
      isLocalTyping.current = false;
    }, 2000);
  };

  const onEmojiClick = (emojiObject) => {
    if (isChatDisabled) return;
    setInputText((prev) => prev + emojiObject.emoji);
  };

  const handleQuickReply = (text) => {
    if (isChatDisabled) return;
    handleSendMessage(null, text);
    setShowQuickReplies(false);
  };

  const onFormSubmit = (e) => {
    if (isChatDisabled) return;
    handleSendMessage(e);
    setShowEmojiPicker(false);
    setShowQuickReplies(false);
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col min-h-[85vh] items-center justify-center bg-[#efeae2] px-6 select-none relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Phone size={180} className="text-gray-200 opacity-30" />
        </div>

        <div className="relative z-10 text-center max-w-sm">
          <h2 className="text-lg font-medium text-gray-700 mb-2">
            Degreefyd Chat
          </h2>
          <p className="text-sm text-gray-500">
            Choose a conversation from the left panel to start engaging with students.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Waiting for a conversation
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">

      <div className="absolute inset-0 opacity-30 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] pointer-events-none z-0" />

      {/* HEADER */}
      <div className="h-16 bg-[#f0f2f5] border-b border-gray-200 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600">
            {selectedChat.studentName?.[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {selectedChat.studentName}
            </p>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              {isTyping ? (
                <span className="text-green-600 animate-pulse">typing...</span>
              ) : isStudentOnline ? (
                <span className="text-green-600 font-medium">Online</span>
              ) : (
                selectedChat.studentPhone
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isChatDisabled && onCallAction && (
            <>
              <button
                onClick={() => onCallAction(true)}
                className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"
              >
                <Phone size={18} />
              </button>
              <button
                onClick={() => onCallAction(false)}
                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
              >
                <PhoneOff size={18} />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
            </>
          )}

          {!isChatDisabled && (
            <button
              onClick={handleCloseChat}
              className="text-xs font-bold text-red-600 border border-red-200 px-3 py-1.5 rounded-md hover:bg-red-100"
            >
              End Chat
            </button>
          )}
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-2 z-10">
        {messages.map((msg, idx) => {
          const isMe = ['Operator', 'Counsellor', 'Admin', 'Supervisor'].includes(msg.senderType);

          const currentDate = dayjs(msg.createdAt);
          const prevDate = idx > 0 ? dayjs(messages[idx - 1].createdAt) : null;
          const showDate = !prevDate || !currentDate.isSame(prevDate, 'day');

          let dateText = currentDate.format('DD-MM-YYYY');
          if (currentDate.isSame(dayjs(), 'day')) dateText = 'Today';
          if (currentDate.isSame(dayjs().subtract(1, 'day'), 'day')) dateText = 'Yesterday';

          return (
            <React.Fragment key={idx}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="bg-[#1f2c34] text-white text-xs px-3 py-1.5 rounded-lg opacity-80">
                    {dateText}
                  </span>
                </div>
              )}

              <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`relative max-w-[65%] px-3 pt-2 pb-1.5 rounded-lg text-sm shadow-sm ${
                    isMe
                      ? 'bg-[#d9fdd3] rounded-tr-none'
                      : 'bg-white rounded-tl-none'
                  }`}
                >
                  {isMe && (
                    <div className="text-[10px] font-medium text-gray-600">
                      {msg.displayName}
                    </div>
                  )}

                  <div className="pr-14">
                    <p className="whitespace-pre-wrap text-gray-900 leading-snug">
                      {msg.content}
                    </p>
                  </div>

                  <div className="absolute bottom-1 right-2 flex items-center gap-1 text-[11px] text-gray-500">
                    <span>{dayjs(msg.createdAt).format('HH:mm')}</span>
                    {isMe && (
                      msg.isRead ? (
                        <CheckCheck size={14} className="text-[#53bdeb]" />
                      ) : (msg.isDelivered || isStudentOnline) ? (
                        <CheckCheck size={14} className="text-gray-400" />
                      ) : (
                        <Check size={14} className="text-gray-400" />
                      )
                    )}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75" />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!isChatDisabled ? (
        <div className="px-3 py-2 bg-[#f0f2f5] flex items-center gap-2 z-10 relative border-t border-gray-200">

          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-16 left-3 z-50 shadow-2xl rounded-xl">
              <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
            </div>
          )}

          {showQuickReplies && (
            <div
              ref={quickRepliesRef}
              className="absolute bottom-16 left-3 z-50 bg-white shadow-xl rounded-xl border border-gray-100 p-2 min-w-[280px]"
            >
              <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
                Quick Replies
              </p>
              {QUICK_REPLIES.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(reply)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(false);
              setShowQuickReplies(!showQuickReplies);
            }}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200"
          >
            <Zap size={22} />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowQuickReplies(false);
              setShowEmojiPicker(!showEmojiPicker);
            }}
            className="p-1.5 rounded-full text-gray-500 hover:bg-gray-200"
          >
            <Smile size={22} />
          </button>

          <form onSubmit={onFormSubmit} className="flex-1 flex items-center gap-2">
            <textarea
              value={inputText}
              onChange={handleTyping}
              placeholder="Type a message"
              rows={1}
              className="flex-1 resize-none bg-white rounded-lg px-4 py-2 text-sm leading-snug outline-none border border-gray-200"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onFormSubmit(e);
                }
              }}
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-full text-gray-500 hover:text-green-600 disabled:opacity-50"
            >
              <Send size={22} />
            </button>
          </form>
        </div>
      ) : (
        <div className="p-4 bg-gray-100 text-center text-sm text-gray-500 border-t">
          {isClosed
            ? ' This chat is closed. No further messages can be sent.'
            : ' Chat is temporarily disabled for this conversation.'}
        </div>
      )}
    </div>
  );
};

export default ChatWindowArea;
