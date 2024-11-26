import React from "react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiCpu, FiShield, FiVideo, FiZap } from "react-icons/fi";
import { FaTable, FaFileAlt, FaArrowsAltH } from "react-icons/fa";
import {useNavigate} from "react-router"
const LandingPage = () => {
    const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
            Welcome to <span className="text-blue-600">arHQ</span>
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            The ultimate decentralized, AI-powered digital workspace for
            productivity. Secure, dynamic, and designed to help you work smarter
            and faster.
          </p>
          <button onClick={()=> {
            navigate("/connect-wallet")
        }} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md">
            Get Started
          </button>
        </motion.div>
    
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Why Choose <span className="text-blue-600">arHQ</span>?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Feature Card */}
          {[
            {
              Icon: FiCpu,
              title: "AI-Powered Productivity",
              description:
                "Boost your workflows with AI capabilities that help you create tables, docs, and much more.",
            },
            {
              Icon: FiVideo,
              title: "Integrated Video Calls",
              description:
                "Host video calls and get automatic call summaries added as docs.",
            },
            {
              Icon: FaTable,
              title: "Dynamic Table Creation",
              description:
                "Effortlessly create and manage tables with recorded form responses.",
            },
            {
              Icon: FiShield,
              title: "Decentralized & Secure",
              description:
                "Your data is secured by the Arweave stack, ensuring privacy and safety.",
            },
            {
              Icon: FaFileAlt,
              title: "Smart Documentation",
              description:
                "Transform AI-generated ideas into well-structured documents in seconds.",
            },
            {
              Icon: FiZap,
              title: "Seamless Integration",
              description:
                "Connect and integrate seamlessly with your existing workflows.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.8 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <div className="text-blue-600 text-4xl mb-4">
                <feature.Icon />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-blue-600 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="container mx-auto px-6 text-center text-white"
        >
          <h2 className="text-4xl font-bold mb-4">
            Ready to Boost Your Productivity?
          </h2>
          <p className="text-lg mb-6">
            Join the decentralized revolution and let arHQ supercharge your
            workspace with AI and Arweave.
          </p>
          <button onClick={()=> {
            navigate("/connect-wallet")

          }} className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-all font-medium shadow-md">
            Get Started for Free
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
