
# Firestore Security Rules Configuration

## Problem
Your Firestore database is currently blocking read and write operations due to restrictive security rules, causing "Missing or insufficient permissions" errors.

## Solution
You need to update your Firestore security rules to allow proper access to the `properties`, `teamMembers`, and `storyImages` collections.

### How to Update Firestore Rules:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: real-estate-ee44e
3. **Navigate to Firestore Database**
4. **Click on "Rules" tab**
5. **Replace the existing rules with the following:**

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to properties collection
    // This allows the frontend to display property listings to all users
    match /properties/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow public read access to team members collection
    // This allows the About page to display team members to all users  
    match /teamMembers/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow public read access to story images collection
    // This allows the About page to display story/gallery images to all users
    match /storyImages/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // For any other collections, require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Alternative: More Restrictive Rules (if you want to require login for viewing)

If you want to require users to be logged in to view properties, team members, and story images:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Require authentication for all operations
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### After Updating Rules:
1. **Click "Publish"** to save the changes
2. **Test the application** - the permission errors should be resolved
3. **Check the browser console** - you should see successful database operations

### What These Rules Do:
- **Public Read Access**: Allows anyone to view properties, team members, and story images (good for a real estate website)
- **Authenticated Write Access**: Only logged-in users (admins) can add/edit/delete data
- **Security**: Prevents unauthorized modifications while allowing public viewing

### Testing:
After updating the rules, you should be able to:
- ✅ View properties on the main website without logging in
- ✅ View team members on the About page without logging in  
- ✅ View story images on the About page without logging in
- ✅ Add/edit team members when logged in as admin
- ✅ Add/edit properties when logged in as admin
- ✅ Add/edit story images when logged in as admin

## Need Help?
If you're still experiencing issues after updating the rules, check:
1. Make sure you clicked "Publish" after updating the rules
2. Clear your browser cache and refresh the page
3. Check the browser console for any remaining error messages

### Collections Used by Your Application:
- `properties` - Property listings displayed on main pages
- `teamMembers` - Team member profiles on About page
- `storyImages` - Gallery images displayed on About page story section

