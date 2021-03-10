locals {
  dev_bucket_cdn_domain      = "tarpisto-dev.cdn.tko-aly.fi"
}

#data "aws_ssm_parameter" "exam_archive_dev_cf_signing_key_id" {
#  name = "exam-archive-dev-cf-signing-key-id"
#}

#data "aws_ssm_parameter" "exam_archive_dev_cf_signing_key" {
#  name = "exam-archive-dev-cf-signing-key"
#}

resource "aws_s3_bucket" "exam_archive_files_dev_s3_bucket" {
  bucket  = "exam-archive-files-dev"
  acl     = "private"

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "exam_archive_files_dev_s3_block" {
  bucket                  = aws_s3_bucket.exam_archive_files_dev_s3_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  restrict_public_buckets = true
  ignore_public_acls      = true
}

data "aws_iam_policy_document" "exam_archive_files_dev_s3_policy_doc" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.exam_archive_files_dev_s3_bucket.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.exam_archive_files_dev_cf_oai.iam_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "exam_archive_files_dev_s3_policy" {
  bucket = aws_s3_bucket.exam_archive_files_dev_s3_bucket.id
  policy = data.aws_iam_policy_document.exam_archive_files_dev_s3_policy_doc.json
}

locals {
  s3_dev_origin_id = "S3-${aws_s3_bucket.exam_archive_files_dev_s3_bucket.id}"
}

resource "aws_cloudfront_origin_access_identity" "exam_archive_files_dev_cf_oai" {
  comment = "access-identity-exam-archive-files-dev"
}

resource "aws_cloudfront_distribution" "exam_archive_dev_cf_files_distribution" {
  enabled         = true
  is_ipv6_enabled = true
  price_class     = "PriceClass_100"
  aliases         = [local.dev_bucket_cdn_domain]

  default_cache_behavior {
    target_origin_id        = local.s3_dev_origin_id
    viewer_protocol_policy  = "redirect-to-https"
    allowed_methods         = ["GET", "HEAD"]
    cached_methods          = ["GET", "HEAD"]
    compress                = true
    min_ttl                 = 0
    max_ttl                 = 3600
    default_ttl             = 3600

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    trusted_signers = ["self"]
  }

  origin {
    domain_name = aws_s3_bucket.exam_archive_files_dev_s3_bucket.bucket_regional_domain_name
    origin_id = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.exam_archive_files_dev_cf_oai.cloudfront_access_identity_path
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.cdn_certificate.arn
    minimum_protocol_version = "TLSv1"
    ssl_support_method = "sni-only"
  }
}
