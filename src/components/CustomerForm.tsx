import React from 'react';
import { User, Mail, Phone } from 'lucide-react';

function CustomerForm() {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100">
      <div className="px-6 py-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h3>
        <form className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                id="name"
                className="input-field pl-10"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                className="input-field pl-10"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                id="phone"
                className="input-field pl-10"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full btn-primary"
            >
              Save Customer Information
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerForm;