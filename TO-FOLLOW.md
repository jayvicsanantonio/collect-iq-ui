# To-Follow (Do Not Forget)

- Ensure deployment environments provide a valid `KMS_KEY_ID`; Terraform/SSM wiring may need an update if it wasn’t set previously.
- Provision a DynamoDB GSI on `cardId` (matching `CARD_ID_INDEX_NAME`) to avoid the scan fallback in production.
- Run a live smoke test against eBay, TCGplayer, and PriceCharting once credentials are available to confirm the updated requests and normalization end-to-end.
- When you tackle Task 10, hook this adapter into the RekognitionExtract Lambda and back it with integration tests/mocks to keep the Rekognition contract stable.
