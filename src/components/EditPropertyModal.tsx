import React, { useState, useEffect, useCallback } from "react";
import { X, Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { uploadImage } from "../lib/supabase";

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  setProperty: (property: any) => void;
  onConfirm: (updatedProperty: any) => void;
  onUpdatePropertyList: (updatedProperty: any) => void; // New callback function
}

const EditPropertyModal = ({
  isOpen,
  onClose,
  property,
  setProperty,
  onConfirm,
  onUpdatePropertyList, // New callback function
}: EditPropertyModalProps) => {
  const [formData, setFormData] = useState({
    title: property.title || "",
    address: property.address || "",
    price: property.price || "",
    dealType: property.dealType || "Fix & Flip",
    description: property.description || "",
    repairCost: property.repairCost || "",
  });
  const [images, setImages] = useState(property.images || []);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFormData(property);
  }, [property]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setProperty((prev: typeof property) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const updatedPropertyData = {
        ...formData,
        images,
      };

      await onConfirm(updatedPropertyData);
      onUpdatePropertyList(updatedPropertyData); // Update the property list state
      toast.success("Property updated successfully");
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Failed to update property");
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      try {
        const uploadPromises = acceptedFiles.map((file) =>
          uploadImage(file, `${property.user_id}`)
        );
        const uploadedUrls = await Promise.all(uploadPromises);

        // Add new images to the gallery
        setImages((prev) => [...prev, ...uploadedUrls]);
        setProperty((prev: typeof property) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }));
        toast.success("Images uploaded successfully!");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload images");
      } finally {
        setUploading(false);
      }
    },
    [property.user_id, setProperty]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5242880, // 5MB
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Edit Property</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Images
              </label>
              <div
                {...getRootProps()}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${
                  isDragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <input {...getInputProps()} />
                    <p className="pl-1">
                      Drag & drop images here, or click to select
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              </div>

              {uploading && (
                <div className="mt-4">
                  <div className="animate-pulse flex space-x-4 items-center">
                    <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                    <div className="text-sm text-indigo-600">Uploading...</div>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
                <AnimatePresence>
                  {images.map((url, index) => (
                    <motion.div
                      key={url}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square rounded-lg overflow-hidden group"
                    >
                      <img
                        src={url}
                        alt={`Property image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = images.filter(
                            (_, i) => i !== index
                          );
                          setImages(newImages);
                          setProperty((prev: typeof property) => ({
                            ...prev,
                            images: newImages,
                          }));
                        }}
                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-6 w-6 text-white" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Common Fields */}
            {[
              { label: "Title", name: "title", type: "text" },
              { label: "Price", name: "price", type: "number" },
              { label: "Address", name: "address", type: "text" },
              { label: "Repair Cost", name: "repairCost", type: "number" },
              {
                label: "Profit for Selling",
                name: "profitForSelling",
                type: "number",
              },
              { label: "ROI", name: "roi", type: "number" },
              { label: "Rent", name: "rent", type: "number" },
              { label: "Net Cash Flow", name: "netCashFlow", type: "number" },
              {
                label: "Cash on Cash Return",
                name: "cashOnCashReturn",
                type: "number",
              },
              { label: "ARV", name: "arv", type: "number" },
              { label: "Property ID", name: "propertyId", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={formData[name] || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            ))}

            {/* Dropdown for Deal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deal Type
              </label>
              <select
                name="dealType"
                value={formData.dealType || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option>Fix & Flip</option>
                <option>BRRRR</option>
              </select>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPropertyModal;
