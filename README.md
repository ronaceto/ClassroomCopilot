# Classroom Copilot - AI Teaching Assistant

An AI-powered teaching and learning assistant that helps educators create lesson plans, quizzes, projects, and other educational materials while providing personalized tutoring support for students.

## Features

### Teacher Mode
- Generate comprehensive lesson plans with objectives, activities, and assessments
- Create quizzes and tests with answer keys
- Design projects with rubrics and milestones
- Develop differentiated materials for diverse learners
- Generate parent communication notes

### Student Mode
- Personalized tutoring and explanations
- Step-by-step problem solving guidance
- Study support and practice questions
- Homework help with learning-focused approach

## Deployment to Netlify

### Prerequisites
1. A Netlify account (sign up at [netlify.com](https://netlify.com))
2. Your code in a Git repository (GitHub, GitLab, or Bitbucket)
3. An OpenAI API key

### Step-by-Step Deployment

1. **Push your code to a Git repository** (if not already done)

2. **Sign in to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign in with your preferred method

3. **Create a new site**
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider (GitHub, GitLab, etc.)
   - Select your repository

4. **Configure build settings**
   - Netlify should auto-detect these settings from `netlify.toml`:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - If not auto-detected, enter them manually

5. **Add environment variables**
   - In your Netlify site dashboard, go to "Site settings" → "Environment variables"
   - Add the following variable:
     - Key: `OPENAI_API_KEY`
     - Value: Your OpenAI API key (starts with `sk-proj-...`)

6. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your app
   - You'll get a unique URL like `https://amazing-name-123456.netlify.app`

### Custom Domain (Optional)
- In your site dashboard, go to "Domain settings"
- Click "Add custom domain" to use your own domain

### Environment Variables Needed
- `OPENAI_API_KEY`: Your OpenAI API key for the chat functionality


## OpenAI / Netlify Troubleshooting

If the app UI loads but requests fail when sending messages, validate the serverless function setup first:

1. **Confirm function path is working**
   - In production, the frontend posts to `/api/chat`, which is redirected by `netlify.toml` to `/.netlify/functions/chat`.
   - Open browser devtools and confirm the request is not returning 404/405.

2. **Verify Netlify environment variables**
   - Required: `OPENAI_API_KEY`
   - Optional: `OPENAI_MODEL` (defaults to `gpt-4o-mini`)
   - After editing environment variables in Netlify, trigger a new deploy (functions do not always pick up changes until redeploy).

3. **Model access issues**
   - If your API key does not have access to a configured model, OpenAI returns a 4xx error.
   - Set `OPENAI_MODEL` to a model your account can access (for example `gpt-4o-mini`).

4. **Inspect function logs**
   - In Netlify: Site → Functions → `chat` → logs.
   - The function now returns troubleshooting details in error responses to simplify diagnosis.

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Configuration

The app includes a comprehensive configuration system allowing teachers to customize:
- Grade levels and subjects
- Educational standards alignment
- Reading levels and differentiation options
- Output depth and included features

## Support

For issues or questions, please check the repository issues or create a new one.