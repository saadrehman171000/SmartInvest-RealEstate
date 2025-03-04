import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Star,
  Brain,
  UserCog,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Trash2,
  Edit,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Property, AdvisorRequest } from "../types";
import { supabase } from "../lib/supabase";
import EditPropertyModal from "./EditPropertyModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

interface PropertyCardProps {
  property: Property;
  onAnalyze: (id: string) => void;
  onAskAI: (id: string) => void;
  onRequestAdvisor: (id: string) => void;
  onEdit: (property: Property) => void;
  onDelete: (deletedPropertyId: string) => void;
  advisorRequest?: AdvisorRequest;
  isAdmin?: boolean;
}

export default function PropertyCard({
  property,
  onAnalyze,
  onAskAI,
  onRequestAdvisor,
  onEdit,
  onDelete,
  advisorRequest,
  isAdmin,
}: PropertyCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(property);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNextImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        property.images && prevIndex < property.images.length - 1
          ? prevIndex + 1
          : 0 // Loop back to the first image
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        property.images && prevIndex > 0
          ? prevIndex - 1
          : property.images.length - 1 // Loop back to the last image
    );
  };

  const handleDelete = async () => {
    try {
      await supabase.from("properties").delete().eq("id", property.id);
      toast.success("Property deleted successfully");
      onDelete(property.id);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
    }
  };

  const handleEdit = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .update(editFormData)
        .eq("id", property.id);

      if (error) throw error;

      toast.success("Property updated successfully");
      if (data) {
        onEdit(data[0]);
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Failed to update property");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Deal Pending":
        return (
          <div className="flex items-center text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4 mr-1" />
            Deal Pending
          </div>
        );
      case "Under Contract":
        return (
          <div className="flex items-center text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-sm">
            <Clock className="w-4 h-4 mr-1" />
            Under Contract
          </div>
        );
      case "Sold":
        return (
          <div className="flex items-center text-gray-700 bg-gray-50 px-3 py-1 rounded-full text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            Sold
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl"
      >
        <div className="relative h-64">
          {property.images && property.images.length > 0 ? (
            <>
              {/* Current Image */}
              <img
                src={property.images[currentImageIndex]}
                alt={`Property image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Left Button */}
              {property.images.length > 1 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-opacity"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Right Button */}
              {property.images.length > 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-opacity"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
              No Images Available
            </div>
          )}
          <div className="absolute top-4 left-4 flex space-x-2">
            {isAdmin && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </motion.button>
              </>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {property.title}
            </h3>
            <p className="text-gray-600">{property.address}</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-indigo-600 mr-2" />
                <span className="text-sm text-gray-600">
                  {property.deal_type}
                </span>
              </div>
              {isAdmin && (
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-5 w-5 mr-1" />
                  Admin
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-xl font-bold text-indigo-600">
                ${property.price.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ARV</p>
              <p className="text-xl font-bold text-green-600">
                ${property.arv?.toLocaleString() || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Repair Cost</p>
              <p className="text-lg text-gray-700">
                ${property.repairCost?.toLocaleString() || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Profit for Selling</p>
              <p className="text-lg text-gray-700">
                ${property.profitForSelling?.toLocaleString() || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ROI</p>
              <p className="text-lg text-gray-700">
                {property.roi ? `${property.roi}%` : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rent</p>
              <p className="text-lg text-gray-700">
                ${property.rent?.toLocaleString() || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Cash Flow</p>
              <p className="text-lg text-gray-700">
                ${property.netCashFlow?.toLocaleString() || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cash on Cash Return</p>
              <p className="text-lg text-gray-700">
                {property.cashOnCashReturn
                  ? `${property.cashOnCashReturn}%`
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="mb-6 mt-4">
            {getStatusBadge(property.status ?? "")}
          </div>

          {advisorRequest && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              {getStatusBadge(advisorRequest.status ?? "")}
              {advisorRequest.response && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">
                    Advisor Response:
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {advisorRequest.response}
                  </p>
                </div>
              )}
            </div>
          )}

          {!isAdmin && (
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAnalyze(property.id)}
                className="col-span-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Analyze Deal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAskAI(property.id)}
                className="flex items-center justify-center p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                title="Ask AI"
              >
                <Brain className="h-5 w-5 text-indigo-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onRequestAdvisor(property.id)}
                className="col-span-3 flex items-center justify-center p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl hover:from-indigo-100 hover:to-purple-100 transition-colors"
              >
                <UserCog className="h-5 w-5 text-indigo-600 mr-2" />
                <span className="text-sm font-medium text-indigo-600">
                  Request Advisor
                </span>
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {isEditModalOpen && (
        <EditPropertyModal
          isOpen={isEditModalOpen}
          title="Edit Property"
          onClose={() => setIsEditModalOpen(false)}
          property={editFormData}
          setProperty={setEditFormData}
          onConfirm={handleEdit}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
