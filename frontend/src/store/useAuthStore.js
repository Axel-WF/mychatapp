import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

import { io } from "socket.io-client";

const SOCKET_SERVER_URL =
    import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,

    isCheckingAuth: true,

    onlineUsers: [],

    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data });
            get().connectSocket(); // Connect to socket after checking auth
        } catch (error) {
            console.log("Error in checkAuth: ", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signUp: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully!");

            get().connectSocket(); // Connect to socket after signup
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in signup: ", error);
        } finally {
            set({ isSigningUp: false });
        }
    },

    logIn: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully!");

            get().connectSocket(); // Connect to socket after login
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in login: ", error);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logOut: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully!");
            get().disconnectSocket(); // Disconnect socket on logout
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in logout: ", error);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in updateProfile: ", error);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
        const socket = io(SOCKET_SERVER_URL, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();

        set({ socket: socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) {
            get().socket.disconnect();
        }
    },
}));
