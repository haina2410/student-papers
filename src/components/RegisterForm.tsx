"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RegisterFormData {
  email: string;
  password: string;
  cccd: string;
  name: string;
}

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    cccd: "",
    name: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(result.error || "Registration failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-center">
          <div className="text-green-600 text-2xl mb-2">✅</div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            Đăng ký thành công!
          </h2>
          <p className="text-green-700">
            Tài khoản của bạn đã được tạo. Đang chuyển hướng đến trang đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Đăng ký sinh viên
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Họ và tên
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <label htmlFor="cccd" className="block text-sm font-medium text-gray-700 mb-1">
            Số CCCD
          </label>
          <input
            type="text"
            id="cccd"
            name="cccd"
            value={formData.cccd}
            onChange={handleChange}
            required
            pattern="[0-9]{12}"
            maxLength={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="123456789012"
          />
          <p className="text-xs text-gray-500 mt-1">12 chữ số</p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tối thiểu 6 ký tự"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}