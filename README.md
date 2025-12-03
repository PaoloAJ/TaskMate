# TaskMate

A collaborative accountability platform that connects students with study buddies to help each other stay motivated and productive. Built with Next.js and AWS Amplify.

## Overview

TaskMate is a web application designed to foster accountability and productivity among students by pairing them with study buddies. Users can:

- Find and connect with study partners based on shared interests
- Assign tasks to their buddy and track completion
- Submit photo proof of task completion for accountability
- Maintain study streaks to stay motivated
- Chat with their buddy in real-time
- Compete on leaderboards with other buddy pairs

## Features

### User Authentication & Profile Management
- Secure sign-up and sign-in with AWS Amplify Authentication
- Customizable user profiles with:
  - Profile pictures (stored in S3)
  - Bio and interests
  - School affiliation
- Email verification system

### Buddy System
- Browse available users and send buddy requests
- Accept or decline incoming buddy requests
- View pending sent and received requests
- One-to-one buddy pairing
- Leave buddy functionality with confirmation

### Task Management
- Create tasks for your buddy
- Submit photo proof of task completion
- Approve or decline buddy's submitted proof
- Reject unwanted tasks
- Real-time task status updates

### Social Features
- Real-time messaging with your buddy
- User reporting system for inappropriate behavior
- Admin dashboard for moderating reports
- Leaderboard showcasing top buddy pairs by streak

### Security & Moderation
- Ban system for rule violations
- Report tracking with detailed reasons
- Admin tools for managing user reports

## Tech Stack

- **Framework**: Next.js 15.5.3 with React 19
- **Authentication**: AWS Amplify Auth with Cognito
- **Database**: AWS Amplify Data (DynamoDB)
- **Storage**: AWS S3 for profile pictures and task proofs
- **Styling**: Tailwind CSS 4
- **API**: AWS Amplify GraphQL API

## Database Schema

### UserProfile
- User information (username, bio, interests, school)
- Profile picture key reference
- Buddy relationship tracking
- Friend request management (sent/received)
- Admin and ban status flags

### Tasks
- Task assignments between buddies
- Photo proof storage references
- Completion tracking

### Conversations & Messages
- Real-time chat functionality
- Message history
- Last message timestamps

### Reports
- User reporting system
- Multiple report tracking per user
- Reason documentation
- Reporter tracking

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **AWS Account** with:
  - IAM credentials (Access Key ID and Secret Access Key)
  - Appropriate permissions for Amplify, Cognito, DynamoDB, and S3
- **AWS CLI** (optional but recommended)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd taskmate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure AWS Amplify

Make sure you have your AWS IAM credentials ready. You'll need:
- AWS Access Key ID
- AWS Secret Access Key
- Preferred AWS Region (e.g., `us-east-1`)

#### Install AWS Amplify CLI

```bash
npm install -g @aws-amplify/cli
```

#### Configure Amplify

```bash
amplify configure
```

Follow the prompts to:
1. Sign in to your AWS Console
2. Create an IAM user with appropriate permissions
3. Enter your AWS credentials
4. Select your preferred region

#### Initialize Amplify in the Project

The project already has Amplify configured, but if you need to reinitialize:

```bash
amplify init
```

Follow the prompts and select:
- Environment name: `dev` (or your preference)
- Default editor: Your preferred editor
- App type: `javascript`
- Framework: `react`
- Source directory: `src`
- Distribution directory: `.next`
- Build command: `npm run build`
- Start command: `npm run dev`

#### Deploy Amplify Backend

```bash
amplify push
```

This will:
- Create the authentication resources (Cognito User Pool)
- Set up the GraphQL API with DynamoDB tables
- Configure S3 storage buckets
- Generate the `amplify_outputs.json` configuration file

### 4. Environment Setup

The `amplify_outputs.json` file is automatically generated after running `amplify push`. This file contains all the necessary configuration for your Amplify backend.

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## Project Structure

