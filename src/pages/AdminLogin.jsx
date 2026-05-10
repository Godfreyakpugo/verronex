import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";


const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <h1 className="text-3xl font-bold text-center mb-8">Admin Login</h1>
      <div className="p-8">
        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Admin Email"
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
         

          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full p-4 rounded-xl bg-fuchsia-600 font-bold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {errorMsg && (
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;