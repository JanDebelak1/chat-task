'use client';

import { ChatWidget } from '@/components/visitor/ChatWidget';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">MiniCom</span>
            </div>
            <div className="flex gap-4">
              <a
                href="/agent"
                className="px-4 py-2 text-sm font-medium text-text hover:text-primary"
              >
                Agent Dashboard →
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Our Product
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            This is a mock e-commerce website demonstrating the MiniCom live chat support system.
            Click the chat button in the bottom-right to start a conversation with our support team.
          </p>
          <div className="flex gap-4 justify-center mb-16">
            <button className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover">
              Get Started
            </button>
            <button className="px-8 py-3 bg-white dark:bg-gray-800 text-text border border-border-default rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
              Learn More
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-2 text-text">Fast Performance</h3>
            <p className="text-text-muted">Lightning-fast loading times and smooth interactions.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2 text-text">Secure & Private</h3>
            <p className="text-text-muted">Your data is encrypted and protected at all times.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2 text-text">24/7 Support</h3>
            <p className="text-text-muted">Chat with our support team anytime, anywhere.</p>
          </div>
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}
