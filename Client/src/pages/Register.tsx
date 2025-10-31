import { useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!form.password.trim()) {
      toast.error("Password is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password strength validation
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    // Password complexity validation
    const hasUpperCase = /[A-Z]/.test(form.password);
    const hasLowerCase = /[a-z]/.test(form.password);
    const hasNumbers = /\d/.test(form.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      form.password
    );

    if (!hasUpperCase) {
      toast.error("Password must contain at least one uppercase letter");
      return;
    }
    if (!hasLowerCase) {
      toast.error("Password must contain at least one lowercase letter");
      return;
    }
    if (!hasNumbers) {
      toast.error("Password must contain at least one number");
      return;
    }
    if (!hasSpecialChar) {
      toast.error("Password must contain at least one special character");
      return;
    }

    try {
      await axios.post(`${API_URL}/auth/register`, form);
      toast.success("Registration successful!");
      navigate("/login", { replace: true });
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
            <div className="relative">
              <Input
                placeholder="Password (min 8 chars, uppercase, lowercase, number, special char)"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            <Button type="submit">Register</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
