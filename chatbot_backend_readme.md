# AI Chatbot for IT Support using AWS

This project is an AI-based chatbot designed to automate first-level IT support tasks. Built entirely within the AWS ecosystem, the chatbot handles common user queries such as password resets, email login issues, and Wi-Fi troubleshooting.It leverages services like Amazon Lex for natural language understanding and AWS Lambda for backend logic, providing quick, automated responses to reduce the IT support workload and improve user experience.

## Features

**Conversational Interface**: Built with AWS Lex for natural language intent detection.
**Quick Actions & FAQs**: A user-friendly interface with buttons for common issues like Wi-Fi problems, password resets, and email access.
**Dynamic Responses**: Fetches answers dynamically from a DynamoDB table, allowing for an easily updatable knowledge base.
**Human Escalation**: Escalates complex or unresolved queries to a human agent by creating a support ticket via Amazon SES.
**Serverless Architecture**: Hosted entirely within the AWS ecosystem, using S3 for the frontend and Lambda for the backend logic.
**Informative UI**: Includes a typing animation, system status indicators, and a panel to show recent issues and recognized intents.

---

## Tech Stack & Architecture

This project uses a serverless architecture, relying on managed AWS services to provide a scalable and cost-effective solution.

**Amazon Lex**: The core service used to design, build, and train the conversational chatbot using intents and utterances.
**Executes the backend logic in response to Lex triggers.It processes user requests, fetches data from DynamoDB, and integrates with other AWS services.
**Amazon DynamoDB**: A NoSQL database used to store the FAQ knowledge base, containing questions and corresponding answers for the chatbot.
**Amazon S3**: Hosts the static frontend assets of the chatbot application (HTML, CSS, and JavaScript).
**Amazon API Gateway**: Exposes the Lambda function to the frontend, allowing for secure and scalable communication between the client and the backend.
**Amazon SES (Simple Email Service)**: Used to send email notifications to the IT support team when a user's query is escalated to a human agent.
**AWS IAM**: Manages secure access and permissions for all the AWS services to interact with each other.

### Architectural Flow

1.  The user interacts with the chatbot UI hosted on **Amazon S3**.
2.  The frontend JavaScript sends the user's message to **Amazon Lex** via an **API Gateway** endpoint.
3.  **Amazon Lex** processes the message to determine the user's intent.
4.  Lex triggers the **AWS Lambda** function, passing along the intent details.
5.  The **Lambda** function queries the **DynamoDB** table for an appropriate response or uses **Amazon SES** to send an escalation email.
6.  The response is sent back through Lex and the API Gateway to the user's browser.

---

## Deployment Guide

Follow these steps to deploy the chatbot in your own AWS account.

### Prerequisites

* An AWS account with appropriate permissions (IAM, S3, Lex, Lambda, DynamoDB, SES).
* The project files from this repository.
* Basic knowledge of the AWS Management Console.

### Step 1: Set up DynamoDB Table

1.  Navigate to the **DynamoDB** service in the AWS Console.
2.  Click **Create table**.
    * **Table name**: `FAQTable`
    * **Partition key**: `question` (Type: String)
3.  Click **Create table**.
4.  Once created, select the table. Add the items from `faq-data.json` by navigating to **Explore table items** > **Create item**.

### Step 2: Configure Amazon SES

1.  Navigate to the **Simple Email Service (SES)**.
2.  Go to **Verified identities** in the sidebar.
3.  Click **Create identity**, choose **Email address**, and enter the email you want to use for support notifications.
4.  You will receive a verification email. Click the link inside to verify it.
    * *Note: If your AWS account is in the SES sandbox, you can only send emails **to** verified addresses.*

### Step 3: Create the IAM Role & Policy

1.  Navigate to the **IAM** service and go to **Roles** -> **Create role**.
2.  **Trusted entity type**: AWS service; **Use case**: Lambda.
3.  On the permissions page, attach the **AWSLambdaBasicExecutionRole** policy.
4.  Name the role `ITSupportChatbotLambdaRole` and create it.
5.  Open the role, click **Add permissions** -> **Create inline policy**.
6.  Switch to the **JSON** tab and paste the content from `lambda-permissions-policy.json`.
7.  **IMPORTANT**: In the JSON, replace `YOUR_REGION` and `YOUR_ACCOUNT_ID` with your actual AWS details.
8.  Name and create the policy.

### Step 4: Deploy the Lambda Function

1.  Navigate to the **Lambda** service and click **Create function**.
2.  Select **Author from scratch**.
    * **Function name**: `ITSupportChatbotHandler`
    * **Runtime**: Python 3.9 (or newer).
    * **Permissions**: Choose "Use an existing role" and select the `ITSupportChatbotLambdaRole`.
3.  In the **Code source** editor, paste the content of `lambda_function.py`.
4.  Go to **Configuration** -> **Environment variables** and add:
    * **Key**: `FAQ_TABLE_NAME`, **Value**: `FAQTable`
    * **Key**: `SUPPORT_EMAIL`, **Value**: Your verified SES email address.
5.  Click **Deploy**.

### Step 5: Configure the Amazon Lex Bot

1.  Navigate to **Amazon Lex** and **Create bot**. Choose **Create a blank bot**.
2.  **Bot name**: `ITSupportAssistant`. Let Lex create a new IAM role.
3.  Create the following **Intents**:
    * `PasswordReset` (Add sample utterances: "forgot my password", "reset password")
    * `WiFiTroubleshooting` (Add sample utterances: "wifi not working", "internet issues")
    * `EmailAccess` (Add sample utterances: "email problem", "cant open outlook")
    * `EscalateToHuman` (Add sample utterances: "speak to an agent", "talk to human"). Add two **slots**:
        * `issue` (Type: `AMAZON.FreeFormInput`, Prompt: "Please describe your issue.")
        * `priority` (Type: `AMAZON.AlphaNumeric`, Prompt: "How urgent is this? (Low, Medium, High)")
4.  For **each** intent, go to the **Fulfillment** section, check **Use a Lambda function for fulfillment**, and select your `ITSupportChatbotHandler` function.
5.  **Build** the bot. Once complete, create an **Alias** (e.g., `Prod`) and associate it with the latest version.

### Step 6: Connect & Host the Frontend

1.  In Lex, navigate to your bot's **Aliases**, select your `Prod` alias, and find the API endpoint details.
2.  Open your local `appv2.js` file.
3.  Find the section marked `--- AWS LEX V2 API CONFIGURATION ---`.
4.  Replace the placeholder values for `lexV2Endpoint`, `botId`, and `botAliasId` with the actual values from your Lex bot.
5.  Navigate to the **S3** service and create a new bucket.
6.  In the bucket's **Properties** tab, enable **Static website hosting**.
7.  In the **Permissions** tab, disable **Block all public access** and add a bucket policy to allow public read access.
8.  Upload `index.html`, `style.css`, and the modified `appv2.js` to the bucket.
9.  Navigate to your S3 bucket's static website endpoint URL to use the chatbot.

---

## Usage

Once deployed, you can interact with the chatbot in several ways:
* Type a natural language question like "I forgot my password" or "my wifi isn't working".
* Use the "Quick Actions" buttons for common predefined issues.
* Ask to "speak to an agent" to test the human escalation workflow.
