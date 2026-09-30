# Paystack live checkout

Premium passes are sold through Paystack in live mode at NGN 50,000 (5,000,000 kobo). Regular registration remains free.

## Production configuration

1. Apply all pending Supabase migrations, including `202609210003_paystack.sql`.
2. Store the Paystack live secret key only as the Supabase Edge Function secret `PAYSTACK_SECRET_KEY`. Never expose it through a `VITE_` variable or frontend code.
3. Set `PAYSTACK_SITE_URL` to the production frontend origin, currently `https://atf.e360.africa`.
4. Deploy the `paystack` function with gateway JWT verification disabled: `supabase functions deploy paystack --no-verify-jwt`. The endpoint is public for guest checkout, while webhook requests are authenticated using HMAC-SHA512 and every completed payment is independently verified through Paystack's API.
5. Deploy the current `send-confirmation` function.
6. In Paystack live settings, set the webhook URL to `https://<project-ref>.supabase.co/functions/v1/paystack`.

## Behaviour and operations

- Pending Premium tickets reserve a server-generated reference before checkout; only a successful live Paystack verification confirms the ticket.
- The server validates the expected amount, currency, live domain, reference and customer email. Client-supplied prices and ticket types are ignored.
- Payment references, amounts, status and paid timestamps are visible in Admin ticket details. Payment fields cannot be changed by the public client.
- Callback retries and duplicate webhooks are idempotent. Cancelled registrations require staff review and are not reactivated automatically.
- Returning without paying leaves a pending record. The attendee can use the recovery link to check the previous payment before starting again.
- Confirmed live payments trigger ticket confirmation email delivery.

## Release checks

Run `node --test tests/paystack.test.mjs`, `npm run typecheck`, `npm run lint`, and `npm run build`. After deployment, complete one controlled live transaction, confirm the Paystack dashboard event and webhook response, verify the ticket becomes paid and confirmed, verify the email arrives, and refund the controlled transaction if appropriate.