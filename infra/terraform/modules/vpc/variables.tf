variable "vpc_name" {
  description = "Name for the VPC"
}

variable "vpc_cidr" {
  description = "CIDR of the VPC"
}

variable "create_igw" {
  description = "Set to true/false for the creation of Internet Gateway"
  type 	      = bool
  default     = false
}

variable "create_natgw" {
  description = "Set to true/false for the creation of NAT Gateway"
  type 	      = bool
  default     = false
}

variable "public_subnets_cidr" {
  description = "List of Public Subnets CIDR"
  type = list
}

variable "private_subnets_cidr" {
  description = "List of Private Subnets CIDR"
  type = list
}

variable "availability_zones" {
  description = "List of AZs"
  type = list
}

variable "environment" {
  description = "Environment name"
}
