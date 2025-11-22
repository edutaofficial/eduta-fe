"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CONSTANTS } from "@/lib/constants";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function InstructorPayments() {
  const revenueData = CONSTANTS.PAYMENT_REVENUE;
  const payments = CONSTANTS.PAYMENTS;

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "release-ready":
        return (
          <Badge className="bg-success-500 text-white">Release Ready</Badge>
        );
      case "pending":
        return <Badge className="bg-warning-500 text-white">Pending</Badge>;
      case "released":
        return <Badge className="bg-primary-500 text-white">Released</Badge>;
      case "withdrawn":
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculateReleaseReady = () => {
    return payments
      .filter((p) => p.status === "release-ready")
      .reduce((sum, p) => sum + p.earnings, 0);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-default-900">Payments</h1>
        <p className="text-muted-foreground mt-2">
          Track your earnings and payment history
        </p>
      </div>

      {/* Release Ready Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm mb-2">
              Release Ready to Withdraw
            </p>
            <p className="text-4xl font-bold">
              ${calculateReleaseReady().toFixed(2)}
            </p>
          </div>
          <Button variant="secondary" size="lg">
            Withdraw Now
          </Button>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Payment History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and track all your payment transactions
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Course</TableHead>
                <TableHead className="font-semibold">Earnings</TableHead>
                <TableHead className="font-semibold">Students</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Release Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {payment.courseTitle}
                  </TableCell>
                  <TableCell className="font-semibold text-success-600">
                    ${payment.earnings.toFixed(2)}
                  </TableCell>
                  <TableCell>{payment.students}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(payment.releaseDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
