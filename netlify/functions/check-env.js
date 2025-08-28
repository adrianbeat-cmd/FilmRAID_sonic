exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      fedexClientLooksSet: !!process.env.FEDEX_CLIENT_ID,
      fedexSecretLooksSet: !!process.env.FEDEX_CLIENT_SECRET,
      fedexAccount: process.env.FEDEX_ACCOUNT_NUMBER || 'missing',
    }),
  };
};
