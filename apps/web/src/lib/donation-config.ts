export function getDonationQrConfig() {
  const imageUrl =
    process.env.NEXT_PUBLIC_DONATION_QR_IMAGE_URL || '/donation-qr.jpeg';

  return {
    imageUrl,
    title: process.env.NEXT_PUBLIC_DONATION_QR_TITLE || 'Scan and Pay',
    note:
      process.env.NEXT_PUBLIC_DONATION_QR_NOTE ||
      'Scan the QR code, complete the payment, and upload the screenshot below for manual verification.',
    isConfigured: imageUrl !== '/donation-qr-placeholder.svg',
  };
}
