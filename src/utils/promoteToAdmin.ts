import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Utility function to promote a user to admin role
 * This should be used carefully and only by developers
 * 
 * @param userEmail - Email of the user to promote to admin
 * @param userId - UID of the user to promote to admin
 */
export const promoteUserToAdmin = async (userEmail: string, userId: string) => {
  try {
    // First, check if user exists
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error(`User with ID ${userId} not found in database`);
    }

    const userData = userDoc.data();
    
    // Verify email matches
    if (userData.email !== userEmail) {
      throw new Error(`Email mismatch. Expected: ${userEmail}, Found: ${userData.email}`);
    }

    // Update user role to admin
    await updateDoc(doc(db, 'users', userId), {
      role: 'admin',
      promotedAt: new Date(),
      promotedBy: 'system'
    });

    console.log(`Successfully promoted user ${userEmail} (${userId}) to admin role`);
    return { success: true, message: `User ${userEmail} promoted to admin successfully` };
    
  } catch (error: any) {
    console.error('Error promoting user to admin:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Utility function to demote an admin user to regular user
 * 
 * @param userEmail - Email of the user to demote
 * @param userId - UID of the user to demote
 */
export const demoteAdminToUser = async (userEmail: string, userId: string) => {
  try {
    // First, check if user exists
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error(`User with ID ${userId} not found in database`);
    }

    const userData = userDoc.data();
    
    // Verify email matches
    if (userData.email !== userEmail) {
      throw new Error(`Email mismatch. Expected: ${userEmail}, Found: ${userData.email}`);
    }

    // Update user role to regular user
    await updateDoc(doc(db, 'users', userId), {
      role: 'user',
      demotedAt: new Date(),
      demotedBy: 'system'
    });

    console.log(`Successfully demoted admin ${userEmail} (${userId}) to regular user`);
    return { success: true, message: `User ${userEmail} demoted to regular user successfully` };
    
  } catch (error: any) {
    console.error('Error demoting admin to user:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Instructions for using these utilities:
 * 
 * 1. Open browser console on your deployed site
 * 2. To promote a user to admin:
 *    - Find the user's UID from Firebase Auth console
 *    - Run: promoteUserToAdmin('user@example.com', 'userUID')
 * 
 * 3. To demote an admin to user:
 *    - Run: demoteAdminToUser('admin@example.com', 'userUID')
 * 
 * Note: These functions should only be used by developers/system administrators
 */
