# Admin Role Management Setup Guide

## 🔐 Overview
This guide explains how to set up and manage admin roles in the Mana Nivasam real estate application.

## 🛠️ How the Admin System Works

### 1. User Registration
- When users sign up, they are automatically assigned the role `"user"`
- All new users are regular users by default
- User data is stored in Firestore `users` collection with the following structure:
  ```json
  {
    "uid": "user-firebase-uid",
    "username": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "timestamp"
  }
  ```

### 2. Admin Role Assignment
- Admin users have the role `"admin"` in their user document
- Only users with `role: "admin"` can access the admin dashboard
- The system checks both authentication AND role before granting access

### 3. Access Control Flow
1. User logs in with email/password
2. System verifies Firebase Authentication
3. System fetches user role from Firestore
4. If `role === "admin"`, user can access admin dashboard
5. If `role !== "admin"`, user is redirected with "Access Denied" message

## 🎯 Creating Your First Admin User

### Method 1: Manual Database Update (Recommended)
1. **Create a regular user account first**:
   - Go to your website
   - Sign up with the email you want to use as admin
   - Complete the registration process

2. **Update the user role in Firestore**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `real-estate-ee44e`
   - Navigate to "Firestore Database"
   - Find the `users` collection
   - Locate your user document (by email)
   - Edit the document and change `role` from `"user"` to `"admin"`
   - Save the changes

3. **Test admin access**:
   - Go to `/admin/login` on your website
   - Log in with your admin credentials
   - You should now have access to the admin dashboard

### Method 2: Using Developer Console (Advanced)
1. **Open browser console on your deployed site**
2. **Find your user UID**:
   - Go to Firebase Console > Authentication
   - Find your user and copy the UID
3. **Run the promotion function**:
   ```javascript
   // Import the utility (this would be available in development)
   import { promoteUserToAdmin } from '@/utils/promoteToAdmin';
   
   // Promote user to admin
   await promoteUserToAdmin('your-email@example.com', 'your-user-uid');
   ```

## 🔧 Managing Admin Users

### Adding More Admins
1. **User must register first** as a regular user
2. **Update their role** in Firestore manually or using the utility function
3. **Verify access** by having them log in at `/admin/login`

### Removing Admin Access
1. **Update user role** in Firestore from `"admin"` to `"user"`
2. **User will lose admin access** immediately
3. **They can still use the regular website** features

## 🛡️ Security Features

### ✅ What's Protected
- **Route Protection**: `/admin/dashboard` requires admin role
- **Authentication Check**: User must be logged in
- **Role Verification**: User must have `role: "admin"`
- **Real-time Validation**: Role is checked on every page load
- **Secure Logout**: Role is cleared on logout

### ✅ Access Control Messages
- **Loading State**: Shows "Verifying access..." while checking role
- **Access Denied**: Clear message for non-admin users
- **Navigation Options**: Redirects to homepage or login page

### ✅ Error Handling
- **Default Role**: If role is missing, defaults to "user"
- **Database Errors**: Gracefully handles Firestore connection issues
- **Authentication Errors**: Provides clear error messages

## 🚫 What Regular Users Cannot Do

### ❌ Blocked Actions
- Access `/admin/dashboard` route
- Add/Edit/Delete properties
- Add/Edit/Delete team members
- Add/Edit/Delete story images
- View admin statistics and analytics

### ✅ What They Can Still Do
- Browse properties on the main site
- View property details
- Contact property owners
- Save properties to shortlist
- Use EMI calculator
- View about page and team members

## 🔍 Troubleshooting

### Issue: "Access Denied" even for admin user
1. **Check user role in Firestore**:
   - Go to Firebase Console > Firestore Database
   - Find your user document
   - Verify `role` field is set to `"admin"`

2. **Clear browser cache** and try again

3. **Check browser console** for any errors

### Issue: User can't log in to admin panel
1. **Verify email/password** are correct
2. **Check Firebase Authentication** console for the user
3. **Ensure user document exists** in Firestore
4. **Check network connectivity** to Firebase

### Issue: Role not updating
1. **Refresh the page** after updating role in Firestore
2. **Log out and log back in** to refresh the role
3. **Check Firestore rules** allow read access to users collection

## 📋 Best Practices

### 🔒 Security
- **Limit admin users**: Only give admin access to trusted individuals
- **Regular audits**: Periodically review who has admin access
- **Use strong passwords**: Ensure admin accounts use secure passwords
- **Monitor access**: Keep track of who accesses the admin panel

### 📊 Management
- **Document admin users**: Keep a record of who has admin access
- **Regular backups**: Backup your Firestore database regularly
- **Test changes**: Always test admin functionality after updates

## 🆘 Emergency Admin Access

### If you lose admin access:
1. **Go to Firebase Console**
2. **Navigate to Firestore Database**
3. **Find your user document**
4. **Manually update role to "admin"**
5. **Clear browser cache and try again**

### If you can't access Firebase Console:
1. **Use a different Google account** that has project access
2. **Ask another project owner** to update your role
3. **Create a new admin user** following the setup process

## 📞 Support

For additional help with admin setup:
- Email: snsnarayanac@gmail.com
- Check the browser console for error messages
- Review Firebase Console for authentication issues

---

**Remember**: Only users with `role: "admin"` in their Firestore user document can access the admin dashboard. Regular authenticated users will be denied access with a clear message.
