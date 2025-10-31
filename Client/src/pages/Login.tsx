import { useState } from "react";
import axios from "axios";
export const API_URL = import.meta.env.VITE_BASE_URL;
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, form);
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px] p-5 ">
        <CardHeader>
          <CardTitle className="text-center font-extrabold text-2xl">
            Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              placeholder="Email"
              name="email"
              type="email"
              onChange={handleChange}
              required
            />
            <Input
              placeholder="Password"
              name="password"
              type="password"
              onChange={handleChange}
              required
            />
            <Button type="submit">Login</Button>
            <div className="text-center text-gray-600">
              Don't have an account?{" "}
              <a href="/register" className="underline">
                Register
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
