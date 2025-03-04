import { useState, useEffect } from "react";
import { Calculator, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Property, DealAnalysis } from "../types";

interface DealAnalyzerProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export default function DealAnalyzer({
  property,
  isOpen,
  onClose,
}: DealAnalyzerProps) {
  const [analysis, setAnalysis] = useState<DealAnalysis>({
    purchase_price: property.price || 0,
    rehab_cost: property.repairCost || 0,
    arv: property.arv || 0,
    holding_costs: 0,
    roi: property.roi || 0,
    rent: property.rent || 0,
    refinance_rate: 0,
    loan_amount: 0,
    project_duration: 0,
    closing_costs: 1500,
    project_management_fee: 0,
    annual_taxes: 0,
    utilities: 0,
    annual_insurance_premium: 0,
    interest_points: 12,
    other_fees: 1000,
    hml_purchase: 86.5,
    hml_repair: 86.5,
    selling_costs: 1500,
    turnkey_flip: 0,
    current_rent: property.rent || 0,
    property_management: 0,
    loan_fees: 0,
    down_payment: 0,
    vacancy_maintenance: 0,
    refinance_loan_interest_points: 0,
    refinance_loan_other_fees: 0,
  });

  const [strategy, setStrategy] = useState<"Fix & Flip" | "BRRRR" | "Both">(
    property.dealType || "Fix & Flip"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [netProfit, setNetProfit] = useState(0);
  const [totalInvestment, setTotalInvestment] = useState(0);
  const [cashFlow, setCashFlow] = useState(0);
  const [cashOnCashReturn, setCashOnCashReturn] = useState(0);

  useEffect(() => {
    // Update analysis when property changes
    setAnalysis({
      purchase_price: property.price || 0,
      rehab_cost: property.repairCost || 0,
      arv: property.arv || 0,
      holding_costs: 0,
      roi: property.roi || 0,
      rent: property.rent || 0,
      refinance_rate: 0,
      loan_amount: 0,
      project_duration: 0,
      closing_costs: 0,
      project_management_fee: 0,
      annual_taxes: 0,
      utilities: 0,
      annual_insurance_premium: 0,
      interest_points: 0,
      other_fees: 0,
      hml_purchase: 0,
      hml_repair: 0,
      selling_costs: 0,
      turnkey_flip: 0,
      current_rent: property.rent || 0,
      property_management: 0,
      loan_fees: 0,
      down_payment: 0,
      vacancy_maintenance: 0,
      refinance_loan_interest_points: 0,
      refinance_loan_other_fees: 0,
    });
    setStrategy(property.dealType || "Fix & Flip");
  }, [property]);

  if (!isOpen) return null;

  const calculateResults = async () => {
    setLoading(true);
    setError("");

    try {
      const {
        purchase_price,
        rehab_cost,
        arv,
        holding_costs,
        rent,
        refinance_rate,
        loan_amount,
        project_duration,
        closing_costs,
        project_management_fee,
        annual_taxes,
        utilities,
        annual_insurance_premium,
        interest_points,
        other_fees,
        hml_purchase,
        hml_repair,
        selling_costs,
        turnkey_flip,
        current_rent,
        property_management,
        loan_fees,
        down_payment,
        vacancy_maintenance,
        refinance_loan_interest_points,
        refinance_loan_other_fees,
      } = analysis;

      // Validate inputs
      if (purchase_price <= 0 || arv <= 0) {
        throw new Error("Purchase price and ARV must be greater than zero.");
      }

      // Convert percentages to decimals for calculations
      const management_fee = (project_management_fee / 100) * purchase_price;
      const interest_cost = (interest_points / 100) * loan_amount;
      const refinance_fees =
        (refinance_loan_interest_points / 100) * loan_amount +
        refinance_loan_other_fees;
      const monthly_property_management =
        (property_management / 100) * current_rent;

      // Calculate Total Investment
      const total_investment =
        purchase_price +
        rehab_cost +
        holding_costs +
        closing_costs +
        management_fee +
        annual_taxes +
        utilities +
        annual_insurance_premium +
        interest_cost +
        other_fees +
        hml_purchase +
        hml_repair +
        selling_costs +
        turnkey_flip +
        monthly_property_management * project_duration +
        loan_fees +
        down_payment +
        vacancy_maintenance +
        refinance_fees;
      setTotalInvestment(total_investment);

      if (strategy === "Fix & Flip" || strategy === "Both") {
        // Fix & Flip ROI Calculation
        const net_profit = arv - total_investment;
        const roi = (net_profit / total_investment) * 100;

        setNetProfit(net_profit);
        setAnalysis((prev) => ({
          ...prev,
          roi: parseFloat(roi.toFixed(2)),
        }));
      }

      if (strategy === "BRRRR" || strategy === "Both") {
        // Monthly Cash Flow Calculation
        const monthly_loan_payment = (loan_amount * refinance_rate) / 100 / 12;
        const cash_flow =
          rent - monthly_loan_payment - monthly_property_management;

        // Cash on Cash Return Calculation
        const annual_cash_flow = cash_flow * 12;
        const cash_on_cash_return = (annual_cash_flow / total_investment) * 100;

        setCashFlow(cash_flow);
        setCashOnCashReturn(cash_on_cash_return);
        setAnalysis((prev) => ({
          ...prev,
          roi: parseFloat(cash_on_cash_return.toFixed(2)),
        }));
      }

      setShowResults(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Calculation error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm"
        >
          <div className="flex items-center justify-center min-h-screen px-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <Calculator className="h-8 w-8 text-brand-blue mr-3" />
                  <h2 className="text-2xl font-bold text-brand-navy">
                    Deal Analyzer
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex space-x-4 mb-6">
                  <button
                    onClick={() => setStrategy("Fix & Flip")}
                    className={`px-4 py-2 rounded-lg ${
                      strategy === "Fix & Flip" || strategy === "Both"
                        ? "bg-brand-blue text-white"
                        : "bg-gray-100 text-brand-navy"
                    }`}
                  >
                    Fix & Flip
                  </button>
                  <button
                    onClick={() => setStrategy("BRRRR")}
                    className={`px-4 py-2 rounded-lg ${
                      strategy === "BRRRR" || strategy === "Both"
                        ? "bg-brand-blue text-white"
                        : "bg-gray-100 text-brand-navy"
                    }`}
                  >
                    BRRRR
                  </button>
                  <button
                    onClick={() => setStrategy("Both")}
                    className={`px-4 py-2 rounded-lg ${
                      strategy === "Both"
                        ? "bg-brand-blue text-white"
                        : "bg-gray-100 text-brand-navy"
                    }`}
                  >
                    Both
                  </button>
                </div>

                <div className="bg-gradient-to-r from-brand-navy/5 to-brand-blue/10 p-6 rounded-2xl mb-6">
                  <h3 className="font-semibold text-brand-navy mb-2">
                    Property Details
                  </h3>
                  <p className="text-brand-navy/80">{property.address}</p>
                  <p className="text-brand-navy/80">
                    Listed Price: ${property.price.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      After Repair Value (ARV)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={analysis.arv === 0 ? "" : analysis.arv}
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          arv:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Project Duration (1-12 months)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.project_duration === 0
                          ? ""
                          : analysis.project_duration
                      }
                      min={1}
                      max={12}
                      onChange={(e) => {
                        const value = Math.min(Number(e.target.value), 12);
                        setAnalysis({
                          ...analysis,
                          project_duration:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Purchase Price ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.purchase_price === 0
                          ? ""
                          : analysis.purchase_price
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          purchase_price:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Closing Costs ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.closing_costs === 0
                          ? ""
                          : analysis.closing_costs
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          closing_costs:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Repair Costs ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.rehab_cost === 0 ? "" : analysis.rehab_cost
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          rehab_cost:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Project Management Fee (%)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.project_management_fee === 0
                          ? ""
                          : analysis.project_management_fee
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          project_management_fee:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Annual Taxes ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.annual_taxes === 0 ? "" : analysis.annual_taxes
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          annual_taxes:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Utilities ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={analysis.utilities === 0 ? "" : analysis.utilities}
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          utilities:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Annual Insurance Premium ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.annual_insurance_premium === 0
                          ? ""
                          : analysis.annual_insurance_premium
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          annual_insurance_premium:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Interest / Points (%)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.interest_points === 0
                          ? ""
                          : analysis.interest_points
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          interest_points:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Other Fees ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.other_fees === 0 ? "" : analysis.other_fees
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          other_fees:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      HML for Purchase ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.hml_purchase === 0 ? "" : analysis.hml_purchase
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          hml_purchase:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      HML for Repair ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.hml_repair === 0 ? "" : analysis.hml_repair
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          hml_repair:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Selling Costs ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.selling_costs === 0
                          ? ""
                          : analysis.selling_costs
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          selling_costs:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Turnkey Flip ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.turnkey_flip === 0 ? "" : analysis.turnkey_flip
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          turnkey_flip:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Current Rent / Market Rent ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.current_rent === 0 ? "" : analysis.current_rent
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          current_rent:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Property Management (%) per month
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.property_management === 0
                          ? ""
                          : analysis.property_management
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          property_management:
                            e.target.value === "" ? 0 : Number(e.target.value),
                          s,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Loan Fees ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={analysis.loan_fees === 0 ? "" : analysis.loan_fees}
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          loan_fees:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-2">
                      Down Payment ($)
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                      value={
                        analysis.down_payment === 0 ? "" : analysis.down_payment
                      }
                      onChange={(e) =>
                        setAnalysis({
                          ...analysis,
                          down_payment:
                            e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  {(strategy === "BRRRR" || strategy === "Both") && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-brand-navy mb-2">
                          Vacancy and Maintenance ($)
                        </label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                          value={
                            analysis.vacancy_maintenance === 0
                              ? ""
                              : analysis.vacancy_maintenance
                          }
                          onChange={(e) =>
                            setAnalysis({
                              ...analysis,
                              vacancy_maintenance:
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-navy mb-2">
                          Monthly Rent (For BRRRR) ($)
                        </label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                          value={analysis.rent === 0 ? "" : analysis.rent}
                          onChange={(e) =>
                            setAnalysis({
                              ...analysis,
                              rent:
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-navy mb-2">
                          Refinance Rate (For BRRRR) (%)
                        </label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                          value={
                            analysis.refinance_rate === 0
                              ? ""
                              : analysis.refinance_rate
                          }
                          onChange={(e) =>
                            setAnalysis({
                              ...analysis,
                              refinance_rate:
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl">
                    {error}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={calculateResults}
                  disabled={loading}
                  className="w-full bg-brand-navy text-white px-6 py-4 rounded-xl hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? "Calculating..." : "Calculate"}
                </motion.button>

                <AnimatePresence>
                  {showResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6 p-6 bg-gradient-to-r from-brand-navy/5 to-brand-blue/10 rounded-2xl"
                    >
                      <h3 className="text-xl font-bold text-brand-navy mb-4">
                        Analysis Results
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-brand-navy/70">
                            ROI ({strategy}):
                          </span>
                          <span className="font-bold text-xl text-brand-navy">
                            {analysis.roi.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-brand-navy/70">
                            Total Investment:
                          </span>
                          <span className="font-bold text-xl text-brand-navy">
                            ${totalInvestment.toLocaleString()}
                          </span>
                        </div>
                        {strategy === "Fix & Flip" || strategy === "Both" ? (
                          <div className="flex justify-between items-center">
                            <span className="text-brand-navy/70">
                              Net Profit:
                            </span>
                            <span className="font-bold text-xl text-brand-navy">
                              ${netProfit.toLocaleString()}
                            </span>
                          </div>
                        ) : null}
                        {strategy === "BRRRR" || strategy === "Both" ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-brand-navy/70">
                                Monthly Cash Flow:
                              </span>
                              <span className="font-bold text-xl text-brand-navy">
                                ${cashFlow.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-brand-navy/70">
                                Cash on Cash Return:
                              </span>
                              <span className="font-bold text-xl text-brand-navy">
                                {cashOnCashReturn.toFixed(2)}%
                              </span>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
