"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PriceHandle = { validateAndFocus: () => Promise<boolean> };

const PriceInner = (_: object, ref: React.Ref<PriceHandle>) => {
  const [currency, setCurrency] = React.useState("USD");
  const [priceTier, setPriceTier] = React.useState("free");
  const [customPrice, setCustomPrice] = React.useState("");
  const [showErrors, setShowErrors] = React.useState(false);

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
    </div>
  );
};

export const Price = React.forwardRef<PriceHandle, object>(PriceInner);
