"use client";

import React, { useState } from "react";
import { useStepper } from "@/hooks/use-stepper";
import {
  Stepper,
  StepperItems,
  StepperItem,
  StepperContent,
  StepperPanel,
  StepperActions,
  StepperPreviousButton,
  StepperNextButton,
  StepperCompleteButton,
} from "@/components/ui/stepper";

export default function StepperTest() {
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    firstName: "",
    lastName: "",
    email: "",

    // Step 2: Address
    street: "",
    city: "",
    country: "",

    // Step 3: Preferences
    notifications: false,
    newsletter: false,

    // Step 4: Review (no fields)
  });

  const stepper = useStepper({
    initialStep: 0,
    steps: [
      {
        id: "personal-info",
        label: "Personal Information",
        description: "Enter your basic details",
      },
      {
        id: "address",
        label: "Address",
        description: "Where do you live?",
      },
      {
        id: "preferences",
        label: "Preferences",
        description: "Customize your experience",
        optional: true,
      },
      {
        id: "review",
        label: "Review & Submit",
        description: "Confirm your information",
      },
    ],
    onStepChange: () => {
      // Step change handler
    },
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleComplete = () => {
    // Form submission handler - would send data to backend
    // formData contains all the user's information
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Registration Form
        </h1>
        <p className="text-muted-foreground">
          Complete all steps to finish your registration
        </p>
      </div>

      <Stepper stepper={stepper}>
        {/* Step Indicators */}
        <StepperItems>
          {stepper.steps.map((_, index) => (
            <StepperItem key={index} index={index} />
          ))}
        </StepperItems>

        {/* Step Content */}
        <StepperContent>
          {/* Step 1: Personal Information */}
          <StepperPanel index={0}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Personal Information
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Please provide your basic information
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="John"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>
          </StepperPanel>

          {/* Step 2: Address */}
          <StepperPanel index={1}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Address Information
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Where should we reach you?
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="street">
                  Street Address
                </label>
                <input
                  id="street"
                  type="text"
                  value={formData.street}
                  onChange={(e) => handleInputChange("street", e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="New York"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="country">
                    Country
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
          </StepperPanel>

          {/* Step 3: Preferences */}
          <StepperPanel index={2}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Customize your experience (Optional)
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                  <input
                    id="notifications"
                    type="checkbox"
                    checked={formData.notifications}
                    onChange={(e) =>
                      handleInputChange("notifications", e.target.checked)
                    }
                    className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="notifications"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Enable Notifications
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Receive updates about your account activity
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                  <input
                    id="newsletter"
                    type="checkbox"
                    checked={formData.newsletter}
                    onChange={(e) =>
                      handleInputChange("newsletter", e.target.checked)
                    }
                    className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="newsletter"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Subscribe to Newsletter
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Get weekly updates and special offers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </StepperPanel>

          {/* Step 4: Review */}
          <StepperPanel index={3}>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Review Your Information
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Please review your information before submitting
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-3 text-sm">
                    Personal Information
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Name:</dt>
                      <dd className="font-medium">
                        {formData.firstName} {formData.lastName}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Email:</dt>
                      <dd className="font-medium">{formData.email}</dd>
                    </div>
                  </dl>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-3 text-sm">Address</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Street:</dt>
                      <dd className="font-medium">{formData.street}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">City:</dt>
                      <dd className="font-medium">{formData.city}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Country:</dt>
                      <dd className="font-medium">{formData.country}</dd>
                    </div>
                  </dl>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-semibold mb-3 text-sm">Preferences</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Notifications:</dt>
                      <dd className="font-medium">
                        {formData.notifications ? "Enabled" : "Disabled"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Newsletter:</dt>
                      <dd className="font-medium">
                        {formData.newsletter ? "Subscribed" : "Not subscribed"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </StepperPanel>
        </StepperContent>

        {/* Navigation Actions */}
        <StepperActions>
          <StepperPreviousButton />
          <div className="flex gap-2">
            <StepperNextButton />
            <StepperCompleteButton onClick={handleComplete}>
              Submit
            </StepperCompleteButton>
          </div>
        </StepperActions>
      </Stepper>
    </div>
  );
}
