# To-Follow (Do Not Forget)

- Ensure deployment environments provide a valid `KMS_KEY_ID`; Terraform/SSM wiring may need an update if it wasn’t set previously.
- Provision a DynamoDB GSI on `cardId` (matching `CARD_ID_INDEX_NAME`) to avoid the scan fallback in production.
