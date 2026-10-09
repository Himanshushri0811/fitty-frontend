// src/pages/profileApi.js  (ya jahan Profile.jsx hai, wahin rakho)
//
// SIRF ye 2 cheezein apne project ke hisaab se set karo:
const API_BASE = "https://fitmitra-backend.onrender.com/api/accounts"; // bina trailing slash
const ENDPOINTS = {
    profile: "/profile/",        // ProfileView ka URL
    upload: "/profile/upload/",  // UploadProfilePicView ka URL
};

const TOKEN_KEYS = ["access", "token", "access_token", "accessToken", "authToken"];

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

export function getToken() {
    for (const key of TOKEN_KEYS) {
        const raw = localStorage.getItem(key);
        if (raw) return raw.replace(/^"|"$/g, "");
    }
    try {
        const u = JSON.parse(localStorage.getItem("user") || "null");
        if (u?.access) return u.access;
    } catch {
        /* ignore */
    }
    return null;
}

async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
        res = await fetch(API_BASE + path, { ...options, headers });
    } catch {
        throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
    }

    let data = null;
    try {
        data = await res.json();
    } catch {
        /* non-JSON body */
    }

    if (!res.ok) {
        const msg =
            res.status === 401
                ? "Your session has expired. Please log in again."
                : data?.error || data?.detail || `Request failed (${res.status})`;
        throw new ApiError(msg, res.status);
    }
    return data;
}

export const fetchProfile = () => request(ENDPOINTS.profile);

export const saveProfile = (payload) =>
    request(ENDPOINTS.profile, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

// kind: "profile_pic" | "cover_pic"
export const uploadImage = (kind, file) => {
    const form = new FormData();
    form.append(kind, file);
    return request(ENDPOINTS.upload, { method: "POST", body: form });
};