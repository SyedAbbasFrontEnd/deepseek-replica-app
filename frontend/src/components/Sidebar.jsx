import React, { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, X } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

function Sidebar({ onClose, onNewChat, onSelectChat, selectedChatIndex, historyRefresh }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [, setAuthUser] = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4002/api/v1/user/logout",
        {
          withCredentials: true,
        }
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      alert(data.message);

      setAuthUser(null);
      navigate("/login");
    } catch (error) {
      alert(error?.response?.data?.errors || "Logout Failed");
    }
  };

  const [history, setHistory] = useState([]);
  // Helper to load history
  const loadHistory = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const h = JSON.parse(localStorage.getItem(`chatHistory_${user._id}`) || "[]");
      setHistory(h);
    }
  };

  useEffect(() => {
    loadHistory();
    // Listen for localStorage changes (other tabs/windows)
    const onStorage = (e) => {
      if (e.key && e.key.startsWith('chatHistory_')) loadHistory();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Refresh history when a new chat is started, chat is loaded, or historyRefresh changes
  useEffect(() => {
    loadHistory();
  }, [onNewChat, onSelectChat, historyRefresh]);

  return (
    <div className="h-screen flex flex-col p-4 bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex border-b border-gray-600 p-2 justify-between items-center mb-4 flex-shrink-0">
        <div className="text-2xl font-bold text-gray-200">deepseek</div>
        <button onClick={onClose}>
          <X className="w-6 h-6 text-gray-400 md:hidden" />
        </button>
      </div>

      {/* Scrollable History Section */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <button
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl mb-4"
          onClick={typeof onNewChat === 'function' ? onNewChat : undefined}
        >
          + New Chat
        </button>
        {history.length === 0 ? (
          <div className="text-gray-500 text-sm mt-20 text-center">
            No chat history yet
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((chat, idx) => (
              <button
                key={idx}
                className={`w-full text-left px-3 py-2 rounded-lg transition border border-gray-700 hover:bg-gray-700 ${selectedChatIndex === idx ? 'bg-gray-700 text-indigo-400' : 'bg-[#232327] text-gray-200'}`}
                onClick={() => onSelectChat && onSelectChat(idx)}
              >
                {chat[0]?.content?.slice(0, 20) || `Chat ${idx + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-1 border-t border-gray-600 flex-shrink-0">
        <div className="flex items-center gap-2 cursor-pointer my-3">
          <img
            src="https://i.pravatar.cc/32"
            alt="profile"
            className="rounded-full w-8 h-8"
          />
          <span className="text-gray-300 font-bold">
            {user ? user?.firstName : "My Profile"}
          </span>
        </div>

        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 duration-300 transition"
          >
            <LogOut className="" />
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;