import { useState, useEffect } from "react";
import api from "../api/axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface UserProfile {
  id_user: number;
  nama_lengkap: string;
  username: string;
}

export function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Token tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/profile");
        setProfile(response.data);
      } catch (err) {
        setError("Gagal mengambil data profil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md text-center w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {loading ? <Skeleton width={250} /> : "Selamat Datang di E-Aset!"}
      </h1>

      <div className="text-gray-700">
        {loading ? (
          <Skeleton count={2} />
        ) : profile ? (
          <p>
            Anda login sebagai:{" "}
            <span className="font-semibold">{profile.nama_lengkap}</span>
          </p>
        ) : (
          <p className="text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}
