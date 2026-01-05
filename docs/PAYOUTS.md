# Payouts Configuration

This document explains how to configure payouts for LedgerSmart AI.

## Overview

LedgerSmart AI uses Stripe for payment processing. Payouts from Stripe can be configured to go to:
- Payoneer accounts
- Bank accounts (direct deposit)
- Other payment processors

## Stripe Payout Configuration

### Step 1: Access Stripe Dashboard

1. Login to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Settings** > **Payouts**

### Step 2: Add Payout Account

#### For Payoneer:

1. In Stripe Dashboard, go to **Settings** > **Payouts**
2. Click **Add payout account**
3. Select **External account**
4. Enter Payoneer account details:
   - Account type: Bank account
   - Account number: Your Payoneer account number
   - Routing number: Payoneer routing number
   - Account holder name: Your name
5. Verify the account (Stripe will send test deposits)

#### For Bank Account:

1. Follow same steps as above
2. Use your local bank account details
3. Complete verification process

### Step 3: Set Default Payout Account

1. In Stripe Dashboard > Settings > Payouts
2. Select your payout account
3. Click **Set as default**

## Application Configuration

The application stores minimal payout metadata in the user's profile:

```javascript
payoutAccount: {
  provider: 'stripe', // or 'payoneer', 'bank'
  accountId: 'account_id',
  metadata: {} // Additional info if needed
}
```

**Important**: The application does NOT store sensitive banking information. All payout configuration is done directly in Stripe Dashboard.

## Payout Schedule

Stripe default payout schedule:
- **US accounts**: Daily (next business day)
- **International**: Varies by country

You can customize payout schedule in Stripe Dashboard.

## Fees

- Stripe charges a small fee per payout
- Payoneer may charge additional fees
- Check both Stripe and Payoneer fee structures

## Testing Payouts

1. Use Stripe test mode
2. Create test payouts
3. Verify funds arrive correctly
4. Switch to live mode for production

## Security

- Never store bank account details in application database
- All sensitive information handled by Stripe
- Use Stripe's secure API for payout operations
- Follow PCI compliance guidelines

## Support

For payout issues:
- Stripe Support: https://support.stripe.com
- Payoneer Support: https://www.payoneer.com/support

## Production Checklist

- [ ] Payout account added in Stripe
- [ ] Account verified
- [ ] Default payout account set
- [ ] Payout schedule configured
- [ ] Test payout completed successfully
- [ ] Fees reviewed and understood
- [ ] Tax information provided to Stripe

