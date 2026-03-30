output "s3_bucket_name" {
  value = aws_s3_bucket.blog_assets.id
}

output "s3_bucket_region" {
  value = var.aws_region
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.blog_auth.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.blog_auth_client.id
}

output "cognito_issuer_url" {
  value = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.blog_auth.id}"
}

output "rds_endpoint" {
  value = aws_db_instance.blog_db.endpoint
}

output "rds_db_name" {
  value = aws_db_instance.blog_db.db_name
}

output "rds_username" {
  value = aws_db_instance.blog_db.username
}

