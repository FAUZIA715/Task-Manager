import { useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
export const API_URL = import.meta.env.VITE_BASE_URL;
interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

const Register = () => {
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/register`, form);
      toast.success("Registration successful!");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error registering user");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px] p-5 ">
        <CardHeader>
          <CardTitle className="text-center font-extrabold text-2xl">
            Register
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              placeholder="Name"
              name="name"
              onChange={handleChange}
              required
            />
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
            <Button type="submit">Register</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
