# 🚀 Quick Start: OTP Verification with 10 SMS/Day Quota

## ✅ What's Ready

- ✅ **OTPVerification.tsx** - Complete OTP UI with quota display
- ✅ **SMSQuotaService.ts** - Quota tracking service
- ✅ **Login.tsx** - Updated with quota checks
- ✅ **SMS_OTP_QUOTA_GUIDE.md** - Full implementation guide

## 📋 Setup Checklist (15 minutes)

### 1️⃣ Set Up Backend Quota Tracking (Choose One)

**Option A: Firebase Cloud Functions (Easiest)**
```bash
# Install Firebase CLI
npm install -g firebase-tools
firebase login

# Go to functions directory
cd functions

# Copy code from SMS_QUOTA_BACKEND_GUIDE.ts
# Deploy functions
firebase deploy --only functions
```

**Option B: Your Own Node.js Backend**
- Copy the Express routes from SMS_QUOTA_BACKEND_GUIDE.ts
- Set up MongoDB/Firestore collection
- Deploy to your server

### 2️⃣ Update SMSQuotaService.ts

Replace backend URL with your actual endpoint:
```typescript
// In getQuotaStatus()
const response = await fetch('YOUR_BACKEND_URL/api/sms/quota-status', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${userToken}`,
  },
});

// In recordSMSSent()
const response = await fetch('YOUR_BACKEND_URL/api/sms/record', {
  method: 'POST',
  body: JSON.stringify({ phoneNumber }),
});
```

### 3️⃣ Test on Real Device

**Android:**
```bash
# Connect Android device via USB
adb devices

# Run app
npm run android

# Or direct command
react-native run-android
```

**iOS:**
```bash
# Install pods
cd ios && pod install && cd ..

# Run app
npm run ios
```

### 4️⃣ Test OTP Flow

1. Launch app on real device
2. Go to Login screen
3. Enter phone number (e.g., your own number or test number)
4. Click "Login"
5. Check:
   - ✅ OTP received
   - ✅ Quota decreases (shows "10/10", "9/10", etc.)
   - ✅ Can resend max 2 times
   - ✅ Timer counts down

### 5️⃣ Verify Quota Reset

In your backend database:
```javascript
// Check Firestore collection
Collection: sms_quota
├── Document: 2024-05-23_+911234567890
│   ├── count: 3
│   ├── date: "2024-05-23"
```

At midnight UTC, old records should be auto-deleted.

---

## 🔑 Key Variables to Update

### In `src/services/SMSQuotaService.ts`:
```typescript
const BACKEND_URL = 'https://your-backend.com'; // Add this
const QUOTA_LIMIT = 10; // Your SMS quota
```

### In `src/screens/Login.tsx`:
```typescript
const fullPhoneNumber = '+91' + mobile; // Check country code
```

---

## 📊 Real Device Testing

### Test Case 1: First OTP
- Expected: OTP sent, quota shows "9/10"
- Actual: ___________

### Test Case 2: Resend (after 30s)
- Expected: OTP resent, quota shows "8/10"
- Actual: ___________

### Test Case 3: Second Resend
- Expected: OTP resent, quota shows "7/10"
- Actual: ___________

### Test Case 4: Third Resend Attempt
- Expected: "No more resend attempts available"
- Actual: ___________

### Test Case 5: Next Day
- Expected: Quota resets to "10/10"
- Actual: ___________

---

## 🐛 Common Issues & Fixes

### Issue: "SMS quota undefined" error
**Fix:** Check backend endpoint is correct and accessible
```bash
curl -X GET https://your-backend/api/sms/quota-status
```

### Issue: OTP not arriving on real device
**Fix:**
1. Check phone number is correct format (+91...)
2. Verify Firebase Authentication is enabled
3. Check device has cellular/WiFi connection
4. Test with Firebase test phone numbers first

### Issue: Quota not updating
**Fix:**
1. Check backend is receiving POST requests
2. Verify database indexes are created
3. Check Firebase/backend logs for errors
4. Manually test: `firebase deploy --only functions`

### Issue: "Resend" button not appearing
**Fix:**
1. Wait 60 seconds (OTP expiry timer)
2. Check in console if timeLeft is updating
3. Verify `canResend` state is updating

---

## 📱 Firebase Test Phone Numbers

For testing without using real SMS quota:

1. Go to Firebase Console
2. Authentication > Phone
3. "Add test phone numbers"
4. Add format: +91XXXXXXXXXX
5. Add test code: 123456

These WON'T count toward SMS quota!

---

## 🔍 Monitoring Quota Usage

### Check daily usage:
```bash
# Firebase
firebase firestore:inspect sms_quota

# MongoDB
db.sms_quota_logs.find({ date: "2024-05-23" })
```

### Export logs:
```bash
# Firebase
firebase firestore:export exports/quota

# MongoDB
mongoexport --collection sms_quota_logs --out quota.json
```

### Create dashboard:
- Display quota used today
- Show reset time
- Alert when reaching 80%
- Graph daily usage

---

## 📞 SMS Provider Configuration

If NOT using Firebase, connect to SMS provider:

### MSG91 (Recommended for India)
```typescript
// In backend
const msg91 = require('msg91');
const client = new msg91('YOUR_AUTH_KEY');

await client.sendSMS({
  phone: phoneNumber,
  message: `Your OTP is: ${otp}. Valid for 5 minutes.`,
  route: 'OTP',
});
```

### Twilio
```typescript
const twilio = require('twilio');
const client = new twilio(accountSID, authToken);

await client.messages.create({
  body: `Your OTP is: ${otp}`,
  from: '+1234567890',
  to: phoneNumber,
});
```

---

## 🚀 Production Checklist

- [ ] Backend quota service deployed
- [ ] Scheduled job for daily reset configured
- [ ] Rate limiting enabled (max 3 OTP/number/day)
- [ ] SMS provider set to alert at 80% quota
- [ ] Monitoring/logging for all SMS sends
- [ ] Error handling for quota exceeded
- [ ] User-friendly error messages
- [ ] Tested on real devices (Android & iOS)
- [ ] Database backups configured
- [ ] Quota analytics dashboard set up

---

## 📞 Support

**Need help with:**
- Firebase setup? → Go to Firebase docs
- Backend deployment? → Check your provider's docs
- Debugging OTP? → Enable Logcat (Android) or Xcode (iOS)
- SMS provider issues? → Contact their support

---

**Remember: With 10 SMS/day, you can support ~100-130 users/month. Plan your marketing accordingly!**
