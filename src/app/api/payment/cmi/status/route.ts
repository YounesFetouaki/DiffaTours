import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if CMI credentials are configured in environment variables
    const cmiMerchantId = process.env.CMI_MERCHANT_ID;
    const cmiStoreKey = process.env.CMI_STORE_KEY;
    const cmiApiUrl = process.env.CMI_API_URL;

    // CMI is enabled only if all required credentials are present
    const isEnabled = !!(cmiMerchantId && cmiStoreKey && cmiApiUrl);

    // TEMPORARY: Enable for testing purposes even without credentials
    // TODO: Remove this override once CMI credentials are configured
    const isTestingEnabled = true;

    return NextResponse.json({ 
      enabled: isTestingEnabled || isEnabled,
      message: isTestingEnabled 
        ? 'CMI payment gateway enabled for testing (credentials not required)'
        : isEnabled 
          ? 'CMI payment gateway is configured and ready' 
          : 'CMI payment gateway credentials not configured'
    });
  } catch (error) {
    console.error('Error checking CMI status:', error);
    return NextResponse.json({ 
      enabled: false,
      message: 'Error checking CMI status'
    }, { status: 500 });
  }
}