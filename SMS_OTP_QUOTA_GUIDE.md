# SMS OTP Quota Management - Complete Implementation Guide

## 📊 Your Quota Strategy: 10 SMS/Day

With a 10 SMS/day quota, you can support:
- **3-4 users per day** (with initial OTP + up to 2 resends each)
- **100-130 users per month** (if spread across the month)

---

## 🎯 Strategy Overview

### SMS Budget Allocation
```
Daily SMS Quota: 10
├─ 3 SMS per user (1 initial + 2 resends) = 3-4 users supported
└─ Remaining: 1-2 SMS buffer for errors/edge cases
```

### How It Works
1. **User enters phone number** → System checks if quota available
2. **Firebase sends OTP** → System records 1 SMS used
3. **User can resend max 2 times** → Each resend = 1 SMS (total 3 per number)
4. **Quota resets daily at midnight** → Automatic backend process

---

## 📱 Frontend Implementation (Already Done)

### File: `src/screens/OTPVerification.tsx`
✅ Complete OTP verification screen with:
- 6-digit OTP input
- 60-second timer for OTP expiry
- Maximum 2 resend attempts (3 total with initial)
- Real-time quota display
- Auto-submit when 6 digits entered

### File: `src/services/SMSQuotaService.ts`
✅ Quota management service with:
- Check available quota
- Record SMS sent
- Get phone-specific quota remaining
- Auto reset at midnight

---

## 🔧 Backend Setup (Choose One)

### Option 1: Firebase Cloud Functions (Recommended if using Firebase)

#### Step 1: Enable Cloud Functions
```bash
firebase init functions
cd functions
npm install firebase-admin firebase-functions
```

#### Step 2: Create quota collection in Firestore
```
Collection: sms_quota
├── Document ID: YYYY-MM-DD_phoneNumber
│   ├── date: "YYYY-MM-DD"
│   ├── phoneNumber: "+91..."
│   ├── count: 1-10
│   └── lastSentAt: timestamp
```

#### Step 3: Deploy Cloud Functions

Create `functions/src/sms-quota.ts`:
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Record SMS sent (called after Firebase sends OTP)
export const recordSmsSent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { phoneNumber } = data;
  const today = new Date().toISOString().split('T')[0];
  const docId = `${today}_${phoneNumber}`;
  
  const docRef = db.collection('sms_quota').doc(docId);
  const doc = await docRef.get();
  
  if (doc.exists && doc.data()!.count >= 10) {
    throw new functions.https.HttpsError('resource-exhausted', 'Daily quota exceeded');
  }
  
  await docRef.set({
    date: today,
    phoneNumber,
    count: (doc.data()?.count || 0) + 1,
    lastSentAt: admin.firestore.Timestamp.now(),
  }, { merge: true });

  const updated = await docRef.get();
  
  return {
    success: true,
    smsSent: updated.data()!.count,
    remaining: 10 - updated.data()!.count,
  };
});

// Get quota status
export const getQuotaStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { phoneNumber } = data;
  const today = new Date().toISOString().split('T')[0];
  const docId = `${today}_${phoneNumber}`;
  
  const doc = await db.collection('sms_quota').doc(docId).get();
  const count = doc.exists ? doc.data()!.count : 0;

  return {
    totalSent: count,
    remaining: Math.max(0, 10 - count),
    canSend: count < 10,
  };
});

// Reset quota daily (scheduled)
export const resetDailyQuota = functions.pubsub
  .schedule('0 0 * * *') // Midnight UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const query = db.collection('sms_quota').where('date', '<', yesterdayStr);
    const docs = await query.get();
    
    const batch = db.batch();
    docs.docs.forEach(doc => batch.delete(doc.ref));
    
    if (docs.size > 0) {
      await batch.commit();
      console.log(`Cleaned up ${docs.size} old quota records`);
    }
    
    return null;
  });
```

Deploy:
```bash
firebase deploy --only functions
```

#### Step 4: Update frontend to call Cloud Function

In `src/services/SMSQuotaService.ts`:
```typescript
import { httpsCallable } from '@react-native-firebase/functions';

const recordSmsSentFn = httpsCallable(functions(), 'recordSmsSent');
const getQuotaStatusFn = httpsCallable(functions(), 'getQuotaStatus');

export const recordSMSSent = async (phoneNumber: string): Promise<boolean> => {
  try {
    const result = await recordSmsSentFn({ phoneNumber });
    console.log(`SMS recorded: ${result.data.smsSent}/10 used`);
    return true;
  } catch (error: any) {
    if (error.code === 'resource-exhausted') {
      console.error('Daily quota exceeded');
      // Handle quota exceeded
    }
    return false;
  }
};
```

---

### Option 2: Node.js/Express Backend

If you have your own Node.js backend:

#### Step 1: Install dependencies
```bash
npm install mongoose express firebase-admin
```

#### Step 2: Create SMS Quota model
```typescript
// models/SMSQuotaLog.ts
import mongoose from 'mongoose';

const smsQuotaSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  count: { type: Number, default: 1 },
  lastSentAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Compound index for fast lookups
smsQuotaSchema.index({ phoneNumber: 1, date: 1 });

export default mongoose.model('SMSQuotaLog', smsQuotaSchema);
```

#### Step 3: Create API routes
```typescript
// routes/sms-quota.ts
import express from 'express';
import SMSQuotaLog from '../models/SMSQuotaLog';
import { verifyAuth } from '../middleware/auth';

const router = express.Router();

