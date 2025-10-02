import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Prompt from "./Prompt";
import { Menu } from "lucide-react";

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChatIndex, setSelectedChatIndex] = useState(null);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const promptApi = React.useRef({});

  // Handler for Sidebar actions
  const handleSidebarAction = (action) => {
    if (action === 'new') {
      promptApi.current.newChat && promptApi.current.newChat();
      setSelectedChatIndex(null);
      setHistoryRefresh((v) => v + 1); // force sidebar to refresh
    } else if (typeof action === 'number') {
      promptApi.current.loadChat && promptApi.current.loadChat(action);
      setSelectedChatIndex(action);
      setHistoryRefresh((v) => v + 1); // force sidebar to refresh
    }
  };

  return (
  <div className="flex flex-col md:flex-row h-screen bg-[#1e1e1e] text-white">
      {/* Sidebar (slide-in) */}
      <div
        className={`fixed top-0 left-0 h-full w-4/5 max-w-xs sm:w-72 md:w-64 lg:w-72 xl:w-80 bg-[#232327] transition-transform z-40
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:relative md:flex-shrink-0`}
      >
        <Sidebar
          onClose={() => setIsSidebarOpen(false)}
          onNewChat={() => handleSidebarAction('new')}
          onSelectChat={handleSidebarAction}
          selectedChatIndex={selectedChatIndex}
          historyRefresh={historyRefresh}
        />
      </div>

      {/* Main content */}
  <div className="flex-1 flex flex-col w-full md:ml-64 h-full min-h-0 overflow-y-auto transition-all duration-300">
        {/* Header for mobile */}
  <div className="md:hidden flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-700 bg-[#232327]">
          <div className="text-xl font-bold">deepseek</div>
          <button onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* Message area */}
  <div className="flex-1 flex items-center justify-center px-1 xs:px-2 sm:px-4 md:px-6 min-h-0 w-full max-w-full">
          <Prompt
            onNewChat={api => { promptApi.current = api; }}
            selectedChatIndex={selectedChatIndex}
          />
        </div>
      </div>

      {/* Overlay on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default Home;