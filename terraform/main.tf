terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. Amazon S3 - Storage

resource "aws_s3_bucket" "blog_assets" {
  bucket        = var.bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "blog_assets_public_access" {
  bucket = aws_s3_bucket.blog_assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "allow_public_read" {
  bucket = aws_s3_bucket.blog_assets.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.blog_assets.arn}/*"
      },
    ]
  })
  depends_on = [aws_s3_bucket_public_access_block.blog_assets_public_access]
}

resource "aws_s3_bucket_cors_configuration" "blog_assets_cors" {
  bucket = aws_s3_bucket.blog_assets.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "POST", "PUT"]
    allowed_origins = [
      "http://localhost:3000",
      "https://${var.vercel_domain}"
    ]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# 2. Amazon Cognito - Authentication

resource "aws_cognito_user_pool" "blog_auth" {
  name = "blog-platform-auth-pool"

  username_attributes        = ["email"]
  auto_verified_attributes   = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  # Simplified verified email
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Your blog verification code"
    email_message        = "Your verification code is {####}."
  }
}

resource "aws_cognito_user_pool_client" "blog_auth_client" {
  name         = "blog-platform-client"
  user_pool_id = aws_cognito_user_pool.blog_auth.id

  generate_secret = true

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  supported_identity_providers = ["COGNITO"]
  
  # For NextAuth.js
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  callback_urls                        = [
    "http://localhost:3000/api/auth/callback/cognito",
    "https://${var.vercel_domain}/api/auth/callback/cognito"
  ]
  logout_urls                          = [
    "http://localhost:3000",
    "https://${var.vercel_domain}",
    "https://${var.vercel_domain}/admin"
  ]
}

# Cognito Domain for Hosted UI (NextAuth uses this)
resource "aws_cognito_user_pool_domain" "blog_auth_domain" {
  domain       = var.cognito_domain_prefix
  user_pool_id = aws_cognito_user_pool.blog_auth.id
}

# 3. Amazon RDS - PostgreSQL Database (Free Tier)

# Use default VPC for simplicity in free tier
data "aws_vpc" "default" {
  default = true
}

# Default subnets for DB Subnet Group
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_db_subnet_group" "db_subnet" {
  name       = "blog-platform-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids
}

# Security group allowing public access on port 5432 (for dev purposes)
resource "aws_security_group" "rds_sg" {
  name        = "blog-platform-db-sg"
  description = "Allow inbound PostgreSQL traffic"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["YOUR_IP_ADDRESS/32"] # Placeholder: Restrict to your specific IP for production
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "blog_db" {
  identifier           = "blog-platform-rds"
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "15.7" # Recommended Postgres version
  instance_class       = "db.t4g.micro" # Free tier eligible
  db_name              = var.db_name
  username             = var.db_username
  password             = var.db_password
  parameter_group_name = "default.postgres15"
  skip_final_snapshot  = true
  publicly_accessible  = true

  db_subnet_group_name   = aws_db_subnet_group.db_subnet.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  
  tags = {
    Name = "BlogPlatformDatabase"
  }
}
