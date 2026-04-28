import React, { useState } from "react";

const faqs = [
  {
    q: "How to place an order?",
    a: "Open chat, select items, and confirm your order."
  },
  {
    q: "How to contact restaurant?",
    a: "Use the contact page or call support number."
  },
  {
    q: "How to track order?",
    a: "Go to dashboard → orders section."
  }
];

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Help & Support</h1>

      {/* FAQ Section */}
      <div className="space-y-3">
        {faqs.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 cursor-pointer"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <h2 className="font-semibold">{item.q}</h2>
            {openIndex === index && (
              <p className="text-gray-600 mt-2">{item.a}</p>
            )}
          </div>
        ))}
      </div>

      {/* Contact Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Need more help?</h2>
        <p className="text-gray-600 mb-3">
          Reach out to us anytime.
        </p>

        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default Help;