import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/client";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const [userInitial, setUserInitial] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const name = docSnap.data().fullName || "";
          setUserInitial(name.charAt(0).toUpperCase());
        }
      } else {
        setUserInitial("");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <nav className="bg-black shadow-md px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">
        MyApp
      </Link>

      <div className="flex items-center space-x-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "text-blue-600 font-semibold"
              : "text-gray-600 hover:text-blue-600"
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/login"
          className={({ isActive }) =>
            isActive
              ? "text-blue-600 font-semibold"
              : "text-gray-600 hover:text-blue-600"
          }
        >
          Login
        </NavLink>
        <NavLink
          to="/interview"
          className={({ isActive }) =>
            isActive
              ? "text-blue-600 font-semibold"
              : "text-gray-600 hover:text-blue-600"
          }
        >
          Interview
        </NavLink>
        <NavLink
          to="/register"
          className={({ isActive }) =>
            isActive
              ? "text-blue-600 font-semibold"
              : "text-gray-600 hover:text-blue-600"
          }
        >
          Register
        </NavLink>

        {userInitial && (
          <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-semibold text-lg shadow">
            {userInitial}
          </div>
        )}
      </div>
    </nav>
  );
}