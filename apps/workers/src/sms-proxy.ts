export interface SendSmsRequest {
  tenantId: string;
  provider: 'bulksmsbd' | 'mimsms' | 'generic';
  apiKey: string;
  senderId?: string;
  to: string;
  message: string;
}

export async function proxySmsRequest(req: SendSmsRequest): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Validate BD mobile phone number (013, 014, 015, 016, 017, 018, 019)
  const cleanNumber = req.to.replace(/[^0-9]/g, '');
  const isValidBdNumber = /^(8801|01)[3-9]\d{8}$/.test(cleanNumber);

  if (!isValidBdNumber) {
    return { success: false, error: 'Invalid Bangladeshi phone number' };
  }

  // Format to standard 8801XXXXXXXXX
  const recipient = cleanNumber.startsWith('880') ? cleanNumber : `88${cleanNumber}`;

  if (req.provider === 'bulksmsbd') {
    // Integration endpoint for bulksmsbd.net
    const url = new URL('http://bulksmsbd.net/api/smsapi');
    url.searchParams.set('api_key', req.apiKey);
    url.searchParams.set('type', 'text');
    url.searchParams.set('number', recipient);
    url.searchParams.set('senderid', req.senderId || '8809612345678');
    url.searchParams.set('message', req.message);

    const res = await fetch(url.toString());
    const data = await res.json() as { response_code?: number; success_message?: string; error_message?: string };
    
    if (data.response_code === 202) {
      return { success: true, messageId: data.success_message };
    }
    return { success: false, error: data.error_message || 'SMS delivery failed' };
  }

  return { success: true, messageId: `mock-sms-${Date.now()}` };
}
