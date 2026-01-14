import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface MortgageCalculatorRequest {
  home_value: number;
  downpayment: number;
  interest_rate: number;
  duration_years: number;
  monthly_hoa?: number;
  annual_property_tax?: number;
  annual_home_insurance?: number;
}

interface MortgageCalculatorResponse {
  monthly_payment: {
    mortgage: number;
    property_tax: number;
    hoa: number;
    home_insurance: number;
    total: number;
  };
  annual_payment: {
    mortgage: number;
    property_tax: number;
    hoa: number;
    home_insurance: number;
    total: number;
  };
  total_interest_paid: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: MortgageCalculatorRequest = await request.json();
    const {
      home_value,
      downpayment,
      interest_rate,
      duration_years,
      monthly_hoa = 0,
      annual_property_tax,
      annual_home_insurance,
    } = body;

    if (!home_value || !interest_rate || !duration_years) {
      return NextResponse.json(
        { error: "Missing required fields: home_value, interest_rate, duration_years" },
        { status: 400 }
      );
    }

    const apiKey = process.env.API_NINJAS_KEY;
    if (!apiKey) {
      console.error("API_NINJAS_KEY is not configured");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Build query parameters
    const params = new URLSearchParams({
      home_value: home_value.toString(),
      downpayment: (downpayment || 0).toString(),
      interest_rate: interest_rate.toString(),
      duration_years: duration_years.toString(),
    });

    if (monthly_hoa) params.append("monthly_hoa", monthly_hoa.toString());
    if (annual_property_tax) params.append("annual_property_tax", annual_property_tax.toString());
    if (annual_home_insurance) params.append("annual_home_insurance", annual_home_insurance.toString());

    const response = await fetch(
      `https://api.api-ninjas.com/v1/mortgagecalculator?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error("API Ninjas error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to calculate mortgage" },
        { status: response.status }
      );
    }

    const data: MortgageCalculatorResponse = await response.json();

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Mortgage API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
