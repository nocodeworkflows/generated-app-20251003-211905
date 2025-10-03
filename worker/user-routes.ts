import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ToolEntity, ContributionEntity, ReviewEntity, UserState } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { User, AuthResponse, Tool, Contribution, Review, HeadlineRequest, HeadlineResponse, ABTestRequest, ABTestResponse, SubjectLineRequest, SubjectLineResponse, SubjectLineFeedback } from "@shared/types";
const MOCK_TOKEN_SECRET = "a-very-secret-key-for-dev-only";
const ADMIN_EMAIL = "admin@growthkit.com"; // Hardcoded admin user
const CREDIT_REWARD_FOR_CONTRIBUTION = 10;
const CREDIT_REWARD_FOR_REVIEW = 1;
async function getUserFromToken(c: any): Promise<{ entity: UserEntity, state: UserState } | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  const email = token.replace('mock_token_for_', '');
  if (!email) return null;
  const userEntity = new UserEntity(c.env, email);
  if (!(await userEntity.exists())) {
    return null;
  }
  const userState = await userEntity.getState();
  return { entity: userEntity, state: userState };
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // AUTH ROUTES
  app.post('/api/auth/signup', async (c) => {
    const { email, password } = await c.req.json();
    if (!isStr(email) || !isStr(password) || password.length < 6) {
      return bad(c, 'Valid email and a password of at least 6 characters are required.');
    }
    const user = new UserEntity(c.env, email);
    if (await user.exists()) {
      return bad(c, 'A user with this email already exists.');
    }
    const newUserState: UserState = {
      id: crypto.randomUUID(),
      email,
      credits: 5, // Start new users with 5 credits
      unlockedTools: [],
      createdAt: Date.now(),
      isAdmin: email === ADMIN_EMAIL,
      hashedPassword: `hashed_${password}`
    };
    await UserEntity.create(c.env, newUserState);
    const { hashedPassword, ...userProfile } = newUserState;
    const response: AuthResponse = {
      user: userProfile,
      token: `mock_token_for_${email}`,
    };
    return ok(c, response);
  });
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    if (!isStr(email) || !isStr(password)) {
      return bad(c, 'Email and password are required.');
    }
    const user = new UserEntity(c.env, email);
    if (!(await user.exists())) {
      return bad(c, 'Invalid credentials.');
    }
    const userState = (await user.getState()) as UserState;
    if (userState.hashedPassword !== `hashed_${password}`) {
      return bad(c, 'Invalid credentials.');
    }
    const { hashedPassword, ...userProfile } = userState;
    const response: AuthResponse = {
      user: userProfile,
      token: `mock_token_for_${email}`,
    };
    return ok(c, response);
  });
  app.get('/api/auth/me', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const { hashedPassword, ...userProfile } = userAuth.state;
    return ok(c, userProfile);
  });
  // TOOL ROUTES
  app.get('/api/tools', async (c) => {
    await ToolEntity.ensureSeed(c.env);
    const { items } = await ToolEntity.list(c.env);
    return ok(c, items);
  });
  app.get('/api/tools/:id', async (c) => {
    const { id } = c.req.param();
    const tool = new ToolEntity(c.env, id);
    if (!(await tool.exists())) {
      return notFound(c, 'Tool not found');
    }
    return ok(c, await tool.getState());
  });
  app.post('/api/tools/:id/unlock', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const { id: toolId } = c.req.param();
    const toolEntity = new ToolEntity(c.env, toolId);
    if (!(await toolEntity.exists())) {
      return notFound(c, 'Tool not found');
    }
    const tool = await toolEntity.getState();
    const user = userAuth.state;
    if (user.unlockedTools.includes(toolId)) {
      return bad(c, 'Tool already unlocked.');
    }
    if (user.credits < tool.cost) {
      return bad(c, 'Not enough credits.');
    }
    const updatedUser = await userAuth.entity.mutate(currentUser => ({
      ...currentUser,
      credits: currentUser.credits - tool.cost,
      unlockedTools: [...currentUser.unlockedTools, toolId],
    }));
    const { hashedPassword, ...userProfile } = updatedUser;
    return ok(c, { user: userProfile, tool });
  });
  // CREDIT ROUTES
  app.post('/api/credits/buy', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const { credits } = await c.req.json();
    if (typeof credits !== 'number' || credits <= 0) {
      return bad(c, 'Invalid number of credits.');
    }
    const updatedUser = await userAuth.entity.mutate(currentUser => ({
      ...currentUser,
      credits: currentUser.credits + credits,
    }));
    const { hashedPassword, ...userProfile } = updatedUser;
    return ok(c, userProfile);
  });
  // INTERACTIVE TOOL ROUTES
  app.post('/api/tools/generate-headline', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const { topic, tone } = await c.req.json<HeadlineRequest>();
    if (!isStr(topic) || !isStr(tone)) {
      return bad(c, 'Topic and tone are required.');
    }
    const templates = {
      Professional: [`The Ultimate Guide to ${topic}`, `How to Master ${topic} in 5 Simple Steps`, `A Data-Driven Approach to ${topic}`],
      Casual: [`Everything You Need to Know About ${topic}`, `${topic} Made Easy: A Beginner's Guide`, `Let's Talk About ${topic}`],
      Bold: [`Why Your ${topic} Strategy is Failing (and How to Fix It)`, `The One Thing You're Getting Wrong About ${topic}`, `Stop Wasting Time on ${topic} and Do This Instead`],
      Witty: [`How to Win at ${topic} Without Really Trying`, `The ${topic} Guide for People Who Hate Guides`, `Confessions of a ${topic} Expert`],
      Informative: [`A Comprehensive Overview of ${topic}`, `The Key Principles of Effective ${topic}`, `Exploring the Core Concepts of ${topic}`],
    };
    const selectedTemplates = templates[tone] || templates.Professional;
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response: HeadlineResponse = { headlines: selectedTemplates };
    return ok(c, response);
  });
  app.post('/api/tools/calculate-ab-test', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const { visitorsA, conversionsA, visitorsB, conversionsB } = await c.req.json<ABTestRequest>();
    if (visitorsA <= 0 || visitorsB <= 0 || conversionsA < 0 || conversionsB < 0 || conversionsA > visitorsA || conversionsB > visitorsB) {
      return bad(c, 'Invalid input values.');
    }
    const rateA = conversionsA / visitorsA;
    const rateB = conversionsB / visitorsB;
    const pooledRate = (conversionsA + conversionsB) / (visitorsA + visitorsB);
    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1 / visitorsA + 1 / visitorsB));
    if (standardError === 0) {
      return ok(c, { rateA, rateB, zScore: 0, pValue: 1, significant: false, winner: 'None', confidence: '0%' });
    }
    const zScore = (rateA - rateB) / standardError;
    const pValue = 2 * (1 - (0.5 * (1 + Math.tanh(Math.sqrt(Math.PI) * (zScore / Math.sqrt(2))))));
    const significant = pValue < 0.05;
    const winner = significant ? (rateA > rateB ? 'A' : 'B') : 'None';
    const confidence = `${((1 - pValue) * 100).toFixed(2)}%`;
    const response: ABTestResponse = { rateA, rateB, zScore, pValue, significant, winner, confidence };
    await new Promise(resolve => setTimeout(resolve, 1000));
    return ok(c, response);
  });
  app.post('/api/tools/test-subject-line', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const { subjectLine } = await c.req.json<SubjectLineRequest>();
    if (!isStr(subjectLine)) {
      return bad(c, 'Subject line is required.');
    }
    let score = 100;
    const feedback: SubjectLineFeedback[] = [];
    if (subjectLine.length < 20) {
      score -= 15;
      feedback.push({ type: 'warning', message: 'A bit short. Consider adding more detail to entice readers.' });
    } else if (subjectLine.length > 60) {
      score -= 15;
      feedback.push({ type: 'warning', message: 'Too long. It might get cut off in some email clients.' });
    } else {
      feedback.push({ type: 'success', message: 'Good length. It\'s concise and likely to be fully visible.' });
    }
    const powerWords = ['amazing', 'free', 'new', 'guaranteed', 'proven'];
    if (powerWords.some(word => subjectLine.toLowerCase().includes(word))) {
      feedback.push({ type: 'success', message: 'Includes a power word that can boost open rates.' });
    } else {
      score -= 10;
      feedback.push({ type: 'info', message: 'Consider adding a "power word" like "new" or "proven" to create urgency.' });
    }
    if (/\d/.test(subjectLine)) {
      feedback.push({ type: 'success', message: 'Using numbers can increase clarity and click-through rates.' });
    } else {
      score -= 5;
      feedback.push({ type: 'info', message: 'Adding a specific number or statistic can make your subject line more compelling.' });
    }
    if (subjectLine.includes('?')) {
      feedback.push({ type: 'success', message: 'Asking a question engages the reader and piques curiosity.' });
    }
    if (subjectLine.split(' ').some(word => word.length > 2 && word === word.toUpperCase())) {
      score -= 20;
      feedback.push({ type: 'warning', message: 'Avoid using all caps, as it can look like spam.' });
    }
    const response: SubjectLineResponse = { score: Math.max(0, score), feedback };
    await new Promise(resolve => setTimeout(resolve, 1000));
    return ok(c, response);
  });
  // CONTRIBUTION ROUTES
  app.post('/api/contributions', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const { toolName, toolUrl, description } = await c.req.json();
    if (!isStr(toolName) || !isStr(toolUrl) || !isStr(description)) {
      return bad(c, 'Missing required fields.');
    }
    const newContribution: Contribution = {
      id: crypto.randomUUID(),
      userId: userAuth.state.id,
      userEmail: userAuth.state.email,
      toolName,
      toolUrl,
      description,
      status: 'pending',
      createdAt: Date.now(),
    };
    await ContributionEntity.create(c.env, newContribution);
    return ok(c, newContribution);
  });
  app.get('/api/contributions/me', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const { items: allContributions } = await ContributionEntity.list(c.env);
    const userContributions = allContributions.filter(contrib => contrib.userId === userAuth.state.id);
    return ok(c, userContributions);
  });
  // REVIEW ROUTES
  app.get('/api/tools/:id/reviews', async (c) => {
    const { id: toolId } = c.req.param();
    const { items: allReviews } = await ReviewEntity.list(c.env);
    const toolReviews = allReviews.filter(review => review.toolId === toolId);
    return ok(c, toolReviews);
  });
  app.post('/api/tools/:id/reviews', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const { id: toolId } = c.req.param();
    const { rating, comment } = await c.req.json();
    if (typeof rating !== 'number' || rating < 1 || rating > 5 || !isStr(comment)) {
      return bad(c, 'A rating between 1 and 5 and a comment are required.');
    }
    if (!userAuth.state.unlockedTools.includes(toolId)) {
      return c.json({ success: false, error: 'You must unlock this tool to review it.' }, 403);
    }
    const { items: allReviews } = await ReviewEntity.list(c.env);
    if (allReviews.some(r => r.toolId === toolId && r.userId === userAuth.state.id)) {
      return bad(c, 'You have already reviewed this tool.');
    }
    const newReview: Review = {
      id: crypto.randomUUID(),
      userId: userAuth.state.id,
      userEmail: userAuth.state.email,
      toolId,
      rating,
      comment,
      createdAt: Date.now(),
    };
    await ReviewEntity.create(c.env, newReview);
    await userAuth.entity.mutate(user => ({ ...user, credits: user.credits + CREDIT_REWARD_FOR_REVIEW }));
    const toolEntity = new ToolEntity(c.env, toolId);
    if (await toolEntity.exists()) {
      await toolEntity.mutate(tool => {
        const newReviewCount = (tool.reviewCount || 0) + 1;
        const newTotalRating = (tool.rating || 0) * (tool.reviewCount || 0) + newReview.rating;
        return { ...tool, rating: newTotalRating / newReviewCount, reviewCount: newReviewCount };
      });
    }
    return ok(c, newReview);
  });
  // ADMIN ROUTES
  app.get('/api/admin/contributions', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth || !userAuth.state.isAdmin) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { items } = await ContributionEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/admin/contributions/:id/approve', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth || !userAuth.state.isAdmin) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { id } = c.req.param();
    const contributionEntity = new ContributionEntity(c.env, id);
    if (!(await contributionEntity.exists())) {
      return notFound(c, 'Contribution not found.');
    }
    const contribution = await contributionEntity.getState();
    if (contribution.status !== 'pending') {
      return bad(c, 'Contribution has already been reviewed.');
    }
    const newTool: Tool = {
      id: crypto.randomUUID(),
      title: contribution.toolName,
      description: contribution.description,
      category: 'Community',
      cost: 2,
      tags: ['community', 'new'],
      imageUrl: `https://images.unsplash.com/photo-1587440871875-191322ee64b0?q=80&w=800&auto=format&fit=crop`,
      content: `Tool content from URL: ${contribution.toolUrl}`,
      rating: 0,
      reviewCount: 0,
    };
    await ToolEntity.create(c.env, newTool);
    if (contribution.userEmail) {
      const contributorEntity = new UserEntity(c.env, contribution.userEmail);
      if (await contributorEntity.exists()) {
        await contributorEntity.mutate(user => ({ ...user, credits: user.credits + CREDIT_REWARD_FOR_CONTRIBUTION }));
      }
    }
    const updatedContribution = await contributionEntity.mutate(c => ({ ...c, status: 'approved' }));
    return ok(c, updatedContribution);
  });
  app.post('/api/admin/contributions/:id/reject', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth || !userAuth.state.isAdmin) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { id } = c.req.param();
    const contributionEntity = new ContributionEntity(c.env, id);
    if (!(await contributionEntity.exists())) {
      return notFound(c, 'Contribution not found.');
    }
    const contribution = await contributionEntity.getState();
    if (contribution.status !== 'pending') {
      return bad(c, 'Contribution has already been reviewed.');
    }
    const updatedContribution = await contributionEntity.mutate(c => ({ ...c, status: 'rejected' }));
    return ok(c, updatedContribution);
  });
  app.get('/api/admin/tools', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth || !userAuth.state.isAdmin) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { items } = await ToolEntity.list(c.env);
    return ok(c, items);
  });
  app.put('/api/admin/tools/:id', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth || !userAuth.state.isAdmin) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { id } = c.req.param();
    const toolData = await c.req.json<Partial<Tool>>();
    const toolEntity = new ToolEntity(c.env, id);
    if (!(await toolEntity.exists())) {
      return notFound(c, 'Tool not found.');
    }
    await toolEntity.patch(toolData);
    return ok(c, await toolEntity.getState());
  });
  app.delete('/api/admin/tools/:id', async (c) => {
    const userAuth = await getUserFromToken(c);
    if (!userAuth || !userAuth.state.isAdmin) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { id } = c.req.param();
    const deleted = await ToolEntity.delete(c.env, id);
    if (!deleted) {
      return notFound(c, 'Tool not found.');
    }
    return ok(c, { id });
  });
}