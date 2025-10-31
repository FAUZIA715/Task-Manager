import { useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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
      await axios.post("http://localhost:8080/api/auth/register", form);
      alert("Registration successful!");
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error registering user");
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle>Register</CardTitle>
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
  );
};

export default Register;
