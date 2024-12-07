const createCodCheckoutTemplate = (confirmUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm your order (COD)</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
    <h1 style="color: #444;">Confirm your order</h1>
    <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your order. Please click the button below to confirm your order:</p>
    <a href="${confirmUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px;">Confirm</a>
    <p style="margin-top: 20px; font-size: 14px;">If you did not place this order, please ignore this email.</p>
</body>
</html>
`;

module.exports = createCodCheckoutTemplate;
