import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle, XCircle, Clock, UserPlus } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";
import type { AdvisorRequest } from "../types";
import AddUserModal from "../components/AddUserModal";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [requests, setRequests] = useState<AdvisorRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AdvisorRequest | null>(
    null
  );
  const [response, setResponse] = useState("");
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchRequests = async () => {
      const { data, error } = await supabase.from("advisor_requests").select(`
          *,
          properties (
            title,
            address,
            price
          ),
          profiles!advisor_requests_user_id_fkey (
            name,
            email
          )
        `);

      if (error) {
        console.error("Error fetching advisor requests:", error);
        return;
      }

      setRequests(data as AdvisorRequest[]);
    };

    fetchRequests();
  }, [user, navigate]);

  const handleResponse = async (
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    if (!selectedRequest) return;

    try {
      const { error } = await supabase
        .from("advisor_requests")
        .update({
          status,
          response,
          responded_at: new Date().toISOString(),
          advisor_id: user?.id,
        })
        .eq("id", requestId);

      if (error) {
        throw error;
      }

      setSelectedRequest(null);
      setResponse("");

      const { data, error: fetchError } = await supabase.from(
        "advisor_requests"
      ).select(`
          *,
          properties (
            title,
            address,
            price
          ),
          profiles!advisor_requests_user_id_fkey (
            name,
            email
          )
        `);

      if (fetchError) {
        console.error("Error fetching advisor requests:", fetchError);
        return;
      }

      setRequests(data as AdvisorRequest[]);
    } catch (error) {
      console.error("Error updating advisor request:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Buy
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Do not buy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              Advisor Dashboard
            </h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.properties?.title ||
                          "Property Details Unavailable"}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      From: {request.profiles?.name || "Unknown User"} (
                      {request.profiles?.email || "No Email"})
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Address: {request.properties?.address || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Price: $
                      {request.properties?.price?.toLocaleString() || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      Message: {request.message}
                    </p>
                    {request.response && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium text-gray-700">
                          Response:
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.response}
                        </p>
                      </div>
                    )}
                    {request.status === "pending" && (
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Respond
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No advisor requests found
              </div>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddUserModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-brand-navy text-white rounded-xl shadow-lg"
        >
          <UserPlus className="h-5 w-5" />
          <span>Add New User</span>
        </motion.button>

        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
        />
      </div>

      {/* Response Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Respond to Request
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Enter your response..."
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResponse(selectedRequest.id, "rejected")}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleResponse(selectedRequest.id, "approved")}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
