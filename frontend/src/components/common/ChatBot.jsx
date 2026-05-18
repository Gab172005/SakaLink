import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ChatBot.module.css";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! How can I help you navigate the SakaLink Marketplace today?", isBot: true },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  const faqs = [
    { question: "How to buy?", answer: "To buy products, just browse the Shop, add items to your cart, and proceed to checkout from the cart icon in the navbar!" },
    { question: "Where is my profile?", answer: "You can find your profile by clicking the profile icon in the navbar or by asking me to take you there!", action: () => navigate("/profile") },
    { question: "What is SakaLink?", answer: "SakaLink is your premier marketplace for high-quality products. We help you find exactly what you need with ease." },
    { question: "How to sell?", answer: "If you're an admin, you can add products via the Admin Dashboard. Regular users can browse and purchase!" },
  ];

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleBotResponse = (responseObj) => {
    const botMessage = { text: responseObj.text || responseObj.answer, isBot: true };
    setMessages((prev) => [...prev, botMessage]);
    
    if (responseObj.action) {
      setTimeout(() => {
        responseObj.action();
      }, 1500);
    }
  };

  const getBotResponse = (input) => {
    const text = input.toLowerCase();
    
    if (text.includes("shop") || text.includes("market") || text.includes("buy")) {
      return { 
        text: "You can find all our products in the Shop! Would you like me to take you there?", 
        action: () => navigate("/shop") 
      };
    }
    if (text.includes("profile") || text.includes("account") || text.includes("my orders")) {
      return { 
        text: "Your profile page contains your order history and account details. Heading there now?", 
        action: () => navigate("/profile") 
      };
    }
    if (text.includes("setting")) {
      return { 
        text: "You can manage your account settings here. Want to go to settings?", 
        action: () => navigate("/settings") 
      };
    }
    if (text.includes("hello") || text.includes("hi")) {
      return { text: "Hello! I'm your SakaLink assistant. Ask me about our shop, your profile, or how to get started!" };
    }
    if (text.includes("help") || text.includes("what can you do")) {
      return { text: "I can help you navigate to the Shop, check your Profile, or manage your Settings. Just ask!" };
    }
    
    return { text: "I'm not sure I understand. Try asking about 'shop', 'profile', or 'settings'!" };
  };

  const handleSend = (text = inputValue) => {
    if (!text.trim()) return;

    const userMessage = { text, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot thinking
    setTimeout(() => {
      const response = getBotResponse(userMessage.text);
      handleBotResponse(response);
    }, 800);
  };

  const handleFAQClick = (faq) => {
    const userMessage = { text: faq.question, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    
    setTimeout(() => {
      handleBotResponse(faq);
    }, 600);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      {!isOpen && (
        <button 
          className={styles.chatBubble} 
          onClick={() => setIsOpen(true)}
          aria-label="Open Chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {isOpen && (
        <div className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <h3>SakaLink Bot</h3>
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className={styles.messageArea}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`${styles.message} ${msg.isBot ? styles.botMessage : styles.userMessage}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
          
          <div className={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <button 
                key={index} 
                className={styles.faqButton}
                onClick={() => handleFAQClick(faq)}
              >
                {faq.question}
              </button>
            ))}
          </div>

          <div className={styles.inputArea}>
            <input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button className={styles.sendButton} onClick={() => handleSend()}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
