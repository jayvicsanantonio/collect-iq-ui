# Creates an S3 Bucket to store Terraform State & DynamoDB for Terraform State Lock.

module "prereq" {
  source        = "../modules/prereq"
  bucket_name   = "collectiq-tfstate"
  dynamodb_name = "collectiq-tfstate-lock"
}
