# Package backend
cd backend
zip -r ../backend.zip .

# Deploy to EB
eb init
eb create missing-pets-prod