// @ts-nocheck
const emailjs = require('emailjs-com');

exports.handler = async (event) => {
  const data = JSON.parse(event.body);
  const order = data.content; // Snipcart order data

  console.log('Order completed webhook called for:', order.invoiceNumber);

  // Generate custom invoice logic (e.g., PDF via lib like pdfkit - install via package.json if needed, but fallback to text)
  const invoiceDetails = `
    Invoice: ${order.invoiceNumber}
    Total: €${order.total}
    Items: ${order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}
    Shipping: ${order.shippingInformation.address1}, ${order.shippingInformation.country}
    From: The DIT World Company S.L.U., ESB10680478, Carrer del Valles 55, 1-2, 08030 Barcelona, Spain
  `;

  // Send delayed email (manual trigger when picked up, or automate via cron if needed)
  // For now, this sends on webhook - modify to queue/delay if using external service
  await emailjs.send(
    process.env.EMAILJS_SERVICE_ID,
    process.env.EMAILJS_TEMPLATE_ID,
    {
      to_email: order.email,
      message: invoiceDetails,
      from_name: 'FilmRAID',
      reply_to: 'orders@filmraid.pro',
    },
    process.env.EMAILJS_USER_ID,
  );

  return { statusCode: 200 };
};
