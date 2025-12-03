import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  UserProfile: a
    .model({
      id: a.id().required(),
      username: a.string().required(),
      bio: a.string().required(),
      interests: a.string().array(),
      school: a.string().required(),
      pfp_key: a.string(),
      buddy_id: a.id(),
      request: a.id().array(),
      sent: a.id().array(),
      banned: a.boolean().default(false),
      admin: a.boolean().default(false),
    })
    .authorization((allow) => [allow.authenticated(), allow.publicApiKey()]),

  Conversations: a
    .model({
      id: a.id().required(),
      members: a.string().array().required(),
      lastMessage: a.string(),
      lastMessageAt: a.date(),
    })
    .authorization((allow) => [allow.authenticated()]),

  Messages: a
    .model({
      id: a.id().required(),
      conversation_id: a.id().required(),
      message: a.string(),
      sender_id: a.id(),
      created_at: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  Tasks: a
    .model({
      id: a.id().required(),
      task: a.string(),
      img_proof: a.string(),
      sender_id: a.id().required(),
      reciever_id: a.id(),
      time: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  Conversations: a
    .model({
      id: a.id().required(),
      members: a.string().array().required(),
      lastMessage: a.string(),
      lastMessageAt: a.date(),
    })
    .authorization((allow) => [allow.authenticated()]),

  Messages: a
    .model({
      id: a.id().required(),
      conversation_id: a.id().required(),
      message: a.string(),
      sender_id: a.id(),
      created_at: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  Tasks: a
    .model({
      id: a.id().required(),
      task: a.string(),
      img_proof: a.string(),
      sender_id: a.id().required(),
      reciever_id: a.id(),
      time: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  Report: a
    .model({
      reported_user_id: a.id().required(),
      reported_username: a.string().required(),
      reporter_username: a.string().array().required(),
      amt: a.integer().required(),
      reason: a.string().array().required(),
      created_at: a.string().array().required(),
    })
    .identifier(['reported_user_id'])
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});