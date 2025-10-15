# To-Follow (Do Not Forget)

- Ensure deployment environments provide a valid `KMS_KEY_ID`; Terraform/SSM wiring may need an update if it wasn’t set previously.
- Populate the missing env vars (e.g. `KMS_KEY_ID`) locally before rerunning backend tests.
- Provision a DynamoDB GSI on `cardId` (matching `CARD_ID_INDEX_NAME`) to avoid the scan fallback in production.
- Run a live smoke test against eBay, TCGplayer, and PriceCharting once credentials are available to confirm the updated requests and normalization end-to-end.
- When you tackle Task 10, hook this adapter into the RekognitionExtract Lambda and back it with integration tests/mocks to keep the Rekognition contract stable.
- Declare the valuation Step Functions state machine (RekognitionExtract → parallel Pricing/Authenticity → Aggregator, Catch → ErrorHandler) in Terraform and wire the Lambdas; currently only the handlers exist so Task 10 is incomplete.
- Adjust Aggregator’s state input handling or state-machine `ResultPath`/`ResultSelector`; Step Functions wraps each Lambda result as `{ Payload, StatusCode, ... }`, so the code’s direct destructuring of `pricingResult`/`authenticityResult` will throw without that fix (see AWS Step Functions Lambda integration docs).
- Provision the supporting AWS resources and wiring (EventBridge bus for `CardValuationCompleted`, SQS DLQ for the error handler, env vars) in Terraform so the Aggregator/EventBridge and ErrorHandler/SQS paths actually work.
