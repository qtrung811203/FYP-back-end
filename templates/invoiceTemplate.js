const createInvoiceTemplate = (order) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <header style="background-color: #f4f4f4; padding: 20px; text-align: center;">
        <h1 style="color: #444; margin: 0;">Order Confirmation</h1>
    </header>
    <main style="padding: 20px;">
        <section style="margin-bottom: 30px;">
            <h2 style="color: #444; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Details</h2>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        </section>
        <section style="margin-bottom: 30px;">
            <h2 style="color: #444; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Shipping Information</h2>
            <p><strong>Name:</strong> ${order.shippingInformation.fullName}</p>
            <p><strong>Phone:</strong> ${order.shippingInformation.phoneNumber}</p>
            <p><strong>Address:</strong> ${order.shippingInformation.address}</p>
            <p><strong>Province:</strong> ${order.shippingInformation.province}</p>
            <p><strong>District:</strong> ${order.shippingInformation.district}</p>
            <p><strong>Ward:</strong> ${order.shippingInformation.ward}</p>
            ${order.shippingInformation.note ? `<p><strong>Note:</strong> ${order.shippingInformation.note}</p>` : ''}
        </section>
        <section style="margin-bottom: 30px;">
            <h2 style="color: #444; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f4f4f4;">
                        <th style="text-align: left; padding: 10px; border: 1px solid #ddd;">Item</th>
                        <th style="text-align: right; padding: 10px; border: 1px solid #ddd;">Quantity</th>
                        <th style="text-align: right; padding: 10px; border: 1px solid #ddd;">Price</th>
                        <th style="text-align: right; padding: 10px; border: 1px solid #ddd;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items
                      .map(
                        (item) => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">${item.itemId.name}</td>
                            <td style="text-align: right; padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
                            <td style="text-align: right; padding: 10px; border: 1px solid #ddd;">${item.itemId.price.toLocaleString()} VND</td>
                            <td style="text-align: right; padding: 10px; border: 1px solid #ddd;">${(item.itemId.price * item.quantity).toLocaleString()} VND</td>
                        </tr>
                    `,
                      )
                      .join('')}
                </tbody>
                <tfoot>
                    <tr style="background-color: #f4f4f4;">
                        <td colspan="3" style="text-align: right; padding: 10px; border: 1px solid #ddd;"><strong>Total:</strong></td>
                        <td style="text-align: right; padding: 10px; border: 1px solid #ddd;"><strong>${order.totalPrice.toLocaleString()} VND</strong></td>
                    </tr>
                </tfoot>
            </table>
        </section>
    </main>
    <footer style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 0.8em;">
        <p>Thank you for your order!</p>
        <p>If you have any questions, please contact our customer support.</p>
    </footer>
</body>
</html>
`;

module.exports = createInvoiceTemplate;
