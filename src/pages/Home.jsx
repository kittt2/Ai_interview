import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Home() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };

    fetchUsers();
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Welcome to IntelliHire</h1>

      {users.length > 0 ? (
        <div className="w-full max-w-md">
          <p className="text-gray-300 mb-4">📋 Registered Users:</p>
          <ul className="space-y-3">
            {users.map(user => (
              <li key={user.id} className="bg-gray-800 px-4 py-2 rounded shadow-md text-left">
                <p className="font-semibold">{user.fullName || "Unnamed"}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
                {user.phone && (
                  <p className="text-sm text-gray-500">📞 {user.phone}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <p className="text-lg max-w-xl mb-6 text-gray-300">
            Your AI-powered interview assistant. Practice, prepare, and perfect your skills with smart feedback and real-time simulations.
          </p>
          <div className="flex gap-4">
            <Link to="/login">
              <Button>Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="text-gray-800">Get Started</Button>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}