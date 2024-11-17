export const formatPhoneNumber = (phone: string, countryCode: string): string => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Remove country code if it's at the start of the phone number
  return cleaned.startsWith(countryCode.replace('+', '')) 
    ? cleaned 
    : cleaned;
};