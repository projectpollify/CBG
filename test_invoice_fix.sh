#!/bin/bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDkxZjgwMS0wMThiLTQwZWMtYjBhNC04ODk5Yjc0YTdlZmEiLCJlbWFpbCI6ImluZm9AY3V0dGluZ2JvYXJkZ3V5cy5jYSIsInJvbGUiOiJPV05FUiIsImlhdCI6MTc3MDEzNTE2OCwiZXhwIjoxNzcwNzM5OTY4fQ.5qYf2zxVtBf8Da-jz6X9by5xC4-MtNDGKI6YkLmXhmU"

echo "Creating a CORRECT test invoice..."
curl -s -X POST http://localhost:3001/api/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "adb359a9-9b05-4b19-9e86-314422dcf11f", 
    "date": "2026-02-02T00:00:00.000Z",
    "dueDate": "2026-03-02T00:00:00.000Z",
    "status": "DRAFT",
    "lineItems": [
      {
        "serviceType": "RESURFACING",
        "description": "Board Resurfacing",
        "quantity": 1,
        "unitPrice": 50.00,
        "totalPrice": 50.00
      }
    ]
  }'
