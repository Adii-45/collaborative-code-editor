import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * @route   GET /api/auth/github
 * @desc    Redirect to GitHub OAuth login
 * @access  Public
 */
export const githubLogin = (req, res) => {
  console.log('Backend: Redirecting to GitHub OAuth...');
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.GITHUB_CALLBACK_URL || `http://localhost:8001/api/auth/github/callback`);
  const scope = encodeURIComponent('user:email');
  
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  res.redirect(githubUrl);
};

/**
 * @route   GET /api/auth/github/callback
 * @desc    Handle GitHub OAuth callback
 * @access  Public
 */
export const githubCallback = async (req, res) => {
  console.log('Backend: Received GitHub OAuth callback');
  const { code } = req.query;

  if (!code) {
    console.error('Backend Error: No authorization code provided');
    return res.status(400).json({ message: 'No authorization code provided' });
  }

  try {
    console.log('Backend: Exchanging code for access token...');
    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('Failed to obtain access token from GitHub');
    }

    // 2. Fetch user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const githubUser = await userResponse.json();

    // 3. Fetch user emails
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const emails = await emailsResponse.json();

    // Find primary email
    const primaryEmailObj = emails.find(e => e.primary) || emails[0];
    if (!primaryEmailObj || !primaryEmailObj.email) {
      console.error('Backend Error: No email found in GitHub profile');
      throw new Error('No email found associated with GitHub account');
    }
    const email = primaryEmailObj.email;
    console.log(`Backend: Found GitHub user ${githubUser.login} with email ${email}`);

    // 4. Find or Create User
    console.log('Backend: Finding or creating user in database...');
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      const username = githubUser.login || email.split('@')[0];
      
      // Ensure unique username by appending random string if needed
      let uniqueUsername = username;
      let counter = 1;
      while (await User.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${username}${counter}`;
        counter++;
      }

      user = await User.create({
        username: uniqueUsername,
        email,
        avatar: githubUser.avatar_url,
        githubId: githubUser.id.toString(),
        isGithubUser: true,
      });
    } else {
      // Update existing user with GitHub info if missing
      if (!user.githubId) {
        user.githubId = githubUser.id.toString();
        user.isGithubUser = true;
        if (!user.avatar) {
          user.avatar = githubUser.avatar_url;
        }
        await user.save();
      }
    }

    // 5. Generate JWT
    const token = generateToken(user._id);
    console.log('Backend: JWT generated successfully');

    // 6. Redirect to frontend with token
    console.log('Backend: Redirecting back to frontend with token...');
    res.redirect(`http://localhost:5173/github/callback?token=${token}`);

  } catch (error) {
    console.error('GitHub Auth Error:', error);
    res.redirect(`http://localhost:5173/login?error=github_auth_failed`);
  }
};