// Record SMS sent
router.post('/record', verifyAuth, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    let quota = await SMSQuotaLog.findOne({ phoneNumber, date: today });
    
    if (!quota) {
      quota = new SMSQuotaLog({ phoneNumber, date: today, count: 0 });
    }
    
    if (quota.count >= 10) {
      return res.status(429).json({
        success: false,
        message: 'Daily SMS quota (10) exceeded',
        remaining: 0,
      });
    }
    
    quota.count += 1;
    quota.lastSentAt = new Date();
    await quota.save();
    
    res.json({
      success: true,
      smsSent: quota.count,
      remaining: 10 - quota.count,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
});

// Get quota status
router.get('/status/:phoneNumber', verifyAuth, async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const quota = await SMSQuotaLog.findOne({ phoneNumber, date: today });
    const count = quota?.count || 0;
    
    res.json({
      totalSent: count,
      remaining: Math.max(0, 10 - count),
      canSend: count < 10,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
});

export default router;
```

---

## 🔌 Integration Steps

### Step 1: Update Login.tsx
```typescript
// Add this to check quota before sending OTP
const signInWithPhoneNumber = async () => {
  if (!mobile || mobile.length < 10) {
    Alert.alert('Invalid number', 'Please enter a valid 10-digit mobile number.');
    return;
  }

  const fullPhoneNumber = '+91' + mobile;
  
  try {
    setLoading(true);
    
    // Check quota
    const quota = await SMSQuotaService.getQuotaStatus();
    if (quota.remainingQuota <= 0) {
      Alert.alert(
        'SMS Limit Reached',
        `Daily limit (10 SMS) reached. Reset at ${quota.resetAt}`
      );
      return;
    }

    // Send OTP
    const confirmationResult = await auth().signInWithPhoneNumber(fullPhoneNumber);
    
    // Record in quota system
    await SMSQuotaService.recordSMSSent(fullPhoneNumber);
    
    setConfirmation(confirmationResult);
    setPhoneNumber(fullPhoneNumber);
  } catch (error: any) {
    Alert.alert('Error', error.message);
  } finally {
    setLoading(false);
  }
};
```

### Step 2: Test on Real Devices

```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```

**Testing with real devices:**
1. Install app on real device
2. Go to Login screen
3. Enter phone number
4. Watch OTP appear in quota logs
5. Verify quota decreases

---

## 📊 Monitoring & Analytics

### Track quota usage:
```typescript
// Log quota analytics
export const logQuotaUsage = async () => {
  const quota = await getQuotaStatus();
  console.log({
    timestamp: new Date(),
    totalSent: quota.totalSent,
    remaining: quota.remainingQuota,
    usagePercent: (quota.totalSent / 10) * 100,
  });
};
```

### Set up alerts:
- ⚠️ Alert at 70% (7/10 SMS used)
- 🚨 Alert at 100% (quota exceeded)
- 📈 Daily summary email with quota stats

---

## 🛡️ Security Checklist

- [ ] Rate limit: 3 OTP requests per phone number per day
- [ ] Rate limit: 10 requests per IP per hour
- [ ] Validate phone number format before processing
- [ ] Require authentication for quota APIs
- [ ] Log all SMS sends for audit trail
- [ ] Set spending limit with SMS provider
- [ ] Monitor for abuse patterns
- [ ] Keep audit logs for 90 days minimum

---

## 💡 Optimization Tips

1. **Reduce unnecessary SMS**
   - Cache recently verified numbers (1 hour)
   - Reduce resend wait time to 30 seconds
   
2. **Better quota planning**
   - Peak hours: Limit to 1 SMS per user
   - Off-peak: Allow full 3 attempts per user
   
3. **Consider premium service**
   - Upgrade SMS quota as you grow
   - Different tiers: 10/day → 100/day → unlimited

4. **Handle quotas gracefully**
   - Don't fail users, show timer "try again tomorrow"
   - Offer alternative verification (email, password reset)

---

## 📞 SMS Provider Recommendations

| Provider | Cost | Quota | Setup Time |
|----------|------|-------|-----------|
| Firebase | Free tier (limited) | Varies | 5 min |
| Twilio | $0.0075/SMS | Custom | 10 min |
| AWS SNS | $0.0645/SMS (India) | Spending limit | 15 min |
| MSG91 | ₹300/month (100 SMS) | 100-1000/month | 5 min |
| Kaleyra | ₹500/month (500 SMS) | Variable | 10 min |

**Recommendation for India:** Use MSG91 or Kaleyra for best rates.

---

## 📝 Troubleshooting

**Issue: SMS quota exceeded but haven't sent 10**
- Solution: Check if resend attempts are counted
- Verify timestamp logic (timezone issues)

**Issue: Quota not resetting at midnight**
- Solution: Check Cloud Function scheduled execution
- Verify timezone (use UTC for consistency)
- Check database for stale records

**Issue: False quota rejections**
- Solution: Clear old records manually
- Check compound index is created
- Verify phone number formatting consistency

---

## 🚀 Next Steps

1. Choose backend option (Firebase or Node.js)
2. Set up quota collection/table
3. Deploy Cloud Functions or API routes
4. Update Login.tsx and SMSQuotaService.ts
5. Test on real devices
6. Monitor quota usage for first week
7. Adjust based on actual usage patterns

---

## 📚 Related Files

- `src/screens/Login.tsx` - Phone entry screen
- `src/screens/OTPVerification.tsx` - OTP verification (✅ ready)
- `src/services/SMSQuotaService.ts` - Quota management (✅ ready)
- `SMS_QUOTA_BACKEND_GUIDE.ts` - Backend implementation details

---

**Questions? Check your SMS provider's documentation or Firebase Auth setup guide.**
