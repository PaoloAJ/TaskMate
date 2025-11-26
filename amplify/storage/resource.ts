import { defineStorage } from "@aws-amplify/backend";

export const storage = defineStorage({
  name: "userProfilePictures",
  access: (allow) => ({
    // Setup paths.
    // 'profile-pictures/*' is a folder where users can read/write their own stuff
    "profile-pictures/{entity_id}/*": [
      allow.guest.to(["read"]), // Guests can see PFPs
      allow.authenticated.to(["read", "write", "delete"]), // Users manage their own
    ],
  }),
});
