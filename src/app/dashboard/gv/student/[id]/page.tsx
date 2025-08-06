'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTeacherAuth } from '@/hooks/useAuthorization';

interface StudentSubmission {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    cccd: string;
  };
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  s3ObjectId: string;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { session, isLoading: isPending } = useTeacherAuth();
  
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = params.id as string;

  const fetchStudentSubmission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/student/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Student submission not found');
        } else if (response.status === 403) {
          setError('You are not authorized to view this submission');
        } else {
          setError('Failed to fetch student submission');
        }
        return;
      }

      const data = await response.json();
      setSubmission(data.submission);
    } catch (err) {
      console.error('Error fetching student submission:', err);
      setError('An error occurred while fetching the submission');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    // Only fetch data when we have a valid session and student ID
    if (!isPending && session?.user?.id && studentId) {
      fetchStudentSubmission();
    }
  }, [session, isPending, studentId, fetchStudentSubmission]);

  const handleDownloadFile = async () => {
    if (!submission) return;

    try {
      const response = await fetch(`/api/admin/files/${submission.id}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const data = await response.json();
      
      // Open the presigned URL in a new tab for download
      window.open(data.downloadUrl, '_blank');
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'APPROVED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'PENDING':
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  // Show loading state while checking authentication or fetching data
  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={fetchStudentSubmission}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show submission details
  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-600">No submission found for this student.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Student Submission Details</h1>
        </div>

        {/* Student Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="mt-1 text-lg text-gray-900">{submission.user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">CCCD</label>
              <p className="mt-1 text-lg text-gray-900 font-mono">{submission.user.cccd}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-lg text-gray-900">{submission.user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Student ID</label>
              <p className="mt-1 text-lg text-gray-900 font-mono">{submission.user.id}</p>
            </div>
          </div>
        </div>

        {/* Submission Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Submission Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Upload Date</label>
              <p className="mt-1 text-lg text-gray-900">{formatDate(submission.uploadedAt)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <span className={getStatusBadge(submission.status)}>
                  {submission.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* File Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">File Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Original File Name</label>
              <p className="mt-1 text-lg text-gray-900">{submission.originalName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">File Size</label>
              <p className="mt-1 text-lg text-gray-900">{formatFileSize(submission.fileSize)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">File Type</label>
              <p className="mt-1 text-lg text-gray-900">{submission.mimeType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Storage ID</label>
              <p className="mt-1 text-lg text-gray-900 font-mono text-sm">{submission.s3ObjectId}</p>
            </div>
          </div>

          {/* Download Button */}
          <div className="border-t pt-4">
            <button
              onClick={handleDownloadFile}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
