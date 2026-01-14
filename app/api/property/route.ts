import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface PropertyDetailsRequest {
  address: string;
}

interface PropertyDetails {
  beds?: number;
  baths?: number;
  sqft?: number;
  year_built?: number;
  lot_sqft?: number;
  property_type?: string;
  estimated_value?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: PropertyDetailsRequest = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.API_NINJAS_KEY;
    if (!apiKey) {
      console.error("API_NINJAS_KEY is not configured");
      return NextResponse.json({ data: null });
    }

    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://api.api-ninjas.com/v1/propertydetails?address=${encodedAddress}`,
      {
        method: "GET",
        headers: {
          "X-Api-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error("API Ninjas error:", response.status, response.statusText);
      return NextResponse.json({ data: null });
    }

    const rawData = await response.json();

    // DEBUG: Log the raw response from API Ninjas
    console.log("API Ninjas raw response for address:", address);
    console.log("API Ninjas raw data:", JSON.stringify(rawData, null, 2));

    // API Ninjas returns data in a specific format - extract relevant fields
    // The response structure may vary, so we handle it gracefully
    const propertyData: PropertyDetails = {};

    if (rawData && typeof rawData === "object") {
      // Handle different possible response formats
      const data = rawData.property || rawData;

      if (data.bedrooms !== undefined) propertyData.beds = Number(data.bedrooms);
      if (data.beds !== undefined) propertyData.beds = Number(data.beds);

      if (data.bathrooms !== undefined) propertyData.baths = Number(data.bathrooms);
      if (data.baths !== undefined) propertyData.baths = Number(data.baths);

      if (data.square_feet !== undefined) propertyData.sqft = Number(data.square_feet);
      if (data.sqft !== undefined) propertyData.sqft = Number(data.sqft);
      if (data.building_size !== undefined) propertyData.sqft = Number(data.building_size);

      if (data.year_built !== undefined) propertyData.year_built = Number(data.year_built);

      if (data.lot_size !== undefined) propertyData.lot_sqft = Number(data.lot_size);
      if (data.lot_sqft !== undefined) propertyData.lot_sqft = Number(data.lot_sqft);

      if (data.property_type !== undefined) propertyData.property_type = String(data.property_type);

      if (data.estimated_value !== undefined) propertyData.estimated_value = Number(data.estimated_value);
      if (data.price !== undefined) propertyData.estimated_value = Number(data.price);
    }

    // Only return data if we have at least one valid field
    const hasData = Object.keys(propertyData).length > 0;

    // DEBUG: Log what we're returning
    console.log("Parsed property data:", propertyData);
    console.log("Has data:", hasData);

    return NextResponse.json({
      data: hasData ? propertyData : null
    });
  } catch (error) {
    console.error("Property API error:", error);
    return NextResponse.json({ data: null });
  }
}
