import json
import boto3
import os
from datetime import datetime

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
ses_client = boto3.client('ses')

# Fetch environment variables
FAQ_TABLE_NAME = os.environ.get('FAQ_TABLE_NAME')
SUPPORT_EMAIL = os.environ.get('SUPPORT_EMAIL')

def lambda_handler(event, context):
    """
    Main Lambda function to handle chatbot logic from AWS Lex V2.
    """
    print("Received event:", json.dumps(event))
    
    intent_name = event['sessionState']['intent']['name']
    slots = event['sessionState']['intent']['slots']
    
    response_message = ""

    if intent_name in ["PasswordReset", "WiFiTroubleshooting", "EmailAccess"]:
        # Handle simple intents by looking up the intent name in DynamoDB
        response_message = query_dynamodb_faq(intent_name)

    elif intent_name == "EscalateToHuman":
        # Handle escalation to a human agent
        issue_description = "Not provided"
        if slots and 'issue' in slots and slots['issue']:
            issue_description = slots['issue']['value']['interpretedValue']
            
        priority = "Medium"
        if slots and 'priority' in slots and slots['priority']:
            priority = slots['priority']['value']['interpretedValue']

        ticket_id = f"IT-{int(datetime.now().timestamp()) % 100000}"
        
        email_sent = send_escalation_email(ticket_id, issue_description, priority)
        
        if email_sent:
            response_message = (
                f"Thanks! I've created ticket #{ticket_id} and assigned it {priority} priority. "
                f"A technician will contact you shortly."
            )
        else:
            response_message = "I'm sorry, I couldn't create your ticket. Please email IT support directly."

    else:
        # Fallback for unrecognized intents
        response_message = "I'm not sure how to help with that. I can assist with password resets, WiFi issues, and email problems."

    # If no specific answer is found in DynamoDB, provide a default response
    if not response_message:
        response_message = "I can help with IT issues. How can I assist you today?"

    # Construct the response object for Lex
    return {
        "sessionState": {
            "dialogAction": {
                "type": "Close"
            },
            "intent": {
                "name": intent_name,
                "state": "Fulfilled"
            }
        },
        "messages": [
            {
                "contentType": "PlainText",
                "content": response_message
            }
        ]
    }

def query_dynamodb_faq(query_key):
    """
    Queries the DynamoDB table for a specific question key.
    """
    if not FAQ_TABLE_NAME:
        return "Configuration error: DynamoDB table name is not set."
    try:
        table = dynamodb.Table(FAQ_TABLE_NAME)
        response = table.get_item(Key={'question': query_key})
        
        if 'Item' in response:
            return response['Item'].get('answer', "I found an article but it seems to be empty.")
        else:
            print(f"No item found for key: {query_key}")
            return None
    except Exception as e:
        print(f"Error querying DynamoDB: {e}")
        return "I'm having trouble accessing my knowledge base right now."

def send_escalation_email(ticket_id, issue, priority):
    """
    Sends an escalation email using Amazon SES.
    """
    if not SUPPORT_EMAIL:
        print("Configuration error: Support email is not set.")
        return False
        
    subject = f"New IT Support Ticket: #{ticket_id} [{priority}]"
    body = f"""
    A new IT support ticket has been created by the chatbot.

    Ticket ID: {ticket_id}
    Priority: {priority}
    Issue Description: {issue}

    Please assign a technician to follow up on this request.
    """
    try:
        ses_client.send_email(
            Source=SUPPORT_EMAIL,
            Destination={'ToAddresses': [SUPPORT_EMAIL]},
            Message={
                'Subject': {'Data': subject},
                'Body': {'Text': {'Data': body}}
            }
        )
        print(f"Successfully sent escalation email for ticket {ticket_id}")
        return True
    except Exception as e:
        print(f"Error sending SES email: {e}")
        return False