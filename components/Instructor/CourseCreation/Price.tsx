"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCourseStore } from "@/store/useCourseStore";
import { EyeIcon } from "lucide-react";

export type PriceHandle = { validateAndFocus: () => Promise<boolean> };

interface PriceProps {
  onPreview?: () => void;
}

const PriceInner = ({ onPreview }: PriceProps, ref: React.Ref<PriceHandle>) => {
  const { pricing, setPricing } = useCourseStore();

  // Initialize from store or defaults
  const [currency, setCurrency] = React.useState(pricing.currency || "USD");
  const [priceTier, setPriceTier] = React.useState(
    pricing.isFree
      ? "free"
      : pricing.price === 0
        ? "free"
        : pricing.price === 9.99
          ? "basic"
          : pricing.price === 19.99
            ? "standard"
            : pricing.price === 39.99
              ? "premium"
              : "custom"
  );
  const [customPrice, setCustomPrice] = React.useState(
    priceTier === "custom" ? String(pricing.price) : ""
  );
  const [showErrors, setShowErrors] = React.useState(false);

  // Sync from store when pricing changes (e.g., when navigating back)
  // Only sync if component just mounted or store values changed externally
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // Skip on initial mount since useState already initialized from store
    }

    // Only update if store values are different from current local state
    if (pricing.currency && pricing.currency !== currency) {
      setCurrency(pricing.currency);
    }
    const newPriceTier = pricing.isFree
      ? "free"
      : Math.abs(pricing.price - 0) < 0.01
        ? "free"
        : Math.abs(pricing.price - 9.99) < 0.01
          ? "basic"
          : Math.abs(pricing.price - 19.99) < 0.01
            ? "standard"
            : Math.abs(pricing.price - 39.99) < 0.01
              ? "premium"
              : "custom";
    if (newPriceTier !== priceTier) {
      setPriceTier(newPriceTier);
      if (newPriceTier === "custom") {
        setCustomPrice(String(pricing.price));
      } else {
        setCustomPrice("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricing.currency, pricing.price, pricing.isFree]); // Only re-sync when store values change, not on every render

  // Sync to store
  React.useEffect(() => {
    const price =
      priceTier === "free"
        ? 0
        : priceTier === "basic"
          ? 9.99
          : priceTier === "standard"
            ? 19.99
            : priceTier === "premium"
              ? 39.99
              : parseFloat(customPrice) || 0;

    setPricing({
      currency,
      price,
      isFree: priceTier === "free",
      discountPercent: null,
      priceTier,
    });
  }, [currency, priceTier, customPrice, setPricing]);

  React.useImperativeHandle(ref, () => ({
    validateAndFocus: async () => {
      const ok = priceTier !== "custom" || customPrice.trim() !== "";
      if (ok) return true;
      setShowErrors(true);
      const el = document.getElementById("custom-price");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Pricing Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Set the price tier and currency for your course
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency Dropdown */}
        <div className="space-y-2">
          <Label>
            Currency <span className="text-destructive">*</span>
          </Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar ($)</SelectItem>
              <SelectItem value="EUR">EUR - Euro (€)</SelectItem>
              <SelectItem value="GBP">GBP - British Pound (£)</SelectItem>
              <SelectItem value="INR">INR - Indian Rupee (₹)</SelectItem>
              <SelectItem value="CAD">CAD - Canadian Dollar (C$)</SelectItem>
              <SelectItem value="AUD">AUD - Australian Dollar (A$)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Tier Dropdown */}
        <div className="space-y-2">
          <Label>
            Price Tier <span className="text-destructive">*</span>
          </Label>
          <Select value={priceTier} onValueChange={setPriceTier}>
            <SelectTrigger>
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic ($9.99)</SelectItem>
              <SelectItem value="standard">Standard ($19.99)</SelectItem>
              <SelectItem value="premium">Premium ($39.99)</SelectItem>
              <SelectItem value="custom">Custom Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Custom Price Input */}
      {priceTier === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="custom-price">
            Custom Price <span className="text-destructive">*</span>
          </Label>
          <Input
            id="custom-price"
            type="number"
            placeholder="Enter custom price"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
          />
          {showErrors && !customPrice.trim() && (
            <p className="text-sm text-destructive mt-1">
              Custom price is required
            </p>
          )}
        </div>
      )}

      {/* Price Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Price Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Currency:</span>
            <span className="font-medium">{currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">
              {priceTier === "free"
                ? "Free"
                : priceTier === "custom"
                  ? `${currency} ${customPrice || "0.00"}`
                  : priceTier === "basic"
                    ? "$9.99"
                    : priceTier === "standard"
                      ? "$19.99"
                      : "$39.99"}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Button */}
      {onPreview && (
        <div className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onPreview}
            className="w-full gap-2"
          >
            <EyeIcon className="size-4" />
            Preview Course
          </Button>
        </div>
      )}
    </div>
  );
};

export const Price = React.forwardRef<PriceHandle, PriceProps>(PriceInner);