```
taskmate/
├── amplify/                    # Amplify backend configuration
│   ├── auth/                   # Authentication resources
│   ├── data/                   # Database schema and resources
│   └── storage/                # S3 storage configuration
├── public/                     # Static assets
│   └── default-avatar.png      # Default profile picture
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   │   ├── signin/        # Sign-in page
│   │   │   └── signup/        # Sign-up page
│   │   ├── admin/             # Admin dashboard
│   │   ├── banned/            # Banned user page
│   │   ├── chat/              # Chat interface
│   │   ├── components/        # Shared components
│   │   │   ├── Navbar.js
│   │   │   ├── ProfilePicture.js
│   │   │   └── ProfilePictureUpload.js
│   │   ├── findbuddy/         # Buddy discovery page
│   │   ├── home/              # Home/buddy dashboard
│   │   ├── leaderboard/       # Leaderboard page
│   │   ├── settings/          # User settings
│   │   ├── setup-profile/     # Profile setup wizard
│   │   ├── task/              # Task management
│   │   └── verify/            # Email verification
│   ├── components/            # Additional components
│   │   └── chat/              # Chat-specific components
│   ├── lib/                   # Utility functions and context
│   │   ├── auth-context.js    # Authentication context
│   │   ├── helperFuncts.js    # Helper functions
│   │   └── profile-picture-context.js
│   └── middleware.js          # Next.js middleware
├── amplify_outputs.json       # Amplify configuration (auto-generated)
├── next.config.mjs            # Next.js configuration
├── package.json               # Project dependencies
└── tailwind.config.js         # Tailwind CSS configuration
```

## User Flow

1. **Sign Up**: New users create an account and verify their email
2. **Profile Setup**: Complete profile with interests and school information
3. **Find Buddy**: Browse available users and send buddy requests
4. **Get Matched**: Accept incoming requests or wait for your requests to be accepted
5. **Task Assignment**: Create tasks for your buddy to complete
6. **Proof Submission**: Submit photo proof when you complete tasks
7. **Approval**: Approve or decline your buddy's submitted proofs
8. **Build Streaks**: Maintain consistency to climb the leaderboard

## Key Pages

- `/` - Landing page
- `/signin` - User authentication
- `/signup` - New user registration
- `/verify` - Email verification
- `/setup-profile` - Initial profile setup
- `/findbuddy` - Browse and request buddies
- `/home` - Main dashboard with buddy info and leaderboard
- `/task` - Task management interface
- `/chat` - Real-time messaging
- `/settings` - Account settings
- `/leaderboard` - Full leaderboard view
- `/admin` - Administrative tools (admin only)
- `/banned` - Banned user notice

## Configuration

### Amplify Configuration

The application uses Amplify Gen 2 configuration. All backend resources are defined in the `amplify/` directory:

- **Auth**: [amplify/auth/resource.ts](amplify/auth/resource.ts)
- **Data**: [amplify/data/resource.ts](amplify/data/resource.ts)
- **Storage**: [amplify/storage/resource.ts](amplify/storage/resource.ts)

### Next.js Configuration

Configure Next.js settings in [next.config.mjs](next.config.mjs). For external image domains (S3 buckets), you may need to add image configuration.

## Security

- All API routes are protected by AWS Amplify authentication
- Profile pictures and task proofs are stored securely in S3 with access controls
- User sessions are managed by AWS Cognito
- Sensitive operations require authentication tokens
- Admin features are restricted to users with admin privileges

## Troubleshooting

### Amplify Configuration Errors

If you see "Amplify has not been configured" errors during build:
- These are expected during static generation
- Ensure `amplify_outputs.json` exists in the root directory
- Run `amplify push` to regenerate backend configuration

### Authentication Issues

- Clear browser cookies and local storage
- Verify Cognito User Pool is properly configured
- Check that authentication redirects are correctly set

### Image Upload Failures

- Verify S3 bucket permissions
- Check storage configuration in `amplify/storage/resource.ts`
- Ensure file size is within limits (5MB for profile pictures, 10MB for task proofs)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- Group study sessions
- Study timer with Pomodoro technique
- Calendar integration for scheduling
- Push notifications for task assignments and approvals
- Advanced matching algorithm based on study patterns
- Gamification with badges and achievements
- Mobile application (React Native)

## License

This project is private and proprietary.

## Support

For issues and questions, please open an issue in the repository or contact the development team.

---

Built with ❤️ by the TaskMate Team
