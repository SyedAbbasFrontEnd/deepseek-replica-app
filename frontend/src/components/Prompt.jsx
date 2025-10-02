import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Paperclip, ArrowUp, Globe, Bot } from "lucide-react";
import logo from "../assets/logo.png";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";

function Promt({ onNewChat, selectedChatIndex }) {
  const [inputValue, setInputValue] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [promt, setPromt] = useState([]);
  const [loading, setLoading] = useState(false);
  const promtEndRef = useRef();

  // Helper: get/set chat history
  const getHistory = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return [];
    return JSON.parse(localStorage.getItem(`chatHistory_${user._id}`) || "[]");
  };
  const setHistory = (history) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    localStorage.setItem(`chatHistory_${user._id}` , JSON.stringify(history));
  };

  // Save current chat to history and clear
  const handleNewChat = () => {
    if (promt.length > 0) {
      const history = getHistory();
      setHistory([...history, promt]);
    }
    setPromt([]);
  };

  // Expose new chat and load chat to parent
  useEffect(() => {
    if (onNewChat) {
      onNewChat({
        newChat: handleNewChat,
        loadChat: (idx) => {
          const history = getHistory();
          if (history[idx]) setPromt(history[idx]);
        }
      });
    }
    // eslint-disable-next-line
  }, [onNewChat, promt]);

  // Load selected chat if index changes
  useEffect(() => {
    if (typeof selectedChatIndex === 'number' && selectedChatIndex >= 0) {
      const history = getHistory();
      if (history[selectedChatIndex]) setPromt(history[selectedChatIndex]);
    }
    // eslint-disable-next-line
  }, [selectedChatIndex]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const storedPromt = localStorage.getItem(`promtHistory_${user._id}`);
      if (storedPromt) {
        setPromt(JSON.parse(storedPromt));
      }
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      localStorage.setItem(`promtHistory_${user._id}`, JSON.stringify(promt));
    }
  }, [promt]);

  useEffect(() => {
    promtEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promt, loading]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setInputValue("");
    setTypeMessage(trimmed);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        "http://localhost:4002/api/v1/deepseekai/promt",
        { content: trimmed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setPromt((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      setPromt((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        {
          role: "assistant",
          content: "❌ Something went wrong with the AI response.",
        },
      ]);
    } finally {
      setLoading(false);
      setTypeMessage(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="flex flex-col items-center justify-between flex-1 w-full px-1 xs:px-2 sm:px-4 md:px-6 pb-2 sm:pb-4 md:pb-8 max-w-full">
      {/* ➤ Greeting Section */}
      <div className="mt-4 sm:mt-8 md:mt-16 text-center w-full">
        <div className="flex items-center justify-center gap-2">
          <img src={logo} alt="DeepSeek Logo" className="h-6 sm:h-7 md:h-8" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-2">
            Hi, I'm DeepSeek.
          </h1>
        </div>
        <p className="text-gray-400 text-sm sm:text-base md:text-sm mt-2">
          💬 How can I help you today?
        </p>
      </div>

      {/* ➤ Scrollable Chat Box */}
      <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl flex-1 overflow-y-auto mt-4 sm:mt-6 mb-2 sm:mb-4 space-y-4 max-h-[50vh] sm:max-h-[60vh] px-0 sm:px-1">
        {promt.map((msg, index) => (
          <div
            key={index}
            className={`w-full flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" ? (
              // 🧠 Full-width assistant response
              <div className="w-full bg-[#232323] text-white rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-pre-wrap break-words">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={codeTheme}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg mt-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className="bg-gray-800 px-1 py-0.5 rounded"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              // 👤 User message - 30% width at top-right
              <div className="max-w-[80%] sm:max-w-[50%] bg-blue-600 text-white rounded-xl px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm whitespace-pre-wrap self-start break-words">
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {/* Show user's prompt while loading */}
        {loading && typeMessage && (
          <div
            className="whitespace-pre-wrap px-2 sm:px-4 py-2 sm:py-3 rounded-2xl text-xs sm:text-sm break-words
             bg-blue-600 text-white self-end ml-auto max-w-[70%] sm:max-w-[40%]"
          >
            {typeMessage}
          </div>
        )}

        {/* 🤖 Typing Indicator */}
        {loading && (
          <div className="flex justify-start w-full">
            <div className="bg-[#2f2f2f] text-white px-2 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm animate-pulse">
              🤖Loading...
            </div>
          </div>
        )}

        <div ref={promtEndRef} />
      </div>

      {/* ➤ Input Box */}
      <div className="w-full max-w-2xl sm:max-w-3xl md:max-w-4xl relative mt-auto px-0 sm:px-2">
        <div className="bg-[#2f2f2f] rounded-[2rem] px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 shadow-md flex flex-col gap-2 sm:gap-4">
          <input
            type="text"
            placeholder="💬 Message DeepSeek"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent w-full text-white placeholder-gray-400 text-sm sm:text-base md:text-lg outline-none"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 sm:mt-4 gap-2 sm:gap-4">
            {/* 🛠️ Functional Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button className="flex items-center gap-2 border border-gray-500 text-white text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 rounded-full hover:bg-gray-600 transition">
                <Bot className="w-4 h-4" />
                DeepThink (R1)
              </button>
              <button className="flex items-center gap-2 border border-gray-500 text-white text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 rounded-full hover:bg-gray-600 transition">
                <Globe className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* ➤ Send Button */}
            <div className="flex items-center gap-2 ml-auto">
              <button className="text-gray-400 hover:text-white transition">
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                className="bg-gray-500 hover:bg-blue-600 p-2 rounded-full text-white transition"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Promt;