import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Download Sample Form - Student Papers',
  description: 'Download the sample form for student document submission',
}

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Vietnamese Student Paper Submission
            </h1>
            <nav className="flex space-x-4">
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Register
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Download Sample Form
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Download the sample form below, fill it out completely, and submit it through your student account.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Instructions
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  1
                </span>
                Download the sample form using the button below
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  2
                </span>
                Fill out all required fields with accurate information
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  3
                </span>
                Ensure your CCCD (Vietnamese National ID) is correctly entered
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                  4
                </span>
                Register for an account and upload your completed form
              </li>
            </ul>
          </div>

          {/* Download Button */}
          <div className="text-center">
            <a
              href="/sample-student-form.pdf"
              download="vietnamese-student-form.pdf"
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <svg 
                className="w-6 h-6 mr-3" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              Download Sample Form (PDF)
            </a>
          </div>

          {/* File Information */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>File format: PDF | File size: ~2KB</p>
            <p className="mt-2">
              Having trouble downloading? Try right-clicking the button and selecting "Save link as..."
            </p>
          </div>

          {/* Next Steps */}
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Next Steps
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Create Account</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Register with your CCCD and email to create your student account
                </p>
                <Link 
                  href="/register"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Register Now
                </Link>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Upload Form</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Submit your completed form through your student dashboard
                </p>
                <Link 
                  href="/login"
                  className="inline-block bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm font-medium"
                >
                  Login to Upload
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p>&copy; 2025 Vietnamese Student Paper Submission System</p>
          <p className="text-gray-400 text-sm mt-2">
            For technical support, please contact your university administration.
          </p>
        </div>
      </footer>
    </div>
  )
}
