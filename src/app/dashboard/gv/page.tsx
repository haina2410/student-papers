"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";

export default function TeacherDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }

    // Check if user is actually a teacher
    if (!isPending && session) {
      const userRole = session.user?.role;
      if (userRole !== "TEACHER") {
        router.push("/dashboard/student");
        return;
      }
    }
  }, [session, isPending, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Bảng điều khiển Giáo viên
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Xin chào, {session.user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Chào mừng đến với Hệ thống Quản lý Hồ sơ Sinh viên
              </h2>
              <p className="text-gray-600 mb-6">
                Đây là bảng điều khiển dành cho giáo viên để quản lý và duyệt hồ sơ của sinh viên.
              </p>
              
              {/* Coming Soon Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-gray-400 text-3xl mb-2">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Danh sách Hồ sơ Sinh viên
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Xem và quản lý tất cả hồ sơ được nộp bởi sinh viên
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Sắp có
                  </span>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-gray-400 text-3xl mb-2">✅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Duyệt Hồ sơ
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Phê duyệt hoặc từ chối hồ sơ của sinh viên
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Sắp có
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Thông tin Tài khoản
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Họ tên</dt>
                  <dd className="mt-1 text-sm text-gray-900">{session.user?.name || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{session.user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">CCCD</dt>
                  <dd className="mt-1 text-sm text-gray-900">{session.user?.cccd || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Vai trò</dt>
                  <dd className="mt-1 text-sm text-gray-900">Giáo viên</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-6">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
