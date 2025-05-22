"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import apiService from "@/services/api";

export default function StudentLogin() {
    const [formData, setFormData] = useState({
        studentId: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Simulate API call
        try {
            // Replace with actual API call
            //api call
            const response = await apiService.login(formData.studentId, formData.password);
            console.log("Login successful", response);

            if (!response) {
                throw new Error("Login failed");
            }
            // Handle successful login
            console.log("Login successful", response);
            // Store token or user data in local storage or context
            localStorage.setItem("studentToken", response.token);
            // save data on local storage
            localStorage.setItem("studentData", JSON.stringify(response.student));
            //send student to th test platform if has_completed_quiz false
            if (!response.student.has_completed_quiz) {
                router.push("/student/test");
                return;
            }
            // Check if the user has completed the quiz
            // Redirect to the dashboard if the quiz is completed
            // if (response.data.has_completed_quiz) {


            // Redirect to the next page on successful login
            router.push("/student/dashboard");
        } catch (err) {
            setError("Invalid Student ID or Password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
                <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
                    Student Login
                </h1>
                <form onSubmit={handleSubmit} className=" text-black space-y-6">
                    <div>
                        <label
                            htmlFor="studentId"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Student ID
                        </label>
                        <input
                            type="text"
                            id="studentId"
                            value={formData.studentId}
                            onChange={(e) =>
                                setFormData({ ...formData, studentId: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                            placeholder="Enter your Student ID"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white hover:border-gray-300"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                Connexion...
                            </div>
                        ) : (
                            "🔐 Se connecter"
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            <span>Connexion sécurisée</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            <span>Protection des données</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            <span>IA à votre service</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}