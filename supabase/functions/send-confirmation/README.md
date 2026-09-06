# Confirmation email function

Required production secrets:

- `RESEND_API_KEY`: Resend API key for the verified sending domain.
- `CONFIRMATION_EMAIL_FROM`: Sender in the format `AgriTech Fest <tickets@your-domain>`.

Deploy without JWT verification because registrations are public. The function accepts only a valid ticket or application code, retrieves the destination from the database with the server-side service role, and deduplicates deliveries.
