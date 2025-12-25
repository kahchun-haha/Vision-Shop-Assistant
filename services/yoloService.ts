import { DetectionResponse } from "../types";

export const detectObjectInImage = async (base64Image: string): Promise<DetectionResponse> => {
  try {
    // UPDATED: Now pointing to your Laptop's WiFi IP
    const response = await fetch('https://192.168.1.111:5000/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data as DetectionResponse;

  } catch (error) {
    console.error("YOLO Connection Error:", error);
    return { itemFound: false, reason: "Connection failed" };
  }
};