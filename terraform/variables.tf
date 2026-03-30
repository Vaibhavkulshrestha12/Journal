variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Name of the S3 bucket (must be globally unique)"
  type        = string
}

variable "cognito_domain_prefix" {
  description = "Unique domain prefix for Cognito hosted UI"
  type        = string
}

variable "db_name" {
  description = "Name of the Postgres database"
  type        = string
}

variable "db_username" {
  description = "Database master username"
  type        = string
}

variable "db_password" {
  description = "Database master password (min 8 chars)"
  type        = string
  sensitive   = true
}

variable "vercel_domain" {
  description = "Vercel production domain"
  type        = string
}
