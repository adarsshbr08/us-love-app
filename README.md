# Us ❤️ Love App — Version 2

Updated features:
- Working login and logout flow
- Real-time Firebase chat
- Safe message rendering with `textContent`
- Working quick-love buttons
- Firebase-backed Love Notes
- Working bottom navigation
- Memories placeholder section
- Responsive mobile-first design
- Proper CSS error styling
- Listener cleanup on logout/auth changes

## Important Firebase setup

The frontend email allow-list is not enough for real privacy. Configure Firestore Security Rules so only the two authenticated users can read and write the couple's documents.

Before deploying, test:
1. Login with both allowed accounts.
2. Send a normal chat message.
3. Send a message containing `<b>test</b>` and confirm it appears as text.
4. Save a Love Note.
5. Refresh the page and confirm data remains.
6. Test every bottom navigation button.
