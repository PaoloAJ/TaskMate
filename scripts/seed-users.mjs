import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load Amplify configuration
const amplifyConfig = JSON.parse(
  readFileSync(join(__dirname, '../amplify_outputs.json'), 'utf-8')
);

Amplify.configure(amplifyConfig);

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: amplifyConfig.auth.aws_region,
});

// Initialize Amplify data client with API Key auth for seeding
const client = generateClient({
  authMode: 'apiKey',
});

// Get User Pool ID from config
const USER_POOL_ID = amplifyConfig.auth.user_pool_id;

// Load interests
const interests = JSON.parse(
  readFileSync(join(__dirname, '../src/lib/interests.json'), 'utf-8')
);

// Sample data
const universities = [
  'Massachusetts Institute of Technology',
  'Stanford University',
  'Harvard University',
  'University of California Berkeley',
  'California Institute of Technology',
  'Princeton University',
  'Yale University',
  'Columbia University',
  'University of Chicago',
  'University of Pennsylvania',
  'Cornell University',
  'University of Michigan',
  'Johns Hopkins University',
  'Northwestern University',
  'Duke University',
  'University of Washington',
  'New York University',
  'University of California Los Angeles',
  'University of Texas Austin',
  'Georgia Institute of Technology',
];

const firstNames = [
  'Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery',
  'Quinn', 'Parker', 'Cameron', 'Drew', 'Skylar', 'Rowan', 'Jamie', 'Kendall',
  'Sage', 'River', 'Phoenix', 'Dakota', 'Reese', 'Finley', 'Blake', 'Hayden',
  'Emerson', 'Charlie', 'Kai', 'Remy', 'Oakley', 'Ellis', 'Adrian', 'Sydney',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
];

const bioTemplates = [
  "Student passionate about {interest1} and {interest2}. Always looking to learn more!",
  "I love {interest1}, {interest2}, and meeting new study buddies. Let's ace this semester!",
  "Studying hard and staying motivated through {interest1} and {interest2}. Let's connect!",
  "{interest1} enthusiast who also loves {interest2}. Looking for accountability partners!",
  "Balancing {interest1} with {interest2} while trying to maintain good grades!",
  "Passionate about {interest1}. Also interested in {interest2}. Let's study together!",
  "Coffee-fueled student into {interest1} and {interest2}. Always happy to help!",
  "Making the most of college life with {interest1} and {interest2}. Let's collaborate!",
  "I geek out over {interest1} and {interest2}. Looking for like-minded study partners!",
  "Juggling classes and {interest1} while exploring {interest2}. Let's stay accountable!",
];

// Utility functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateUsername(firstName, lastName) {
  const patterns = [
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
  ];
  return getRandomElement(patterns);
}

function generateEmail(username) {
  return `${username}@test.taskmate.com`;
}

function generateBio(userInterests) {
  const template = getRandomElement(bioTemplates);
  let bio = template;

  if (userInterests.length >= 2) {
    bio = bio
      .replace('{interest1}', userInterests[0].toLowerCase())
      .replace('{interest2}', userInterests[1].toLowerCase());
  } else if (userInterests.length === 1) {
    bio = `Passionate ${userInterests[0].toLowerCase()} enthusiast. Looking to connect with study buddies!`;
  } else {
    bio = "Motivated student looking for accountability partners. Let's help each other succeed!";
  }

  return bio;
}

async function createRandomUser() {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const username = generateUsername(firstName, lastName);
  const email = generateEmail(username);
  const password = 'TempPass123!';
  const school = getRandomElement(universities);
  const userInterests = getRandomElements(interests, Math.floor(Math.random() * 4));
  const bio = generateBio(userInterests);

  try {
    console.log(`\nCreating user: ${username} (${email})`);

    // Step 1: Create user in Cognito (suppresses verification email)
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
      ],
      MessageAction: 'SUPPRESS', // Don't send welcome email
    });

    const createUserResponse = await cognitoClient.send(createUserCommand);

    // Extract the sub (user ID) from the user attributes
    const subAttribute = createUserResponse.User.Attributes.find(attr => attr.Name === 'sub');
    const userId = subAttribute ? subAttribute.Value : createUserResponse.User.Username;

    console.log(`  ✓ Cognito user created with ID: ${userId}`);

    // Step 2: Set permanent password (no need for user to change it)
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      Password: password,
      Permanent: true,
    });

    await cognitoClient.send(setPasswordCommand);
    console.log(`  ✓ Password set`);

    // Step 3: Create UserProfile in DynamoDB
    await client.models.UserProfile.create({
      id: userId,
      username: username,
      bio: bio,
      interests: userInterests,
      school: school,
      banned: false,
      admin: false,
    });

    console.log(`  ✓ Profile created`);
    console.log(`     Username: ${username}`);
    console.log(`     School: ${school}`);
    console.log(`     Interests: ${userInterests.join(', ')}`);
    console.log(`     Bio: ${bio}`);

    return {
      success: true,
      userId,
      email,
      username,
      password,
    };
  } catch (error) {
    console.error(`  ✗ Error creating user ${username}:`, error.message);

    return {
      success: false,
      error: error.message,
      username,
      email,
    };
  }
}

async function seedUsers(count = 10) {
  console.log(`\n=== TaskMate User Seeding Script ===`);
  console.log(`User Pool ID: ${USER_POOL_ID}`);
  console.log(`Region: ${amplifyConfig.auth.aws_region}`);
  console.log(`Creating ${count} random users...\n`);

  const results = {
    successful: [],
    failed: [],
  };

  for (let i = 0; i < count; i++) {
    console.log(`\n[${i + 1}/${count}]`);

    const result = await createRandomUser();

    if (result.success) {
      results.successful.push(result);
    } else {
      results.failed.push(result);
    }

    // Small delay to avoid rate limiting
    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n\n=== Seeding Complete ===`);
  console.log(`Successfully created: ${results.successful.length} users`);
  console.log(`Failed: ${results.failed.length} users`);

  if (results.successful.length > 0) {
    console.log(`\n✓ Successful users:`);
    results.successful.forEach(u => {
      console.log(`  - ${u.username} (${u.email})`);
    });
  }

  if (results.failed.length > 0) {
    console.log(`\n✗ Failed users:`);
    results.failed.forEach(u => {
      console.log(`  - ${u.username} (${u.email}): ${u.error}`);
    });
  }

  console.log(`\n✓ All users are verified and ready to use!`);
  console.log(`  Default password for all users: TempPass123!\n`);
}

// Get count from command line or use default
const count = parseInt(process.argv[2]) || 10;

seedUsers(count)
  .then(() => {
    console.log('Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
