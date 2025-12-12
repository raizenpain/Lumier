# Deploy backend
cd backend
heroku create missing-pets-api
heroku addons:create mongolab
heroku config:set JWT_SECRET=your_secret
git push heroku main

# Deploy frontend
cd frontend
npm run build
# Use build output with static hosting