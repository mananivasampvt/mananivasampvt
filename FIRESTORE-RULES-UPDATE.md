# Updated Firestore Security Rules

## Current Rules with User Role Support

Replace your current Firestore rules with these updated rules that support user role management:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow public read access to properties collection
    // This allows the frontend to display property listings to all users
    match /properties/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
                     resource.data.get('role', 'user') == 'admin';
    }
    
    // Allow public read access to team members collection
    // This allows the About page to display team members to all users  
    match /teamMembers/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
                     resource.data.get('role', 'user') == 'admin';
    }
    
    // Allow public read access to story images collection
    // This allows the About page to display story/gallery images to all users
    match /storyImages/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
                     resource.data.get('role', 'user') == 'admin';
    }
    
    // Users collection - for storing user profiles and roles
    match /users/{userId} {
      // Users can read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can create their own profile during signup
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Users can update their own profile (but not their role)
      allow update: if request.auth != null && request.auth.uid == userId &&
                      request.resource.data.role == resource.data.role;
      
      // Only admins can update user roles (for promoting/demoting)
      allow update: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // No one can delete user profiles
      allow delete: if false;
    }
    
    // User shortlists - private to each user
    match /users/{userId}/shortlisted/{propertyId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // For any other collections, require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Alternative: Simplified Rules (Less Strict)

If you prefer simpler rules without role-based write restrictions:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow public read access to properties collection
    match /properties/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow public read access to team members collection
    match /teamMembers/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow public read access to story images collection
    match /storyImages/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Users collection - for storing user profiles and roles
    match /users/{userId} {
      // Users can read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can create/update their own profile
      allow create, update: if request.auth != null && request.auth.uid == userId;
      
      // No one can delete user profiles
      allow delete: if false;
    }
    
    // User shortlists - private to each user
    match /users/{userId}/shortlisted/{propertyId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // For any other collections, require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## How to Update the Rules

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: real-estate-ee44e
3. **Navigate to Firestore Database**
4. **Click on "Rules" tab**
5. **Replace the existing rules** with one of the rule sets above
6. **Click "Publish"** to save the changes

## What These Rules Do

### ✅ Security Features:
- **Public read access** to properties, team members, and story images
- **User profile protection** - users can only access their own profiles
- **Role-based access** - admin role checking for sensitive operations
- **Shortlist privacy** - users can only see their own shortlisted properties

### ✅ Admin Protection:
- Only authenticated users can write to main collections
- Role verification happens at the application level
- Database rules provide an additional layer of security

### ✅ User Experience:
- Public can view properties and team members
- Authenticated users can manage their profiles
- Admin users can manage all content

## Testing the Rules

After updating the rules, test that:
- ✅ Public users can view the website without logging in
- ✅ Regular users can sign up and manage their profiles
- ✅ Admin users can access the admin dashboard
- ✅ Non-admin users are denied access to admin features
- ✅ All database operations work without permission errors

## Troubleshooting

If you encounter issues:
1. **Check the browser console** for permission errors
2. **Verify the rules are published** in Firebase Console
3. **Clear browser cache** and refresh the page
4. **Check user roles** in the Firestore users collection

---

**Note**: These rules provide both security and usability. The first rule set is more restrictive and provides better security, while the second is simpler and easier to manage.
