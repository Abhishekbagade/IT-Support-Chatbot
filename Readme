# AI Chatbot for IT Support – Backend

This backend powers an **AI-based IT Support Chatbot** built on AWS. It handles user queries through **AWS Lambda**, stores and retrieves FAQs from **DynamoDB**, and escalates unresolved issues via **Amazon SES**. The backend is designed to integrate with both **Amazon Lex** and a **custom frontend** hosted on Amazon S3.  

---

## Overview  

The chatbot automates first-level IT support tasks such as:  
- Password reset guidance  
- Wi-Fi troubleshooting  
- Email login issues  
- Escalation to human support  

The backend Lambda function processes incoming requests, fetches answers from DynamoDB, or escalates queries by sending an email to the IT support team.  

---

## Features  

- **Predefined responses** for common IT issues (Password, Wi-Fi, Email)  
- **DynamoDB integration** for FAQ-based dynamic responses  
- **Amazon SES integration** for escalation emails  
- **Supports both Lex and API Gateway** as entry points  
- **Serverless architecture** with minimal dependencies  

---

## File Structure  

```
backend/
├── lambda_function.py     # Main Lambda handler
├── requirements.txt       # Dependencies
└── deployment.zip         # Uploadable package for AWS Lambda
```

---

## Setup Instructions  

### 1. DynamoDB Setup  
- Create a table named `IT_FAQ` (or any name you prefer).  
- Use `question` as the **primary key** (String).  
- Add an `answer` field to store responses.  
- Populate the table with common IT support questions and answers.  

Example entry:  
```json
{
  "question": "how to reset password",
  "answer": "Visit the IT portal and follow the password reset steps."
}
```

### 2. Amazon SES Setup  
- Verify the **sender email** (FROM_EMAIL).  
- Verify the **recipient email** (SUPPORT_EMAIL).  
- Ensure SES is in production mode or both emails are verified in sandbox.  

### 3. Lambda Setup  
1. Go to **AWS Lambda Console**.  
2. Create a new Lambda function (Python 3.9 or later).  
3. Upload `deployment.zip`.  
4. Add environment variables:  
   - `FAQ_TABLE` → your DynamoDB table name  
   - `FROM_EMAIL` → verified sender email  
   - `SUPPORT_EMAIL` → escalation recipient email  
5. Assign an IAM role with the following permissions:  
   - `AmazonDynamoDBFullAccess` (or restricted to your table)  
   - `AmazonSESFullAccess`  
   - `AWSLambdaBasicExecutionRole`  

### 4. API Gateway Setup (Frontend Integration)  
- Create a REST API in API Gateway.  
- Link it to the Lambda function.  
- Enable CORS for your frontend domain (S3 bucket website).  
- Deploy the API and copy the endpoint URL.  
- Update your frontend `app.js` with this API Gateway URL.  

---

## Testing  

1. **Password reset query**  
   ```
   Input: "I forgot my password"
   Output: "Reset your password through the IT portal."
   ```

2. **Wi-Fi issue**  
   ```
   Input: "Wi-Fi not working"
   Output: "Check Wi-Fi connection. Restart router if issue continues."
   ```

3. **Email issue**  
   ```
   Input: "I can't open my email"
   Output: "Verify credentials and network connection. Contact support if issue persists."
   ```

4. **Escalation**  
   ```
   Input: "Talk to a human"
   Output: "Escalated to human support."
   ```

5. **Unrecognized query**  
   ```
   Input: "My printer is jammed"
   Output: "No answer found. Escalate to support?"
   ```

---

## Requirements  

- AWS Lambda (Python 3.9+)  
- AWS DynamoDB  
- AWS SES  
- AWS API Gateway (for frontend integration)  
- boto3 (already available in Lambda runtime)  

---

## Deployment  

To create the deployment package manually:  
```bash
zip -r deployment.zip lambda_function.py
```
Upload `deployment.zip` to AWS Lambda via the console.  

---

## Conclusion  

This backend provides a scalable and serverless solution for IT support chatbots. It integrates seamlessly with AWS services, delivers quick responses for FAQs, and ensures unresolved issues are escalated to human agents when needed.

