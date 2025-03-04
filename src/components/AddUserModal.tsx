import { useState } from "react";
import { X, UserPlus, Mail, Lock, User } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const { createUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUser(email, password, name);
      onClose();
      // Reset form
      setEmail("");
      setPassword("");
      setName("");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create user';
      toast.error(message);
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 mb-6">
          <UserPlus className="h-6 w-6 text-brand-navy" />
          <h2 className="text-xl font-semibold text-brand-navy">Add New User</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">
              Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <User className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                className="appearance-none block w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-brand-navy hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create User"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
} 