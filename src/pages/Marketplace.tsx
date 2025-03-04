import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Building2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import PropertyCard from "../components/PropertyCard";
import AddPropertyModal from "../components/AddPropertyModal";
import DealAnalyzer from "../components/DealAnalyzer";
import AskAIModal from "../components/AskAIModal";
import RequestAdvisorModal from "../components/RequestAdvisorModal";
import { supabase } from "../lib/supabase";
import type { Property, AdvisorRequest } from "../types";
import toast from "react-hot-toast";
import EditPropertyModal from "../components/EditPropertyModal"; // Import the EditPropertyModal component

export default function Marketplace() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [advisorRequests, setAdvisorRequests] = useState<AdvisorRequest[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch properties - for admin, fetch all properties, for users, fetch only their properties
    // const fetchProperties = async () => {
    //   const query = supabase
    //     .from("properties")
    //     .select("*, profiles:user_id (name, email)");

    //   // Only filter by user_id if not admin
    //   const { data, error } = await (user.role === "admin"
    //     ? query.order("created_at", { ascending: false })
    //     : query
    //         .eq("user_id", user.id)
    //         .order("created_at", { ascending: false }));

    //   if (error) {
    //     console.error("Error fetching properties:", error);
    //     toast.error("Failed to load properties");
    //     return;
    //   }

    //   setProperties(
    //     (data || []).map((property) => ({
    //       ...property,
    //       deal_type: property.deal_type as "Fix & Flip" | "BRRRR",
    //       status: property.status as "Deal Pending" | "Under Contract" | "Sold",
    //     }))
    //   );
    // };

    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching properties:", error);
        toast.error("Failed to load properties");
        return;
      }

      setProperties(
        (data || []).map((property) => ({
          ...property,
          deal_type: property.deal_type as "Fix & Flip" | "BRRRR",
          status: property.status as "Deal Pending" | "Under Contract" | "Sold",
        }))
      );
    };

    // Fetch advisor requests
    const fetchAdvisorRequests = async () => {
      const { data, error } = await supabase
        .from("advisor_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching advisor requests:", error);
        toast.error("Failed to load advisor requests");
        return;
      }

      setAdvisorRequests((data || []) as AdvisorRequest[]);
    };

    fetchProperties();
    if (user.role !== "admin") {
      fetchAdvisorRequests();
    }
  }, [user]);

  const handleAddProperty = async (data: any) => {
    if (!user) return;

    try {
      const propertyData = {
        ...data,
        user_id: user.id,
        iq_score: Math.floor(Math.random() * 5) + 5,
      };

      const { error } = await supabase
        .from("properties")
        .insert([propertyData]);

      if (error) throw error;

      setIsAddModalOpen(false);
      toast.success("Property added successfully!");

      // Refetch properties
      const query = supabase.from("properties").select("*");

      const { data: updatedProperties } = await (user.role === "admin"
        ? query.order("created_at", { ascending: false })
        : query
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }));

      setProperties(
        (updatedProperties || []).map((property) => ({
          ...property,
          deal_type: property.deal_type as "Fix & Flip" | "BRRRR" | "Both",
        }))
      );
    } catch (error) {
      console.error("Error adding property:", error);
      toast.error("Failed to add property");
    }
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.deal_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAdvisorRequest = (propertyId: string) => {
    return advisorRequests.find(
      (request) => request.property_id === propertyId
    );
  };

  const handleEditProperty = async (updatedProperty: Property) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update(updatedProperty)
        .eq("id", updatedProperty.id);

      if (error) throw error;

      setProperties((prevProperties) =>
        prevProperties.map((property) =>
          property.id === updatedProperty.id ? updatedProperty : property
        )
      );
      toast.success("Property updated successfully!");
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Failed to update property");
    }
  };

  const handleDeleteProperty = async (deletedPropertyId: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", deletedPropertyId);

      if (error) throw error;

      setProperties((prevProperties) =>
        prevProperties.filter((property) => property.id !== deletedPropertyId)
      );
      toast.success("Property deleted successfully!");
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 space-y-4 sm:space-y-0"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center">
              <Building2 className="h-10 w-10 text-indigo-600 mr-3" />
              {user?.role === "admin" ? "All Properties" : "My Properties"}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              {user?.role === "admin"
                ? "Manage and oversee all property listings"
                : "Manage and analyze your real estate investments"}
            </p>
          </div>
          {user?.role == "admin" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Property
            </motion.button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pl-12 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              advisorRequest={getAdvisorRequest(property.id)}
              onAnalyze={() => {
                setSelectedProperty(property);
                setIsAnalyzerOpen(true);
              }}
              onAskAI={() => {
                setSelectedProperty(property);
                setIsAIModalOpen(true);
              }}
              onRequestAdvisor={() => {
                setSelectedProperty(property);
                setIsAdvisorModalOpen(true);
              }}
              onEdit={handleEditProperty}
              onDelete={handleDeleteProperty}
              isAdmin={user?.role === "admin"}
            />
          ))}
        </div>
      </div>

      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProperty}
      />

      {selectedProperty && (
        <DealAnalyzer
          isOpen={isAnalyzerOpen}
          onClose={() => setIsAnalyzerOpen(false)}
          property={selectedProperty}
        />
      )}

      {selectedProperty && (
        <AskAIModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          property={selectedProperty}
        />
      )}

      {selectedProperty && (
        <RequestAdvisorModal
          isOpen={isAdvisorModalOpen}
          onClose={() => setIsAdvisorModalOpen(false)}
          property={selectedProperty}
        />
      )}

      {selectedProperty && (
        <EditPropertyModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          property={selectedProperty}
          setProperty={setSelectedProperty}
          onConfirm={handleEditProperty}
          onUpdatePropertyList={(updatedProperty) => {
            setProperties((prevProperties) =>
              prevProperties.map((property) =>
                property.id === updatedProperty.id ? updatedProperty : property
              )
            );
          }} // Pass the callback function
        />
      )}
    </div>
  );
}
